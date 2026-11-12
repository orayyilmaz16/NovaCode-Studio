// Yapay zekâ asistanı (ana süreç): çoklu sağlayıcı (Anthropic, OpenAI uyumlu, Ollama), akış, agentic araç döngüsü, dikte.
// Güvenlik:
// - API anahtarı yalnız burada (şifreli depodan) okunur; renderer'a hiç geçmez.
// - Araçlar yalnız açık çalışma klasörü içinde çalışır (gerçek yol + sembolik bağ denetimi); gizli dosyalar reddedilir.
// - Yazma/komut araçları kullanıcı onayı ister (yazma için "otomatik onay" ayarı opsiyoneldir; komut her zaman sorar).
// - Özel taban adres yalnız https:// veya yerel (localhost/127.0.0.1) http:// olabilir.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, spawn } = require('child_process');
const { readSecret } = require('./electron-secrets.cjs');
const search = require('./electron-search.cjs');
const { TextBuffer } = require('./electron-textbuffer.cjs');

const MAX_STEPS = 20;
const MAX_READ = 200 * 1024;
const MAX_OUT = 20 * 1024;
const MAX_AUDIO = 25 * 1024 * 1024;
const SECRET_FILE = /(^|[\\/])(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_(rsa|ed25519|ecdsa)(\.pub)?|\.npmrc|\.netrc|credentials(\.json)?)$/i;

const PROVIDERS = {
  anthropic: { base: 'https://api.anthropic.com', secret: 'aiKey_anthropic' },
  openai: { base: 'https://api.openai.com/v1', secret: 'aiKey_openai' },
  ollama: { base: 'http://localhost:11434/v1', secret: null }
};

const runs = new Map(); // runId -> { abort: AbortController, pending: Map<id, resolve> }

function isLoopback(base) {
  try { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname); } catch { return false; }
}

