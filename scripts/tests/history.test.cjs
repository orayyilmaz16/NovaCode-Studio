// Yerel geçmiş (electron-history.cjs) ve .gitignore eşleyici (electron-gitignore.cjs) saf mantık testleri.
// Çalıştırma: node scripts/tests/history.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const H = require(path.join(__dirname, '..', '..', 'electron-history.cjs'));
const { createIgnoreMatcher } = require(path.join(__dirname, '..', '..', 'electron-gitignore.cjs'));

const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

(async () => {
  // ---- saf yardımcılar ----
  ok(H.parseVersion('1700000000000.txt') === 1700000000000 && H.parseVersion('meta.json') === null, 'sürüm adı ayrıştırma');
  const names = Array.from({ length: 35 }, (_, i) => H.versionName(1700000000000 + i));
  const drop = H.pickPrune(names, 30);
  ok(drop.length === 5 && drop[0] === names[0] && drop[4] === names[4], 'en eski 5 sürüm budanır');
  ok(H.pickPrune(names.slice(0, 3), 30).length === 0, 'sınır altında budama yok');
  ok(H.looksText(Buffer.from('merhaba')) && !H.looksText(Buffer.from([65, 0, 66])), 'NUL baytlı dosya ikili sayılır');
  const ents = [{ key: 'a', name: 'x', size: 60, ts: 3 }, { key: 'a', name: 'y', size: 60, ts: 1 }, { key: 'b', name: 'z', size: 60, ts: 2 }];
  const pr = H.pickPruneTotal(ents, 130);
  ok(pr.length === 1 && pr[0].ts === 1, 'toplam sınır: en eski girdi silinir');

  // ---- gerçek dosya akışı ----
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-hist-'));
  const root = path.join(base, 'ws');
  fs.mkdirSync(root);
  const file = path.join(root, 'a.txt');
  const h = H.create({ userDataDir: path.join(base, 'ud'), getRoot: () => root, isInside: (p) => path.resolve(p).startsWith(root) });
  ok((await h.snapshot(file, 'x')) === false, 'olmayan dosya: anlık görüntü yok');
  fs.writeFileSync(file, 'v1');
  ok((await h.snapshot(file, 'v2')) === true, 'eski içerik kaydedilir');
  ok((await h.snapshot(file, 'v2')) === false, 'aynı içerik yinelenmez');
  fs.writeFileSync(file, 'v2');
  await h.snapshot(file, 'v3');
  const list = await h.list(file);
  ok(list.length === 2 && list[0].time > list[1].time, 'liste yeniden eskiye');
  ok((await h.read(file, list[1].id)) === 'v1', 'sürüm içeriği okunur');
  let bad = false; try { await h.read(file, '../../etc/passwd'); } catch { bad = true; }
  ok(bad, 'geçersiz sürüm kimliği reddedilir (path traversal)');
  fs.writeFileSync(file, Buffer.from([1, 0, 2]));
  ok((await h.snapshot(file, 'v9')) === false, 'ikili dosya atlanır');
  fs.writeFileSync(file, 'x'.repeat(H.MAX_FILE_BYTES + 1));
  ok((await h.snapshot(file, 'v9')) === false, 'büyük dosya atlanır');
  h.setConfig({ maxVersions: 3 });
  for (let i = 0; i < 6; i++) { fs.writeFileSync(file, 'c' + i); await h.snapshot(file, 'n' + i); }
  ok((await h.list(file)).length === 3, 'dosya başına sürüm sınırı uygulanır');
  fs.rmSync(file);
  const del = await h.deleted();
  ok(del.length === 1 && del[0].path === path.resolve(file), 'silinen dosya kurtarma listesinde');
  h.setConfig({ enabled: false });
  fs.writeFileSync(file, 'off');
  ok((await h.snapshot(file, 'y')) === false, 'kapalıyken kayıt yok');
  await h.clear('all');
  h.setConfig({ enabled: true });
  ok((await h.list(file)).length === 0 && (await h.deleted()).length === 0, 'clear(all) her şeyi siler');
  fs.rmSync(base, { recursive: true, force: true });

  // ---- .gitignore eşleyici ----
  const ig = createIgnoreMatcher('# yorum\n\nout/\n*.log\n/build\n!keep.log\ndocs/**/tmp\n');
  ok(ig('out', true) && !ig('out', false), 'out/ yalnız klasör');
  ok(ig('a/b/x.log', false) && !ig('keep.log', false), '*.log ve olumsuzlama');
  ok(ig('build', true) && !ig('src/build', true), '/build köke bağlı');
  ok(ig('docs/a/b/tmp', true) && ig('docs/tmp', true), '** sıfır veya çok klasör');
  ok(!ig('src', true) && createIgnoreMatcher('')('x', false) === false, 'eşleşmeyen / boş dosya');
  ok(createIgnoreMatcher('a'.repeat(500))('a', true) === false, 'çok uzun desen yok sayılır');
})();
