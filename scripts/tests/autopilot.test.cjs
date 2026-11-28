// Otopilot saf kuralları: sprint takvimi, devir (rollover), çıktı temizleme, kapı sınıflandırma,
// issue planı, proje durumu, rapor biçimi. Ağ gerekmez. Çalıştırma: node scripts/tests/autopilot.test.cjs
const { pathToFileURL } = require('url');
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

(async () => {
  const lib = await import(pathToFileURL(path.join(__dirname, '..', 'autopilot-lib.mjs')).href);

  // ---- sprint takvimi (çapa 30.11.2026, 14 gün, Pazartesi–Cuma)
  const s1 = lib.sprintFor('2026-11-30');
  ok(s1.n === 1 && s1.start === '2026-11-30' && s1.end === '2026-12-11', 'Sprint 1: 30.11–11.12.2026');
  ok(lib.sprintFor('2026-12-11').n === 1, 'Sprint 1 son günü (Cuma) hâlâ Sprint 1');
  const s2 = lib.sprintFor('2026-12-14');
  ok(s2.n === 2 && s2.start === '2026-12-14' && s2.end === '2026-12-25', 'Sprint 2: 14–25.12.2026');
  ok(s2.dueOn === '2026-12-25T23:59:59Z', 'sprint son tarihi bitiş gününün sonu (UTC)');
  ok(lib.sprintFor('2026-11-29') === null, 'çapadan önce sprint yok');
  ok(lib.sprintFor('2027-01-20').n === 4, 'uzun vadede sayım doğru (2027-01-20 → Sprint 4)');

  // ---- devir: süresi geçen sprintte kalan açık issue taşınır; tarihsiz milestone ve kapalılar kalır
  const milestones = [
    { title: 'Sprint 1', due_on: '2026-12-11T23:59:59Z' },
    { title: 'Sprint 2', due_on: '2026-12-25T23:59:59Z' },
    { title: 'Ürün kararı bekliyor', due_on: null },
  ];
  const issues = [
    { number: 1, state: 'open', milestone: { title: 'Sprint 1' } },
    { number: 2, state: 'closed', milestone: { title: 'Sprint 1' } },
    { number: 3, state: 'open', milestone: { title: 'Ürün kararı bekliyor' } },
    { number: 4, state: 'open', milestone: { title: 'Sprint 1' }, pull_request: {} },
    { number: 5, state: 'open', milestone: null },
  ];
  const roll = lib.planRollover(issues, milestones, '2026-12-14');
  ok(roll.target === 'Sprint 2' && roll.moves.length === 1 && roll.moves[0].number === 1, 'devir: yalnız açık issue #1 Sprint 2\'ye');
  const rollSame = lib.planRollover(issues, milestones, '2026-12-08');
  ok(rollSame.moves.length === 0, 'sprint bitmeden devir yok');

  // ---- çıktı temizleme: yol, sır, e-posta, IP
  const dirty = 'C:\\Users\\orayy\\Desktop\\x.cjs /home/ali/p ghp_' + 'a'.repeat(36) + ' ali@ornek.com 10.1.2.3 D:\\a\\repo\\y.js';
  const clean = lib.redact(dirty);
  ok(!/orayy|ali@|10\.1\.2\.3|ghp_a|D:\\a\\/.test(clean), 'redact: yol, e-posta, IP ve token temizlenir', clean);
  ok(clean.includes('<token>') && clean.includes('<e-posta>') && clean.includes('<ip>'), 'redact: yer tutucular yazılır');
  ok(lib.redact('v1.10.0 ve 10.0.26300 sürüm') === 'v1.10.0 ve 10.0.26300 sürüm', 'redact: sürüm numaraları bozulmaz');

  // ---- çıktı özeti: hata satırları korunur, çok uzun olmaz
  const longOut = Array.from({ length: 300 }, (_, i) => (i === 150 ? 'FAIL scripts/tests/term.test.cjs' : 'satır ' + i)).join('\n');
  const ex = lib.excerptOf(longOut);
  ok(ex.includes('FAIL scripts/tests/term.test.cjs') && ex.split('\n').length <= 60 && ex.length <= 3000, 'özet: hata satırı var, en fazla 60 satır');

  // ---- kapı sınıflandırma
  const brain = lib.classifyGate('brain', '');
  ok(brain.autoFix === true && brain.labels.includes('sev:minor') && brain.labels.includes('auto-detected'), 'brain: mekanik, düzeltme uygun, sev:minor');
  const tsc = lib.classifyGate('tsc', 'error TS2322');
  ok(tsc.autoFix === false && tsc.labels.includes('sev:major'), 'tsc: insan işi (otomatik düzeltme kapalı)');
  const tests = lib.classifyGate('tests', 'FAIL scripts/tests/term.test.cjs');
  ok(tests.labels.includes('area:terminal') && tests.autoFix === false, 'tests: test dosyasından alan etiketi (term → area:terminal)');
  ok(lib.classifyGate('tests', 'FAIL scripts/tests/ai-security.test.cjs').labels.includes('area:security'), 'ai-security → area:security (ai- önekinden önce)');

  // ---- issue planı: yeni hata → create; açık varsa → comment; yeşil ve açıksa → comment+close; yeşil ve açık yoksa → hiçbir şey
  const run = { sha: 'abcdef1234', runUrl: 'https://example/run/1' };
  const openBrain = { number: 77, body: 'x\n' + lib.fingerprintMarker('brain') };
  const plan1 = lib.planActions([{ gate: 'brain', status: 'fail', excerpt: 'e' }, { gate: 'tsc', status: 'fail', excerpt: 'e' }], [openBrain], run);
  ok(plan1.length === 2 && plan1[0].type === 'comment' && plan1[0].number === 77, 'mevcut açık issue yorumlanır, yeniden açılmaz');
  ok(plan1[1].type === 'create' && plan1[1].labels.includes('bug'), 'yeni tsc hatası için issue açılır');
  const newBrain = lib.planActions([{ gate: 'brain', status: 'fail', excerpt: 'e' }], [], run);
  ok(newBrain[0].type === 'create' && newBrain[0].autoFix === true && newBrain[0].labels.includes('auto-fix'), 'brain hatası: auto-fix etiketi ve düzeltme işareti');
  const green = lib.planActions([{ gate: 'brain', status: 'pass' }], [openBrain], run);
  ok(green.length === 2 && green[0].type === 'comment' && green[1].type === 'close' && green[1].number === 77, 'yeşil kapı açık issue\'yu kapatır');
  ok(lib.planActions([{ gate: 'tests', status: 'pass' }], [], run).length === 0, 'yeşil ve açık issue yoksa işlem yok');
  ok(lib.buildIssueBody({ gate: 'tests', sha: 'abc', runUrl: 'u', excerpt: 'x' }).includes(lib.fingerprintMarker('tests')), 'issue gövdesi parmak izi işaretçisi taşır');

  // ---- proje durumu kuralları
  const pOpen = lib.projectStatusPlan({ kind: 'issue', action: 'opened', number: 9 });
  ok(pOpen.length === 1 && pOpen[0].status === 'Backlog', 'issue açılınca Backlog');
  const pQa = lib.projectStatusPlan({ kind: 'issue', action: 'labeled', number: 9, label: 'qa:needs-test' });
  ok(pQa[0].status === 'QA’da', 'qa:needs-test etiketi → QA’da');
  const pRe = lib.projectStatusPlan({ kind: 'issue', action: 'labeled', number: 9, label: 'qa:reopened' });
  ok(pRe[0].status === 'Geliştiriliyor', 'qa:reopened → Geliştiriliyor');
  const linked = lib.parseLinked('Closes #163, fixes #164 ve kapatır #164');
  ok(JSON.stringify(linked) === '[163,164]', 'bağlı issue numaraları ayıklanır, tekrarsız');
  const prOpen = lib.projectStatusPlan({ kind: 'pull_request', action: 'opened', body: 'Closes #163 Fixes #164' });
  ok(prOpen.length === 2 && prOpen.every((p) => p.status === 'PR / CI'), 'PR açılınca bağlı issue\'lar PR / CI');
  const prMerged = lib.projectStatusPlan({ kind: 'pull_request', action: 'closed', merged: true, body: 'Closes #163' });
  ok(prMerged.length === 1 && prMerged[0].status === 'Tamam', 'PR birleşince Tamam');
  ok(lib.projectStatusPlan({ kind: 'pull_request', action: 'closed', merged: false, body: 'Closes #163' }).length === 0, 'birleşmeden kapanan PR durum değiştirmez');

  // ---- rapor biçimi (Türkçe tarih)
  const rep = lib.buildReport({ sprint: s2, date: '2026-12-14', open: 3, closed: 1, autoOpen: 2, moved: 1 });
  ok(rep.includes('14.12.2026') && rep.includes('25.12.2026') && rep.includes('Açık: 3'), 'rapor: GG.AA.YYYY tarih ve sayılar');

  console.log(fails ? `\n${fails} kontrol başarısız` : '\nTüm otopilot kontrolleri geçti');
})().catch((e) => { console.error('FAIL otopilot testi çöktü:', e.message); process.exitCode = 1; });
