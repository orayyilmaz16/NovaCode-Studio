// Proje senkronizasyonu: issue/PR olaylarını GitHub Projects (#2) kartlarına ve Status alanına yansıtır.
// Kullanım (Actions): node scripts/project-sync.mjs   (GITHUB_EVENT_NAME / GITHUB_EVENT_PATH okunur)
//                     node scripts/project-sync.mjs --dry-run --event <payload.json> --kind issue
// Token: PROJECT_TOKEN (Projects yazma yetkisi). Yoksa sessizce atlanır; hata vermez.
// Kural: docs/brain/actions/autopilot.md
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { PROJECT_NUMBER, projectStatusPlan, ghRest, ghGraphql, repoSlug } from './autopilot-lib.mjs';

const OWNER = process.env.PROJECT_OWNER || repoSlug().split('/')[0];

// Proje kimliği, Status alanı ve seçenek kimlikleri (çalışma zamanında çözülür; sabit kimlik kodlanmaz).
export async function loadProject(token) {
  const data = await ghGraphql(token, `query($login:String!,$number:Int!){
    user(login:$login){ projectV2(number:$number){ id fields(first:50){ nodes{ ... on ProjectV2SingleSelectField { id name options { id name } } } } } } }`,
    { login: OWNER, number: PROJECT_NUMBER });
  const project = data.user.projectV2;
  const status = project.fields.nodes.find((f) => f && f.name === 'Status');
  if (!status) throw new Error('Projede Status alanı yok');
  return { id: project.id, statusField: status.id, options: Object.fromEntries(status.options.map((o) => [o.name, o.id])) };
}

// Issue'yu projeye ekler (zaten varsa aynı kartı döner) ve durumu yazar.
export async function setIssueStatus(token, project, issueNumber, statusName) {
  const repo = repoSlug();
  const issue = await ghRest(token, 'GET', `/repos/${repo}/issues/${issueNumber}`);
  const add = await ghGraphql(token, `mutation($p:ID!,$c:ID!){ addProjectV2ItemById(input:{projectId:$p, contentId:$c}){ item { id } } }`,
    { p: project.id, c: issue.node_id });
  const optionId = project.options[statusName];
  if (!optionId) throw new Error(`Status seçeneği yok: ${statusName}`);
  await ghGraphql(token, `mutation($p:ID!,$i:ID!,$f:ID!,$o:String!){ updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$o}}){ projectV2Item { id } } }`,
    { p: project.id, i: add.addProjectV2ItemById.item.id, f: project.statusField, o: optionId });
  return { number: issueNumber, status: statusName };
}

// Olay payload'ını yorumlar: { kind, action, number, body, labels/label, merged }
export function eventFromPayload(name, payload) {
  if (name === 'issues') {
    return { kind: 'issue', action: payload.action, number: payload.issue.number, label: payload.label?.name };
  }
  if (name === 'pull_request') {
    return { kind: 'pull_request', action: payload.action, body: payload.pull_request.body, merged: !!payload.pull_request.merged };
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const evtIdx = args.indexOf('--event');
  const payload = evtIdx >= 0
    ? JSON.parse(readFileSync(args[evtIdx + 1], 'utf8'))
    : JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const name = args.includes('--kind') ? args[args.indexOf('--kind') + 1] : process.env.GITHUB_EVENT_NAME;
  const evt = eventFromPayload(name === 'issue' ? 'issues' : name, payload);
  if (!evt) { console.log(`Olay atlandı: ${name}`); return; }

  // Olay planı ağ gerektirmez; önce planı yazdır.
  const plan = projectStatusPlan(evt).map((p) => ({ ...p }));
  // Bir PR'ın bağladığı issue'ların durumu: planı kesinleştirmek için yalnız numara yeterli.
  console.log(`Plan (${plan.length}): ${plan.map((p) => `#${p.number}→${p.status}`).join(', ') || 'yok'}`);
  if (dry || plan.length === 0) return;

  const token = process.env.PROJECT_TOKEN;
  if (!token) { console.log('PROJECT_TOKEN yok: proje güncellemesi atlandı.'); return; }
  const project = await loadProject(token);
  for (const p of plan) {
    const r = await setIssueStatus(token, project, p.number, p.status);
    console.log(`#${r.number} → ${r.status}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(`project-sync: ${e.message}`); process.exitCode = 1; });
}
