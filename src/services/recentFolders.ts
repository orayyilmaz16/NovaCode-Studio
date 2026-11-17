// Son açılan klasörler: aynı anda gelen çağrılar tek ana süreç isteğinde birleşir (P-21).
// Ana süreç listeyi her çağrıda doğrular (existsSync); iki bileşenin ayrı ayrı sormasını önler.
export interface RecentFolder { path: string; name: string }

let inflight: Promise<RecentFolder[]> | null = null;
let cache: { at: number; list: RecentFolder[] } | null = null;
const TTL = 1500; // ms: art arda mount/yenileme çağrıları için kısa önbellek

export function getRecentFolders(force = false): Promise<RecentFolder[]> {
  const api = window.electronAPI?.recentFolders;
  if (!api) return Promise.resolve([]);
  if (!force && cache && Date.now() - cache.at < TTL) return Promise.resolve(cache.list);
  if (inflight) return inflight;
  inflight = api()
    .then((list) => {
      cache = { at: Date.now(), list };
      return list;
    })
    .catch(() => [] as RecentFolder[])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export const invalidateRecentFolders = () => {
  cache = null;
};
