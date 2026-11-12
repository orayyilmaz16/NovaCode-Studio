import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Globe, Loader2, Play, RefreshCw, Terminal as TermIcon, Trash2, X } from 'lucide-react';
import { t } from '../i18n/uiText';
import { Markdown } from './Markdown';
import { previewKind } from '../services/previewKind';

// Önizleme: localhost veya sunucu gerekmeden HTML / SVG / Markdown dosyalarını uygulama içinde gösterir.
//  - HTML: yerel CSS, JS, görsel ve yazı tipleri diskten çözülür ve sayfaya gömülür; kaydedilmemiş (editördeki) içerik önceliklidir;
//    yazdıkça ve dosyalar değişince canlı yenilenir. Sayfa sandbox'lı iframe'de çalışır (allow-same-origin YOK: uygulamanın
//    API'lerine erişemez); konsol/hata mesajları ve bağlantı tıklamaları köprüyle buraya taşınır.
//  - CSS/JS: aynı klasördeki index.html önizlenir. SVG: görsel olarak, Markdown: biçimlendirilmiş gösterilir.
//  - Terminalde çalışan bir geliştirme sunucusu (http://localhost:PORT) görününce tek tıkla önizlenir; adres yazmak gerekmez.
interface FileLike {
  name: string;
  path?: string;
  language?: string;
  content?: string;
}

interface PreviewProps {
  file: FileLike | null;
  rootPath: string | null;
  /** Editörde açık dosyaların (kaydedilmemiş dahil) içerikleri: diskteki sürümden önce kullanılır. */
  live: { path?: string; content?: string }[];
  /** Terminal çıktısında yakalanan yerel sunucu adresi. */
  localUrl: string | null;
  onClose: () => void;
  onOpenFile: (path: string) => void;
}

type Line = { level: string; text: string };

