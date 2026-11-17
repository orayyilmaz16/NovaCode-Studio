// Önizleme ayrı köken + uygulama CSP testleri (S-01): electron-preview.cjs saf mantığı ve index.html meta CSP'si.
// Çalıştırma: node scripts/tests/preview-csp.test.cjs
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const { PREVIEW_SCHEME, PREVIEW_CSP, PREVIEW_SCHEME_REGISTRATION, createPreviewStore, previewResponse } = require(path.join(root, 'electron-preview.cjs'));

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };

// ---- şema kaydı ----
ok(PREVIEW_SCHEME === 'nova-preview' && PREVIEW_SCHEME_REGISTRATION.scheme === 'nova-preview', 'şema adı nova-preview');
ok(PREVIEW_SCHEME_REGISTRATION.privileges.standard && PREVIEW_SCHEME_REGISTRATION.privileges.secure, 'şema standard + secure');
ok(!PREVIEW_SCHEME_REGISTRATION.privileges.bypassCSP, 'şema bypassCSP istemez');

// ---- bellek deposu ----
let t = 1000;
const store = createPreviewStore({ max: 2, ttlMs: 100, now: () => t });
const a = store.put('<p>a</p>');
ok(/^[0-9a-f]{32}$/.test(a), 'kimlik 128 bit hex');
ok(store.get(a) === '<p>a</p>', 'put/get');
ok(store.put(42) === null, 'dize olmayan reddedilir');
ok(store.put('x'.repeat(8 * 1024 * 1024 + 1)) === null, 'çok büyük içerik reddedilir');
const b = store.put('b'); const c = store.put('c');
ok(store.get(a) === null && store.get(b) === 'b' && store.size() === 2, 'üst sınırda en eski atılır');
t += 101;
ok(store.get(b) === null, 'süre dolunca silinir');
const d = store.put('d'); store.drop(d);
ok(store.get(d) === null, 'drop çalışır');
ok(store.get('../x') === null && store.get(undefined) === null, 'geçersiz kimlik');

// ---- yanıt ----
const live = createPreviewStore();
const id = live.put('<h1>hi</h1>');
const r = previewResponse(live, `nova-preview://${id}/`);
ok(r.status === 200 && r.body === '<h1>hi</h1>' && /text\/html/.test(r.headers['content-type']), 'GET 200 html');
ok(r.headers['content-security-policy'] === PREVIEW_CSP, 'yanıt kendi CSP başlığını taşır');
ok(r.headers['cache-control'] === 'no-store' && r.headers['x-content-type-options'] === 'nosniff', 'no-store + nosniff');
ok(previewResponse(live, `nova-preview://${id}/index.html`).status === 200, '/index.html');
ok(previewResponse(live, `nova-preview://${id}/secret`).status === 404, 'başka yol 404');
ok(previewResponse(live, `nova-preview://${'0'.repeat(32)}/`).status === 404, 'bilinmeyen kimlik 404');
ok(previewResponse(live, `nova-preview://${id}/`, 'POST').status === 405, 'POST 405');
ok(previewResponse(live, `https://${id}/`).status === 400, 'başka şema 400');
ok(previewResponse(live, 'nova-preview://u:p@' + id + '/').status === 400, 'kimlik bilgisi 400');
ok(previewResponse(live, 'not a url').status === 400, 'bozuk adres 400');
ok(previewResponse(live, `nova-preview://${id}/`, 'HEAD').body === '', 'HEAD gövdesiz');

// ---- önizleme CSP'si: önizlenen sayfa CDN/eval/fetch kullanabilir, eklenti yok ----
ok(/default-src[^;]*'unsafe-eval'/.test(PREVIEW_CSP) && /connect-src[^;]*https:/.test(PREVIEW_CSP), 'önizleme CSP: eval + https bağlantı serbest');
ok(/object-src 'none'/.test(PREVIEW_CSP), 'önizleme CSP: object-src none');

// ---- uygulama CSP'si (index.html) ----
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
ok(!!m, 'index.html meta CSP var');
const dirs = {};
for (const part of (m ? m[1] : '').split(';')) { const [k, ...v] = part.trim().split(/\s+/); if (k) dirs[k] = v; }
ok(dirs['script-src'] && dirs['script-src'].join(' ') === "'self'", "script-src yalnız 'self'");
ok(!/unsafe-eval/.test(m ? m[1] : ''), 'unsafe-eval yok');
ok(!dirs['script-src'].some((x) => /^https?:|^\*$/.test(x)), 'script-src uzak kaynak yok');
ok(!dirs['connect-src'].some((x) => /^(https?:|\*)/.test(x)), 'connect-src http(s)/* yok (yalnız self, ws/wss, data/blob)');
ok(dirs['connect-src'].includes('ws:') && dirs['connect-src'].includes('wss:'), 'connect-src ws/wss (kullanıcı eşitleme sunucusu) kalır');
ok(dirs['frame-src'].includes('nova-preview:') && !dirs['frame-src'].some((x) => ['data:', 'blob:', 'about:', "'self'", 'https:'].includes(x)), 'frame-src yalnız nova-preview: + yerel adresler');
ok(dirs['object-src'].join() === "'none'" && dirs['base-uri'].join() === "'self'", 'object-src none, base-uri self');
ok(dirs['default-src'].join() === "'self'", "default-src 'self'");
process.exit(fails ? 1 : 0);
