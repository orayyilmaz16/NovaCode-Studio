// Yapay zekâ asistanı (ana süreç): çoklu sağlayıcı (Anthropic, OpenAI uyumlu, Ollama), akış, agentic araç döngüsü, dikte.
// Güvenlik:
// - API anahtarı yalnız burada (şifreli depodan) okunur; renderer'a hiç geçmez.
// - Araçlar yalnız açık çalışma klasörü içinde çalışır (gerçek yol + sembolik bağ denetimi); gizli dosyalar reddedilir.
// - Yazma/komut araçları kullanıcı onayı ister (yazma için "otomatik onay" ayarı opsiyoneldir; komut her zaman sorar).
// - Özel taban adres yalnız https:// veya yerel (localhost/127.0.0.1) http:// olabilir.
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { readSecret } = require('./electron-secrets.cjs');
const search = require('./electron-search.cjs');

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
  { name: 'replace_in_file', description: 'Dosyada tek bir benzersiz metni değiştirir (old, dosyada tam bir kez geçmeli). Kullanıcı onayı gerekir.', input_schema: { type: 'object', properties: { path: { type: 'string' }, old: { type: 'string' }, new: { type: 'string' } }, required: ['path', 'old', 'new'] } },
  { name: 'run_command', description: 'Çalışma klasöründe kabuk komutu çalıştırır (60 sn sınır). Her zaman kullanıcı onayı gerekir.', input_schema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] } }
];

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
      return `Yazıldı: ${path.relative(root, file)}`;
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
      return `Düzenlendi: ${path.relative(root, file)}`;
    }
    case 'run_command': {
      if (!allowCommands) return 'Komut çalıştırma ayarlardan kapalı.';
      const cmd = String(input.command || '').trim();
      if (!cmd || cmd.length > 2000) throw new Error('Komut geçersiz.');
      const ok = await approve({ tool: name, summary: 'Komut çalıştır', preview: cmd });
      if (!ok) return 'Kullanıcı reddetti.';
      return await new Promise((resolve) => {
        exec(cmd, { cwd: root, timeout: 60000, maxBuffer: 1024 * 1024, windowsHide: true, env: { ...process.env, NOVA_AI_AGENT: '1' } }, (err, stdout, stderr) => {
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
      messages: toOpenAIMessages(system, messages),
      ...(tools ? { tools: tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } })) } : {})
    })
  });
  if (!res.ok) await httpError(res);
  let text = '';
  const calls = [];
  let stop = null;
  const usage = { in: 0, out: 0 };
  for await (const data of sseLines(res, signal)) {
    if (data === '[DONE]') break;
    let ev; try { ev = JSON.parse(data); } catch { continue; }
    if (ev.usage) { usage.in = ev.usage.prompt_tokens || 0; usage.out = ev.usage.completion_tokens || 0; }
    const ch = ev.choices && ev.choices[0];
    if (!ch) continue;
    if (ch.delta?.content) { text += ch.delta.content; onText(ch.delta.content); }
    for (const tc of ch.delta?.tool_calls || []) {
      const c = (calls[tc.index] = calls[tc.index] || { id: '', name: '', args: '' });
      if (tc.id) c.id = tc.id;
      if (tc.function?.name) c.name += tc.function.name;
      if (tc.function?.arguments) c.args += tc.function.arguments;
    }
    if (ch.finish_reason) stop = ch.finish_reason;
  }
  const content = [];
  if (text) content.push({ type: 'text', text });
  for (const c of calls.filter(Boolean)) {
    let input = {}; try { input = c.args ? JSON.parse(c.args) : {}; } catch { /* boş */ }
    content.push({ type: 'tool_use', id: c.id || 'call_' + Math.random().toString(36).slice(2, 10), name: c.name, input });
  }
  return { content, stop: calls.length ? 'tool_use' : stop, usage };
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

