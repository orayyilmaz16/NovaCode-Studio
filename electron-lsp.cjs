'use strict';
// Dil sunucusu köprüsü (LSP): Monaco'nun kendi dil hizmetinin olmadığı diller için (Python, Rust, Go, C/C++, C#, PHP, Ruby, Lua, YAML).
// TS/JS/JSON/CSS/HTML Monaco'nun yerleşik hizmetiyle çalışır; bu modül onların yerine geçmez.
//
// Güvenlik:
//  • Yalnız aşağıdaki sabit izin listesindeki programlar, yalnız kullanıcının PATH'inden başlatılır. Açılan projenin içindeki programlar
//    (node_modules/.bin, ./bin vb.) ASLA çalıştırılmaz: kötü niyetli bir proje bu yolla kod çalıştıramaz.
//  • Renderer rastgele komut veremez; yalnız dil kimliği, dosya yolu (çalışma klasörü içinde) ve izinli LSP yöntemlerini iletir.
//  • Sunucu yalnız stdio ile konuşur; ağ portu açılmaz.
const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL, fileURLToPath } = require('url');

const SERVERS = {
  python: [{ name: 'pyright', cmd: 'pyright-langserver', args: ['--stdio'], hint: 'npm install -g pyright' }, { name: 'pylsp', cmd: 'pylsp', args: [], hint: 'pip install python-lsp-server' }],
  rust: [{ name: 'rust-analyzer', cmd: 'rust-analyzer', args: [], hint: 'rustup component add rust-analyzer' }],
  go: [{ name: 'gopls', cmd: 'gopls', args: [], hint: 'go install golang.org/x/tools/gopls@latest' }],
  c: [{ name: 'clangd', cmd: 'clangd', args: [], hint: 'LLVM clangd' }],
  cpp: [{ name: 'clangd', cmd: 'clangd', args: [], hint: 'LLVM clangd' }],
  csharp: [{ name: 'csharp-ls', cmd: 'csharp-ls', args: [], hint: 'dotnet tool install -g csharp-ls' }],
  php: [{ name: 'intelephense', cmd: 'intelephense', args: ['--stdio'], hint: 'npm install -g intelephense' }],
  ruby: [{ name: 'solargraph', cmd: 'solargraph', args: ['stdio'], hint: 'gem install solargraph' }],
  lua: [{ name: 'lua-language-server', cmd: 'lua-language-server', args: [], hint: 'lua-language-server' }],
  yaml: [{ name: 'yaml-language-server', cmd: 'yaml-language-server', args: ['--stdio'], hint: 'npm install -g yaml-language-server' }]
};

const NOTIFY_OK = new Set(['textDocument/didOpen', 'textDocument/didChange', 'textDocument/didClose', 'textDocument/didSave']);
const REQUEST_OK = new Set(['textDocument/completion', 'textDocument/hover', 'textDocument/definition', 'textDocument/signatureHelp']);
const MAX_TEXT = 4 * 1024 * 1024;
const MAX_MSG = 32 * 1024 * 1024;

let api = { getWindow: () => null, getRoot: () => '' };
const servers = new Map(); // sunucu adı -> { def, proc, rpc, state, caps, error, restarts, root }
const emit = (payload) => {
  const w = api.getWindow();
  if (w && !w.isDestroyed()) w.webContents.send('lsp:event', payload);
};

function findExe(cmd) {
  // Windows'ta uzantısız dosya çalıştırılabilir değildir (ör. npm'in sh betiği): yalnız .exe/.cmd/.bat aranır
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat'] : [''];
  for (const dir of (process.env.PATH || process.env.Path || '').split(path.delimiter)) {
    if (!dir) continue;
    for (const e of exts) {
      try { const f = path.join(dir, cmd + e); if (fs.statSync(f).isFile()) return f; } catch { /* yok */ }
    }
  }
  return null;
}

