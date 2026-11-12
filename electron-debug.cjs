'use strict';
// Hata ayıklayıcı (Node.js / JavaScript): V8 Inspector protokolü (Chrome DevTools Protocol) ile.
// Çalışma klasöründeki bir .js/.mjs/.cjs dosyası `--inspect-brk=0` ile başlatılır; Electron içinde kendi Node'u (ELECTRON_RUN_AS_NODE) kullanılır,
// yani sistemde Node kurulu olmak zorunda değildir. Tek oturum aynı anda çalışır.
//
// Güvenlik: yalnız açık çalışma klasörü içindeki dosya çalıştırılır (realpath ile sembolik bağ kaçışı kontrol edilir); denetleyici portu
// yalnız 127.0.0.1'dedir ve rastgeledir; renderer yalnız aşağıdaki IPC kanallarını çağırabilir; ifade değerlendirme yalnız kullanıcının kendi
// hata ayıklama oturumunda çalışır.
const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fileURLToPath, pathToFileURL } = require('url');
const WebSocket = require('ws');

let api = { getWindow: () => null, getRoot: () => '' };
let sess = null; // { child, ws, nextId, pending, scripts, frames, bpIds, exited }
const bps = new Map(); // dosya (mutlak yol) -> satırlar (1 tabanlı)
const MAX_BP = 500;

const emit = (payload) => {
  const w = api.getWindow();
  if (w && !w.isDestroyed()) w.webContents.send('dbg:event', payload);
};

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function insideRoot(file) {
  const root = api.getRoot();
  if (!root || typeof file !== 'string' || !file || file.includes('\0')) return null;
  try {
    const real = fs.realpathSync(path.resolve(file));
    const realRoot = fs.realpathSync(root);
    const rel = path.relative(realRoot, real);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return real;
  } catch {
    return null;
  }
}

function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    if (!sess || sess.exited || sess.ws.readyState !== WebSocket.OPEN) return reject(new Error('oturum yok'));
    const id = sess.nextId++;
    const timer = setTimeout(() => { sess && sess.pending.delete(id); reject(new Error('zaman aşımı: ' + method)); }, 15000);
    sess.pending.set(id, { resolve: (r) => { clearTimeout(timer); resolve(r); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    sess.ws.send(JSON.stringify({ id, method, params }));
  });
}

const preview = (v) => {
  if (!v) return 'undefined';
  if (v.type === 'string') return JSON.stringify(v.value);
  if (v.type === 'undefined') return 'undefined';
  if (v.subtype === 'null') return 'null';
  if ('value' in v && v.value !== undefined) return String(v.value);
  return String(v.description || v.className || v.type).slice(0, 200);
};

function toFile(url) {
  if (typeof url !== 'string' || !url.startsWith('file:')) return null;
  try { return fileURLToPath(url); } catch { return null; }
}

async function applyBreakpoints(file) {
  if (!sess) return [];
  for (const id of sess.bpIds.get(file) || []) { try { await cdp('Debugger.removeBreakpoint', { breakpointId: id }); } catch { /* yok */ } }
  sess.bpIds.set(file, []);
  const out = [];
  const regex = '^' + reEsc(pathToFileURL(file).href) + '$';
  for (const line of bps.get(file) || []) {
    try {
      const r = await cdp('Debugger.setBreakpointByUrl', { lineNumber: line - 1, urlRegex: regex });
      sess.bpIds.get(file).push(r.breakpointId);
      sess.bpFile.set(r.breakpointId, file);
      out.push({ line, verified: Array.isArray(r.locations) && r.locations.length > 0 });
    } catch {
      out.push({ line, verified: false });
    }
  }
  return out;
}