function safeBase(provider, custom) {
  const def = PROVIDERS[provider];
  if (!def) throw new Error('Bilinmeyen sağlayıcı.');
  const raw = (custom && String(custom).trim()) || def.base;
  let u;
  try { u = new URL(raw); } catch { throw new Error('Taban adres geçersiz.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  if (!(u.protocol === 'https:' || (u.protocol === 'http:' && local))) throw new Error('Taban adres https:// olmalı (yalnız yerel adreste http:// olabilir).');
  return raw.replace(/\/+$/, '');
}

// ---------- Çalışma klasörü ve araçlar ----------
function resolveInRoot(root, p) {
  if (!root) throw new Error('Açık çalışma klasörü yok.');
  if (typeof p !== 'string' || !p || p.includes('\0')) throw new Error('Geçersiz yol.');
  // Küçük modeller yolun başına klasör adını ekleyebilir ("proje/src/a.ts"): kök adı varsa ve gerçek öğe yoksa soy
  let rp = p;
  const base = path.basename(root);
  const norm = p.split('\\').join('/');
  if (norm.startsWith(base + '/') && !fs.existsSync(path.resolve(root, p))) rp = norm.slice(base.length + 1);
  const abs = path.resolve(root, rp);
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Yol çalışma klasörü dışında.');
  // Sembolik bağ kaçışı: var olan en yakın üst öğenin gerçek yolu da kök içinde olmalı
  let probe = abs;
  while (!fs.existsSync(probe) && probe !== path.dirname(probe)) probe = path.dirname(probe);
  const real = fs.realpathSync(probe);
  const realRoot = fs.realpathSync(root);
  const r2 = path.relative(realRoot, real);
  if (r2.startsWith('..') || path.isAbsolute(r2)) throw new Error('Yol çalışma klasörü dışına işaret ediyor.');
  if (SECRET_FILE.test(abs)) throw new Error('Gizli dosyalara erişim engelli.');
  return abs;
}

const TOOLS = [
  { name: 'list_dir', description: 'Bir klasörün içeriğini listeler (çalışma klasörüne göre yol; "." kök).', input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'read_file', description: 'Dosya içeriğini okur (satır numaralı). İsteğe bağlı start_line/end_line.', input_schema: { type: 'object', properties: { path: { type: 'string' }, start_line: { type: 'integer' }, end_line: { type: 'integer' } }, required: ['path'] } },
  { name: 'search_text', description: 'Projede metin arar (büyük/küçük harf duyarsız). Eşleşen dosya:satır döner.', input_schema: { type: 'object', properties: { query: { type: 'string' }, regex: { type: 'boolean' } }, required: ['query'] } },
  { name: 'write_file', description: 'Dosyayı tamamen yazar/oluşturur. Kullanıcı onayı gerekir.', input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
  { name: 'edit_lines', description: 'Dosyada satır aralıklarını değiştirir. Satır numaraları read_file çıktısındaki gibidir (1 tabanlı, uçlar dahil). Birden çok düzenleme ÖZGÜN numaralara göre atomik uygulanır (biri geçersizse hiçbiri uygulanmaz). Araya ekleme için end_line = start_line - 1; silmek için text boş. Çok satırlı değişiklikte replace_in_file yerine bunu tercih et. Kullanıcı onayı gerekir.', input_schema: { type: 'object', properties: { path: { type: 'string' }, edits: { type: 'array', items: { type: 'object', properties: { start_line: { type: 'integer' }, end_line: { type: 'integer' }, text: { type: 'string' } }, required: ['start_line', 'end_line', 'text'] } } }, required: ['path', 'edits'] } },
  { name: 'replace_in_file', description: 'Dosyada tek bir benzersiz metni değiştirir (old, dosyada tam bir kez geçmeli). Kullanıcı onayı gerekir.', input_schema: { type: 'object', properties: { path: { type: 'string' }, old: { type: 'string' }, new: { type: 'string' } }, required: ['path', 'old', 'new'] } },
  { name: 'run_command', description: 'Çalışma klasöründe kabuk komutu çalıştırır (60 sn; derleme/test komutlarında 180 sn sınır). Kullanıcı onayı gerekir; otonom modda yalnız güvenli derleme/test/lint komutları (npm run build|test|lint, npx tsc --noEmit, cargo/go/dotnet build|test, pytest) onaysız çalışır. Her komutu ayrı çağır, && | ; kullanma.', input_schema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] } }
];

// ---------- Otonom mod: yalnız güvenli derleme/test/lint komutları onaysız çalışır ----------
// Kabuk birleştirme, yönlendirme ve değiştirme karakterleri yasak; yalnız bilinen komut kalıpları ve argümansız (veya yalnız yol alan) biçimleri.
const SHELL_META = /[;&|<>`$(){}\\^%!\r\n"'*?~]/;
const SAFE_CMDS = [
  /^npm (?:run )?(?:test|build|lint|typecheck|type-check|check|compile)(?::[\w-]+)?$/,
  /^npx tsc --noEmit(?: -p [\w.\/-]+)?$/,
  /^node --check [\w.\/-]+$/,
  /^cargo (?:build|check|test|clippy)(?: --release)?$/,
  /^go (?:build|vet|test) [\w.\/-]+$/,
  /^dotnet (?:build|test)(?: [\w.\/-]+)?$/,
  /^(?:python -m )?pytest(?: [\w.\/][\w.\/-]*)?$/
];
function isSafeCommand(cmd) {
  return cmd.length <= 200 && !SHELL_META.test(cmd) && SAFE_CMDS.some((re) => re.test(cmd));
}
// Derleme sırasında kod çalıştırabilen dosyalar: bu çalıştırmada değiştirildiyse güvenli komutlar bile onay ister
// (ajanın package.json'a kötü bir betik yazıp sonra "npm run build" ile tetiklemesini engeller).
const RISKY_NAME = new Set(['package.json', 'package-lock.json', '.npmrc', 'makefile', 'cargo.toml', 'build.rs', 'go.mod', 'pom.xml', 'build.gradle', '.env']);
const RISKY_EXT = new Set(['.sh', '.bat', '.cmd', '.ps1', '.csproj', '.sln', '.targets', '.props']);
function isRiskyPath(root, file) {
  const rel = path.relative(root, file).split(path.sep).join('/').toLowerCase();
  const base = path.basename(rel);
  return RISKY_NAME.has(base) || RISKY_EXT.has(path.extname(base)) || /^(scripts|\.github|\.husky|node_modules)\//.test(rel)
    || /(^|\/)(vite|webpack|rollup|esbuild|tsup|next|nuxt|svelte|babel|jest|vitest|eslint|postcss|tailwind)\.config\./.test(rel) || base.startsWith('.babelrc');
}

const FILE_EDIT_TOOLS = new Set(['write_file', 'replace_in_file', 'edit_lines']);
const clip = (s, n = MAX_OUT) => (s.length > n ? s.slice(0, n) + `\n…(${s.length - n} karakter kesildi)` : s);

async function runTool(name, input, ctx) {
  const { root, approve, autoApproveEdits, allowCommands } = ctx;
  input = input && typeof input === 'object' ? input : {};
  switch (name) {
    case 'list_dir': {
      const dir = resolveInRoot(root, input.path || '.');
      const ents = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !search.IGNORED.has(e.name)).slice(0, 300);
      return ents.map((e) => (e.isDirectory() ? e.name + '/' : e.name)).join('\n') || '(boş)';
    }
    case 'read_file': {
      const file = resolveInRoot(root, input.path);
      const st = fs.statSync(file);
      if (!st.isFile()) throw new Error('Dosya değil.');
      if (st.size > MAX_READ * 5) throw new Error('Dosya çok büyük.');
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      const a = Math.max(1, Number(input.start_line) || 1);
      const b = Math.min(lines.length, Number(input.end_line) || lines.length);
      return clip(lines.slice(a - 1, b).map((l, i) => `${a + i}: ${l}`).join('\n'), MAX_READ);
    }
    case 'search_text': {
      if (!root) throw new Error('Açık çalışma klasörü yok.');
      const res = await search.searchText(root, { query: String(input.query || ''), regex: !!input.regex, caseSensitive: false, maxResults: 80 });
      return res.results.map((r) => `${r.rel}:${r.line}: ${r.text}`).join('\n') || 'Eşleşme yok.';
    }
    case 'write_file': {
      const file = resolveInRoot(root, input.path);
      if (typeof input.content !== 'string' || input.content.length > 2 * 1024 * 1024) throw new Error('İçerik geçersiz veya çok büyük.');
      const existed = fs.existsSync(file);
      const ok = autoApproveEdits || (await approve({ tool: name, summary: `${existed ? 'Üzerine yaz' : 'Oluştur'}: ${path.relative(root, file)}`, preview: clip(input.content, 4000) }));
      if (!ok) return 'Kullanıcı reddetti.';
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, input.content, 'utf8');
      ctx.changed.add(file);
      if (isRiskyPath(root, file)) ctx.riskyTouched = true;
      return `Yazıldı: ${path.relative(root, file)}`;
    }
    case 'edit_lines': {
      const file = resolveInRoot(root, input.path);
      const rawEdits = Array.isArray(input.edits) ? input.edits.slice(0, 50) : [];
      if (!rawEdits.length) throw new Error('edits boş olamaz.');
      const st = fs.statSync(file);
      if (!st.isFile() || st.size > 2 * 1024 * 1024) throw new Error('Dosya değil veya çok büyük.');
      const src = fs.readFileSync(file, 'utf8');
      const edits = rawEdits.map((e) => ({ startLine: Number(e.start_line), endLine: Number(e.end_line), text: String(e.text ?? '') }));
      const orig = new TextBuffer(src);
      const buf = new TextBuffer(src);
      try { buf.applyLineEdits(edits); } catch (err) { throw new Error(err.message); } // geçersiz/çakışan düzenleme: dosya değişmez
      const rel = path.relative(root, file);
      const sorted = [...edits].sort((a, b) => a.startLine - b.startLine);
      const preview = sorted.map((e) => {
        const old = [];
        for (let n = e.startLine; n <= e.endLine; n++) old.push('- ' + orig.getLine(n));
        const neu = e.text === '' ? [] : e.text.split(/\r\n|\r|\n/).map((l) => '+ ' + l);
        return `@@ satır ${e.startLine}${e.endLine >= e.startLine ? '-' + e.endLine : ' (öncesine ekleme)'} @@\n${[...old, ...neu].join('\n')}`;
      }).join('\n');
      const ok = autoApproveEdits || (await approve({ tool: name, summary: `Satır düzenle: ${rel} (${edits.length} düzenleme)`, preview: clip(preview, 4000) }));
      if (!ok) return 'Kullanıcı reddetti.';
      fs.writeFileSync(file, buf.getText(), 'utf8');
      ctx.changed.add(file);
      if (isRiskyPath(root, file)) ctx.riskyTouched = true;
      // Doğrulama için ilk düzenlemenin yeni satır numaralarıyla çevresini göster (model sonucu kontrol edebilsin)
      const first = sorted[0];
      const newCount = first.text === '' ? 0 : first.text.split(/\r\n|\r|\n/).length;
      const from = Math.max(1, first.startLine - 2);
      const to = Math.min(buf.lineCount, first.startLine + Math.max(newCount, 1) + 1);
      const ctxLines = [];
      for (let n = from; n <= to; n++) ctxLines.push(`${n}: ${buf.getLine(n)}`);
      return `Düzenlendi: ${rel} — ${edits.length} düzenleme, ${orig.lineCount} → ${buf.lineCount} satır.\n${clip(ctxLines.join('\n'), 1200)}`;
    }
    case 'replace_in_file': {
      const file = resolveInRoot(root, input.path);
      const src = fs.readFileSync(file, 'utf8');
      const old = String(input.old ?? '');
      if (!old) throw new Error('old boş olamaz.');
      const count = src.split(old).length - 1;
      if (count !== 1) throw new Error(`old dosyada ${count} kez geçiyor; tam bir kez geçmeli.`);
      const ok = autoApproveEdits || (await approve({ tool: name, summary: `Düzenle: ${path.relative(root, file)}`, preview: `- ${clip(old, 1500)}\n+ ${clip(String(input.new ?? ''), 1500)}` }));
      if (!ok) return 'Kullanıcı reddetti.';
      fs.writeFileSync(file, src.replace(old, () => String(input.new ?? '')), 'utf8');
      ctx.changed.add(file);
      if (isRiskyPath(root, file)) ctx.riskyTouched = true;
      return `Düzenlendi: ${path.relative(root, file)}`;
    }
    case 'run_command': {
      if (!allowCommands) return 'Komut çalıştırma ayarlardan kapalı.';
      const cmd = String(input.command || '').trim();
      if (!cmd || cmd.length > 2000) throw new Error('Komut geçersiz.');
      // Otonom mod: güvenli derleme/test komutu ve bu çalıştırmada derlemeyi etkileyen dosya değişmediyse onaysız
      const safe = !!ctx.autoSafeCommands && !ctx.riskyTouched && isSafeCommand(cmd);
      const ok = safe || (await approve({ tool: name, summary: ctx.riskyTouched && ctx.autoSafeCommands ? 'Komut çalıştır (derlemeyi etkileyen dosya değişti)' : 'Komut çalıştır', preview: cmd }));
      if (!ok) return 'Kullanıcı reddetti.';
      return await new Promise((resolve) => {
        exec(cmd, { cwd: root, timeout: safe || isSafeCommand(cmd) ? 180000 : 60000, maxBuffer: 1024 * 1024, windowsHide: true, env: { ...process.env, NOVA_AI_AGENT: '1' } }, (err, stdout, stderr) => {
          resolve(clip(`${err ? `çıkış hatası: ${err.code ?? err.message}\n` : ''}${stdout}${stderr ? `\n[stderr]\n${stderr}` : ''}`.trim() || '(çıktı yok)'));
        });
      });
    }
    default:
      throw new Error('Bilinmeyen araç: ' + name);
  }
}

// ---------- SSE ----------
async function* sseLines(res, signal) {
  const dec = new TextDecoder();
  let buf = '';
  for await (const chunk of res.body) {
    if (signal.aborted) return;
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).replace(/\r$/, '');
      buf = buf.slice(i + 1);
      if (line.startsWith('data:')) yield line.slice(5).trim();
    }
  }
}

async function httpError(res) {
  let detail = '';
  try { detail = (await res.text()).slice(0, 300); } catch { /* yok */ }
  const code = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate' : 'http';
  const e = new Error(`${code}:${res.status}${detail ? ' ' + detail : ''}`);
  throw e;
}

// ---------- Sağlayıcı bağdaştırıcıları (kanonik ileti biçimi: Anthropic blokları) ----------
async function callAnthropic(cfg, system, messages, tools, onText, signal) {
  const res = await fetch(cfg.base + '/v1/messages', {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: cfg.model, max_tokens: cfg.maxTokens, system, messages, ...(tools ? { tools } : {}), stream: true })
  });
  if (!res.ok) await httpError(res);
  const blocks = [];
  let stop = null;
  const usage = { in: 0, out: 0 };
  for await (const data of sseLines(res, signal)) {
    let ev; try { ev = JSON.parse(data); } catch { continue; }
    if (ev.type === 'message_start') usage.in = ev.message?.usage?.input_tokens || 0;
    else if (ev.type === 'content_block_start') blocks[ev.index] = ev.content_block.type === 'tool_use' ? { type: 'tool_use', id: ev.content_block.id, name: ev.content_block.name, _json: '' } : { type: 'text', text: '' };
    else if (ev.type === 'content_block_delta') {
      const b = blocks[ev.index];
      if (!b) continue;
      if (ev.delta.type === 'text_delta') { b.text += ev.delta.text; onText(ev.delta.text); }
      else if (ev.delta.type === 'input_json_delta') b._json += ev.delta.partial_json;
    } else if (ev.type === 'message_delta') { stop = ev.delta?.stop_reason || stop; usage.out = ev.usage?.output_tokens || usage.out; }
    else if (ev.type === 'error') throw new Error('http:' + (ev.error?.message || 'stream'));
  }
  const content = blocks.filter(Boolean).map((b) => {
    if (b.type !== 'tool_use') return b;
    let input = {}; try { input = b._json ? JSON.parse(b._json) : {}; } catch { /* boş */ }
    return { type: 'tool_use', id: b.id, name: b.name, input };
  });
  return { content, stop, usage };
}

function toOpenAIMessages(system, messages) {
  const out = [{ role: 'system', content: system }];
  for (const m of messages) {
    if (typeof m.content === 'string') { out.push({ role: m.role, content: m.content }); continue; }
    if (m.role === 'assistant') {
      const text = m.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
      const calls = m.content.filter((b) => b.type === 'tool_use').map((b) => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) } }));
      out.push({ role: 'assistant', content: text || null, ...(calls.length ? { tool_calls: calls } : {}) });
    } else {
      const results = m.content.filter((b) => b.type === 'tool_result');
      for (const r of results) out.push({ role: 'tool', tool_call_id: r.tool_use_id, content: r.content });
      const rest = m.content.filter((b) => b.type !== 'tool_result');
      if (rest.length) {
        out.push({ role: 'user', content: rest.map((b) => (b.type === 'image' ? { type: 'image_url', image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` } } : { type: 'text', text: b.text })) });
      }
    }
  }
  return out;
}

