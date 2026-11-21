// Test çıktısı özeti: terminal çıktısından (ANSI temizlenmiş) Jest, Vitest, Node test runner ve pytest özet satırlarını okur.
// Yalnız özet sayılarını ve başarısız test adlarını çıkarır; kod/içerik hiçbir yere gönderilmez.
export interface TestSummary {
  runner: 'jest' | 'vitest' | 'node' | 'pytest' | 'generic';
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  /** saniye */
  duration?: number;
  failures: string[];
}

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b\][^\u0007]*\u0007/g;
export const stripAnsi = (s: string) => s.replace(ANSI, '').replace(/\r(?!\n)/g, '\n');

const num = (v: string | undefined) => (v ? Number(v) : 0);
const lastMatch = (re: RegExp, text: string): RegExpExecArray | null => {
  let m: RegExpExecArray | null = null;
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  for (let x = g.exec(text); x; x = g.exec(text)) m = x;
  return m;
};

function failuresOf(text: string): string[] {
  const out: string[] = [];
  const re = /^[ \t]*(?:✕|×|✗|✖|FAIL|not ok \d+ -|●)[ \t]+(.{2,160})$/gm;
  for (let m = re.exec(text); m && out.length < 30; m = re.exec(text)) {
    const name = m[1].replace(/\s+\(\d+(\.\d+)?\s*m?s\)$/, '').trim();
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}

/** Çıktının sonundaki en güncel özeti döndürür; özet satırı yoksa null (test hâlâ çalışıyor olabilir). */
export function parseTestOutput(raw: string): TestSummary | null {
  const text = stripAnsi(raw.length > 400_000 ? raw.slice(-400_000) : raw);

  // Node test runner: "ℹ tests 6 / ℹ pass 5 / ℹ fail 1 / ℹ skipped 0 / ℹ duration_ms 123.4"
  const nTests = lastMatch(/^[ \t]*ℹ[ \t]+tests[ \t]+(\d+)/m, text);
  if (nTests) {
    const pass = lastMatch(/^[ \t]*ℹ[ \t]+pass[ \t]+(\d+)/m, text);
    const fail = lastMatch(/^[ \t]*ℹ[ \t]+fail[ \t]+(\d+)/m, text);
    const skip = lastMatch(/^[ \t]*ℹ[ \t]+skipped[ \t]+(\d+)/m, text);
    const dur = lastMatch(/^[ \t]*ℹ[ \t]+duration_ms[ \t]+([\d.]+)/m, text);
    return { runner: 'node', passed: num(pass?.[1]), failed: num(fail?.[1]), skipped: num(skip?.[1]), total: num(nTests[1]), duration: dur ? Number(dur[1]) / 1000 : undefined, failures: failuresOf(text) };
  }

  // Jest: "Tests:       1 failed, 2 skipped, 5 passed, 8 total" (+ "Time:        1.234 s")
  const jest = lastMatch(/^Tests:[ \t]+(.+?)[ \t]+total\b/m, text);
  if (jest) {
    const part = (w: string) => num(new RegExp(`(\\d+) ${w}`).exec(jest[1])?.[1]);
    const total = num(/(\d+)$/.exec(jest[0].replace(/[ \t]+total\b.*/, ''))?.[1]) || part('passed') + part('failed') + part('skipped');
    const time = lastMatch(/^Time:[ \t]+([\d.]+)[ \t]*s/m, text);
    return { runner: 'jest', passed: part('passed'), failed: part('failed'), skipped: part('skipped') + part('todo'), total, duration: time ? Number(time[1]) : undefined, failures: failuresOf(text) };
  }

  // Vitest: "Tests  1 failed | 5 passed | 1 skipped (7)" (+ "Duration  1.23s")
  const vt = lastMatch(/^[ \t]*Tests[ \t]+(.+?)[ \t]*\((\d+)\)/m, text);
  if (vt) {
    const part = (w: string) => num(new RegExp(`(\\d+) ${w}`).exec(vt[1])?.[1]);
    const dur = lastMatch(/^[ \t]*Duration[ \t]+([\d.]+)(ms|s)/m, text);
    return { runner: 'vitest', passed: part('passed'), failed: part('failed'), skipped: part('skipped') + part('todo'), total: num(vt[2]), duration: dur ? Number(dur[1]) / (dur[2] === 'ms' ? 1000 : 1) : undefined, failures: failuresOf(text) };
  }

  // pytest: "=== 1 failed, 5 passed, 2 skipped in 0.12s ===" ya da "5 passed in 0.03s"
  const py = lastMatch(/^=*[ \t]*((?:\d+ (?:failed|passed|skipped|error|errors|xfailed|xpassed|warnings?)(?:, )?)+)[ \t]+in[ \t]+([\d.]+)s/m, text);
  if (py) {
    const part = (w: string) => num(new RegExp(`(\\d+) ${w}`).exec(py[1])?.[1]);
    const failed = part('failed') + part('errors?');
    return { runner: 'pytest', passed: part('passed'), failed, skipped: part('skipped'), total: part('passed') + failed + part('skipped'), duration: Number(py[2]), failures: failuresOf(text) };
  }
  return null;
}

/** package.json / görev adından test betiği mi? (test, test:unit, vitest, jest, e2e, spec, coverage, pytest) */
export const isTestTask = (label: string) => /(^|[\s:/_-])(test|tests|vitest|jest|mocha|spec|e2e|coverage|pytest|unittest)([\s:/_-]|$)/i.test(label);