function onMessage(raw) {
  let m; try { m = JSON.parse(raw); } catch { return; }
  if (m.id && sess && sess.pending.has(m.id)) {
    const p = sess.pending.get(m.id);
    sess.pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error.message || 'cdp hata')); else p.resolve(m.result || {});
    return;
  }
  if (!sess) return;
  if (m.method === 'Debugger.scriptParsed') {
    sess.scripts.set(m.params.scriptId, m.params.url || '');
  } else if (m.method === 'Debugger.paused') {
    const p = m.params;
    if (p.reason === 'Break on start' && !sess.stopOnEntry) { void cdp('Debugger.resume').catch(() => {}); return; }
    sess.frames = new Map();
    const frames = p.callFrames.map((cf) => {
      sess.frames.set(cf.callFrameId, cf);
      const url = sess.scripts.get(cf.location.scriptId) || '';
      return { id: cf.callFrameId, name: cf.functionName || '(anonim)', file: toFile(url), url, line: cf.location.lineNumber + 1, column: (cf.location.columnNumber || 0) + 1 };
    });
    emit({ type: 'paused', reason: p.reason, frames, hit: (p.hitBreakpoints || []).length });
  } else if (m.method === 'Debugger.breakpointResolved') {
    // betik yüklenince kesme noktası gerçek konuma çözülür: arayüzde "doğrulandı" olarak gösterilir
    const file = sess.bpFile.get(m.params.breakpointId);
    if (file) emit({ type: 'bpVerified', file, line: m.params.location.lineNumber + 1 });
  } else if (m.method === 'Debugger.resumed') {
    emit({ type: 'resumed' });
  }
}

async function start({ file, args, stopOnEntry }) {
  if (sess) await stop();
  const root = api.getRoot();
  if (!root) return { success: false, error: 'no-folder' };
  const abs = insideRoot(file);
  if (!abs || !/\.(c|m)?js$/i.test(abs) || !fs.statSync(abs).isFile()) return { success: false, error: 'invalid-file' };
  const extra = (Array.isArray(args) ? args : []).slice(0, 20).map(String).filter((a) => a.length < 500 && !a.includes('\0'));

  const child = spawn(process.execPath, ['--inspect-brk=0', abs, ...extra], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NOVA_DEBUG: '1' }
  });
  const s = { child, ws: null, nextId: 1, pending: new Map(), scripts: new Map(), frames: new Map(), bpIds: new Map(), bpFile: new Map(), exited: false, stopOnEntry: !!stopOnEntry, file: abs };
  sess = s;

  child.stdout.on('data', (d) => emit({ type: 'output', stream: 'stdout', text: d.toString('utf8') }));
  let wsUrl = null;
  child.stderr.on('data', (d) => {
    const text = d.toString('utf8');
    const m = /ws:\/\/127\.0\.0\.1:\d+\/[\w-]+/.exec(text);
    if (m && !wsUrl) wsUrl = m[0];
    // Program bitince Node, denetleyici bağlıyken çıkmadan önce bağlantının kapanmasını bekler: bağlantıyı biz kapatırız
    if (/Waiting for the debugger to disconnect/.test(text)) { try { s.ws && s.ws.close(); } catch { /* kapalı */ } }
    const shown = text.split(/\r?\n/).filter((l) => l && !/^Debugger listening on|^For help, see:|^Debugger attached\.|^Waiting for the debugger/.test(l)).join('\n');
    if (shown) emit({ type: 'output', stream: 'stderr', text: shown + '\n' });
  });
  child.on('exit', (code) => {
    s.exited = true;
    for (const p of s.pending.values()) p.reject(new Error('oturum bitti'));
    s.pending.clear();
    try { s.ws && s.ws.close(); } catch { /* kapalı */ }
    if (sess === s) sess = null;
    emit({ type: 'exited', code: code ?? 0 });
  });
  child.on('error', (e) => { emit({ type: 'error', message: String(e.message || e) }); });

  const t0 = Date.now();
  while (!wsUrl && !s.exited && Date.now() - t0 < 10000) await new Promise((r) => setTimeout(r, 40));
  if (!wsUrl) { await stop(); return { success: false, error: 'no-inspector' }; }

  s.ws = new WebSocket(wsUrl, { perMessageDeflate: false });
  s.ws.on('message', (d) => onMessage(d.toString('utf8')));
  await new Promise((res, rej) => { s.ws.once('open', res); s.ws.once('error', rej); });
  emit({ type: 'started', file: abs });
  await cdp('Runtime.enable');
  await cdp('Debugger.enable');
  for (const f of bps.keys()) await applyBreakpoints(f);
  await cdp('Runtime.runIfWaitingForDebugger');
  return { success: true };
}

