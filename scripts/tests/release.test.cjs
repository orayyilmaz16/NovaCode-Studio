// Sürüm otomasyonu testi (scripts/release.mjs): düzey belirleme (patch/minor/major), hazırlama çıktıları, bekleyen sürüm, etiket kararı.
// Her durum geçici bir git deposunda gerçek betikle çalışır. Çalıştırma: node scripts/tests/release.test.cjs
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'release.mjs');
let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

const sh = (cwd, cmd, args) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const release = (cwd, ...args) => execFileSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function repo({ tr = [], en = [], version = '1.3.0', tag = 'v1.3.0' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-rel-'));
  const w = (f, s) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), s); };
  w('package.json', JSON.stringify({ name: 'x', version }, null, 2) + '\n');
  w('package-lock.json', JSON.stringify({ name: 'x', version, packages: { '': { version } } }, null, 2) + '\n');
  w('CHANGELOG.md', `# Changelog\n\n## Unreleased\n\n### tr\n${tr.map((x) => `- ${x}`).join('\n')}\n\n### en\n${en.map((x) => `- ${x}`).join('\n')}\n\n## ${version} - 01.01.2026\n### Türkçe\n- eski\n`);
  w('CLAUDE.md', '# c\n<!-- version:start -->\nx\n<!-- version:end -->\n');
  w('AGENT.md', '# a\n<!-- release:start -->\nx\n<!-- release:end -->\n');
  sh(dir, 'git', ['init', '-q']);
  sh(dir, 'git', ['config', 'user.email', 't@t.t']);
  sh(dir, 'git', ['config', 'user.name', 't']);
  sh(dir, 'git', ['add', '-A']);
  sh(dir, 'git', ['commit', '-qm', 'init']);
  if (tag) sh(dir, 'git', ['tag', tag]);
  return dir;
}
const plan = (dir, ...a) => JSON.parse(release(dir, 'plan', ...a));