function insideRoot(file) {
  const root = api.getRoot();
  if (!root || typeof file !== 'string' || !file || file.includes('\0')) return null;
  try {
    const real = fs.realpathSync(path.resolve(file));
    const rel = path.relative(fs.realpathSync(root), real);
    return rel.startsWith('..') || path.isAbsolute(rel) ? null : real;
  } catch { return null; }
}

const toUri = (p) => pathToFileURL(p).href;
const toPath = (u) => { try { return fileURLToPath(u); } catch { return null; } };

// ---------- JSON-RPC (Content-Length çerçeveli) ----------
class Rpc {
  constructor(proc, onNotify, onRequest) {
    this.proc = proc; this.onNotify = onNotify; this.onRequest = onRequest;
    this.buf = Buffer.alloc(0); this.next = 1; this.pending = new Map();
    proc.stdout.on('data', (d) => this._data(d));
  }
  _data(d) {
    this.buf = Buffer.concat([this.buf, d]);
    for (;;) {
      const he = this.buf.indexOf('\r\n\r\n');
      if (he < 0) return;
      const m = /Content-Length:\s*(\d+)/i.exec(this.buf.slice(0, he).toString('ascii'));
      if (!m) { this.buf = this.buf.slice(he + 4); continue; }
      const len = Number(m[1]);
      if (len > MAX_MSG) { this.buf = Buffer.alloc(0); return; }
      if (this.buf.length < he + 4 + len) return;
      const body = this.buf.slice(he + 4, he + 4 + len).toString('utf8');
      this.buf = this.buf.slice(he + 4 + len);
      let msg; try { msg = JSON.parse(body); } catch { continue; }
      this._msg(msg);
    }
  }
  _msg(m) {
    if (m.id !== undefined && m.method) { // sunucudan istek
      Promise.resolve(this.onRequest(m)).then((r) => this._send({ jsonrpc: '2.0', id: m.id, result: r === undefined ? null : r }), () => this._send({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'unsupported' } }));
    } else if (m.id !== undefined) {
      const p = this.pending.get(m.id);
      if (p) { this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message || 'lsp error')) : p.resolve(m.result); }
    } else if (m.method) this.onNotify(m.method, m.params);
  }
  _send(obj) {
    if (!this.proc.stdin.writable) return;
    const body = Buffer.from(JSON.stringify(obj), 'utf8');
    this.proc.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    this.proc.stdin.write(body);
  }
  notify(method, params) { this._send({ jsonrpc: '2.0', method, params }); }
  request(method, params, ms = 10000) {
    return new Promise((resolve, reject) => {
      const id = this.next++;
      const t = setTimeout(() => { this.pending.delete(id); reject(new Error('timeout: ' + method)); }, ms);
      this.pending.set(id, { resolve: (r) => { clearTimeout(t); resolve(r); }, reject: (e) => { clearTimeout(t); reject(e); } });
      this._send({ jsonrpc: '2.0', id, method, params });
    });
  }
  dispose() { for (const p of this.pending.values()) p.reject(new Error('closed')); this.pending.clear(); }
}

function pickServer(lang) {
  const list = SERVERS[lang];
  if (!list) return { supported: false };
  for (const def of list) { const exe = findExe(def.cmd); if (exe) return { supported: true, def, exe }; }
  return { supported: true, def: list[0], exe: null };
}

