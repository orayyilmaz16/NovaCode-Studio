// Sprint otomasyonu (her Pazartesi): mevcut ve sonraki sprint milestone'larını oluşturur, süresi geçen
// sprintteki açık issue'ları mevcut sprint'e taşır, milestone açıklamasını otomatik rapor olarak günceller.
// Kullanım: node scripts/sprint-cadence.mjs [--date YYYY-MM-DD] [--dry-run]
// Token: GITHUB_TOKEN (issues: write). Kural: docs/brain/actions/autopilot.md
import { pathToFileURL } from 'node:url';
import { sprintFor, planRollover, buildReport, todayUtc, repoSlug, ghRest, ghPaginate, AUTO_LABEL } from './autopilot-lib.mjs';

export function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const date = argValue(args, '--date') || todayUtc();
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN gerekli');
  const repo = repoSlug();

  const current = sprintFor(date);
  if (!current) { console.log(`Sprint takvimi ${date} için henüz başlamadı.`); return; }
  const nextStart = new Date(new Date(`${current.end}T00:00:00Z`).getTime() + 3 * 86400000).toISOString().slice(0, 10);
  const next = sprintFor(nextStart);

  const milestones = await ghPaginate(token, `/repos/${repo}/milestones?state=all`);
  const ensure = async (s) => {
    if (milestones.some((m) => m.title === s.title)) return;
    console.log(`Milestone oluşturulacak: ${s.title} (son tarih ${s.dueOn})`);
    if (dry) return;
    const created = await ghRest(token, 'POST', `/repos/${repo}/milestones`, {
      title: s.title, state: 'open', due_on: s.dueOn,
      description: `${s.start} – ${s.end} (otomatik sprint takvimi)`,
    });
    milestones.push(created);
  };
  await ensure(current);
  await ensure(next);

  const issues = await ghPaginate(token, `/repos/${repo}/issues?state=all`);
  const { target, moves } = planRollover(issues, milestones, date);
  const targetMs = milestones.find((m) => m.title === target);
  console.log(`Taşınacak issue: ${moves.length} → ${target}`);
  for (const mv of moves) {
    console.log(`  #${mv.number}: ${mv.from} → ${mv.to}`);
    if (!dry && targetMs) await ghRest(token, 'PATCH', `/repos/${repo}/issues/${mv.number}`, { milestone: targetMs.number });
  }

  // Rapor: mevcut sprint milestone'undaki sayılar
  const inSprint = issues.filter((i) => !i.pull_request && i.milestone && i.milestone.title === current.title);
  const open = inSprint.filter((i) => i.state === 'open').length;
  const closed = inSprint.filter((i) => i.state === 'closed').length;
  const autoOpen = issues.filter((i) => !i.pull_request && i.state === 'open' && (i.labels || []).some((l) => (l.name || l) === AUTO_LABEL)).length;
  const report = buildReport({ sprint: current, date, open, closed, autoOpen, moved: moves.length });
  console.log(report);
  if (!dry && targetMs) {
    await ghRest(token, 'PATCH', `/repos/${repo}/milestones/${targetMs.number}`, { description: report });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(`sprint-cadence: ${e.message}`); process.exitCode = 1; });
}