try {
  // --- Düzey belirleme ---
  let d = repo({ tr: ['[fix] **Hata:** düzeltildi'], en: ['[fix] **Bug:** fixed'] });
  let p = plan(d);
  ok(p.action === 'release' && p.level === 'patch' && p.next === '1.3.1', 'yalnız [fix] → patch 1.3.1', JSON.stringify(p));

  d = repo({ tr: ['[fix] a', '[feat] **Yeni:** b'], en: ['[fix] a', '[feat] **New:** b'] });
  p = plan(d);
  ok(p.level === 'patch' && p.next === '1.3.1', 'tek [feat] küçük güncelleme → patch 1.3.1', JSON.stringify(p));

  d = repo({ tr: ['[feat] a', '[feat] b'], en: ['[feat] a', '[feat] b'] });
  p = plan(d);
  ok(p.level === 'minor' && p.next === '1.4.0', '2 [feat] (büyük güncelleme) → minor 1.4.0', JSON.stringify(p));

  const six = ['[fix] a', '[fix] b', '[improve] c', '[perf] d', '[fix] e', '[improve] f'];
  d = repo({ tr: six, en: six });
  p = plan(d);
  ok(p.level === 'minor' && p.next === '1.4.0', '6+ madde (toplu güncelleme) → minor 1.4.0', JSON.stringify(p));

  d = repo({ tr: ['[feat] a', '[breaking] **Kırıcı:** b'], en: ['[feat] a', '[breaking] **Breaking:** b'] });
  p = plan(d);
  ok(p.level === 'minor' && p.next === '1.4.0', '[breaking] otomatik major değil → minor 1.4.0', JSON.stringify(p));

  d = repo({ tr: ['**Etiketsiz:** x'], en: ['**Untagged:** x'] });
  p = plan(d);
  ok(p.level === 'patch' && p.warns.some((w) => /etiketsiz/.test(w)), 'etiketsiz madde → patch + uyarı', JSON.stringify(p));

  d = repo({});
  p = plan(d);
  ok(p.action === 'none', 'Unreleased boş → sürüm çıkmaz', JSON.stringify(p));

  d = repo({ tr: ['[docs] yalnız belge'], en: ['[docs] docs only'] });
  p = plan(d);
  ok(p.action === 'none', 'yalnız [docs] → sürüm çıkmaz', JSON.stringify(p));

  d = repo({ tr: ['[fix] a'], en: ['[fix] a'] });
  p = plan(d, '--level', 'major');
  ok(p.next === '2.0.0', '--level yükseltir (major)', JSON.stringify(p));
  p = plan(d, '--level', 'patch');
  ok(p.next === '1.3.1', '--level düşüremez (patch kalır)', JSON.stringify(p));

  // Commit'ten gelen kırıcı sinyal
  d = repo({ tr: ['[fix] a'], en: ['[fix] a'] });
  fs.writeFileSync(path.join(d, 'f.txt'), 'x');
  sh(d, 'git', ['add', '-A']);
  sh(d, 'git', ['commit', '-qm', 'feat!: drop old api']);
  p = plan(d);
  ok(p.level === 'minor' && p.next === '1.4.0', 'commit `feat!:` otomatik major değil → minor', JSON.stringify(p));

  // chore(auto) tek başına düzey değiştirmez
  d = repo({ tr: ['[fix] a'], en: ['[fix] a'] });
  fs.writeFileSync(path.join(d, 'f.txt'), 'x');
  sh(d, 'git', ['add', '-A']);
  sh(d, 'git', ['commit', '-qm', 'chore(auto): save session changes (3 files)']);
  p = plan(d);
  ok(p.level === 'patch', 'chore(auto) commit düzeyi yükseltmez', JSON.stringify(p));

  // Etiket HEAD'in atası değil (eski sürümlerde yaşanan durum): en yüksek etiket yine bulunur
  d = repo({ tr: ['[feat] a', '[feat] b'], en: ['[feat] a', '[feat] b'] });
  sh(d, 'git', ['checkout', '-q', '-b', 'side']);
  fs.writeFileSync(path.join(d, 'side.txt'), 's');
  sh(d, 'git', ['add', '-A']);
  sh(d, 'git', ['commit', '-qm', 'side']);
  sh(d, 'git', ['tag', 'v1.9.0']);
  sh(d, 'git', ['checkout', '-q', '-']);
  p = plan(d);
  ok(p.last === '1.9.0' && p.next === '1.10.0', 'ata olmayan en yüksek etiket (v1.9.0) taban alınır, 1.10.0 (sayısal sıralama)', JSON.stringify(p));

  // --- prepare çıktıları ---
  d = repo({
    tr: ['[feat] **Yeni özellik:** ayrıntı', '[feat] **İkinci:** ayrıntı', '[fix] **Hata:** düzeltildi', '[improve] hızlandı'],
    en: ['[feat] **New feature:** detail', '[feat] **Second:** detail', '[fix] **Bug:** fixed', '[improve] faster']
  });
  release(d, 'prepare');
  const pkg = JSON.parse(fs.readFileSync(path.join(d, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(d, 'package-lock.json'), 'utf8'));
  ok(pkg.version === '1.4.0' && lock.version === '1.4.0' && lock.packages[''].version === '1.4.0', 'package.json ve lock 1.4.0 olur');
  const notes = fs.readFileSync(path.join(d, 'release-notes', 'v1.4.0.md'), 'utf8');
  ok(/## Türkçe/.test(notes) && /## English/.test(notes) && /#### Yeni özellikler/.test(notes) && /#### New features/.test(notes) && /#### Düzeltmeler/.test(notes) && /#### Fixes/.test(notes) && /#### İyileştirmeler/.test(notes), 'release-notes TR+EN ve kategori başlıkları');
  ok(!/\[feat\]|\[fix\]|\[improve\]/.test(notes), 'etiketler notlara sızmaz');
  const cl = fs.readFileSync(path.join(d, 'CHANGELOG.md'), 'utf8');
  ok(/## Unreleased\n\n### tr\n\n### en\n/.test(cl) && /## 1\.4\.0 - \d\d\.\d\d\.\d{4}\n<!-- level: minor -->/.test(cl) && /## 1\.3\.0 - 01\.01\.2026/.test(cl), 'CHANGELOG: boş Unreleased + yeni sürüm bölümü + eski sürüm korunur');
  const ver = fs.readFileSync(path.join(d, 'docs', 'brain', 'VERSIONS.md'), 'utf8');
  ok(/\| v1\.4\.0 \| \d\d\.\d\d\.\d{4} \| minor \|/.test(ver) && /\| v1\.3\.0 \|/.test(ver) && ver.indexOf('v1.4.0') < ver.indexOf('v1.3.0'), 'VERSIONS.md: yeni satır üstte, geçmiş etiket satırı tamamlanır');
  ok(/Güncel sürüm: \*\*v1\.4\.0\*\* \(minor/.test(fs.readFileSync(path.join(d, 'CLAUDE.md'), 'utf8')), 'CLAUDE.md sürüm bloğu güncellenir');
  const ag = fs.readFileSync(path.join(d, 'AGENT.md'), 'utf8');
  ok(/Son sürüm v1\.4\.0/.test(ag) && /Yeni özellikler: Yeni özellik/.test(ag), 'AGENT.md son sürüm bloğu özetle güncellenir');

  // --- Bekleyen sürüm: aynı sürüm tekrar yükseltilmez ---
  fs.writeFileSync(path.join(d, 'CHANGELOG.md'), cl.replace('### tr\n\n### en\n', '### tr\n- [fix] yeni madde\n\n### en\n- [fix] new item\n'));
  p = plan(d);
  ok(p.action === 'pending', 'etiketlenmemiş hazır sürüm varken yenisi bindirilmez', JSON.stringify(p));
  release(d, 'prepare');
  ok(JSON.parse(fs.readFileSync(path.join(d, 'package.json'), 'utf8')).version === '1.4.0', 'bekleyen sürümde prepare package.json sürümünü değiştirmez');

  // --- tag kipi ---
  let t = release(d, 'tag');
  ok(/release=true/.test(t) && /version=1\.4\.0/.test(t), 'tag: etiket yok + notlar var → release=true', t);
  sh(d, 'git', ['add', '-A']);
  sh(d, 'git', ['commit', '-qm', 'release']);
  sh(d, 'git', ['tag', 'v1.4.0']);
  t = release(d, 'tag');
  ok(/release=false/.test(t) && /zaten var/.test(t), 'tag: etiket varsa release=false', t);
  p = plan(d);
  ok(p.action === 'release' && p.next === '1.4.1', 'etiket atıldıktan sonra bekleyen maddeler yeni sürüme (1.4.1) girer', JSON.stringify(p));

  const dn = repo({ version: '1.3.0' });
  const pj = JSON.parse(fs.readFileSync(path.join(dn, 'package.json'), 'utf8'));
  pj.version = '1.5.0';
  fs.writeFileSync(path.join(dn, 'package.json'), JSON.stringify(pj));
  t = release(dn, 'tag');
  ok(/release=false/.test(t) && /yok/.test(t), 'tag: sürüm artmış ama notlar hazırlanmamışsa release=false', t);
} finally {
  // geçici depolar işletim sistemi temizliğine bırakılır
}
console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
process.exit(fails ? 1 : 0);
