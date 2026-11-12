import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { attachPty } from '../services/ptyBus';

// Gerçek terminal görünümü (xterm.js). Gecikmeli yüklenir (ayrı paket parçası); oturumu Terminal.tsx başlatır, burası yalnız çizer ve girdiyi iletir.
// Renkler uygulamanın --ansi-N değişkenlerinden okunur (koyu/açık tema uyumlu); sabit hex yok.
export interface PtyHandle { clear: () => void; focus: () => void }

interface Props {
  id: string;
  cwd: string;
  active: boolean;
  fontSize: number;
  lineHeight: number;
  cursor: 'block' | 'bar' | 'underline';
  scrollback: number;
  onReady?: (id: string, h: PtyHandle | null) => void;
}

const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const themeFromCss = () => {
  const a = (i: number) => cssVar(`--ansi-${i}`);
  return {
    background: cssVar('--color-nv-side'), foreground: cssVar('--color-zinc-300'), cursor: cssVar('--color-zinc-100'), cursorAccent: cssVar('--color-nv-side'),
    selectionBackground: cssVar('--selection'),
    black: a(0), red: a(1), green: a(2), yellow: a(3), blue: a(4), magenta: a(5), cyan: a(6), white: a(7),
    brightBlack: a(8), brightRed: a(9), brightGreen: a(10), brightYellow: a(11), brightBlue: a(12), brightMagenta: a(13), brightCyan: a(14), brightWhite: a(15)
  };
};

// Çıktıdaki dosya yolları (yol:satır:sütun) ve adresler Ctrl+Tık ile açılır
const FILE_RE = /((?:[A-Za-z]:)?[\w.\\/@~-]+\.[A-Za-z0-9]{1,8}):(\d+)(?::(\d+))?/g;
const URL_RE = /https?:\/\/[^\s'")>\]]+/g;

export const PtyView: React.FC<Props> = ({ id, cwd, active, fontSize, lineHeight, cursor, scrollback, onReady }) => {
  const host = useRef<HTMLDivElement>(null);
  const term = useRef<XTerm | null>(null);
  const fit = useRef<FitAddon | null>(null);
  const cwdRef = useRef(cwd);
  cwdRef.current = cwd;

  useEffect(() => {
    const api = window.electronAPI?.pty;
    const el = host.current;
    if (!api || !el) return;
    const x = new XTerm({
      fontFamily: cssVar('--font-mono') || 'Consolas, monospace',
      fontSize, lineHeight, cursorStyle: cursor, cursorBlink: true,
      scrollback: Math.min(Math.max(scrollback, 1000), 50000),
      theme: themeFromCss(), allowProposedApi: true, convertEol: false
    });
    const f = new FitAddon();
    x.loadAddon(f);
    x.open(el);
    term.current = x;
    fit.current = f;
    const doFit = () => { if (el.clientWidth > 20 && el.clientHeight > 20) { try { f.fit(); } catch { /* gizliyken boyut yok */ } } };
    doFit();

    const detach = attachPty(id, (d) => x.write(d));
    const dData = x.onData((d) => { void api.write(id, d); });
    const dResize = x.onResize(({ cols, rows }) => { void api.resize(id, cols, rows); });
    void api.resize(id, x.cols, x.rows);

    // Ctrl+Tık: dosya yolu → editörde aç, adres → tarayıcı/önizleme
    const link = x.registerLinkProvider({
      provideLinks(y, cb) {
        const text = x.buffer.active.getLine(y - 1)?.translateToString(true) ?? '';
        const out: { range: { start: { x: number; y: number }; end: { x: number; y: number } }; text: string; activate: (e: MouseEvent) => void }[] = [];
        for (const m of text.matchAll(URL_RE)) {
          out.push({ range: { start: { x: m.index! + 1, y }, end: { x: m.index! + m[0].length, y } }, text: m[0], activate: (e) => { if (e.ctrlKey || e.metaKey) window.open(m[0]); } });
        }
        for (const m of text.matchAll(FILE_RE)) {
          if (/^https?:/i.test(m[1])) continue;
          out.push({
            range: { start: { x: m.index! + 1, y }, end: { x: m.index! + m[0].length, y } }, text: m[0],
            activate: (e) => { if (e.ctrlKey || e.metaKey) window.dispatchEvent(new CustomEvent('nova:open-file', { detail: { path: m[1], line: Number(m[2]), cwd: cwdRef.current } })); }
          });
        }
        cb(out);
      }
    });

    const ro = new ResizeObserver(doFit);
    ro.observe(el);
    // Tema değişince (data-theme) renkler yeniden okunur
    const mo = new MutationObserver(() => { x.options.theme = themeFromCss(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });

    onReady?.(id, { clear: () => x.clear(), focus: () => x.focus() });
    return () => {
      onReady?.(id, null);
      ro.disconnect(); mo.disconnect(); link.dispose(); dData.dispose(); dResize.dispose(); detach();
      x.dispose();
      term.current = null; fit.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Ayarlar değişince yazı tipi / imleç / satır yüksekliği canlı güncellenir
  useEffect(() => {
    const x = term.current;
    if (!x) return;
    x.options.fontSize = fontSize;
    x.options.lineHeight = lineHeight;
    x.options.cursorStyle = cursor;
    try { fit.current?.fit(); } catch { /* gizli */ }
  }, [fontSize, lineHeight, cursor]);

  // Görünür olunca boyutu yeniden hesapla ve odaklan
  useEffect(() => {
    if (!active) return;
    const tm = window.setTimeout(() => { try { fit.current?.fit(); } catch { /* gizli */ } term.current?.focus(); }, 30);
    return () => window.clearTimeout(tm);
  }, [active]);

  return <div ref={host} className={`${active ? 'absolute inset-0' : 'hidden'} px-2 py-1`} data-pty="" />;
};

export default PtyView;