function buildSystem({ root, lang, agent, project }) {
  const langName = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'русский', ar: 'العربية', es: 'español', fr: 'français', az: 'azərbaycanca' }[lang] || 'Türkçe';
  return [
    'Sen NovaCode Studio kod editörünün yapay zekâ asistanısın. Kısa, net ve doğru yanıt ver; emin olmadığını kesinmiş gibi sunma.',
    `Kullanıcının arayüz dili: ${langName}. Aksi istenmedikçe bu dilde yanıtla. Kodu uygun dil etiketli kod bloğuna koy.`,
    root ? `Çalışma klasörü: ${path.basename(root)}` : 'Açık çalışma klasörü yok.',
    agent
      ? 'AGENT modundasın: görevi bitirmek için araçları kullan (önce oku/ara, sonra değiştir). Değişikliklerden önce ilgili dosyayı oku. Yazma ve komut araçları kullanıcı onayı ister; reddedilirse alternatif öner. Bitirince ne yaptığını kısaca özetle.'
      : 'ASK modundasın: araç yok; verilen bağlamdan yanıtla ve gerekirse kod öner.',
    'Gizli bilgileri (anahtar, token, şifre) yanıtlarında tekrar etme; .env gibi dosyalara dokunma.'
  ].join('\n') + project;
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
        const system = buildSystem({ root: rootDir, lang: req.lang, agent: agentOn, project: agentOn || req.useProject ? loadProjectInstructions(rootDir) : '' });
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
      const cfg = { base: safeBase(provider, req.baseUrl), key, model: String(req.model || '').slice(0, 120), maxTokens: Math.min(Math.max(Number(req.maxTokens) || 4096, 256), 32000) };
      if (!cfg.model) throw new Error('Model adı boş.');
      const root = getRoot();
      const agent = req.mode === 'agent' && !!root;
      const system = buildSystem({ root, lang: req.lang, agent, project: agent || req.useProject ? loadProjectInstructions(root) : '' });

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

      for (let step = 0; step < (agent ? MAX_STEPS : 1); step++) {
        const turn = await call(cfg, system, messages, agent ? TOOLS : null, (text) => emit({ type: 'text', text }), run.abort.signal);
        total.in += turn.usage.in; total.out += turn.usage.out;
        const uses = turn.content.filter((b) => b.type === 'tool_use');
        if (!agent || !uses.length) break;
        messages.push({ role: 'assistant', content: turn.content });
        const results = [];
        for (const u of uses) {
          if (run.abort.signal.aborted) break;
          emit({ type: 'tool', id: u.id, name: u.name, input: u.name === 'write_file' ? { path: u.input.path, bytes: String(u.input.content || '').length } : u.input });
          let out; let isError = false;
          try { out = await runTool(u.name, u.input, ctx); } catch (err) { out = 'Hata: ' + err.message; isError = true; }
          emit({ type: 'tool_result', id: u.id, ok: !isError, text: clip(out, 1500) });
          results.push({ type: 'tool_result', tool_use_id: u.id, content: out, ...(isError ? { is_error: true } : {}) });
        }
        if (run.abort.signal.aborted) break;
        messages.push({ role: 'user', content: results });
        if (step === MAX_STEPS - 1) emit({ type: 'text', text: '\n\n_(Adım sınırına ulaşıldı.)_' });
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

  // Dikte: ses kaydı OpenAI uyumlu transkripsiyon API'sine gider (3. parti; kullanıcı açık rızası arayüzde alınır).
  ipcMain.handle('ai:transcribe', async (_e, req) => {
    try {
      // Yerel sunucu (whisper.cpp / faster-whisper-server vb.) anahtarsız çalışır; uzak adres için OpenAI anahtarı gerekir.
      const base = safeBase('openai', req.baseUrl);
      const key = isLoopback(base) ? '' : await readSecret('aiKey_openai');
      if (!key && !isLoopback(base)) return { success: false, error: 'nokey' };
      const buf = req && req.audio;
      if (!(buf instanceof ArrayBuffer || ArrayBuffer.isView(buf)) || buf.byteLength > MAX_AUDIO || buf.byteLength < 200) return { success: false, error: 'invalid-audio' };
      const mime = /^audio\/(webm|ogg|mp4|mpeg|wav)/.test(String(req.mime)) ? String(req.mime).split(';')[0] : 'audio/webm';
      const form = new FormData();
      form.append('file', new Blob([buf], { type: mime }), 'dictation.' + mime.split('/')[1]);
      form.append('model', String(req.model || 'whisper-1').slice(0, 80));
      if (req.lang && /^[a-z]{2}$/.test(req.lang)) form.append('language', req.lang);
      const res = await fetch(base + '/audio/transcriptions', { method: 'POST', headers: key ? { authorization: 'Bearer ' + key } : {}, body: form, signal: AbortSignal.timeout(60000) });
      if (!res.ok) return { success: false, error: res.status === 401 ? 'auth' : 'http' };
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

module.exports = { register };
