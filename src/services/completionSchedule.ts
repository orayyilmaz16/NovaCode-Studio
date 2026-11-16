// AI tamamlama zamanlaması (saf mantık, Monaco/React bağımsız; test: scripts/tests/completion-schedule.test.cjs).
//
// Kavramlar:
//  - gecikme (delay): son tuş vuruşundan sonra beklenecek sessizlik. Monaco her tuşta sağlayıcıyı yeniden çağırıp eskisini iptal ettiği için
//    "çağrı anından delay kadar bekle" = debounce.
//  - soğuma (cooldown): bir istek bittikten (öneri geldi / iptal edildi / hata) sonra yenisinin başlayabileceği en erken an.
//  - uyum: iptal edilen (boşa giden) istekler gecikmeyi kademeli uzatır; öneri gelince sıfırlanır.
//  - geri çekilme: art arda hata (Ollama kapalı/model yok) kademeli bekleme getirir; elle tetikleme (Alt+\) hepsini aşar.

export interface ScheduleConfig { delay: number; cooldown: number }
export interface ScheduleState {
  /** Son isteğin bittiği an (ms, epoch) */
  lastDoneAt: number;
  /** Art arda boşa giden (yazarken iptal edilen) istek sayısı */
  wasted: number;
  /** Art arda hata sayısı */
  fails: number;
  /** Bu ana kadar otomatik istek atılmaz */
  blockedUntil: number;
}
export type Outcome = 'ok' | 'wasted' | 'timeout' | 'fail';

/** Boşa giden sayı bu süreden eskiyse yazma ritmi değişmiş sayılır ve sıfırlanır. */
export const WASTED_DECAY_MS = 30000;
/** Uyumlu gecikme çarpanının üst sınırı. */
export const MAX_DELAY_FACTOR = 2;

export const newScheduleState = (): ScheduleState => ({ lastDoneAt: 0, wasted: 0, fails: 0, blockedUntil: 0 });

/** Art arda n. hatadan sonra otomatik isteklerin duraklatılacağı süre: 3 sn, 10 sn, 30 sn, sonra 60 sn. */
export function failBackoff(fails: number): number {
  if (fails <= 0) return 0;
  return [3000, 10000, 30000][fails - 1] ?? 60000;
}

/** Boşa giden her istek gecikmeyi %15 uzatır (en çok 2 kat). */
export function effectiveDelay(delay: number, wasted: number): number {
  return Math.round(delay * Math.min(MAX_DELAY_FACTOR, 1 + 0.15 * Math.max(0, wasted)));
}

/**
 * Otomatik tetiklemede bu çağrı için ne yapılacağı. `now`: sağlayıcının çağrıldığı an (= son tuş vuruşu).
 * skip: hata geri çekilmesi sürüyor, hiç sorma. wait: isteği göndermeden önce beklenecek ms.
 */
export function planRequest(now: number, st: ScheduleState, cfg: ScheduleConfig): { skip: boolean; wait: number } {
  if (now < st.blockedUntil) return { skip: true, wait: 0 };
  const wasted = now - st.lastDoneAt > WASTED_DECAY_MS ? 0 : st.wasted;
  const typingGap = effectiveDelay(cfg.delay, wasted);
  const cooldownLeft = st.lastDoneAt + Math.max(0, cfg.cooldown) - now;
  return { skip: false, wait: Math.max(0, typingGap, cooldownLeft) };
}

export function onOutcome(st: ScheduleState, outcome: Outcome, now: number): ScheduleState {
  switch (outcome) {
    case 'ok':
      return { lastDoneAt: now, wasted: 0, fails: 0, blockedUntil: 0 };
    case 'wasted':
      return { ...st, lastDoneAt: now, wasted: (now - st.lastDoneAt > WASTED_DECAY_MS ? 0 : st.wasted) + 1 };
    case 'timeout':
      return { ...st, lastDoneAt: now };
    case 'fail': {
      const fails = st.fails + 1;
      return { ...st, lastDoneAt: now, fails, blockedUntil: now + failBackoff(fails) };
    }
  }
}

/** Model/Ollama geri geldi (ısıtma başarılı): hata geri çekilmesini kaldır. */
export const clearBackoff = (st: ScheduleState): ScheduleState => ({ ...st, fails: 0, blockedUntil: 0 });
