// auto-commit.mjs gerileme testi: gizli dosya koruması (şablon izinli, gerçek sır engelli) ve stash'siz "harcanmış dal" geçişi
// (git add -N kalıntısı olan kirli ağaçta). Gerçek git deposunda çalışır, gh/ağ gerekmez. Çalıştırma: node scripts/tests/autocommit.test.cjs
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };
const src = fs.readFileSync(path.join(__dirname, '..', 'auto-commit.mjs'), 'utf8');

// ---- gizli dosya koruması
const m = /const RISKY = (\/.*\/i);/.exec(src);
ok(!!m, 'RISKY ifadesi bulundu');
const RISKY = m ? eval(m[1]) : /x^/;
for (const [p, risky] of Object.entries({
  'server/analytics-deploy/.env.example': false, 'server/deploy/.env.example': false, '.env.sample': false, '.env.template': false,
  '.env': true, '.env.local': true, 'a/.env.production': true, 'x/.env.example.bak': true, 'k.pem': true, 'id_rsa': true, 'credentials.json': true,
})) ok(RISKY.test(p) === risky, `${p} → ${risky ? 'riskli' : 'izinli'}`);

// ---- kaynak koruması: harcanmış daldan çıkış stash'siz denenir, yedek yolda indeks sıfırlanır
ok(/tryGit\("switch", "-q", "main"\)\s*!==\s*null/.test(src), 'harcanmış daldan önce stash\'siz geçiş denenir');
ok(/tryGit\("reset", "-q"\);\s*git\("stash"/.test(src), 'stash yedeğinden önce indeks sıfırlanır (intent-to-add kalıntısı)');
ok(/update-index", "--chmod=\+x"/.test(src), '.sh dosyalarına yürütme biti verilir');

// ---- davranış: intent-to-add kalıntılı kirli ağaçta stash çöker, switch taşır
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-ac-'));
const g = (...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: tmp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  g('init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(tmp, 'a.txt'), 'a\n'); g('add', '.'); g('commit', '-q', '-m', 'ilk');
  g('switch', '-q', '-c', 'auto/x');
  fs.writeFileSync(path.join(tmp, 'yeni.sh'), '#!/bin/sh\n'); g('add', '-N', 'yeni.sh'); // intent-to-add
  fs.writeFileSync(path.join(tmp, 'a.txt'), 'a\nb\n');
  let stashFailed = false;
  try { g('stash', 'push', '-u', '-q', '-m', 't'); } catch { stashFailed = true; }
  ok(stashFailed, 'önkoşul: intent-to-add varken git stash gerçekten çöker (sorunun kaynağı)');
  g('switch', '-q', 'main');
  ok(fs.readFileSync(path.join(tmp, 'a.txt'), 'utf8') === 'a\nb\n' && fs.existsSync(path.join(tmp, 'yeni.sh')), 'git switch değişiklikleri stash\'siz taşır');
} catch (e) { ok(false, 'git senaryosu', String(e.stderr || e.message)); }
fs.rmSync(tmp, { recursive: true, force: true });
console.log(fails ? `\n${fails} başarısız` : '\ntüm testler geçti');
