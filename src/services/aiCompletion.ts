import { useSyncExternalStore } from 'react';
import type * as MonacoNS from 'monaco-editor';
import { clearBackoff, newScheduleState, onOutcome, planRequest, type ScheduleState } from './completionSchedule';

// AI kod tamamlama (hayalet metin, GitHub Copilot tarzı): Monaco satır içi öneri sağlayıcısı.
// İmleç çevresi yalnız yerel Ollama'ya gider (electron-ai.cjs → ai:complete). Ayarlar ✦ menüsünden ve Ayarlar sayfasından gelir.
// Monaco çalışma zamanı burada içe aktarılmaz (yalnız tip): örnek EditorArea'dan verilir.
type Monaco = typeof MonacoNS;
export type CompletionState = 'idle' | 'busy' | 'unavailable' | 'off';
export type CompletionReason = 'no-api' | 'no-model' | 'no-ollama' | null;
export type SuggestLength = 'line' | 'block' | 'long';

export interface CompletionConfig {
  enabled: boolean;
  /** auto: yazarken; manual: yalnız Alt+\ ile */
  trigger: 'auto' | 'manual';
  /** Son tuştan sonra beklenecek sessizlik (ms) */
  delay: number;
  /** Bir istek bittikten sonra yenisinin başlaması için en az bekleme (ms) */
  cooldown: number;
  maxTokens: number;
  prefixChars: number;
  suffixChars: number;
  temperature: number;
  count: number;
  length: SuggestLength;
  /** Kapalı dil kimlikleri (küçük harf) */
  offLangs: string[];
}

export const DEFAULT_COMPLETION: CompletionConfig = {
  enabled: true, trigger: 'auto', delay: 450, cooldown: 600, maxTokens: 80, prefixChars: 6000, suffixChars: 2000, temperature: 0.1, count: 1, length: 'block', offLangs: []
};

/** "Çaba" ön ayarları: seçilince gecikme, uzunluk ve bağlam birlikte güncellenir. */
export const EFFORT_PRESETS: Record<'fast' | 'balanced' | 'deep', Pick<CompletionConfig, 'delay' | 'cooldown' | 'maxTokens' | 'prefixChars' | 'suffixChars' | 'temperature' | 'length'>> = {
  fast: { delay: 300, cooldown: 300, maxTokens: 48, prefixChars: 3000, suffixChars: 1000, temperature: 0.05, length: 'block' },
  balanced: { delay: 450, cooldown: 600, maxTokens: 80, prefixChars: 6000, suffixChars: 2000, temperature: 0.1, length: 'block' },
  deep: { delay: 600, cooldown: 900, maxTokens: 160, prefixChars: 10000, suffixChars: 3000, temperature: 0.2, length: 'long' }
};

let monaco: Monaco | null = null;
let registered = false;
let cfg: CompletionConfig = { ...DEFAULT_COMPLETION };
let state: CompletionState = 'idle';
let reason: CompletionReason = null;
let sched: ScheduleState = newScheduleState();
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

const setState = (s: CompletionState, r: CompletionReason = null) => {
  if (state === s && reason === r) return;
  state = s;
  reason = r;
  snapshot = { state, reason };
  emit();
};
let snapshot: { state: CompletionState; reason: CompletionReason } = { state, reason };
export const useCompletionState = () => useSyncExternalStore(subscribe, () => snapshot, () => snapshot).state;
export const useCompletionStatus = () => useSyncExternalStore(subscribe, () => snapshot, () => snapshot);

/** Modeli arka planda belleğe yükler (ilk öneri gecikmesin). Aynı anda tek istek; başarısızsa sessiz kalır. */
let warming = false;
export function warmCompletion() {
  const warm = window.electronAPI?.ai?.completeWarm;
  if (!cfg.enabled || warming || !warm) return;
  warming = true;
  warm().then((r) => { if (r?.success) sched = clearBackoff(sched); if (r?.success && state === 'unavailable') setState('idle'); }).catch(() => {}).finally(() => { warming = false; });
}

export function setCompletionConfig(c: Partial<CompletionConfig>) {
  const wasEnabled = cfg.enabled;
  const next = { ...cfg, ...c };
  next.delay = Math.min(1500, Math.max(200, next.delay || 450));
  next.cooldown = Math.min(5000, Math.max(0, Number.isFinite(next.cooldown) ? next.cooldown : 600));
  cfg = next;
  if (!cfg.enabled) setState('off');
  else if (state === 'off') setState('idle');
  if (cfg.enabled && !wasEnabled) warmCompletion();
}

/** İptal edilebilir bekleme: true = süre doldu, false = iptal edildi (yeni tuş vuruşu). */
const waitOrCancel = (ms: number, token: MonacoNS.CancellationToken) => new Promise<boolean>((resolve) => {
  if (token.isCancellationRequested) return resolve(false);
  if (ms <= 0) return resolve(true);
  let sub: MonacoNS.IDisposable | undefined;
  const timer = setTimeout(() => { sub?.dispose(); resolve(true); }, ms);
  sub = token.onCancellationRequested(() => { clearTimeout(timer); sub?.dispose(); resolve(false); });
});

