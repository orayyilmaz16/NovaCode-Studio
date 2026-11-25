// Uygulama menüsü / komut paleti → entegre terminal köprüsü (Terminal.tsx 'nova:term' olayını dinler).
export type TerminalAction = { action: 'run'; command: string; stay?: boolean } | { action: 'cd'; dir: string; stay?: boolean } | { action: 'new' } | { action: 'clear' } | { action: 'tab'; tab: 'problems' | 'terminal' | 'log' | 'debug' | 'tests' };

export function sendTerminal(detail: TerminalAction) {
  window.dispatchEvent(new CustomEvent('nova:term', { detail }));
}

/** Ayarlardaki (Çalıştır) dile özel komut şablonları; {file} ve {dir} yer tutucudur. Boş = yerleşik komut. */
export interface RunOverrides { node?: string; ts?: string; python?: string; go?: string; php?: string }

const fill = (tpl: string, file: string) => tpl.replace(/\{file\}/g, `"${file}"`).replace(/\{dir\}/g, `"${file.slice(0, Math.max(file.lastIndexOf('/'), file.lastIndexOf('\\')))}"`);

/** Etkin dosyanın türüne göre çalıştırma komutu; bilinmiyorsa null. `file` mutlak yoldur. */
export function runCommandFor(file: string, language?: string, custom: RunOverrides = {}): string | null {
  const ext = (file.split('.').pop() ?? '').toLowerCase();
  const q = `"${file}"`;
  const pick = (tpl: string | undefined, fallback: string) => (tpl && tpl.trim() ? fill(tpl.trim(), file) : fallback);
  switch (ext) {
    case 'js': case 'mjs': case 'cjs': return pick(custom.node, `node ${q}`);
    case 'ts': case 'tsx': return pick(custom.ts, `npx tsx ${q}`);
    case 'py': return pick(custom.python, `python ${q}`);
    case 'go': return pick(custom.go, `go run ${q}`);
    case 'php': return pick(custom.php, `php ${q}`);
    case 'rb': return `ruby ${q}`;
    case 'java': return `java ${q}`;
    case 'sh': case 'bash': return `bash ${q}`;
    case 'ps1': return `& ${q}`;
    case 'dart': return `dart run ${q}`;
    case 'lua': return `lua ${q}`;
    default: return language === 'python' ? pick(custom.python, `python ${q}`) : null;
  }
}

// Terminal paneli tembel yüklenir: ilk kullanımda parça inip dinleyici kurulana kadar bekler (sabit gecikme yok).
// Terminal hazır olunca 'nova:term-ready' olayı yayınlayabilir; yayınlamazsa parça yüklenip iki çizim karesi geçince hazır sayılır.
let termReady = false;
let readyPromise: Promise<void> | null = null;
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
function whenTerminalReady(): Promise<void> {
  if (termReady) return Promise.resolve();
  readyPromise ??= new Promise<void>((resolve) => {
    const done = () => { termReady = true; resolve(); };
    window.addEventListener('nova:term-ready', done, { once: true });
    import('../components/Terminal').then(() => nextFrame().then(nextFrame).then(done), done);
  });
  return readyPromise;
}

/** Terminal hazır olunca (ve panelin görünürlük durumu işlendikten sonra) komutu gönderir. */
export async function sendTerminalWhenReady(detail: TerminalAction) {
  await whenTerminalReady();
  await nextFrame();
  sendTerminal(detail);
}