// ---------- Yol yardımcıları (Windows/Unix) ----------
const sepOf = (p: string) => (p.includes('\\') ? '\\' : '/');
const dirOf = (p: string) => p.slice(0, Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\')));
function joinPath(base: string, rel: string): string {
  const sep = sepOf(base);
  const parts = base.split(/[\\/]/);
  for (const seg of rel.split(/[\\/]/)) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join(sep);
}
const isExternal = (u: string) => /^(https?:|data:|blob:|\/\/|#|mailto:|tel:|javascript:|about:)/i.test(u.trim());
const stripQuery = (u: string) => u.split('#')[0].split('?')[0];

// ---------- Sayfaya yerleştirilen köprü: konsol, hata ve bağlantı tıklamaları ----------
const BRIDGE = `<script>(function(){var p=function(m){try{parent.postMessage(m,'*')}catch(e){}};
['log','info','warn','error'].forEach(function(l){var o=console[l];console[l]=function(){var a=[].slice.call(arguments).map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ');p({nova:1,t:'console',level:l,text:a});o&&o.apply(console,arguments)}});
addEventListener('error',function(e){p({nova:1,t:'console',level:'error',text:(e.message||'Hata')+(e.lineno?' (satır '+e.lineno+')':'')})});
addEventListener('unhandledrejection',function(e){p({nova:1,t:'console',level:'error',text:'Yakalanmamış söz reddi: '+(e.reason&&e.reason.message||e.reason)})});
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';if(h.charAt(0)==='#'||/^javascript:/i.test(h))return;e.preventDefault();p({nova:1,t:'nav',href:h})},true);
})();<\/script>`;

export const Preview: React.FC<PreviewProps> = ({ file, rootPath, live, localUrl, onClose, onOpenFile }) => {
  const kind = previewKind(file?.name);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [srcDoc, setSrcDoc] = useState('');
  const [building, setBuilding] = useState(false);
  const [problem, setProblem] = useState<'' | 'noindex' | 'fail'>('');
  const [lines, setLines] = useState<Line[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [tick, setTick] = useState(0);
  const [urlMode, setUrlMode] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlBad, setUrlBad] = useState(false);
  const buildSeq = useRef(0);

  // Açık dosyalar → yol → içerik (kaydedilmemiş değişiklikler dahil)
  const liveMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of live) if (f.path && typeof f.content === 'string') m.set(f.path.split('\\').join('/').toLowerCase(), f.content);
    return m;
  }, [live]);
  const liveRef = useRef(liveMap);
  liveRef.current = liveMap;

  // Dosyalar diskte değişince (ör. dışarıda düzenlenen CSS) önizlemeyi yenile
  useEffect(() => {
    const off = window.electronAPI?.onFileChanged?.(() => setTick((n) => n + 1));
    return () => off?.();
  }, []);

  const readText = useCallback(async (p: string): Promise<string | null> => {
    const l = liveRef.current.get(p.split('\\').join('/').toLowerCase());
    if (l !== undefined) return l;
    try { return await window.electronAPI!.readFile(p); } catch { return null; }
  }, []);
  const readUrl = useCallback(async (p: string): Promise<string | null> => {
    const r = await window.electronAPI?.readDataUrl(p);
    return r?.success && r.dataUrl ? r.dataUrl : null;
  }, []);

  // CSS içindeki url(...) başvurularını (görsel/yazı tipi) gömer
  const inlineCssUrls = useCallback(async (css: string, cssDir: string, budget: { n: number }): Promise<string> => {
    const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    const found = [...css.matchAll(re)].filter((m) => !isExternal(m[2]));
    const repl = new Map<string, string>();
    for (const m of found) {
      if (budget.n <= 0 || repl.has(m[2])) continue;
      budget.n--;
      const data = await readUrl(joinPath(cssDir, stripQuery(m[2])));
      if (data) repl.set(m[2], data);
    }
    return css.replace(re, (all, q, u) => (repl.has(u) ? `url(${q}${repl.get(u)}${q})` : all));
  }, [readUrl]);

  // HTML'i derle: yerel varlıkları göm, köprüyü ekle
  const buildHtml = useCallback(async (html: string, htmlPath: string | undefined): Promise<string> => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const budget = { n: 60 };
    const baseDir = htmlPath ? dirOf(htmlPath) : '';
    const resolve = (u: string): string | null => {
      if (!baseDir || isExternal(u)) return null;
      const clean = stripQuery(decodeURI(u));
      if (clean.startsWith('/')) return rootPath ? joinPath(rootPath, clean) : null;
      return joinPath(baseDir, clean);
    };
    if (baseDir) {
      for (const el of Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'))) {
        const p = resolve(el.getAttribute('href') || '');
        if (!p || budget.n <= 0) continue;
        budget.n--;
        const css = await readText(p);
        if (css === null) continue;
        const style = doc.createElement('style');
        style.setAttribute('data-src', el.getAttribute('href') || '');
        style.textContent = await inlineCssUrls(css, dirOf(p), budget);
        el.replaceWith(style);
      }
      for (const el of Array.from(doc.querySelectorAll('script[src]'))) {
        const p = resolve(el.getAttribute('src') || '');
        if (!p || budget.n <= 0) continue;
        budget.n--;
        const js = await readText(p);
        if (js === null) continue;
        const sc = doc.createElement('script');
        const type = el.getAttribute('type');
        if (type) sc.setAttribute('type', type);
        sc.textContent = js.replace(/<\/script/gi, '<\\/script');
        el.replaceWith(sc);
      }
      for (const el of Array.from(doc.querySelectorAll('img[src], source[src], link[rel~="icon"][href]'))) {
        const attr = el.hasAttribute('src') ? 'src' : 'href';
        const p = resolve(el.getAttribute(attr) || '');
        if (!p || budget.n <= 0) continue;
        budget.n--;
        const data = await readUrl(p);
        if (data) el.setAttribute(attr, data);
      }
    }
    const head = doc.head || doc.documentElement.insertBefore(doc.createElement('head'), doc.body);
    head.insertAdjacentHTML('afterbegin', BRIDGE);
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }, [readText, readUrl, inlineCssUrls, rootPath]);

  const fileContent = file?.content ?? '';
  const filePath = file?.path;

  // Önizleme içeriğini üret (yazdıkça gecikmeli; dosya/disk değişince)
  useEffect(() => {
    if (urlMode) return;
    if (kind !== 'html' && kind !== 'webasset') { setSrcDoc(''); setProblem(''); return; }
    const my = ++buildSeq.current;
    const id = window.setTimeout(async () => {
      setBuilding(true);
      try {
        let html = fileContent;
        let htmlPath = filePath;
        if (kind === 'webasset') {
          // CSS/JS: aynı klasördeki index.html önizlenir
          const dir = filePath ? dirOf(filePath) : '';
          const idx = dir ? joinPath(dir, 'index.html') : '';
          const text = idx ? await readText(idx) : null;
          if (text === null) { if (my === buildSeq.current) { setProblem('noindex'); setSrcDoc(''); } return; }
          html = text;
          htmlPath = idx;
        }
        const out = await buildHtml(html, htmlPath);
        if (my === buildSeq.current) { setSrcDoc(out); setProblem(''); }
      } catch {
        if (my === buildSeq.current) setProblem('fail');
      } finally {
        if (my === buildSeq.current) setBuilding(false);
      }
    }, 350);
    return () => window.clearTimeout(id);
  }, [kind, fileContent, filePath, tick, urlMode, buildHtml, readText, liveMap]);

  // Dosya değişince konsolu sıfırla
  useEffect(() => { setLines([]); }, [filePath, kind, urlMode]);

  // iframe → ana pencere mesajları: konsol ve bağlantılar
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow || !e.data || e.data.nova !== 1) return;
      if (e.data.t === 'console') {
        setLines((prev) => [...prev, { level: String(e.data.level), text: String(e.data.text).slice(0, 400) }].slice(-100));
        if (e.data.level === 'error') setShowConsole(true);
      } else if (e.data.t === 'nav') {
        const href = String(e.data.href || '');
        if (/^https?:\/\//i.test(href)) void window.electronAPI?.openLink(href);
        else if (!isExternal(href) && filePath) {
          const clean = stripQuery(decodeURI(href));
          const target = clean.startsWith('/') ? (rootPath ? joinPath(rootPath, clean) : '') : joinPath(kind === 'webasset' ? dirOf(filePath) : dirOf(filePath), clean);
          if (target) onOpenFile(target);
        }
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [filePath, kind, rootPath, onOpenFile]);

  // Yerel sunucu adresi: yalnız döngü adresi (loopback), kimlik bilgisi yok, uygulamanın kendi kökeni değil
  const safeLocalUrl = useCallback((raw: string): string | null => {
    try {
      const u = new URL(raw.trim());
      if (u.protocol !== 'http:' || u.username || u.password) return null;
      if (!['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) return null;
      if (u.origin === window.location.origin) return null;
      return u.toString();
    } catch { return null; }
  }, []);

  const openUrl = (raw: string) => {
    const ok = safeLocalUrl(raw);
    if (!ok) { setUrlBad(true); return; }
    setUrlBad(false);
    setUrlDraft(ok);
    setUrlMode(ok);
  };

  const levelCls = (l: string) => (l === 'error' ? 'text-rose-300' : l === 'warn' ? 'text-amber-300' : 'text-zinc-300');
  const title = urlMode ? urlMode : file?.name ?? t('tbPreview');
  const errors = lines.filter((l) => l.level === 'error').length;
  const btn = 'w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-nv-hover transition-colors';

  return (
    <div className="flex flex-col h-full min-w-0 bg-nv-side text-zinc-300">
      {/* Başlık */}
      <div className="flex items-center gap-1 px-2 h-10 border-b border-nv-border shrink-0">
        <Globe size={14} className="text-sky-400 shrink-0 ml-1" />
        <span className="text-[12.5px] font-medium text-zinc-100 truncate min-w-0 flex-1" title={title}>{title}</span>
        {building && <Loader2 size={13} className="animate-spin text-zinc-500 shrink-0" />}
        {urlMode && <button className={btn} onClick={() => setUrlMode(null)} title={t('pvBackToFile')} aria-label={t('pvBackToFile')}><ArrowLeft size={14} /></button>}
        <button className={btn} onClick={() => { setTick((n) => n + 1); if (urlMode && iframeRef.current) iframeRef.current.src = urlMode; }} title={t('pvRefresh')} aria-label={t('pvRefresh')}><RefreshCw size={14} /></button>
        <button className={`${btn} ${showConsole ? '!text-zinc-100 bg-nv-hover' : ''} relative`} onClick={() => setShowConsole((v) => !v)} title={t('pvConsole')} aria-label={t('pvConsole')}>
          <TermIcon size={14} />
          {errors > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] leading-[14px] text-center">{errors}</span>}
        </button>
        <button className={btn} onClick={onClose} title={t('aiRemove')} aria-label={t('aiRemove')}><X size={15} /></button>
      </div>

      {/* Terminalde çalışan sunucu: tek tıkla önizle (adres yazmadan) */}
      {localUrl && !urlMode && (
        <div className="mx-2 mt-2 px-2.5 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-[11.5px] flex items-center gap-2 min-w-0">
          <Play size={12} className="text-emerald-300 shrink-0" />
          <span className="truncate min-w-0 flex-1">{t('pvLocalServer')}: <span className="font-mono">{localUrl.replace(/^http:\/\//, '')}</span></span>
          <button className="h-6 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap shrink-0" onClick={() => openUrl(localUrl)}>{t('pvOpenServer')}</button>
        </div>
      )}

      {/* Adres çubuğu (yalnız sunucu modunda; yalnız yerel adresler) */}
      {urlMode && (
        <form className="px-2 pt-2" onSubmit={(e) => { e.preventDefault(); openUrl(urlDraft); }}>
          <input
            value={urlDraft}
            onChange={(e) => { setUrlDraft(e.target.value); setUrlBad(false); }}
            spellCheck={false}
            aria-label={t('pvUrlPlaceholder')}
            placeholder="http://localhost:5173"
            className={`w-full h-7 px-2 rounded bg-nv-input border text-[12px] font-mono text-zinc-100 outline-none ${urlBad ? 'border-rose-500' : 'border-zinc-700 focus:border-indigo-500'}`}
          />
          {urlBad && <p className="mt-1 text-[11px] text-rose-300">{t('pvBadUrl')}</p>}
        </form>
      )}

      {/* İçerik */}
      <div className="flex-1 min-h-0 relative mt-2">
        {urlMode ? (
          <iframe ref={iframeRef} key={urlMode} title="preview" src={urlMode} sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups" className="absolute inset-0 w-full h-full bg-white border-0" />
        ) : kind === 'html' || (kind === 'webasset' && !problem) ? (
          <iframe ref={iframeRef} title="preview" srcDoc={srcDoc} sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads" className="absolute inset-0 w-full h-full bg-white border-0" />
        ) : kind === 'svg' ? (
          <div className="absolute inset-0 overflow-auto p-4 flex items-center justify-center bg-[conic-gradient(#2a2a2a_25%,#222_0_50%,#2a2a2a_0_75%,#222_0)] bg-[length:16px_16px]">
            <img alt={file?.name} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(fileContent)}`} className="max-w-full max-h-full" />
          </div>
        ) : kind === 'md' ? (
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-3"><Markdown source={fileContent} /></div>
        ) : (
          <div className="p-4 text-[12.5px] text-zinc-400">{t('pvNoPreview')}</div>
        )}
        {kind === 'webasset' && problem === 'noindex' && !urlMode && (
          <div className="absolute inset-0 p-4 text-[12.5px] text-zinc-400 bg-nv-side">{t('pvNoIndex')}</div>
        )}
        {problem === 'fail' && !urlMode && (
          <div className="absolute inset-x-0 top-0 m-2 p-2 rounded border border-amber-500/40 bg-amber-500/10 text-[11.5px] text-amber-200 flex items-center gap-2"><AlertTriangle size={13} />{t('pvBuildFailed')}</div>
        )}
      </div>

      {/* Konsol */}
      {showConsole && (
        <div className="shrink-0 h-32 border-t border-nv-border flex flex-col bg-nv-editor">
          <div className="flex items-center justify-between h-6 px-2 text-[10.5px] uppercase tracking-wide text-zinc-500 shrink-0">
            <span>{t('pvConsole')}</span>
            <button onClick={() => setLines([])} title={t('pvClear')} aria-label={t('pvClear')} className="hover:text-zinc-200"><Trash2 size={11} /></button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 pb-1 font-mono text-[11px] leading-snug">
            {lines.length === 0 ? <span className="text-zinc-600">—</span> : lines.map((l, i) => <div key={i} className={`${levelCls(l.level)} break-all`}>{l.text}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};
