import { useSyncExternalStore } from 'react';
import type * as MonacoNS from 'monaco-editor';

// AI kod tamamlama (hayalet metin): Monaco satır içi öneri sağlayıcısı. İmleç çevresi yalnız yerel Ollama'ya gider (electron-ai.cjs → ai:complete).
// Tab kabul eder, Esc reddeder. Monaco çalışma zamanı burada içe aktarılmaz: örnek EditorArea'dan verilir.
type Monaco = typeof MonacoNS;
export type CompletionState = 'idle' | 'busy' | 'unavailable' | 'off';

let monaco: Monaco | null = null;
let registered = false;
let cfg = { enabled: true, delay: 450 };
let state: CompletionState = 'idle';
let failStreak = 0;
let pausedUntil = 0;
let seq = 0;
const listeners = new Set<() => void>();

const setState = (s: CompletionState) => {
  if (state === s) return;
  state = s;
  listeners.forEach((l) => l());
};
export const useCompletionState = () => useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state, () => state);

export function setCompletionConfig(c: { enabled: boolean; delay: number }) {
  cfg = { enabled: c.enabled, delay: Math.min(1500, Math.max(200, c.delay || 450)) };
  if (!cfg.enabled) setState('off');
  else if (state === 'off') setState('idle');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function setCompletionMonaco(m: unknown) {
  monaco = m as Monaco;
  if (registered) return;
  registered = true;
  monaco.languages.registerInlineCompletionsProvider('*', {
    async provideInlineCompletions(model, position, ctx, token) {
      const api = window.electronAPI?.ai;
      const empty = { items: [] };
      if (!api?.complete || !cfg.enabled || !monaco) return empty;
      // Yalnız gerçek/adsız dosya modelleri (fark editörü ve diğer iç modeller hariç); düz metinde öneri yok
      const u = model.uri;
      if (!(u.scheme === 'file' || (u.scheme === 'inmemory' && u.authority === 'untitled'))) return empty;
      if (model.getLanguageId() === 'plaintext') return empty;
      if (ctx.selectedSuggestionInfo) return empty; // klasik öneri listesi açıkken karışma
      if (Date.now() < pausedUntil) return empty;

      await sleep(cfg.delay);
      if (token.isCancellationRequested) return empty;

      const id = `c${++seq}`;
      const prefix = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
      const suffix = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: model.getLineCount(), endColumn: model.getLineMaxColumn(model.getLineCount()) });
      token.onCancellationRequested(() => { void api.completeCancel(id); });
      setState('busy');
      let res: Awaited<ReturnType<typeof api.complete>>;
      try {
        res = await api.complete({ id, prefix, suffix, fileName: u.scheme === 'file' ? u.fsPath : undefined });
      } catch {
        res = { success: false, error: 'unavailable' };
      }
      if (token.isCancellationRequested || res.error === 'aborted') { if (state === 'busy') setState('idle'); return empty; }
      if (!res.success) {
        // Ollama kapalı / model yok: art arda iki başarısızlıktan sonra 60 sn sorma (gürültü ve CPU israfı olmasın)
        failStreak += 1;
        if (failStreak >= 2) pausedUntil = Date.now() + 60000;
        setState('unavailable');
        return empty;
      }
      failStreak = 0;
      setState('idle');

      let text = (res.text ?? '').replace(/^```[a-z]*\n?|\n?```$/g, '');
      // İmleçten sonra aynı satırda kod varsa yalnız satır sonuna kadar öner (kodun ortasına blok eklemeyelim)
      const lineRest = model.getLineContent(position.lineNumber).slice(position.column - 1);
      if (lineRest.trim()) text = text.split('\n')[0];
      // Öneri tek bir blok olsun: ilk boş satırda kes, en çok 8 satır (model sık sık yeni fonksiyonlar uydurur)
      const lines = text.split('\n');
      const cut: string[] = [];
      for (const ln of lines) {
        if (cut.length > 0 && cut.some((x) => x.trim()) && !ln.trim()) break;
        cut.push(ln);
        if (cut.length >= 8) break;
      }
      text = cut.join('\n').replace(/\s+$/, '');
      if (!text.trim()) return empty;
      return { items: [{ insertText: text, range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column) }] };
    },
    freeInlineCompletions() {},
    disposeInlineCompletions() {}
  } as MonacoNS.languages.InlineCompletionsProvider);
}