/** Öneriyi seçilen biçime göre kısaltır: tek satır / blok (ilk boş satıra kadar, 8 satır) / uzun (24 satır). */
export function shapeSuggestion(raw: string, length: SuggestLength, lineRest: string): string {
  let text = raw.replace(/^```[a-z]*\n?|\n?```$/g, '');
  // İmleçten sonra aynı satırda kod varsa yalnız satır sonuna kadar öner (kodun ortasına blok eklemeyelim)
  if (lineRest.trim() || length === 'line') text = text.split('\n')[0];
  else {
    const maxLines = length === 'long' ? 24 : 8;
    const cut: string[] = [];
    for (const ln of text.split('\n')) {
      if (length === 'block' && cut.some((x) => x.trim()) && !ln.trim()) break;
      cut.push(ln);
      if (cut.length >= maxLines) break;
    }
    text = cut.join('\n');
  }
  return text.replace(/\s+$/, '');
}

export function setCompletionMonaco(m: unknown) {
  monaco = m as Monaco;
  if (registered) return;
  registered = true;
  warmCompletion();
  monaco.languages.registerInlineCompletionsProvider('*', {
    async provideInlineCompletions(model, position, ctx, token) {
      const api = window.electronAPI?.ai;
      const empty = { items: [] };
      if (!cfg.enabled || !monaco) return empty;
      // Ana süreç güncellenmemişse (uygulama yeniden başlatılmadı) kanal yoktur: sessiz kalma, nedenini göster
      if (!api?.complete) { setState('unavailable', 'no-api'); return empty; }
      // Yalnız gerçek/adsız dosya modelleri (fark editörü ve diğer iç modeller hariç); düz metinde öneri yok
      const u = model.uri;
      if (!(u.scheme === 'file' || (u.scheme === 'inmemory' && u.authority === 'untitled'))) return empty;
      const lang = model.getLanguageId();
      if (lang === 'plaintext' || cfg.offLangs.includes(lang)) return empty;
      const explicit = ctx.triggerKind === 1; // Alt+\ veya menüden "şimdi öner"
      if (cfg.trigger === 'manual' && !explicit) return empty;
      // Otomatik tetikleme: gecikme (son tuştan sessizlik) + soğuma (önceki istekten bekleme) + hata geri çekilmesi.
      // Her tuşta Monaco eski çağrıyı iptal eder; bekleme iptal olursa yeni çağrı süreyi baştan sayar (debounce).
      if (!explicit) {
        const plan = planRequest(Date.now(), sched, { delay: cfg.delay, cooldown: cfg.cooldown });
        if (plan.skip) return empty;
        if (!(await waitOrCancel(plan.wait, token))) return empty;
      }

      const id = `c${++seq}`;
      const prefix = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
      const last = model.getLineCount();
      const suffix = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: last, endColumn: model.getLineMaxColumn(last) });
      token.onCancellationRequested(() => { void api.completeCancel(id); });
      setState('busy');
      let res: Awaited<ReturnType<typeof api.complete>>;
      try {
        res = await api.complete({
          id, prefix, suffix, fileName: u.scheme === 'file' ? u.fsPath : undefined,
          maxTokens: cfg.maxTokens, temperature: cfg.temperature, prefixChars: cfg.prefixChars, suffixChars: cfg.suffixChars, count: cfg.count
        });
      } catch {
        res = { success: false, error: 'unavailable' };
      }
      // Yazmaya devam edildi, istek boşa gitti: sonraki gecikme kademeli uzar
      if (token.isCancellationRequested || res.error === 'aborted') { sched = onOutcome(sched, 'wasted', Date.now()); if (state === 'busy') setState('idle'); return empty; }
      // Zaman aşımı = model hâlâ yükleniyor olabilir: hata sayma, duraklatma; arka planda ısıt
      if (!res.success && res.error === 'timeout') { sched = onOutcome(sched, 'timeout', Date.now()); setState('idle'); warmCompletion(); return empty; }
      if (!res.success) {
        // Ollama kapalı / model yok: kademeli geri çekilme (3, 10, 30, 60 sn); Alt+\ ile elle denenebilir
        sched = onOutcome(sched, 'fail', Date.now());
        setState('unavailable', res.error === 'http-404' ? 'no-model' : 'no-ollama');
        return empty;
      }
      sched = onOutcome(sched, 'ok', Date.now());
      setState('idle');

      const lineRest = model.getLineContent(position.lineNumber).slice(position.column - 1);
      const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
      const texts = (res.alternatives?.length ? res.alternatives : res.text ? [res.text] : [])
        .map((t) => shapeSuggestion(t, cfg.length, lineRest))
        .filter((t, i, a) => t.trim() && a.indexOf(t) === i);
      return { items: texts.map((insertText) => ({ insertText, range })) };
    },
    freeInlineCompletions() {},
    disposeInlineCompletions() {}
  } as MonacoNS.languages.InlineCompletionsProvider);
}
