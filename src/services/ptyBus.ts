// PTY çıktı tamponu: terminal oturumu (Terminal.tsx) ile xterm görünümü (PtyView.tsx) arasındaki bağ.
// Oturum ömrü görünümden bağımsızdır: görünüm yeniden bağlanırsa (StrictMode, gecikmeli yükleme, sekme değişimi) tampon baştan oynatılır, çıktı kaybolmaz.
const MAX = 1 << 20; // oturum başına en çok ~1 MB ham çıktı
const buffers = new Map<string, string>();
const listeners = new Map<string, (data: string) => void>();
const taps = new Set<(id: string, data: string) => void>();

export function pushPtyData(id: string, data: string) {
  const next = (buffers.get(id) ?? '') + data;
  buffers.set(id, next.length > MAX ? next.slice(-MAX) : next);
  listeners.get(id)?.(data);
  taps.forEach((f) => f(id, data));
}

/** Ham çıktıyı dinler (xterm görünümünden bağımsız; ör. Test paneli özeti). Dönen işlev dinlemeyi bırakır. */
export function tapPty(f: (id: string, data: string) => void): () => void {
  taps.add(f);
  return () => { taps.delete(f); };
}

/** Oturumun şimdiye kadarki ham çıktısı (en çok ~1 MB). */
export function getPtyBuffer(id: string): string {
  return buffers.get(id) ?? '';
}

/** Görünümü bağlar: o ana kadarki çıktıyı oynatır, sonrasını canlı iletir. Dönen işlev bağlantıyı keser. */
export function attachPty(id: string, write: (data: string) => void): () => void {
  const past = buffers.get(id);
  if (past) write(past);
  listeners.set(id, write);
  return () => { if (listeners.get(id) === write) listeners.delete(id); };
}

export function dropPty(id: string) {
  buffers.delete(id);
  listeners.delete(id);
}
