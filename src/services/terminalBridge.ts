// Uygulama menüsü / komut paleti → entegre terminal köprüsü (Terminal.tsx 'nova:term' olayını dinler).
export type TerminalAction = { action: 'run'; command: string } | { action: 'new' } | { action: 'clear' };

export function sendTerminal(detail: TerminalAction) {
  window.dispatchEvent(new CustomEvent('nova:term', { detail }));
}

/** Etkin dosyanın türüne göre çalıştırma komutu; bilinmiyorsa null. `file` mutlak yoldur. */
export function runCommandFor(file: string, language?: string): string | null {
  const ext = (file.split('.').pop() ?? '').toLowerCase();
  const q = `"${file}"`;
  switch (ext) {
    case 'js': case 'mjs': case 'cjs': return `node ${q}`;
    case 'ts': case 'tsx': return `npx tsx ${q}`;
    case 'py': return `python ${q}`;
    case 'go': return `go run ${q}`;
    case 'php': return `php ${q}`;
    case 'rb': return `ruby ${q}`;
    case 'java': return `java ${q}`;
    case 'sh': case 'bash': return `bash ${q}`;
    case 'ps1': return `& ${q}`;
    case 'dart': return `dart run ${q}`;
    case 'lua': return `lua ${q}`;
    default: return language === 'python' ? `python ${q}` : null;
  }
}