async function callOpenAI(cfg, system, messages, tools, onText, signal) {
  const headers = { 'content-type': 'application/json' };
  if (cfg.key) headers.authorization = 'Bearer ' + cfg.key;
  const res = await fetch(cfg.base + '/chat/completions', {
    method: 'POST', signal, headers,
    body: JSON.stringify({
      model: cfg.model, max_tokens: cfg.maxTokens, stream: true, stream_options: { include_usage: true },
      ...(typeof cfg.temperature === 'number' ? { temperature: cfg.temperature } : {}),
      messages: toOpenAIMessages(system, messages),
      ...(tools ? { tools: tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } })) } : {})
    })
  });
  if (!res.ok) await httpError(res);
  let text = '';
  const calls = [];
  let stop = null;
  const usage = { in: 0, out: 0 };
  // Araçlar açıkken: model araç çağrısını düz metin JSON olarak yazmış olabilir (açıklama + ```json bloğu gibi karışık da). Akış, çağrı belirtisi
  // (çit, <tool_call>, {"name":) görüldüğü yerde durur; kalan kısım akış sonunda ayrıştırılır (çağrıysa gösterilmez, değilse olduğu gibi gösterilir).
  // Belirti iki parçaya bölünebilsin diye son 14 karakter akışa son anda verilir.
  const TRIGGER = /```|<tool_call>|\{\s*"name"\s*:/;
  let emitted = 0;
  let held = false;
  for await (const data of sseLines(res, signal)) {
    if (data === '[DONE]') break;
    let ev; try { ev = JSON.parse(data); } catch { continue; }
    if (ev.usage) { usage.in = ev.usage.prompt_tokens || 0; usage.out = ev.usage.completion_tokens || 0; }
    const ch = ev.choices && ev.choices[0];
    if (!ch) continue;
    if (ch.delta?.content) {
      text += ch.delta.content;
      if (!tools) onText(ch.delta.content);
      else if (!held) {
        const idx = text.search(TRIGGER);
        if (idx >= 0) {
          if (idx > emitted) onText(text.slice(emitted, idx));
          emitted = Math.max(emitted, idx);
          held = true;
        } else {
          const safe = Math.max(emitted, text.length - 14);
          if (safe > emitted) { onText(text.slice(emitted, safe)); emitted = safe; }
        }
      }
    }
    for (const tc of ch.delta?.tool_calls || []) {
      const c = (calls[tc.index] = calls[tc.index] || { id: '', name: '', args: '' });
      if (tc.id) c.id = tc.id;
      if (tc.function?.name) c.name += tc.function.name;
      if (tc.function?.arguments) c.args += tc.function.arguments;
    }
    if (ch.finish_reason) stop = ch.finish_reason;
  }
  const textCalls = [];
  if (tools && emitted < text.length) {
    const tail = text.slice(emitted); // akışa verilmemiş kısım (çağrı belirtisinden sonrası ve son 14 karakter)
    const found = !calls.length ? extractToolCalls(tail, new Set(tools.map((x) => x.name))) : { calls: [], remaining: tail };
    if (found.calls.length) textCalls.push(...found.calls);
    if (found.remaining.trim()) onText(found.remaining); // çağrı değilse metin olduğu gibi, çağrıysa yalnız çağrı dışı açıklama gösterilir
    text = text.slice(0, emitted) + found.remaining;
  }
  const content = [];
  if (text) content.push({ type: 'text', text });
  for (const c of calls.filter(Boolean)) {
    let input = {}; try { input = c.args ? JSON.parse(c.args) : {}; } catch { /* boş */ }
    content.push({ type: 'tool_use', id: c.id || 'call_' + Math.random().toString(36).slice(2, 10), name: c.name, input });
  }
  for (const c of textCalls) content.push({ type: 'tool_use', id: 'call_' + Math.random().toString(36).slice(2, 10), name: c.name, input: c.input });
  return { content, stop: calls.length || textCalls.length ? 'tool_use' : stop, usage };
}

// Bazı yerel modeller (ör. qwen2.5-coder) araç çağrısını yapılandırılmış alan yerine düz metin JSON olarak yazar:
// {"name":"read_file","arguments":{...}} — düz, ```json çitli veya <tool_call> etiketli. Bilinen araç adıyla eşleşenler gerçek çağrıya çevrilir;
// çağrı olmayan JSON (ör. kod örneği) varsa metin olduğu gibi bırakılır.
function extractToolCalls(text, toolNames) {
  const rest = text.replace(/<\/?tool_call>/gi, ' ').replace(/```(?:json)?/gi, ' ');
  const spans = [];
  const out = [];
  let i = 0;
  while (i < rest.length) {
    const start = rest.indexOf('{', i);
    if (start < 0) break;
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let k = start; k < rest.length; k++) {
      const ch = rest[k];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { end = k; break; } }
    }
    if (end < 0) break;
    let obj = null; try { obj = JSON.parse(rest.slice(start, end + 1)); } catch { /* JSON değil */ }
    const args = obj && (obj.arguments ?? obj.parameters ?? obj.input);
    if (obj && typeof obj.name === 'string' && toolNames.has(obj.name) && (args === undefined || (args && typeof args === 'object' && !Array.isArray(args)))) {
      out.push({ name: obj.name, input: args || {} });
      spans.push([start, end + 1]);
    }
    i = end + 1;
  }
  if (!out.length) return { calls: [], remaining: text };
  let remaining = '';
  let pos = 0;
  for (const [a, b] of spans) { remaining += rest.slice(pos, a); pos = b; }
  remaining += rest.slice(pos);
  return { calls: out.slice(0, 4), remaining: remaining.trim() };
}

// ---------- Sistem istemi ----------
function loadProjectInstructions(root) {
  if (!root) return '';
  for (const rel of ['.nova/instructions.md', 'AGENTS.md']) {
    try {
      const f = path.join(root, rel);
      if (fs.statSync(f).isFile()) return `\n\n# Proje yönergeleri (${rel})\n` + fs.readFileSync(f, 'utf8').slice(0, 8000);
    } catch { /* yok */ }
  }
  return '';
}

