// Deterministik beyin düzeltici: düzenleme uzaklığı, en yakın ad, bağlantı onarımı, brain:check çıktısı ayıklama.
// Ağ ve LLM gerekmez. Çalıştırma: node scripts/tests/autofix.test.cjs
const { pathToFileURL } = require('url');
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

(async () => {
  const f = await import(pathToFileURL(path.join(__dirname, '..', 'auto-fix-brain.mjs')).href);

  ok(f.editDistance('kitten', 'sitting') === 3, 'düzenleme uzaklığı: kitten→sitting = 3');
  ok(f.editDistance('abc', 'abc') === 0, 'aynı metin = 0');

  ok(f.closestName('qa-agil', ['qa-agile', 'testing']) === 'qa-agile', 'yazım benzeri ad bulunur (qa-agil → qa-agile)');
  ok(f.closestName('agent', ['AGENT', 'CLAUDE']) === 'AGENT', 'büyük/küçük harf farkı eşleşir');
  ok(f.closestName('tamamen-yabanci-ad', ['qa-agile', 'testing']) === null, 'uzak ad eşleşmez (düz metne çevrilir)');
  ok(f.closestName('ab', ['ac', 'xyz']) === 'ac', 'kısa ad: uzaklık ≤ 1 kabul');
  ok(f.closestName('ab', ['xyz']) === null, 'kısa adda uzak eşleşme reddedilir');

  // Onarım: çözülmeyenler değişir, çözülenler dokunulmaz
  const src = 'Bkz [[qa-agil]], [[kirik-yok-xyz]] ve [[AGENT]].';
  const r = f.fixBrainLinks(src, ['qa-agil', 'kirik-yok-xyz'], ['qa-agile', 'AGENT', 'testing']);
  ok(r.content === 'Bkz [[qa-agile]], `kirik-yok-xyz` ve [[AGENT]].', 'onarım: yazım benzeri → en yakın; uzak → kod biçimi; geçerli bağlantı aynen kalır', r.content);
  ok(r.changes.length === 2, 'iki değişiklik raporlanır');
  const again = f.fixBrainLinks(r.content, ['qa-agil', 'kirik-yok-xyz'], ['qa-agile', 'AGENT']);
  ok(again.changes.length === 0, 'idempotent: ikinci çalıştırmada değişiklik yok');

  // brain:check çıktısından çözülmeyenleri ayıklama
  const out = [
    'HATA: docs/brain/actions/a.md: [[qa-agil]] bağlantısı çözülmüyor',
    'HATA: docs/brain/actions/a.md: [[kirik]] bağlantısı çözülmüyor',
    'HATA: AGENT.md: [[yok]] bağlantısı çözülmüyor',
    'HATA: docs/brain/BRAIN.md: BRAIN.md aksiyonu listelemiyor: x',
  ].join('\n');
  const parsed = f.parseUnresolved(out);
  ok(parsed.size === 2 && parsed.get('docs/brain/actions/a.md').size === 2 && parsed.get('AGENT.md').has('yok'), 'brain:check çıktısı doğru ayıklanır (diğer hatalar yok sayılır)');
  ok(f.parseUnresolved('Beyin denetimi tamam').size === 0, 'hatasız çıktı boş küme');

  console.log(fails ? `\n${fails} kontrol başarısız` : '\nTüm beyin düzeltici kontrolleri geçti');
})().catch((e) => { console.error('FAIL beyin düzeltici testi çöktü:', e.message); process.exitCode = 1; });
