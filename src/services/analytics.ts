// Anonim kullanım sayacı (renderer tarafı). Ağ isteği YOK: yalnız izinli olay adını ana sürece iletir; sayma, saklama ve gönderim
// electron-analytics.cjs içindedir (rıza yoksa hiçbir şey sayılmaz). Kural ve KVKK: docs/brain/actions/analytics.md
import { useCallback, useEffect, useRef, useState } from 'react';

export type AnalyticsEvent =
  | 'app_start' | 'panel_files' | 'panel_search' | 'panel_git' | 'panel_extensions' | 'panel_debug'
  | 'panel_terminal' | 'panel_ai' | 'panel_settings' | 'file_save' | 'code_run';

const api = () => window.electronAPI?.analytics;

export function track(name: AnalyticsEvent): void {
  try { api()?.track(name); } catch { /* ana süreç hazır değil: sayılmaz */ }
}

/**
 * Rıza ayarını ana sürece eşitler (ayar kapalıysa ana süreç de kapanır: güvenli yön) ve ilk açılışta tek seferlik rıza sorusunu yönetir.
 * `enabled`: kullanıcının ayarı (`analyticsEnabled`). Rıza yalnız kullanıcı eyleminden gelir; varsayılan kapalı.
 */
export function useAnalytics(enabled: boolean, lang: string) {
  const [ask, setAsk] = useState(false);
  const started = useRef(false);

  useEffect(() => { try { api()?.setLang(lang); } catch { /* yok say */ } }, [lang]);

  useEffect(() => {
    let dead = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = async (attempt: number) => {
      const a = api();
      if (!a) return;
      try {
        const st = await a.setConsent(enabled);
        if (dead) return;
        if (st.enabled && !started.current) { started.current = true; a.track('app_start'); }
        if (enabled && !st.asked) void a.markAsked(); // ayardan açan kişiye ayrıca sorulmaz
        if (!enabled && st.configured && !st.asked) timer = setTimeout(() => { if (!dead) setAsk(true); }, 4000);
      } catch {
        if (!dead && attempt < 5) timer = setTimeout(() => void sync(attempt + 1), 3000); // ana süreç modülü henüz yüklenmemiş olabilir
      }
    };
    void sync(0);
    return () => { dead = true; if (timer) clearTimeout(timer); };
  }, [enabled]);

  /** Soruya yanıt: yalnız "soruldu" işaretlenir; rızayı ayar değişikliği (çağıranın `setSetting`'i) verir. */
  const answered = useCallback(() => {
    setAsk(false);
    try { void api()?.markAsked(); } catch { /* yok say */ }
  }, []);

  return { ask, answered };
}