// ---------- Düşünme seviyesi (mod başına ayar) ----------
// Yerel model (qwen2.5-coder) yerleşik "düşünme modu" sunmaz; seviye sıcaklığı ve sistem istemindeki çalışma biçimini değiştirir.
const THINKING = {
  fast: { temp: { ask: 0.5, agent: 0.3 }, text: 'Düşünme düzeyi: HIZLI. Doğrudan ve kısa yanıtla; gerekmedikçe uzun açıklama yazma.' },
  balanced: { temp: { ask: 0.35, agent: 0.2 }, text: 'Düşünme düzeyi: DENGELİ. Gerekirse kısa bir plan yap, sonra net yanıtla.' },
  deep: {
    temp: { ask: 0.2, agent: 0.1 },
    text: 'Düşünme düzeyi: DERİN. Yanıtlamadan önce sorunu adım adım düşün; uç durumları, olası hataları ve alternatifleri kontrol et; sonra sonucu ve kısa gerekçeyi ver. Düşünce sürecini uzun uzun yazma.',
    agent: 'Derin çalışma: değişiklikten önce ilgili tüm dosyaları oku, etkilenen yerleri ara, sonra değiştir ve mümkünse sonucu doğrula (derleme/test).'
  }
};
const thinkingOf = (x) => THINKING[x] || THINKING.balanced;

