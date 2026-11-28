// Otopilot yardımcıları (sprint takvimi, kalite kapıları, issue planı, proje durumu).
// Saf fonksiyonlar ağ çağrısı yapmaz; testler: scripts/tests/autopilot.test.cjs.
// Ağ yardımcıları (ghRest, ghGraphql) aşağıdaki ayrı bölümde; yalnız CI ve yerel `--dry-run` dışı çalışmada kullanılır.
// Kural: docs/brain/actions/autopilot.md

export const SPRINT_ANCHOR = '2026-11-30'; // Sprint 1 başlangıcı (Pazartesi, UTC)
export const SPRINT_DAYS = 14;             // iki hafta
export const PROJECT_NUMBER = 2;           // "NovaCode Studio: Geliştirme ve QA"
export const STATUS = {
  backlog: 'Backlog', ready: 'Hazır', dev: 'Geliştiriliyor', pr: 'PR / CI', qa: 'QA’da', done: 'Tamam',
};
export const AUTO_LABEL = 'auto-detected';
export const FIX_LABEL = 'auto-fix';

const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const parseIso = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const addDays = (s, n) => iso(new Date(parseIso(s).getTime() + n * DAY));
export const todayUtc = () => iso(new Date());

// ---------- Sprint takvimi ----------
// Sprint n: başlangıç = çapa + (n-1)*14 gün (Pazartesi), bitiş = başlangıç + 11 gün (Cuma).
export function sprintFor(dateStr) {
  const days = Math.floor((parseIso(dateStr) - parseIso(SPRINT_ANCHOR)) / DAY);
  if (days < 0) return null;
  const n = Math.floor(days / SPRINT_DAYS) + 1;
  const start = addDays(SPRINT_ANCHOR, (n - 1) * SPRINT_DAYS);
  const end = addDays(start, 11);
  return { n, title: `Sprint ${n}`, start, end, dueOn: `${end}T23:59:59Z` };
}

// Eski sprintte kalan açık issue'lar mevcut sprint'e taşınır. Yalnız "Sprint N" milestone'ları ve
// son tarihi geçmiş olanlar sayılır; "Ürün kararı bekliyor" gibi tarihsiz milestone'lara dokunulmaz.
export function planRollover(issues, milestones, dateStr) {
  const current = sprintFor(dateStr);
  if (!current) return { target: null, moves: [] };
  const ended = new Set(
    milestones
      .filter((m) => /^Sprint \d+$/.test(m.title) && m.title !== current.title && m.due_on && m.due_on < `${dateStr}T00:00:00Z`)
      .map((m) => m.title),
  );
  const moves = issues
    .filter((i) => !i.pull_request && i.state === 'open' && i.milestone && ended.has(i.milestone.title))
    .map((i) => ({ number: i.number, from: i.milestone.title, to: current.title }));
  return { target: current.title, moves };
}

