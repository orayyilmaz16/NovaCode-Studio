// Kod önizlemesi için ayrı köken (S-01): önizlenen sayfa uygulamanın CSP'sini miras almasın diye
// `nova-preview://<kimlik>/` şemasından, KENDİ (gevşek) CSP başlığıyla sunulur. Saf mantık burada (testi: scripts/tests/preview-csp.test.cjs);
// Electron'a bağlanan kısım (şema kaydı, protocol.handle, IPC) electron-main.cjs içindedir.
// Önizleme sayfasında preload/node yoktur (iframe alt çerçevesidir ve sandbox'lıdır).
const crypto = require('crypto');

const PREVIEW_SCHEME = 'nova-preview';
const MAX_HTML_BYTES = 8 * 1024 * 1024;
const MAX_ENTRIES = 16;
const TTL_MS = 60 * 60 * 1000;
const ID_RE = /^[0-9a-f]{32}$/;

// Önizlenen sayfa CDN, eval, fetch, WebSocket kullanabilir (kullanıcının kendi kodu); uygulamanın kaynaklarına erişemez
// (kendi kökeni opak/ayrı; üst belge file:// veya dev sunucusu). Eklenti/node yok. Form ve üst gezinme sandbox bayraklarıyla sınırlı.
const PREVIEW_CSP = [
  "default-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:* 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss:",
  "img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'self'"
].join('; ');

function createPreviewStore(opts = {}) {
  const max = opts.max || MAX_ENTRIES;
  const ttl = opts.ttlMs || TTL_MS;
  const now = opts.now || Date.now;
  const map = new Map(); // kimlik -> { html, until } (ekleme sırası = en eski önce)
  const sweep = () => { const t = now(); for (const [k, v] of map) if (v.until <= t) map.delete(k); };
  return {
    put(html) {
      if (typeof html !== 'string' || Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) return null;
      sweep();
      while (map.size >= max) map.delete(map.keys().next().value);
      const id = crypto.randomBytes(16).toString('hex');
      map.set(id, { html, until: now() + ttl });
      return id;
    },
    get(id) {
      const v = typeof id === 'string' && ID_RE.test(id) ? map.get(id) : undefined;
      if (!v) return null;
      if (v.until <= now()) { map.delete(id); return null; }
      return v.html;
    },
    drop(id) { if (typeof id === 'string') map.delete(id); },
    size() { return map.size; }
  };
}

// İstek → { status, headers, body }. Yalnız GET/HEAD, geçerli kimlik, kök yol.
function previewResponse(store, rawUrl, method = 'GET') {
  const plain = (status) => ({ status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }, body: '' });
  let u;
  try { u = new URL(rawUrl); } catch { return plain(400); }
  if (u.protocol !== `${PREVIEW_SCHEME}:` || u.username || u.password) return plain(400);
  if (method !== 'GET' && method !== 'HEAD') return plain(405);
  if (u.pathname !== '/' && u.pathname !== '/index.html') return plain(404);
  const html = store.get(u.hostname);
  if (html === null) return plain(404);
  return {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': PREVIEW_CSP,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    },
    body: method === 'HEAD' ? '' : html
  };
}

// protocol.registerSchemesAsPrivileged girdisi (app 'ready' öncesi çağrılmalı)
const PREVIEW_SCHEME_REGISTRATION = {
  scheme: PREVIEW_SCHEME,
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
};

module.exports = { PREVIEW_SCHEME, PREVIEW_CSP, PREVIEW_SCHEME_REGISTRATION, MAX_HTML_BYTES, createPreviewStore, previewResponse };