// ---------- Yerel dikte (whisper.cpp): sabit adres, sabit model, uygulama başlatır ----------
// Elle sunucu/model seçimi yoktur. Bileşenler %LOCALAPPDATA%\NovaWhisper altındadır (NOVA_WHISPER_DIR ile değiştirilebilir).
const WHISPER_PORT = 8080;
const WHISPER_ROOT = `http://127.0.0.1:${WHISPER_PORT}`;
let whisperProc = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function whisperUp() {
  try { await fetch(WHISPER_ROOT + '/', { signal: AbortSignal.timeout(1200) }); return true; } catch { return false; }
}
async function ensureWhisper() {
  if (await whisperUp()) return true;
  const dir = process.env.NOVA_WHISPER_DIR || path.join(process.env.LOCALAPPDATA || os.homedir(), 'NovaWhisper');
  const exe = path.join(dir, 'bin', 'Release', process.platform === 'win32' ? 'whisper-server.exe' : 'whisper-server');
  const model = path.join(dir, 'models', 'ggml-small.bin');
  if (!fs.existsSync(exe) || !fs.existsSync(model)) return false;
  if (!whisperProc) {
    const env = { ...process.env };
    const pk = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
    const ff = path.join(dir, 'ffmpeg', 'bin'); // webm -> wav dönüşümü için
    if (fs.existsSync(ff)) env[pk] = ff + path.delimiter + (env[pk] || '');
    const threads = Math.max(2, Math.min(8, Math.floor(os.cpus().length / 2)));
    // Yalnız bu bilgisayardan erişilir (127.0.0.1); ekran kartı belleği Ollama modeline kalır (--no-gpu)
    const p = spawn(exe, ['--model', model, '--host', '127.0.0.1', '--port', String(WHISPER_PORT), '--inference-path', '/v1/audio/transcriptions', '--language', 'tr', '--threads', String(threads), '-bs', '5', '--convert', '--no-gpu'], { env, windowsHide: true, stdio: 'ignore' });
    p.on('exit', () => { if (whisperProc === p) whisperProc = null; });
    p.on('error', () => { if (whisperProc === p) whisperProc = null; });
    whisperProc = p;
  }
  for (let i = 0; i < 48; i++) { // en çok ~36 sn: model yükleme
    if (await whisperUp()) return true;
    if (!whisperProc) return false;
    await sleep(750);
  }
  return false;
}
function stopWhisper() {
  try { if (whisperProc) whisperProc.kill(); } catch { /* kapanmış */ }
  whisperProc = null;
}