async function stop() {
  const s = sess;
  if (!s) return { success: true };
  try { s.child.kill(); } catch { /* bitmiş */ }
  const t0 = Date.now();
  while (!s.exited && Date.now() - t0 < 3000) await new Promise((r) => setTimeout(r, 30));
  if (sess === s) sess = null;
  return { success: true };
}

const int = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;

function register({ getWindow, getRoot }) {
  api = { getWindow, getRoot };
  const guard = (fn) => async (_e, ...a) => {
    try { return await fn(...a); } catch (err) { return { success: false, error: String(err && err.message || err).slice(0, 200) }; }
  };

  ipcMain.handle('dbg:start', guard((req) => start({ file: req && req.file, args: req && req.args, stopOnEntry: req && req.stopOnEntry })));
  ipcMain.handle('dbg:stop', guard(() => stop()));
  ipcMain.handle('dbg:setBreakpoints', guard(async (req) => {
    const file = insideRoot(req && req.file);
    if (!file) return { success: false, error: 'invalid-file' };
    const lines = [...new Set((Array.isArray(req.lines) ? req.lines : []).filter((n) => int(n, 1, 1000000)))].sort((a, b) => a - b).slice(0, MAX_BP);
    if (lines.length) bps.set(file, lines); else bps.delete(file);
    return { success: true, breakpoints: sess ? await applyBreakpoints(file) : lines.map((line) => ({ line, verified: false })) };
  }));
  const simple = (method) => guard(async () => { await cdp(method); return { success: true }; });
  ipcMain.handle('dbg:resume', simple('Debugger.resume'));
  ipcMain.handle('dbg:stepOver', simple('Debugger.stepOver'));
  ipcMain.handle('dbg:stepInto', simple('Debugger.stepInto'));
  ipcMain.handle('dbg:stepOut', simple('Debugger.stepOut'));
  ipcMain.handle('dbg:pause', simple('Debugger.pause'));
  ipcMain.handle('dbg:scopes', guard(async (req) => {
    const cf = sess && sess.frames.get(String(req && req.frameId));
    if (!cf) return { success: false, error: 'no-frame' };
    const names = { local: 'Yerel', closure: 'Kapsam', block: 'Blok', catch: 'Catch', script: 'Betik', module: 'Modül', with: 'With' };
    const scopes = cf.scopeChain.filter((sc) => sc.type !== 'global' && sc.object && sc.object.objectId).map((sc) => ({ name: names[sc.type] || sc.type, ref: sc.object.objectId, expanded: sc.type === 'local' }));
    if (cf.this && cf.this.objectId) scopes.unshift({ name: 'this', ref: cf.this.objectId, expanded: false });
    return { success: true, scopes };
  }));
  ipcMain.handle('dbg:properties', guard(async (req) => {
    const ref = String(req && req.ref || '');
    if (!ref || ref.length > 200) return { success: false, error: 'invalid-ref' };
    const r = await cdp('Runtime.getProperties', { objectId: ref, ownProperties: true, generatePreview: true });
    const props = (r.result || []).filter((p) => p.name !== '__proto__' && p.value).slice(0, 200).map((p) => ({ name: p.name, value: preview(p.value), type: p.value.subtype || p.value.type, ref: p.value.objectId || null }));
    return { success: true, props };
  }));
  ipcMain.handle('dbg:evaluate', guard(async (req) => {
    const expr = String(req && req.expr || '').slice(0, 2000);
    if (!expr.trim()) return { success: false, error: 'empty' };
    const frameId = req && req.frameId && sess && sess.frames.has(String(req.frameId)) ? String(req.frameId) : null;
    const r = frameId
      ? await cdp('Debugger.evaluateOnCallFrame', { callFrameId: frameId, expression: expr, generatePreview: true, silent: true })
      : await cdp('Runtime.evaluate', { expression: expr, generatePreview: true, silent: true });
    if (r.exceptionDetails) return { success: true, error: String((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).split('\n')[0].slice(0, 300) };
    return { success: true, value: preview(r.result), type: r.result.subtype || r.result.type, ref: r.result.objectId || null };
  }));
}

module.exports = { register, stopAll: () => stop(), _test: { start, stop } };