function spawnServer(def, exe, root) {
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(exe)) {
    // .cmd dosyaları cmd.exe üzerinden çalışır; komut ve argümanlar izin listesinden gelir, kullanıcı girdisi içermez
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `"\"${exe}\" ${def.args.join(' ')}"`], { cwd: root, windowsHide: true, windowsVerbatimArguments: true, stdio: ['pipe', 'pipe', 'pipe'] });
  }
  return spawn(exe, def.args, { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
}

async function ensure(lang) {
  const root = api.getRoot();
  if (!root) return { success: false, error: 'no-folder' };
  const pick = pickServer(lang);
  if (!pick.supported) return { success: false, error: 'unsupported' };
  if (!pick.exe) return { success: false, error: 'missing', name: pick.def.name, hint: pick.def.hint };
  const def = pick.def;
  let s = servers.get(def.name);
  if (s && s.root !== root) { await stopOne(def.name); s = null; }
  if (s && s.state === 'ready') return { success: true, name: def.name, state: s.state, triggers: s.caps.completionProvider?.triggerCharacters ?? [], signatureTriggers: s.caps.signatureHelpProvider?.triggerCharacters ?? [] };
  if (s && s.starting) return s.starting;

  s = { def, proc: null, rpc: null, state: 'starting', caps: {}, root, restarts: s ? s.restarts : 0, starting: null };
  servers.set(def.name, s);
  emit({ type: 'state', name: def.name, state: 'starting' });
  s.starting = (async () => {
    const proc = spawnServer(def, pick.exe, root);
    s.proc = proc;
    let stderrTail = '';
    proc.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString('utf8')).slice(-2000); });
    proc.on('error', () => { s.state = 'error'; emit({ type: 'state', name: def.name, state: 'error' }); });
    proc.on('exit', () => {
      const was = s.state;
      s.state = was === 'stopped' ? 'stopped' : 'error';
      if (servers.get(def.name) === s) servers.delete(def.name);
      s.rpc && s.rpc.dispose();
      emit({ type: 'state', name: def.name, state: s.state });
    });
    s.rpc = new Rpc(proc, (method, params) => {
      if (method === 'textDocument/publishDiagnostics' && params && typeof params.uri === 'string') {
        const file = toPath(params.uri);
        if (file) emit({ type: 'diagnostics', name: def.name, path: file, diagnostics: Array.isArray(params.diagnostics) ? params.diagnostics.slice(0, 1000) : [] });
      }
    }, (req) => {
      switch (req.method) {
        case 'workspace/configuration': return (req.params && req.params.items ? req.params.items : []).map(() => null);
        case 'workspace/workspaceFolders': return [{ uri: toUri(root), name: path.basename(root) }];
        case 'client/registerCapability': case 'client/unregisterCapability': case 'window/workDoneProgress/create': case 'window/showMessageRequest': return null;
        default: throw new Error('unsupported');
      }
    });
    try {
      const init = await s.rpc.request('initialize', {
        processId: process.pid,
        clientInfo: { name: 'NovaCode Studio' },
        rootUri: toUri(root), rootPath: root,
        workspaceFolders: [{ uri: toUri(root), name: path.basename(root) }],
        capabilities: {
          textDocument: {
            synchronization: { dynamicRegistration: false, didSave: true },
            completion: { completionItem: { snippetSupport: true, documentationFormat: ['markdown', 'plaintext'] }, contextSupport: true },
            hover: { contentFormat: ['markdown', 'plaintext'] },
            signatureHelp: { signatureInformation: { documentationFormat: ['markdown', 'plaintext'] } },
            definition: { linkSupport: false },
            publishDiagnostics: { relatedInformation: false }
          },
          workspace: { workspaceFolders: true, configuration: true }
        }
      }, 45000);
      s.caps = (init && init.capabilities) || {};
      s.rpc.notify('initialized', {});
      s.state = 'ready';
      emit({ type: 'state', name: def.name, state: 'ready' });
      return { success: true, name: def.name, state: 'ready', triggers: s.caps.completionProvider?.triggerCharacters ?? [], signatureTriggers: s.caps.signatureHelpProvider?.triggerCharacters ?? [] };
    } catch (err) {
      s.state = 'error';
      emit({ type: 'state', name: def.name, state: 'error', detail: String(err.message || err).slice(0, 200) + (stderrTail ? ' | ' + stderrTail.slice(-200) : '') });
      await stopOne(def.name);
      return { success: false, error: 'init-failed', name: def.name };
    } finally { s.starting = null; }
  })();
  return s.starting;
}