// Kullanıcının mod başına özel yönergesi (Ayarlar → Yapay Zekâ): kısa düz metin; sistem istemine eklenir.
function cleanInstructions(x) {
  const t = String(x || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, 1500);
  return t ? `\n\n# Kullanıcı yönergeleri\n${t}` : '';
}

function buildSystem({ root, lang, agent, project, extra = '', thinking, autonomy }) {
  const th = thinkingOf(thinking);
  // Otonomi: edits = düzenlemeler onaysız; auto = ek olarak güvenli derleme/test komutları onaysız (bkz. isSafeCommand)
  // Küçük yerel modeller için somut, adım adım yönerge (komut listesi vermek modeli dosyalarda komut aramaya itiyordu)
  const auto = autonomy === 'auto' || autonomy === 'edits'
    ? ' OTONOM ÇALIŞ: görevi bitirene kadar kendin ilerle, kullanıcıya hangi komutu veya dosyayı istediğini SORMA (yalnız gerçekten belirsizse tek kısa soru).'
      + (autonomy === 'auto'
        ? ' Derleme/test adımları: 1) read_file ile package.json oku ve "scripts" bölümünden build/test komutunu bul (package.json yoksa: Cargo.toml → "cargo build", go.mod → "go build ./...", .csproj → "dotnet build", pyproject.toml/pytest → "pytest"). 2) Komutu ARAMA, doğrudan run_command ile ÇALIŞTIR (örn. "npm run build"). Bu tür derleme/test komutları onaysız çalışır. 3) Çıktıda hata varsa hata mesajındaki dosyayı read_file ile oku ve replace_in_file ile düzelt. 4) Aynı komutu yeniden çalıştır; başarılı olana kadar 3-4. adımları tekrarla. 5) Sonunda ne yaptığını iki cümleyle özetle. Her komutu ayrı çağır (&&, |, ; kullanma). package.json veya yapı betiklerini değiştirirsen sonraki komut onay ister.'
        : ' Dosya düzenlemeleri onaysızdır; komut çalıştırmak için onay gerekir.')
    : '';
  const langName = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'русский', ar: 'العربية', es: 'español', fr: 'français', az: 'azərbaycanca' }[lang] || 'Türkçe';
  // Türkçe duyarlılığı: doğal dil, dikteyle gelen hatalı yazımı anlama, teknik terim dengesi
  const trNote = lang === 'tr' ? [
    'TÜRKÇE KURALLARI: Doğal, akıcı ve doğru Türkçe yaz (ünlü uyumu, ekler, noktalama; ç ğ ı İ ö ş ü harflerini eksiksiz kullan). Çeviri kokan kalıplardan kaçın, kısa ve net cümleler kur. Kullanıcı "sen" diyorsa sen, "siz" diyorsa siz de. Kod, komut ve dosya adlarını olduğu gibi bırak; yaygın teknik terimleri (commit, branch, API, bileşen, fonksiyon) gerektiğinde İngilizce kullan.',
    'Kullanıcının mesajı sesli dikteyle yazılmış olabilir: noktalama, büyük/küçük harf ve ses benzerliğinden doğan yanlış sözcükleri (örn. "komit" = commit, "riakt" = React, "tayp skript" = TypeScript) bağlama göre anla. Emin değilsen tek kısa soruyla netleştir, tahmin yürütüp kod değiştirme.'
  ] : [];
  return [
    'Sen NovaCode Studio kod editörünün yapay zekâ asistanısın. Kısa, net ve doğru yanıt ver; emin olmadığını kesinmiş gibi sunma.',
    `Kullanıcının arayüz dili: ${langName}. Aksi istenmedikçe bu dilde yanıtla. Kodu uygun dil etiketli kod bloğuna koy.`,
    ...trNote,
    th.text + (agent && th.agent ? ' ' + th.agent : '') + (agent ? auto : ''),
    root ? `Çalışma klasörü: ${path.basename(root)}` : 'Açık çalışma klasörü yok.',
    agent
      ? 'AGENT modundasın: görevi bitirmek için araçları kullan (önce oku/ara, sonra değiştir). Değişikliklerden önce ilgili dosyayı oku. Çok satırlı değişiklikte edit_lines aracını (read_file çıktısındaki satır numaralarıyla), tek benzersiz metin değişikliğinde replace_in_file aracını kullan; düzenlemeden sonra dönen satırlarla sonucu kontrol et. Yazma ve komut araçları kullanıcı onayı ister; reddedilirse alternatif öner. Bitirince ne yaptığını kısaca özetle.'
      : 'ASK modundasın: araç yok; verilen bağlamdan yanıtla ve gerekirse kod öner.',
    'Gizli bilgileri (anahtar, token, şifre) yanıtlarında tekrar etme; .env gibi dosyalara dokunma.'
  ].join('\n') + project + extra;
}

