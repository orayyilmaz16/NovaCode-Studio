import { useCallback, useEffect, useRef, useState } from 'react';

// Sesli dikte: mikrofon kaydı → ana süreç → bu bilgisayardaki whisper.cpp sunucusu (sabit adres/model; ses cihazdan çıkmaz, açık rıza arayüzde alınır).
// Ses diske yazılmaz; kayıt bitince bellekten gönderilir ve atılır. En fazla 120 sn.
export type DictationState = 'idle' | 'recording' | 'transcribing';

export function useDictation(opts: { lang: string; onText: (text: string) => void; onError: (code: string) => void }) {
  const [state, setState] = useState<DictationState>('idle');
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const cleanup = useCallback(() => {
    clearTimeout(timer.current);
    rec.current?.stream.getTracks().forEach((t) => t.stop());
    rec.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!window.electronAPI?.ai || rec.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.onstop = async () => {
        const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
        chunks.current = [];
        cleanup();
        if (blob.size < 1000) { setState('idle'); return; }
        setState('transcribing');
        try {
          const o = optsRef.current;
          const res = await window.electronAPI!.ai.transcribe({
            audio: await blob.arrayBuffer(),
            mime: blob.type,
            lang: o.lang === 'auto' ? undefined : o.lang
          });
          if (res.success && res.text) o.onText(res.text.trim());
          else if (!res.success) o.onError(res.error || 'failed');
        } catch {
          optsRef.current.onError('failed');
        }
        setState('idle');
      };
      rec.current = r;
      r.start();
      setState('recording');
      timer.current = setTimeout(stop, 120000);
    } catch {
      cleanup();
      setState('idle');
      optsRef.current.onError('mic');
    }
  }, [cleanup, stop]);

  return { state, start, stop };
}
