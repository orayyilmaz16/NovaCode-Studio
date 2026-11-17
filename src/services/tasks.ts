// Görev çalıştırıcı: çalışma klasöründeki `.nova/tasks.json` ve `package.json` scripts'i → entegre terminalde çalışır.
// Yeni alt süreç yok: komut metin olarak terminal köprüsüyle (terminalBridge) gönderilir.
// Şema: { "tasks": [{ "label": string, "command": string, "cwd"?: string }] }
// Komut kullanıcının kendi tanımıdır (terminale olduğu gibi gider); label ve cwd doğrulanır, cwd çalışma klasöründe kalır.
import { sendTerminalWhenReady } from './terminalBridge';
import { getTrust, grantTrust } from './trustService';
import { t } from '../i18n/uiText';
import '../i18n/uiTextAi';

export interface Task {
  label: string;
  command: string;
  /** Çalışma klasörüne göre göreli alt dizin. */
  cwd?: string;
  source: 'nova' | 'npm';
}

export const TASKS_FILE = '.nova/tasks.json';
const MAX_TASKS = 100;
// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u001f\u007f]/;
const SCRIPT_NAME = /^[A-Za-z0-9_:.@/-]{1,80}$/;

export const isValidLabel = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 80 && !CTRL.test(v);
// Komut tek satır olmalı (satır sonu = ikinci komut çalıştırmak olurdu)
export const isValidCommand = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 2000 && !CTRL.test(v);

/** cwd: göreli, '..' yok, mutlak/sürücü/UNC yok, kabuk özel karakteri yok. */
export function isSafeCwd(v: unknown): v is string {
  if (typeof v !== 'string' || !v || v.length > 200 || CTRL.test(v)) return false;
  if (/^[\\/]|^[A-Za-z]:|["'`$&|<>^%;]/.test(v)) return false;
  return !v.split(/[\\/]+/).some((seg) => seg === '..');
}

/** Ham JSON'dan geçerli görevleri süzer; geçersiz madde sayısı da döner. */
export function validateTasks(raw: unknown): { tasks: Task[]; invalid: number } {
  const list = raw && typeof raw === 'object' && Array.isArray((raw as { tasks?: unknown }).tasks) ? (raw as { tasks: unknown[] }).tasks : null;
  if (!list) return { tasks: [], invalid: 0 };
  const tasks: Task[] = [];
  let invalid = 0;
  for (const it of list.slice(0, MAX_TASKS)) {
    const o = it as { label?: unknown; command?: unknown; cwd?: unknown } | null;
    if (!o || typeof o !== 'object' || !isValidLabel(o.label) || !isValidCommand(o.command) || (o.cwd !== undefined && !isSafeCwd(o.cwd))) { invalid++; continue; }
    tasks.push({ label: o.label.trim(), command: o.command.trim(), cwd: o.cwd as string | undefined, source: 'nova' });
  }
  invalid += Math.max(0, list.length - MAX_TASKS);
  return { tasks, invalid };
}

/** package.json scripts → "npm run <ad>" görevleri (ad doğrulanır). */
export function scriptsToTasks(pkg: unknown): Task[] {
  const sc = pkg && typeof pkg === 'object' ? (pkg as { scripts?: unknown }).scripts : null;
  if (!sc || typeof sc !== 'object') return [];
  return Object.keys(sc as Record<string, unknown>)
    .filter((n) => SCRIPT_NAME.test(n) && typeof (sc as Record<string, unknown>)[n] === 'string')
    .slice(0, MAX_TASKS)
    .map((n) => ({ label: `npm run ${n}`, command: `npm run ${n}`, source: 'npm' as const }));
}

const join = (root: string, rel: string) => `${root.replace(/[\\/]+$/, '')}${root.includes('\\') ? '\\' : '/'}${rel.replace(/[\\/]+/g, root.includes('\\') ? '\\' : '/')}`;

async function readJson(path: string): Promise<unknown> {
  try {
    const r = await window.electronAPI?.readFile(path);
    if (typeof r !== 'string') return null;
    return JSON.parse(r);
  } catch { return null; }
}

export async function loadTasks(root: string): Promise<{ tasks: Task[]; invalid: number }> {
  const [nova, pkg] = await Promise.all([readJson(join(root, TASKS_FILE)), readJson(join(root, 'package.json'))]);
  const v = validateTasks(nova);
  return { tasks: [...v.tasks, ...scriptsToTasks(pkg)], invalid: v.invalid };
}

/** Görevi terminalde çalıştırır; güvenilmeyen klasörde komut gösterilip onay (ve klasör güveni) istenir. false: iptal/başarısız. */
export async function runTask(task: Task, root: string): Promise<boolean> {
  if (!isValidLabel(task.label) || !isValidCommand(task.command) || (task.cwd !== undefined && !isSafeCwd(task.cwd))) return false;
  const tr = getTrust();
  const trustedHere = tr.trusted && (tr.root === root || tr.root === ''); // web: güven kavramı yok, her zaman güvenilir
  if (!trustedHere) {
    if (!window.confirm(t('taskTrust').replace('{cmd}', task.command))) return false;
    await grantTrust(); // onay klasör güveni olarak da kaydedilir (ana süreç kararı saklar)
  }
  await sendTerminalWhenReady({ action: 'cd', dir: task.cwd ? join(root, task.cwd) : root });
  await sendTerminalWhenReady({ action: 'run', command: task.command });
  return true;
}
