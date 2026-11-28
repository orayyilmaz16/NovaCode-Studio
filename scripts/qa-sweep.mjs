// Kalite taraması (zamanlanmış): kapıları çalıştırır ve sonucu GitHub'a yansıtır.
//   node scripts/qa-sweep.mjs run --out qa-results.json      kapıları çalıştır (tsc, npm test, brain:check)
//   node scripts/qa-sweep.mjs report --results qa-results.json [--dry-run]   issue aç / güncelle / kapat
// Başarısız kapı: aynı kapı için tek açık issue (parmak izi işaretçisiyle), etiketli, projeye eklenir.
// Yeşile dönünce issue kendiliğinden kapanır. Mekanik kapılar (brain) düzeltme workflow'una gönderilir.
// Kural: docs/brain/actions/autopilot.md
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  planActions, excerptOf, sprintFor, todayUtc, repoSlug, ghRest, ghPaginate, AUTO_LABEL,
} from './autopilot-lib.mjs';
import { loadProject, setIssueStatus } from './project-sync.mjs';

const GATES = [
  { id: 'tsc', cmd: 'npx tsc --noEmit' },
  { id: 'tests', cmd: 'npm test' },
  { id: 'brain', cmd: 'npm run brain:check' },
];

export function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

function runGates() {
  const sha = process.env.GITHUB_SHA || '';
  const runUrl = process.env.GITHUB_SERVER_URL
    ? `${process.env.GITHUB_SERVER_URL}/${repoSlug()}/actions/runs/${process.env.GITHUB_RUN_ID || ''}`
    : '(yerel koşu)';
  const results = GATES.map((g) => {
    const res = spawnSync(g.cmd, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 25 * 60 * 1000 });
    const out = `${res.stdout || ''}\n${res.stderr || ''}`;
    const status = res.status === 0 ? 'pass' : 'fail';
    console.log(`${g.id}: ${status}`);
    return { gate: g.id, status, excerpt: status === 'fail' ? excerptOf(out) : '' };
  });
  return { sha, runUrl, results };
}

async function report(token, data, dry) {
  const repo = repoSlug();
  const issues = await ghPaginate(token, `/repos/${repo}/issues?state=open&labels=${AUTO_LABEL}`);
  const milestones = await ghPaginate(token, `/repos/${repo}/milestones?state=open`);
  const sprint = sprintFor(todayUtc());
  const sprintMs = sprint && milestones.find((m) => m.title === sprint.title);
  const actions = planActions(data.results, issues, { sha: data.sha, runUrl: data.runUrl });
  console.log(`Plan: ${actions.map((a) => `${a.type}${a.gate ? ':' + a.gate : ''}${a.number ? ' #' + a.number : ''}`).join(', ') || 'yok'}`);
  if (dry) return;

  const projectToken = process.env.PROJECT_TOKEN;
  const project = projectToken ? await loadProject(projectToken) : null;
  for (const a of actions) {
    if (a.type === 'create') {
      const created = await ghRest(token, 'POST', `/repos/${repo}/issues`, {
        title: a.title, body: a.body, labels: a.labels, ...(sprintMs ? { milestone: sprintMs.number } : {}),
      });
      console.log(`Issue açıldı: #${created.number} (${a.gate})`);
      if (project) await setIssueStatus(projectToken, project, created.number, 'Backlog');
      if (a.autoFix) {
        // GITHUB_TOKEN ile açılan issue etiketi başka workflow'u tetiklemez; düzeltme doğrudan çağrılır.
        await ghRest(token, 'POST', `/repos/${repo}/actions/workflows/auto-fix.yml/dispatches`, {
          ref: 'main', inputs: { issue_number: String(created.number) },
        });
        console.log(`Düzeltme tetiklendi: #${created.number}`);
      }
    } else if (a.type === 'comment') {
      await ghRest(token, 'POST', `/repos/${repo}/issues/${a.number}/comments`, { body: a.body });
    } else if (a.type === 'close') {
      await ghRest(token, 'PATCH', `/repos/${repo}/issues/${a.number}`, { state: 'closed', state_reason: 'completed' });
      if (project) await setIssueStatus(projectToken, project, a.number, 'Tamam');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  if (mode === 'run') {
    const out = argValue(args, '--out') || 'qa-results.json';
    const data = runGates();
    writeFileSync(out, JSON.stringify(data, null, 2));
    console.log(`Sonuç yazıldı: ${out}`);
    return;
  }
  if (mode === 'report') {
    const data = JSON.parse(readFileSync(argValue(args, '--results') || 'qa-results.json', 'utf8'));
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN gerekli');
    await report(token, data, args.includes('--dry-run'));
    return;
  }
  throw new Error('Kullanım: qa-sweep.mjs run|report');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(`qa-sweep: ${e.message}`); process.exitCode = 1; });
}