// ---------- Çıktı temizleme (public repo: issue ve günlükte yol, sır, e-posta, IP yer almaz) ----------
export function redact(text) {
  return String(text)
    .replace(/[A-Za-z]:\\a\\[^\s"'<>]*/g, '<runner-yolu>')
    .replace(/[A-Za-z]:\\[^\s"'<>]+/g, '<yol>')
    .replace(/\/(?:home|Users)\/[^/\s"']+/g, '<yol>')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b/g, '<token>')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<e-posta>')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<ip>');
}

// Test çıktısından kısa, temizlenmiş bir özet: hata satırları + son satırlar, en fazla 60 satır / 3000 karakter.
export function excerptOf(output) {
  const lines = String(output).split(/\r?\n/);
  const hit = lines.filter((l) => /FAIL|Error|error TS|✖|not ok|HATA|hata:/i.test(l));
  const picked = [...new Set([...hit, ...lines.slice(-25)])].slice(-60);
  return redact(picked.join('\n')).slice(0, 3000);
}

// ---------- Kalite kapıları ----------
const AREA_BY_TEST = [
  [/^ai-security/, 'area:security'],
  [/^(paths|trust|ssh|ssh-sftp|preview-csp|electron-misc)/, 'area:security'],
  [/^git/, 'area:git'],
  [/^(term|pty)/, 'area:terminal'],
  [/^ai/, 'area:ai'],
  [/^i18n/, 'area:i18n'],
  [/^(syncserver|sync)/, 'area:sync'],
  [/^search/, 'area:search'],
  [/^release/, 'area:release'],
  [/^palettes/, 'area:ui'],
  [/^(textbuffer|lsp|history|replace|snippets)/, 'area:editor'],
];
export function areaForTest(name) {
  const hit = AREA_BY_TEST.find(([re]) => re.test(name));
  return hit ? hit[1] : null;
}

export const GATE_TITLE = {
  tsc: '[auto] Tip kontrolü başarısız (tsc --noEmit)',
  tests: '[auto] Test takımı başarısız (npm test)',
  brain: '[auto] Belge ve i18n denetimi başarısız (brain:check)',
};

// Her kapı için etiket seti. autoFix yalnız mekanik kapılarda (belge/i18n); kod testleri insan işidir.
export function classifyGate(gate, text = '') {
  if (gate === 'brain') return { labels: ['bug', AUTO_LABEL, 'sev:minor'], autoFix: true };
  const labels = ['bug', AUTO_LABEL, 'sev:major'];
  if (gate === 'tests') {
    const m = /scripts[\\/]tests[\\/]([\w.-]+?)\.test\.cjs/.exec(text);
    const area = m ? areaForTest(m[1]) : null;
    if (area) labels.push(area);
  }
  return { labels, autoFix: false };
}

export const fingerprintMarker = (gate) => `<!-- qa-fingerprint: ${gate} -->`;

export function buildIssueBody({ gate, sha, runUrl, excerpt }) {
  return [
    '**Otomatik tespit (kalite kapısı).** Zamanlanmış kalite taraması bu kapının başarısız olduğunu gördü.',
    '',
    `- Kapı: \`${gate}\``,
    `- Commit: \`${String(sha || '').slice(0, 7) || '—'}\``,
    `- Koşu: ${runUrl}`,
    '',
    'Aynı kapı yeşile döndüğünde bu issue otomatik kapanır. Çıktı temizlenmiştir (yol, sır ve e-posta içermez).',
    '',
    '```text',
    excerpt || '(çıktı yok)',
    '```',
    '',
    fingerprintMarker(gate),
  ].join('\n');
}

// Sonuçları ve açık otomatik issue'ları karşılaştırır, yapılacak işleri döndürür. Ağ çağrısı yapmaz.
export function planActions(results, openIssues, run) {
  const actions = [];
  for (const r of results) {
    const marker = fingerprintMarker(r.gate);
    const existing = openIssues.find((i) => String(i.body || '').includes(marker));
    const sha7 = String(run.sha || '').slice(0, 7);
    if (r.status === 'fail') {
      if (existing) {
        actions.push({ type: 'comment', number: existing.number, body: `Yine başarısız (${sha7}): ${run.runUrl}` });
      } else {
        const c = classifyGate(r.gate, r.excerpt);
        actions.push({
          type: 'create', gate: r.gate, title: GATE_TITLE[r.gate] || `[auto] Kapı başarısız: ${r.gate}`,
          body: buildIssueBody({ gate: r.gate, sha: run.sha, runUrl: run.runUrl, excerpt: r.excerpt }),
          labels: c.autoFix ? [...c.labels, FIX_LABEL] : c.labels, autoFix: c.autoFix,
        });
      }
    } else if (existing) {
      actions.push({ type: 'comment', number: existing.number, body: `✅ \`${r.gate}\` yeşile döndü (${sha7}): ${run.runUrl}\nOtomatik kapatıldı.` });
      actions.push({ type: 'close', number: existing.number });
    }
  }
  return actions;
}

// ---------- Proje durumu (Projects #2) ----------
export function parseLinked(body) {
  const out = [];
  for (const m of String(body || '').matchAll(/(?:closes|fixes|resolves|kapat\w*|düzelt\w*)\s+#(\d+)/gi)) out.push(Number(m[1]));
  return [...new Set(out)];
}

// Olaydan proje durumu kuralları. Dönen her öğe: { number, status } (number = issue numarası).
export function projectStatusPlan(evt) {
  const plan = [];
  if (evt.kind === 'issue') {
    if (['opened', 'reopened'].includes(evt.action)) plan.push({ number: evt.number, status: STATUS.backlog });
    if (evt.action === 'closed') plan.push({ number: evt.number, status: STATUS.done });
    if (evt.action === 'labeled') {
      const map = { 'qa:needs-test': STATUS.qa, 'qa:verified': STATUS.done, 'qa:reopened': STATUS.dev };
      if (map[evt.label]) plan.push({ number: evt.number, status: map[evt.label] });
    }
  }
  if (evt.kind === 'pull_request') {
    const linked = parseLinked(evt.body);
    if (['opened', 'reopened', 'ready_for_review', 'synchronize'].includes(evt.action)) {
      for (const n of linked) plan.push({ number: n, status: STATUS.pr });
    }
    if (evt.action === 'closed' && evt.merged) {
      for (const n of linked) plan.push({ number: n, status: STATUS.done });
    }
  }
  return plan;
}

// ---------- Sprint raporu (milestone açıklaması) ----------
const trDate = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
export function buildReport({ sprint, date, open, closed, autoOpen, moved }) {
  return [
    `Otomatik sprint raporu (${trDate(date)}). Dönem: ${trDate(sprint.start)} – ${trDate(sprint.end)}.`,
    `Açık: ${open} · Kapalı: ${closed} · Otomatik tespit (açık): ${autoOpen} · Bu sprinte taşınan: ${moved}.`,
  ].join('\n');
}

// ---------- Ağ yardımcıları (yalnız CI ve gerçek çalıştırmada) ----------
export function repoSlug() {
  return process.env.GITHUB_REPOSITORY || 'orayyilmaz16/NovaCode-Studio';
}
export async function ghRest(token, method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'novacode-autopilot',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${String(text).slice(0, 200)}`);
  return data;
}
export async function ghPaginate(token, path) {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const rows = await ghRest(token, 'GET', `${path}${sep}per_page=100&page=${page}`);
    out.push(...rows);
    if (rows.length < 100) break;
  }
  return out;
}
export async function ghGraphql(token, query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'novacode-autopilot' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors).slice(0, 300)}`);
  return json.data;
}
