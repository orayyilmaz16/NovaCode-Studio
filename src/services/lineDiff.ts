// Satır farkı (HEAD'deki sürüm ↔ editördeki metin): editör kenarında eklenen / değişen / silinen satır işaretleri için.
// Önce ortak önek/sonek kırpılır, kalan orta kısım LCS ile eşleştirilir. Çok büyük ortalarda (n·m sınırı) kaba yaklaşım kullanılır.
export interface LineDiff {
  /** Yalnız eklenen satırlar (1 tabanlı, yeni metin) */
  added: number[];
  /** Eski satırların yerine geçen değişen satırlar */
  modified: number[];
  /** Silinen satırların konumu: yeni metinde bu satırdan önce silinmiş (1 tabanlı) */
  deletedAt: number[];
}

const MAX_CELLS = 4_000_000;

const splitLines = (s: string): string[] => (s === '' ? [] : s.replace(/\r\n/g, '\n').split('\n'));

export function diffLines(oldText: string, newText: string): LineDiff {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const out: LineDiff = { added: [], modified: [], deletedAt: [] };

  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const aMid = a.slice(pre, a.length - suf);
  const bMid = b.slice(pre, b.length - suf);
  const n = aMid.length;
  const m = bMid.length;

  // Eşleşen (ortak) satır çiftleri: bMid indeksine göre aMid indeksi
  const matchB = new Int32Array(m).fill(-1);
  if (n > 0 && m > 0) {
    if ((n + 1) * (m + 1) <= MAX_CELLS) {
      const w = m + 1;
      const dp = new Int32Array((n + 1) * w);
      for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
          dp[i * w + j] = aMid[i] === bMid[j] ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
        }
      }
      let i = 0;
      let j = 0;
      while (i < n && j < m) {
        if (aMid[i] === bMid[j]) { matchB[j] = i; i++; j++; }
        else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) i++;
        else j++;
      }
    }
    // Büyük ortalarda eşleştirme yok: orta tamamen değişmiş sayılır
  }

  // Yeni metin satırlarını ve eski satırların boşluklarını gez
  let ai = 0;
  let bj = 0;
  const flush = (bFrom: number, bTo: number, aFrom: number, aTo: number) => {
    const nb = bTo - bFrom;
    const na = aTo - aFrom;
    if (nb > 0 && na > 0) for (let k = 0; k < nb; k++) out.modified.push(pre + bFrom + k + 1);
    else if (nb > 0) for (let k = 0; k < nb; k++) out.added.push(pre + bFrom + k + 1);
    else if (na > 0) out.deletedAt.push(Math.max(1, pre + bFrom));
  };
  for (let j = 0; j < m; j++) {
    if (matchB[j] >= 0) {
      flush(bj, j, ai, matchB[j]);
      ai = matchB[j] + 1;
      bj = j + 1;
    }
  }
  flush(bj, m, ai, n);
  return out;
}