async function stopOne(name) {
  const s = servers.get(name);
  if (!s) return;
  servers.delete(name);
  s.state = 'stopped';
  try { await s.rpc.request('shutdown', null, 2000); s.rpc.notify('exit', null); } catch { /* yanıt vermedi */ }
  try { s.rpc.dispose(); } catch { /* kapalı */ }
  // Windows'ta .cmd sarmalayıcısı (cmd.exe) altında asıl sunucu süreci yaşar: tüm süreç ağacı kapatılır
  if (process.platform === 'win32' && s.proc.pid) {
    await new Promise((res) => { const k = spawn('taskkill', ['/pid', String(s.proc.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); k.on('exit', res); k.on('error', res); });
  } else { try { s.proc.kill(); } catch { /* bitmiş */ } }
}

// Sonuçlardaki uri'ler renderer için yola çevrilir (renderer dosya URI'siyle uğraşmaz)
function mapLocations(r) {
  const arr = Array.isArray(r) ? r : r ? [r] : [];
  return arr.map((x) => {
    const uri = x.uri || x.targetUri;
    const file = uri && toPath(uri);
    const range = x.range || x.targetSelectionRange || x.targetRange;
    return file && range ? { path: file, range } : null;
  }).filter(Boolean).slice(0, 50);
}

function register({ getWindow, getRoot }) {
  api = { getWindow, getRoot };
  const guard = (fn) => async (_e, ...a) => { try { return await fn(...a); } catch (err) { return { success: false, error: String(err && err.message || err).slice(0, 200) }; } };

  ipcMain.handle('lsp:status', guard((req) => {
    const lang = String(req && req.lang || '');
    const pick = pickServer(lang);
    if (!pick.supported) return { supported: false };
    const s = servers.get(pick.def.name);
    return { supported: true, name: pick.def.name, available: !!pick.exe, hint: pick.def.hint, state: s ? s.state : 'idle' };
  }));

  ipcMain.handle('lsp:start', guard((req) => ensure(String(req && req.lang || ''))));

  ipcMain.handle('lsp:notify', guard(async (req) => {
    const r = req || {};
    const file = insideRoot(r.path);
    const pick = pickServer(String(r.lang || ''));
    const s = pick.def && servers.get(pick.def.name);
    if (!file || !s || s.state !== 'ready' || !NOTIFY_OK.has(r.method)) return { success: false };
    const params = JSON.parse(JSON.stringify(r.params || {}));
    params.textDocument = { ...(params.textDocument || {}), uri: toUri(file) };
    if (typeof params.textDocument.text === 'string' && params.textDocument.text.length > MAX_TEXT) return { success: false, error: 'too-large' };
    if (Array.isArray(params.contentChanges) && params.contentChanges.some((c) => typeof c.text !== 'string' || c.text.length > MAX_TEXT)) return { success: false, error: 'too-large' };
    s.rpc.notify(r.method, params);
    return { success: true };
  }));

  ipcMain.handle('lsp:request', guard(async (req) => {
    const r = req || {};
    const file = insideRoot(r.path);
    const pick = pickServer(String(r.lang || ''));
    const s = pick.def && servers.get(pick.def.name);
    if (!file || !s || s.state !== 'ready' || !REQUEST_OK.has(r.method)) return { success: false, error: 'not-ready' };
    const params = JSON.parse(JSON.stringify(r.params || {}));
    params.textDocument = { uri: toUri(file) };
    const result = await s.rpc.request(r.method, params, 10000);
    return { success: true, result: r.method === 'textDocument/definition' ? mapLocations(result) : result };
  }));
}

async function stopAll() { for (const name of [...servers.keys()]) await stopOne(name); }

module.exports = { register, stopAll, _test: { SERVERS, findExe } };