// ---------- IPC ----------
function register({ getWindow, getRoot }) {
  const send = (channel, payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send(channel, payload);
  };

  ipcMain.handle('ai:run', async (_e, req) => {
    const runId = String(req && req.runId || '');
    if (!runId || runs.has(runId)) return { success: false, error: 'invalid-run' };
    const provider = req.provider;
    const emit = (ev) => send('ai:event', { runId, ...ev });
    const run = { abort: new AbortController(), pending: new Map() };
    runs.set(runId, run);
    try {
      // Yerleşik yerel model: anahtar/adres yok, her şey bu bilgisayarda (electron-llm.cjs)
      if (provider === 'builtin') {
        const rootDir = getRoot();
        const agentOn = req.mode === 'agent' && !!rootDir;
        const system = buildSystem({ root: rootDir, lang: req.lang, agent: agentOn, project: agentOn || req.useProject ? loadProjectInstructions(rootDir) : '', extra: cleanInstructions(req.instructions), thinking: req.thinking, autonomy: req.autonomy });
        const msgs = (Array.isArray(req.messages) ? req.messages : []).slice(-40).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', text: String(m.text || '').slice(0, 60000) }));
        const last = msgs.pop();
        if (!last || last.role !== 'user') throw new Error('Geçersiz istek.');
        const bctx = {
          root: rootDir,
          autoApproveEdits: !!req.autoApproveEdits,
          allowCommands: req.allowCommands !== false,
          changed: new Set(),
          approve: (info) => new Promise((resolve) => {
            const id = Math.random().toString(36).slice(2, 10);
            run.pending.set(id, resolve);
            emit({ type: 'approval', id, ...info });
          })
        };
        await require('./electron-llm.cjs').runBuiltin({
          modelId: String(req.model || ''), system, history: msgs, prompt: last.text, tools: TOOLS, agent: agentOn,
          runTool: (name, input) => runTool(name, input, bctx), emit, signal: run.abort.signal, maxTokens: req.maxTokens
        });
        emit({ type: 'done', changed: [...bctx.changed], ...(run.abort.signal.aborted ? { cancelled: true } : {}) });
        return { success: true };
      }
      const def = PROVIDERS[provider];
      if (!def) throw new Error('Bilinmeyen sağlayıcı.');
      const key = def.secret ? (await readSecret(def.secret)) : '';
      if (def.secret && !key) throw new Error('auth:nokey');
      const cfg = { base: safeBase(provider, req.baseUrl), key, model: String(req.model || '').slice(0, 120), maxTokens: Math.min(Math.max(Number(req.maxTokens) || 4096, 256), 32000), temperature: thinkingOf(req.thinking).temp[req.mode === 'agent' ? 'agent' : 'ask'] }; // düşük sıcaklık: kod ve Türkçe dilbilgisinde daha tutarlı
      if (!cfg.model) throw new Error('Model adı boş.');
      const root = getRoot();
      const agent = req.mode === 'agent' && !!root;
      const system = buildSystem({ root, lang: req.lang, agent, project: agent || req.useProject ? loadProjectInstructions(root) : '', extra: cleanInstructions(req.instructions), thinking: req.thinking, autonomy: req.autonomy });

      // Geçmiş + yeni kullanıcı iletisi (görseller yalnız son iletide)
      const messages = (Array.isArray(req.messages) ? req.messages : []).slice(-40).map((m, i, arr) => {
        const imgs = i === arr.length - 1 && m.role === 'user' && Array.isArray(m.images) ? m.images.slice(0, 4) : [];
        const text = String(m.text || '').slice(0, 200000);
        if (!imgs.length) return { role: m.role === 'assistant' ? 'assistant' : 'user', content: text };
        return {
          role: 'user',
          content: [
            ...imgs.filter((im) => /^image\/(png|jpeg|gif|webp)$/.test(im.mediaType) && typeof im.data === 'string' && im.data.length < 8 * 1024 * 1024)
              .map((im) => ({ type: 'image', source: { type: 'base64', media_type: im.mediaType, data: im.data } })),
            { type: 'text', text }
          ]
        };
      });

      const ctx = {
        root,
        autoApproveEdits: !!req.autoApproveEdits,
        autoSafeCommands: !!req.autoSafeCommands,
        riskyTouched: false,
        allowCommands: req.allowCommands !== false,
        changed: new Set(),
        approve: (info) => new Promise((resolve) => {
          const id = Math.random().toString(36).slice(2, 10);
          run.pending.set(id, resolve);
          emit({ type: 'approval', id, ...info });
        })
      };
      const call = provider === 'anthropic' ? callAnthropic : callOpenAI;
      const total = { in: 0, out: 0 };
      const maxSteps = Math.min(40, Math.max(5, Math.round(Number(req.maxSteps)) || MAX_STEPS));

      let nudges = 0; // küçük modeller araç çıktısından sonra boş/yarım dönebilir: en çok 3 kez "devam et" uyarısı
      let lastCmdFailed = false;
      for (let step = 0; step < (agent ? maxSteps : 1); step++) {
        const turn = await call(cfg, system, messages, agent ? TOOLS : null, (text) => emit({ type: 'text', text }), run.abort.signal);
        total.in += turn.usage.in; total.out += turn.usage.out;
        const uses = turn.content.filter((b) => b.type === 'tool_use');
        if (!agent) break;
        if (!uses.length) {
          const hadText = turn.content.some((b) => b.type === 'text' && b.text.trim());
          const stalled = step > 0 && (!hadText || (lastCmdFailed && req.autonomy && req.autonomy !== 'ask'));
          if (stalled && nudges < 3 && step < maxSteps - 1 && !run.abort.signal.aborted) {
            nudges++;
            messages.push({ role: 'assistant', content: turn.content.length ? turn.content : [{ type: 'text', text: '…' }] });
            messages.push({ role: 'user', content: lastCmdFailed
              ? 'Komut başarısız oldu. Hata mesajındaki dosyayı düzeltmek için replace_in_file veya write_file aracını ÇAĞIR, sonra komutu run_command ile tekrar çalıştır. Soru sorma.'
              : 'Devam et: görev bitmediyse bir sonraki aracı çağır; bittiyse yaptıklarını iki cümleyle özetle.' });
            continue;
          }
          break;
        }
        messages.push({ role: 'assistant', content: turn.content });
        const results = [];
        for (const u of uses) {
          if (run.abort.signal.aborted) break;
          emit({ type: 'tool', id: u.id, name: u.name, input: u.name === 'write_file' ? { path: u.input.path, bytes: String(u.input.content || '').length } : u.name === 'edit_lines' ? { path: u.input.path, edits: Array.isArray(u.input.edits) ? u.input.edits.length : 0 } : u.input });
          let out; let isError = false;
          try { out = await runTool(u.name, u.input, ctx); } catch (err) { out = 'Hata: ' + err.message; isError = true; }
          // Komut hata koduyla bittiyse (derleme/test başarısız) kart kırmızı görünsün; model çıktıyı yine okur
          const cmdFailed = u.name === 'run_command' && /^çıkış hatası:/.test(out);
          if (u.name === 'run_command') lastCmdFailed = cmdFailed; // başarısız komuttan sonra model durursa "düzelt" uyarısı gider
          else if (FILE_EDIT_TOOLS.has(u.name) && !isError) lastCmdFailed = false;
          emit({ type: 'tool_result', id: u.id, ok: !isError && !cmdFailed, text: clip(out, 1500) });
          results.push({ type: 'tool_result', tool_use_id: u.id, content: out, ...(isError ? { is_error: true } : {}) });
        }
        if (run.abort.signal.aborted) break;
        messages.push({ role: 'user', content: results });
        if (step === maxSteps - 1) emit({ type: 'text', text: '\n\n_(Adım sınırına ulaşıldı.)_' });
      }
      emit({ type: 'done', usage: total, changed: [...ctx.changed] });
      return { success: true };
    } catch (err) {
      if (run.abort.signal.aborted) { emit({ type: 'done', cancelled: true }); return { success: true }; }
      const msg = String(err && err.message || err);
      emit({ type: 'error', error: msg.replace(/sk-[\w-]{8,}/g, '<API_KEY>').slice(0, 400) });
      return { success: false, error: 'failed' };
    } finally {
      for (const resolve of run.pending.values()) resolve(false);
      runs.delete(runId);
    }
  });

  ipcMain.handle('ai:cancel', (_e, runId) => {
    const run = runs.get(String(runId));
    if (run) { run.abort.abort(); for (const r of run.pending.values()) r(false); run.pending.clear(); }
    return { success: true };
  });

  ipcMain.handle('ai:approve', (_e, runId, id, allow) => {
    const run = runs.get(String(runId));
    const resolve = run && run.pending.get(String(id));
    if (resolve) { run.pending.delete(String(id)); resolve(!!allow); }
    return { success: !!resolve };
  });

  // Dikte: ses yalnız bu bilgisayardaki whisper.cpp sunucusuna (sabit adres 127.0.0.1:8080, sabit model "small") gider;
  // ses cihazdan çıkmaz. Renderer adres/model belirleyemez. Sunucu kapalıysa uygulama kendisi başlatır (ensureWhisper).
  ipcMain.handle('ai:transcribe', async (_e, req) => {
    try {
      const buf = req && req.audio;
      if (!(buf instanceof ArrayBuffer || ArrayBuffer.isView(buf)) || buf.byteLength > MAX_AUDIO || buf.byteLength < 200) return { success: false, error: 'invalid-audio' };
      if (!(await ensureWhisper())) return { success: false, error: 'no-whisper' };
      const mime = /^audio\/(webm|ogg|mp4|mpeg|wav)/.test(String(req.mime)) ? String(req.mime).split(';')[0] : 'audio/webm';
      const form = new FormData();
      form.append('file', new Blob([buf], { type: mime }), 'dictation.' + mime.split('/')[1]);
      form.append('model', 'whisper-1');
      if (req.lang && /^[a-z]{2}$/.test(req.lang)) form.append('language', req.lang);
      // Doğruluk: sıcaklık 0 + dilde bir başlangıç ipucu (Whisper "prompt"); Türkçede teknik sözcükler ve noktalama daha iyi çıkar
      form.append('temperature', '0');
      form.append('response_format', 'json');
      const HINT = {
        tr: 'Bu bir yazılım geliştirme konuşmasıdır. Türkçe, düzgün noktalama ve büyük harflerle yazılır. Terimler: React, TypeScript, JavaScript, fonksiyon, bileşen, değişken, commit, branch, API, Ollama, Electron, klasör, dosya, hata ayıklama.',
        en: 'This is a software development conversation. Terms: React, TypeScript, JavaScript, function, component, variable, commit, branch, API, Ollama, Electron.'
      };
      if (HINT[req.lang]) form.append('prompt', HINT[req.lang]);
      const res = await fetch(WHISPER_ROOT + '/v1/audio/transcriptions', { method: 'POST', body: form, signal: AbortSignal.timeout(90000) });
      if (!res.ok) return { success: false, error: 'http' };
      const json = await res.json();
      return { success: true, text: String(json.text || '').slice(0, 20000) };
    } catch {
      return { success: false, error: 'failed' };
    }
  });

  // Ollama durumu ve yüklü modeller (yerel; anahtar yok). /v1 ekini atıp yerel API'ye sorar.
  ipcMain.handle('ai:ollamaModels', async (_e, baseUrl) => {
    try {
      const root = safeBase('ollama', baseUrl).replace(/\/v1$/, '');
      const res = await fetch(root + '/api/tags', { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return { running: false, models: [] };
      const json = await res.json();
      const models = (Array.isArray(json.models) ? json.models : []).map((m) => String(m.name || '')).filter(Boolean).slice(0, 100);
      return { running: true, models };
    } catch {
      return { running: false, models: [] };
    }
  });

  // Özel eğik çizgi komutları: <kök>/.nova/commands/*.md (ad = dosya adı, gövde = istem şablonu; {{args}} yer tutucu)
  ipcMain.handle('ai:commands', () => {
    const root = getRoot();
    if (!root) return [];
    const dir = path.join(root, '.nova', 'commands');
    try {
      return fs.readdirSync(dir).filter((f) => /^[\w-]{1,40}\.md$/.test(f)).slice(0, 50).map((f) => ({
        name: f.slice(0, -3),
        template: fs.readFileSync(path.join(dir, f), 'utf8').slice(0, 8000)
      }));
    } catch { return []; }
  });
}

module.exports = { register, stopWhisper, _test: { runTool, isSafeCommand, extractToolCalls } };
