// Anonim analitik testi: istemci (electron-analytics.cjs) rıza/izin listesi/geri alma/günde bir gönderim, sunucu (server/analytics-server.mjs)
// katı doğrulama ve uçtan uca HTTP. Çalıştırma: node scripts/tests/analytics.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-an-'));

(async () => {
  const { createAnalytics, normalizeEndpoint, EVENTS } = require('../../electron-analytics.cjs');
  const srv = await import(pathToFileURL(path.join(__dirname, '..', '..', 'server', 'analytics-server.mjs')).href);

  // ---- adres
  ok(normalizeEndpoint('https://a.example/v1/ingest', false) !== '', 'https kabul');
  ok(normalizeEndpoint('http://a.example/x', false) === '', 'http ret (üretim)');
  ok(normalizeEndpoint('http://127.0.0.1:8788/v1/ingest', true) !== '' && normalizeEndpoint('http://127.0.0.1:8788/v1/ingest', false) === '', 'yerel http yalnız geliştirmede');
  ok(normalizeEndpoint('https://u:p@a.example/', false) === '', 'kimlik bilgili adres ret');

  // ---- istemci
  const sent = [];
  let netOk = true;
  const fetchFn = async (u, o) => { if (!netOk) throw new Error('net'); sent.push({ u, o }); return { ok: true, status: 204 }; };
  let clock = new Date(2026, 10, 27, 10).getTime();
  const mk = (name, endpoint = 'https://a.example/v1/ingest') => createAnalytics({ file: path.join(tmp, name + '.json'), endpoint, version: '1.9.3', platform: 'win32', fetchFn, now: () => clock });

  const a = mk('a');
  a.setLang('tr');
  ok(a.status().enabled === false && a.status().asked === false, 'varsayılan: rıza yok');
  ok(a.track('app_start') === false && a.buildPayload() === null, 'rıza yokken sayılmaz');
  ok((await a.flush()).sent === false && sent.length === 0, 'rıza yokken gönderilmez');

  a.setConsent(true);
  ok(a.track('panel_git') && a.track('panel_git') && a.track('app_start'), 'rıza sonrası sayılır');
  ok(a.track('dosya_yolu') === false && a.track('') === false && a.track(undefined) === false, 'izinli olmayan ad atılır');
  const p = a.buildPayload();
  ok(JSON.stringify(Object.keys(p).sort()) === '["app","counts","lang","os","v"]', 'yük yalnız v/app/os/lang/counts', JSON.stringify(p));
  ok(p.counts.panel_git === 2 && p.os === 'win' && p.lang === 'tr' && p.app === '1.9.3', 'yük değerleri');
  ok(!/\\|\/|@|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(JSON.stringify(p).replace('1.9.3', '')), 'yükte yol/e-posta/IP benzeri yok');

  const r1 = await a.flush();
  ok(r1.sent === true && sent.length === 1, 'gönderildi');
  ok(sent[0].o.credentials === 'omit' && sent[0].o.method === 'POST' && !('cookie' in sent[0].o.headers), 'çerezsiz POST');
  a.track('panel_git');
  ok((await a.flush()).reason === 'already-sent-today' && sent.length === 1, 'günde en çok bir gönderim');
  clock += 24 * 3600 * 1000;
  ok((await a.flush()).sent === true && sent.length === 2, 'ertesi gün tekrar gider');

  netOk = false; clock += 24 * 3600 * 1000; a.track('code_run');
  ok((await a.flush()).reason === 'network' && a.buildPayload().counts.code_run === 1, 'ağ hatasında sayaç korunur');
  netOk = true;

  a.setConsent(false);
  ok(a.buildPayload() === null && a.status().enabled === false, 'geri alma: sayaçlar silindi');
  ok(a.track('panel_git') === false, 'geri almadan sonra sayılmaz');
  a.flushToDisk();
  ok(!/panel_git|code_run/.test(fs.readFileSync(path.join(tmp, 'a.json'), 'utf8')), 'diskte sayaç kalmadı');

  const b = mk('b', '');
  b.setConsent(true);
  ok(b.status().configured === false && b.status().enabled === false && b.track('app_start') === false, 'adres yoksa analitik tamamen kapalı');
  const c = mk('a'); // aynı dosyadan yeniden yükle
  ok(c.status().enabled === false, 'geri alınan rıza yeniden başlatmada da kapalı');
  ok(EVENTS.every((e) => /^[a-z_]+$/.test(e)), 'olay adları güvenli biçim');

  // ---- sunucu doğrulama
  const good = { v: 1, app: '1.9.3', os: 'win', lang: 'tr', counts: { panel_git: 2 } };
  ok(srv.validate(good) !== null, 'sunucu: geçerli yük');
  ok(srv.validate({ ...good, id: 'x' }) === null, 'sunucu: fazladan alan (kimlik) ret');
  ok(srv.validate({ ...good, os: 'beos' }) === null && srv.validate({ ...good, lang: 'xx' }) === null, 'sunucu: bilinmeyen os/dil ret');
  ok(srv.validate({ ...good, counts: { gizli: 1 } }) === null && srv.validate({ ...good, counts: {} }) === null, 'sunucu: bilinmeyen olay / boş ret');
  ok(srv.validate({ ...good, counts: { panel_git: 1e9 } }) === null && srv.validate({ ...good, counts: { panel_git: 1.5 } }) === null, 'sunucu: aşırı/ondalık sayı ret');
  ok(srv.validate({ ...good, app: '1.9.3; DROP' }) === null, 'sunucu: sürüm biçimi');

  // ---- sunucu uçtan uca
  const dir = path.join(tmp, 'data');
  const store = srv.createStore(dir);
  const token = 'x'.repeat(32);
  const server = srv.createServer({ token, store, rateLimit: 3 });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const call = (method, p, body, headers = {}) => new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: p, headers: { 'content-type': 'application/json', ...headers } }, (res) => {
      let d = ''; res.on('data', (x) => (d += x)); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', () => resolve({ status: 0, body: '' }));
    if (body) req.write(body);
    req.end();
  });
  ok((await call('POST', '/v1/ingest', JSON.stringify(good))).status === 204, 'HTTP: geçerli yük 204');
  ok((await call('POST', '/v1/ingest', JSON.stringify({ ...good, ip: '1.2.3.4' }))).status === 400, 'HTTP: fazladan alan 400');
  ok((await call('POST', '/v1/ingest', 'x'.repeat(5000))).status !== 204, 'HTTP: büyük gövde reddedilir');
  ok((await call('POST', '/v1/ingest', JSON.stringify(good))).status === 429, 'HTTP: hız sınırı');
  ok((await call('GET', '/v1/stats')).status === 401 && (await call('GET', '/v1/stats', null, { authorization: 'Bearer yanlis' })).status === 401, 'HTTP: stats jetonsuz/yanlış jeton 401');
  const st = await call('GET', '/v1/stats?days=7', null, { authorization: `Bearer ${token}` });
  const sj = JSON.parse(st.body);
  ok(st.status === 200 && sj.total.batches === 1 && sj.total.counts.panel_git === 2 && sj.total.os.win === 1, 'HTTP: stats toplamları', st.body);
  const files = fs.readdirSync(dir);
  const disk = fs.readFileSync(path.join(dir, files[0]), 'utf8');
  ok(files.length === 1 && !/127\.0\.0\.1|remote|ip/i.test(disk), 'diskte yalnız günlük toplam, IP yok', disk);
  await new Promise((r) => server.close(r));

  // ---- dağıtım paketi anonimlik korumaları (gerileme koruması)
  const dep = path.join(__dirname, '..', '..', 'server', 'analytics-deploy');
  const caddy = fs.readFileSync(path.join(dep, 'Caddyfile'), 'utf8');
  ok(caddy.includes("output discard") && !/output[ \t]+(stdout|stderr|file)/.test(caddy), "Caddy erişim günlüğü kapalı (output discard)");
  ok(caddy.includes("@allowed path /v1/ingest /v1/stats /healthz"), "Caddy yalnız 3 yolu açar");
  const comp = fs.readFileSync(path.join(dep, "docker-compose.yml"), "utf8");
  const an = comp.split("  caddy:")[0];
  ok(an.includes("read_only: true") && an.includes("cap_drop: [ALL]") && an.includes("no-new-privileges"), "analytics konteyneri salt-okunur, cap_drop ALL, no-new-privileges");
  ok(!an.includes("ports:"), "analytics portu dışarı yayınlanmaz (yalnız Caddy)");
  ok(comp.includes("ANALYTICS_TOKEN: ${ANALYTICS_TOKEN:?"), "token zorunlu, koda gömülü değil");
  ok(fs.readFileSync(path.join(dep, "Dockerfile"), "utf8").includes("USER node"), "Dockerfile root olmayan kullanıcı");
  const srvSrc = fs.readFileSync(path.join(__dirname, "..", "..", "server", "analytics-server.mjs"), "utf8");
  ok(!/console[.](log|info|warn|error)[(][^)]*(req|remoteAddress|headers)/.test(srvSrc), "sunucu istek/IP/başlık yazdırmaz");
  ok(srvSrc.includes("createHmac(\"sha256\", salt)") && !srvSrc.includes("hits.set(req"), "hız sınırı ham IP yerine özet kullanır");
  ok(!/writeFileSync[(][^)]*(remote|[ (,]ip[ ),])/i.test(srvSrc), "sunucu IP diske yazmaz");
  // ---- izin listesi tutarlılığı: istemci = sunucu = TypeScript tipi (yeni olay üç yerde eklenmeli)
  ok(JSON.stringify(EVENTS) === JSON.stringify(srv.EVENTS), 'istemci ve sunucu olay listesi aynı', EVENTS.length + ' vs ' + srv.EVENTS.length);
  const tsSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'services', 'analytics.ts'), 'utf8');
  const missingInTs = EVENTS.filter((e) => !e.startsWith('lang_') && !tsSrc.includes("'" + e + "'"));
  ok(missingInTs.length === 0, 'TypeScript olay tipi tüm olayları içerir', missingInTs.join(','));
  const langBlock = tsSrc.slice(tsSrc.indexOf('const LANG_EVENTS = ['), tsSrc.indexOf(' as const;', tsSrc.indexOf('const LANG_EVENTS = [')));
  const tsLangs = langBlock.match(/'[a-z]+'/g) || [];
  ok(JSON.stringify(tsLangs.map((x) => 'lang_' + x.slice(1, -1)).concat('lang_other')) === JSON.stringify(EVENTS.filter((e) => e.startsWith('lang_'))), 'dil olayları TypeScript listesiyle aynı sırada');
  const worst = {}; for (const e of EVENTS) worst[e] = 100000;
  ok(JSON.stringify({ v: 1, app: '99.99.99', os: 'linux', lang: 'tr', counts: worst }).length < 2048, 'en kötü durum yükü sunucu sınırının (2 KB) altında');
  ok(!EVENTS.some((e) => /(user|login_name|email|path|file|name|ip)(_|$)/.test(e.replace('file_save', ''))), 'olay adlarında kimlik/yol/ad alanı yok');
  const rep = await import(pathToFileURL(path.join(__dirname, '..', 'analytics-report.mjs')).href);
  ok(rep.normalizeBase('https://x.example/a?b') === 'https://x.example' && rep.normalizeBase('http://x.example') === '' && rep.normalizeBase('http://127.0.0.1:1') === 'http://127.0.0.1:1', 'rapor betiği adres denetimi');
  const out = rep.render({ days: 7, total: { batches: 2, counts: { panel_git: 5 }, os: { win: 2 }, lang: { tr: 2 }, version: { '1.9.3': 2 } }, perDay: { '2026-11-27': { batches: 2, counts: {} } } });
  ok(/Paneller/.test(out) && / git +5/.test(out) && /tekil kişi sayılamaz/.test(out), 'rapor çıktısı');
  const out2 = rep.render({ days: 7, total: { batches: 1, counts: { lang_python: 4, github_login: 1, panel_git: 2, file_save: 9 }, os: {}, lang: {}, version: {} }, perDay: {} });
  const lines = out2.split('\n');
  const at = (title) => lines.findIndex((l) => l.startsWith(title));
  ok(at('Diller') >= 0 && /python +4/.test(lines[at('Diller') + 1]) && at('Oturum') >= 0 && /github_login/.test(lines[at('Oturum') + 1]), 'rapor çıktısı dilleri ve oturum olaylarını ayrı gruplar');

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails ? `\n${fails} başarısız` : '\ntüm testler geçti');
})().catch((e) => { console.error(e); process.exitCode = 1; });
