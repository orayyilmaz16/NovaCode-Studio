import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { bindProblemDecorations, setProblemsMonaco, useFileProblems } from '../services/problems';
import { FileTypeIcon } from './FileTypeIcon';
import { bindDebugEditor } from '../services/debugEditor';
import { bindLsp, setLspMonaco } from '../services/lspClient';
import { setActiveEditor, releaseActiveEditor, addFlushHandler } from '../services/editorBridge';
import { getBindings, formatCombo } from '../services/keybindings';
import type { GroupId } from '../services/splitLayout';
import { setCursor } from '../services/cursorStore';
import { setCompletionConfig, setCompletionMonaco } from '../services/aiCompletion';
import { setMonacoForExtensions, useActiveEditorTheme } from '../services/extensionsService';
import { diffLines } from '../services/lineDiff';
import { TriangleAlert, X, Play, Copy, Check, Download, FileCode, Save, Users, FolderOpen, FilePlus, ChevronRight, Columns, GitCompare, Rows2, ExternalLink, SquareSplitHorizontal, Ellipsis } from 'lucide-react';
import { PopupMenu, type MenuItem } from './Menu';
import { Logo } from './Logo';
import { useHoverTip } from './HoverTip';
import { defineNovaThemes } from '../services/editorTheme';
import { useSettings } from '../services/SettingsContext';
import { toMonacoOptions, toMonacoOptionsForFile } from '../services/settings';
import type { FileItem } from '../types';
import { t } from '../i18n/uiText';

export interface CollabConfig {
  enabled: boolean;
  url: string;      // wss:// veya yerel ws://
  token: string;    // sunucu NOVA_SYNC_TOKEN değeri
  room: string;     // rastgele oda kimliği (yerel yol değil, bkz. services/collabRoom.ts)
  root: string;     // kök klasör yolu: yalnız göreli yolu hesaplamak için, sunucuya gitmez
}

interface EditorAreaProps {
  openFiles: FileItem[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onChangeContent: (id: string, content: string) => void;
  onSaveFile?: (file: FileItem) => void;
  onRunCode: () => void;
  /** Aktif dosya HTML/web ise önizleme düğmesi görünür. */
  canPreview?: boolean;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  onNewFile?: () => void;
  onOpenFolder?: () => void;
  onOpenFiles?: () => void;
  /** Açık çalışma alanı kökü: yol göstergesi köke göre gösterilir. */
  rootPath?: string | null;
  rootName?: string;
  collab?: CollabConfig;
  /** Fark sekmesinden gerçek dosyayı aç. */
  onOpenPath?: (path: string) => void;
  /** Sekme ilk değişiklikte hemen "kaydedilmemiş" olur (içerik debounce'la gelir). */
  onDirty?: (id: string) => void;
  /** Yeni model kurulurken kullanılacak metin (taslak/diskten); modeli olan sekmede kullanılmaz. */
  getInitialContent?: (f: FileItem) => string;
  onReloadDisk?: (id: string) => void;
  onKeepMine?: (id: string) => void;
  /** Bölünmüş editör (F-03): bu bileşen bir grubu çizer. Varsayılan: tek grup. */
  groupId?: GroupId;
  /** İki grup açık mı (sekme sürüklemede hedef, kapat düğmesi). */
  split?: boolean;
  /** Bu grup odakta mı: yalnız odaktaki grup imleç durumu ve etkin düzenleyici köprüsünü yazar. */
  focused?: boolean;
  /** Modeli korunacak tüm açık dosyalar (grup yalnız kendi sekmelerini gösterir ama öteki grubun modeli silinmemeli). */
  poolFiles?: FileItem[];
  onFocusGroup?: (g: GroupId) => void;
  /** Sekme bırakıldı: kaynak grup, hedef grup ya da yeni bölme yönü. */
  onDropTab?: (id: string, from: GroupId, to: GroupId | 'new-right' | 'new-down') => void;
  onSplitRight?: () => void;
  onCloseSplit?: () => void;
}

const TAB_MIME = 'application/x-nova-tab';

// Aynı Monaco modelini iki düzenleyici (grup) gösterebilir; dil sunucusu belgesi model başına bir kez açılır.
const lspShared = new Map<string, { n: number; off: () => void }>();
function bindLspShared(ed: any, path: string, enabled: boolean): () => void {
  const m = ed?.getModel?.();
  if (!m || !enabled) return bindLsp(ed, path, enabled);
  let e = lspShared.get(m.id);
  if (!e) { e = { n: 0, off: bindLsp(ed, path, enabled) }; lspShared.set(m.id, e); }
  e.n++;
  const entry = e;
  return () => {
    entry.n--;
    if (entry.n <= 0) { entry.off(); if (lspShared.get(m.id) === entry) lspShared.delete(m.id); }
  };
}

/** Sekme: kendi tanı sayısına abone olur; yalnız kendi dosyası değişince çizilir (P-23). */
const EditorTab = React.memo(function EditorTab({ file, isActive, onSelect, onClose, group }: { file: FileItem; isActive: boolean; onSelect: (id: string) => void; onClose: (id: string) => void; group: GroupId }) {
  const pc = useFileProblems(file.path);
  const nameTone = file.missing ? 'text-zinc-500 line-through' : pc?.e ? 'text-rose-400' : pc?.w ? 'text-amber-300' : '';
  // Yerel title kutusu yerine temaya uyumlu, gecikmeli ipucu: dosya adı + klasör yolu
  const full = file.path || file.name;
  const cut = Math.max(full.lastIndexOf('/'), full.lastIndexOf('\\'));
  const dir = cut > 0 ? full.slice(0, cut) : '';
  const tip = useHoverTip(() => (
    <>
      <div className="font-medium text-zinc-100">{file.name}{file.missing ? ` — ${t('appTabMissing')}` : ''}</div>
      {dir && <div className="mt-0.5 font-mono text-[10.5px] text-zinc-500 break-all">{dir}</div>}
    </>
  ));
  return (
    <>
    <div
      {...tip.props}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(TAB_MIME, JSON.stringify({ id: file.id, from: group }));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onSelect(file.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(file.id);
        }
      }}
      onAuxClick={(e) => {
        if (e.button === 1) onClose(file.id);
      }}
      className={`nova-tab animate-tab-in group relative flex items-center gap-2 pl-3 pr-2 h-full min-w-[96px] max-w-[200px] shrink-0 cursor-pointer border border-b-0 text-[13px] ${
        isActive
          ? 'bg-nv-editor text-zinc-100 border-transparent'
          : 'border-transparent bg-zinc-50/4 text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
      }`}
    >
      {file.diff ? <GitCompare size={14} className="shrink-0 text-indigo-400" /> : <FileTypeIcon name={file.name} size={14} />}
      <span className={`truncate ${nameTone}`} title={pc ? `${pc.e} ✕ · ${pc.w} ⚠` : undefined}>{file.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(file.id);
        }}
        aria-label={`${file.name} — ${t('closeTab')}`}
        title={t('closeTab')}
        className="nova-tab-close ml-auto relative flex items-center justify-center size-5 text-zinc-400 hover:bg-[var(--hover-overlay)] hover:text-zinc-100"
      >
        {file.isModified && (
          <span className="absolute size-2 rounded-full bg-zinc-200 transition-opacity group-hover:opacity-0" />
        )}
        <X
          size={14}
          className={`transition-opacity ${file.isModified ? 'opacity-0 group-hover:opacity-100' : isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </button>
    </div>
    {tip.node}
    </>
  );
});

/**
 * Monaco DiffEditor sarmalayıcı: @monaco-editor/react 4.7, yeni Monaco'da kapanırken modeli editörden önce yok edip
 * "TextModel got disposed before DiffEditorWidget model got reset" hatası verir. Modelleri biz sıfırlayıp yok ederiz.
 */
const SafeDiff: React.FC<{ theme: string; beforeMount: (m: any) => void; language: string; original: string; modified: string; options: object }> = ({ theme, beforeMount, language, original, modified, options }) => {
  const ed = useRef<any>(null);
  useEffect(() => () => {
    const e = ed.current;
    ed.current = null;
    try {
      const m = e?.getModel?.();
      e?.setModel?.(null);
      m?.original?.dispose();
      m?.modified?.dispose();
    } catch { /* editör zaten kapanmış */ }
  }, []);
  return (
    <DiffEditor
      height="100%"
      theme={theme}
      beforeMount={beforeMount}
      language={language}
      original={original}
      modified={modified}
      keepCurrentOriginalModel
      keepCurrentModifiedModel
      onMount={(e) => { ed.current = e; }}
      options={options as never}
    />
  );
};

/** Editör modelinin kimliği (Monaco Uri dizgesi): gerçek dosya file://, adsız dosya inmemory://untitled. */
function fileModelPath(f: { id: string; path?: string }): string {
  if (!f.path) return `inmemory://untitled/${encodeURIComponent(f.id)}`;
  const p = f.path.split('\\').join('/').replace(/^\//, '');
  return 'file:///' + encodeURI(p).replace(/[?#]/g, encodeURIComponent);
}

const EditorAreaImpl: React.FC<EditorAreaProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onSaveFile,
  onRunCode,
  canPreview,
  previewOpen,
  onTogglePreview,
  onNewFile,
  onOpenFolder,
  onOpenFiles,
  rootPath,
  rootName,
  collab,
  onOpenPath,
  onDirty,
  getInitialContent,
  onReloadDisk,
  onKeepMine,
  groupId = 'a',
  split = false,
  focused = true,
  poolFiles,
  onFocusGroup,
  onDropTab,
  onSplitRight,
  onCloseSplit,
}) => {
  // Ayarlar: yazı tipi, tema, imleç... değiştiği an editöre yansır (gerçek zamanlı)
  const { values } = useSettings();
  const theme = useActiveEditorTheme();
  const editorOptions = useMemo(
    () => ({
      ...toMonacoOptions(values),
      // Copilot tarzı satır içi öneri: önizleme araç çubuğu (kabul / kelime / satır / sonraki), klasik öneri listesiyle birlikte çalışır
      inlineSuggest: { enabled: values.aiCompletion !== false, showToolbar: (values.aiCompletionToolbar === false ? 'onHover' : 'always') as 'onHover' | 'always', suppressSuggestions: false }
    }),
    [values]
  );
  const [copied, setCopied] = React.useState(false);
  const [more, setMore] = React.useState<{ x: number; y: number } | null>(null); // dar editörde ikincil eylemler "⋯" menüsünde
  const [savedEffect, setSavedEffect] = React.useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [diffInline, setDiffInline] = useState(false);
  const monacoRef = useRef<any>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  // Etkin sekme çubuğun dışında kalırsa yumuşakça görünür alana kaydır
  useEffect(() => {
    const list = tabListRef.current;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !tab) return;
    if (getComputedStyle(list).direction === 'rtl') { tab.scrollIntoView({ inline: 'nearest', block: 'nearest' }); return; }
    // Sekme giriş animasyonu (ölçek) ölçümü bozmasın diye offset ölçüleri kullanılır; kenarlarda yuvarlak köşeler/bağlantı için pay bırakılır
    const pad = 12;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left - pad < list.scrollLeft) list.scrollTo({ left: Math.max(0, left - pad), behavior: 'smooth' });
    else if (right + pad > list.scrollLeft + list.clientWidth) list.scrollTo({ left: right + pad - list.clientWidth, behavior: 'smooth' });
  }, [activeFileId, openFiles.length]);
  const [collabStatus, setCollabStatus] = useState<'off' | 'connecting' | 'synced' | 'error'>('off');
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // Açık her dosyanın modeli sekme değiştirince yaşar (Sorunlar sayacı tüm açık dosyaları görsün, geri al geçmişi korunsun);
  // kapanan sekmenin modeli burada serbest bırakılır.
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    const want = new Set((poolFiles ?? openFiles).filter((f) => !f.diff).map((f) => m.Uri.parse(fileModelPath(f)).toString()));
    for (const model of m.editor.getModels()) {
      const u = model.uri;
      if ((u.scheme === 'file' || (u.scheme === 'inmemory' && u.authority === 'untitled')) && !want.has(u.toString())) model.dispose();
    }
  }, [openFiles, poolFiles]);

  // Model tabanlı düzenleme (P-06/P-07): içerik her tuşta React durumuna yazılmaz; değişiklik 250 ms sonra toplu aktarılır,
  // "kaydedilmemiş" işareti ise ilk tuşta hemen konur. Kayıt/kapatma öncesi flush ile bekleyen değişiklik hemen aktarılır.
  const cb = useRef({ onChangeContent, onDirty });
  cb.current = { onChangeContent, onDirty };
  const activeIdRef = useRef<string | undefined>(undefined);
  activeIdRef.current = activeFile?.id;
  const suppressRef = useRef(false);
  const flushRef = useRef<() => void>(() => {});
  useEffect(() => {
    const off = addFlushHandler(() => flushRef.current());
    return () => { flushRef.current(); off(); };
  }, []);
  // Odak: yalnız odaktaki grup imleç durumunu ve etkin düzenleyici köprüsünü (komut paleti, AI) yazar
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const reportRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!focused || !editorInstance) return;
    setActiveEditor(editorInstance);
    reportRef.current();
  }, [focused, editorInstance]);
  // Sekme sürükleme: bırakma bölgesi (tek grupta sağ/alt kenar = yeni bölme, iki grupta öteki grubun tamamı)
  const [dropZone, setDropZone] = useState<null | 'self' | 'right' | 'down'>(null);
  const zoneOf = (e: React.DragEvent<HTMLElement>): 'self' | 'right' | 'down' | null => {
    if (!e.dataTransfer.types.includes(TAB_MIME)) return null;
    if (split) return 'self';
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / Math.max(1, r.width);
    const y = (e.clientY - r.top) / Math.max(1, r.height);
    return x > 0.65 ? 'right' : y > 0.7 ? 'down' : null;
  };

  // Dışarıdan (diskten, kayıt dönüşümünden) gelen içerik: kaydedilmemiş düzenleme yoksa modele yansıt
  useEffect(() => {
    const ed = editorInstance;
    const mon = monacoRef.current;
    const m = ed?.getModel?.();
    if (!ed || !m || !mon || !activeFile || activeFile.diff || activeFile.isModified || activeFile.content === undefined) return;
    if (m.uri.toString() !== mon.Uri.parse(fileModelPath(activeFile)).toString()) return;
    if (m.getValue() === activeFile.content) return;
    suppressRef.current = true;
    try {
      m.pushEditOperations([], [{ range: m.getFullModelRange(), text: activeFile.content }], () => null);
    } finally {
      suppressRef.current = false;
    }
  }, [editorInstance, activeFile?.id, activeFile?.content, activeFile?.isModified]);

  // Git satır işaretleri (VS Code gibi): HEAD'deki sürüme göre eklenen (yeşil), değişen (mavi) ve silinen (kırmızı) satırlar.
  // Metin değişince kısa gecikmeyle yeniden hesaplanır; git yoksa, dosya depoda değilse ya da büyük/ikili ise işaret çizilmez.
  const gdRef = useRef<{ ed: any; coll: any; ids?: string[] } | null>(null);
  useEffect(() => {
    const ed = editorInstance;
    const api = window.electronAPI?.gitDiffFile;
    const fp = activeFile?.path;
    const clear = () => { gdRef.current?.coll?.clear?.(); };
    if (!ed || !activeFile || activeFile.diff || !fp || !rootPath || !api) { clear(); return; }
    const np = fp.split('\\').join('/');
    const nr = rootPath.split('\\').join('/').replace(/\/+$/, '');
    if (!nr || !np.toLowerCase().startsWith(nr.toLowerCase() + '/')) { clear(); return; }
    const rel = np.slice(nr.length + 1);
    const text = activeFile.content ?? '';
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void api(rootPath, { path: rel, staged: true }).then((r) => {
        if (cancelled) return;
        if (!r?.success || r.tooLarge || r.binary || (text.length > 2_000_000)) { clear(); return; }
        const d = diffLines(r.original ?? '', text);
        const decos: any[] = [];
        for (const l of d.added) decos.push({ range: { startLineNumber: l, endLineNumber: l, startColumn: 1, endColumn: 1 }, options: { linesDecorationsClassName: 'nova-gd-mod', overviewRuler: { color: '#58a6ff', position: 4 } } });
        for (const l of d.modified) decos.push({ range: { startLineNumber: l, endLineNumber: l, startColumn: 1, endColumn: 1 }, options: { linesDecorationsClassName: 'nova-gd-mod', overviewRuler: { color: '#58a6ff', position: 4 } } });
        for (const l of d.deletedAt) decos.push({ range: { startLineNumber: l, endLineNumber: l, startColumn: 1, endColumn: 1 }, options: { linesDecorationsClassName: 'nova-gd-del', overviewRuler: { color: '#58a6ff', position: 4 } } });
        if (!gdRef.current || gdRef.current.ed !== ed) {
          gdRef.current = { ed, coll: ed.createDecorationsCollection ? ed.createDecorationsCollection() : null };
        }
        const coll = gdRef.current.coll;
        if (coll) coll.set(decos);
        else gdRef.current.ids = ed.deltaDecorations(gdRef.current.ids ?? [], decos);
      }).catch(() => clear());
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorInstance, activeFile?.id, activeFile?.content, activeFile?.path, rootPath]);

  // Büyük dosyada (>2 MB / >20k satır) minimap/katlama/parantez renklendirme kapanır (P-25)
  useEffect(() => {
    const ed = editorInstance;
    const m = ed?.getModel?.();
    if (!ed || !m || !activeFile || activeFile.diff) return;
    ed.updateOptions({ ...toMonacoOptionsForFile(values, { chars: m.getValueLength(), lines: m.getLineCount() }), inlineSuggest: (editorOptions as { inlineSuggest: unknown }).inlineSuggest });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorInstance, activeFile?.id, editorOptions]);

  // AI kod tamamlama ayarları (açık/kapalı, gecikme) anında yansır
  useEffect(() => {
    const num = (v: unknown, d: number) => (Number.isFinite(Number(v)) && v !== '' && v !== undefined ? Number(v) : d);
    const len = String(values.aiCompletionLength);
    setCompletionConfig({
      enabled: values.aiCompletion !== false,
      trigger: values.aiCompletionTrigger === 'manual' ? 'manual' : 'auto',
      delay: num(values.aiCompletionDelay, 100),
      cooldown: num(values.aiCompletionCooldown, 100),
      model: String(values.aiCompletionModel || 'qwen2.5-coder:7b'),
      maxTokens: num(values.aiCompletionMaxTokens, 32),
      prefixChars: num(values.aiCompletionPrefix, 2000),
      suffixChars: num(values.aiCompletionSuffix, 600),
      temperature: num(values.aiCompletionTemperature, 0.05),
      count: num(values.aiCompletionCount, 1),
      length: len === 'line' || len === 'long' ? len : 'block'
    });
  }, [values.aiCompletion, values.aiCompletionTrigger, values.aiCompletionDelay, values.aiCompletionCooldown, values.aiCompletionModel, values.aiCompletionMaxTokens, values.aiCompletionPrefix, values.aiCompletionSuffix, values.aiCompletionTemperature, values.aiCompletionCount, values.aiCompletionLength]);

  // Hatalı satırlar kırmızı, uyarılı satırlar sarı çizgiyle işaretlenir
  useEffect(() => {
    if (!editorInstance || !activeFile || activeFile.diff) return;
    try { return bindProblemDecorations(editorInstance); } catch { return; }
  }, [editorInstance, activeFile?.id, activeFile?.diff]);

  // Hata ayıklama: gutter'da kesme noktası (tıkla / F9) ve durulan satır vurgusu
  useEffect(() => {
    if (!editorInstance || !activeFile?.path) return;
    return bindDebugEditor(editorInstance, activeFile.path);
  }, [editorInstance, activeFile?.path]);

  // Dil sunucusu (LSP): Python, Rust, Go, C/C++ vb. için tanılama, tamamlama, üzerine gelme, tanıma git
  useEffect(() => {
    if (!editorInstance || !activeFile?.path) return;
    return bindLspShared(editorInstance, activeFile.path, values.lspEnabled !== false);
  }, [editorInstance, activeFile?.path, values.lspEnabled]);

  // Ortak düzenleme: aktif dosya için bir Yjs odası aç ve Monaco modeline bağla.
  // Odalar dosya bazlıdır: <proje>/<dosya-yolu>. Sunucu kapalıysa editör yerel çalışmaya devam eder.
  const collabOn = !!collab?.enabled && !!collab.url && !!collab.room && !!activeFile?.path && !!editorInstance;
  const activeId = activeFile?.id;
  const activePath = activeFile?.path;
  const activeContent = activeFile?.content;
  useEffect(() => {
    if (!collabOn || !collab || !activePath || !editorInstance) {
      setCollabStatus('off');
      return;
    }
    const model = editorInstance.getModel();
    if (!model) return;

    // Ortak düzenleme kütüphaneleri yalnız bu özellik açıkken yüklenir (paket boyutu bütçesi için)
    let disposed = false;
    let cleanup = () => {};
    setCollabStatus('connecting');
    void (async () => {
      const [Y, { WebsocketProvider }, { MonacoBinding }, room] = await Promise.all([import('yjs'), import('y-websocket'), import('y-monaco'), import('../services/collabRoom')]);
      // KVKK: oda adı mutlak yol içermez; token URL yerine WebSocket alt protokolüyle gider
      const roomName = await room.collabFileRoom(collab.room, collab.root, activePath);
      if (disposed) return;
      const doc = new Y.Doc();
      const provider = new WebsocketProvider(collab.url, roomName, doc, {
        protocols: room.collabProtocols(collab.token),
        connect: true
      });
      const ytext = doc.getText('monaco');
      const binding = new MonacoBinding(ytext, model, new Set([editorInstance]), provider.awareness);

      const onStatus = ({ status }: { status: string }) => setCollabStatus(status === 'connected' ? 'synced' : 'connecting');
      const onSync = (synced: boolean) => {
        if (synced) {
          // Oda boşsa (ilk bağlanan) yerel içeriği tohumla; doluysa sunucudaki içerik kullanılır.
          if (ytext.length === 0 && activeContent) ytext.insert(0, activeContent);
          setCollabStatus('synced');
        }
      };
      provider.on('status', onStatus);
      provider.on('sync', onSync);
      const onConnErr = () => setCollabStatus('error');
      provider.on('connection-error', onConnErr);

      cleanup = () => {
        provider.off('status', onStatus);
        provider.off('sync', onSync);
        provider.off('connection-error', onConnErr);
        binding.destroy();
        provider.destroy();
        doc.destroy();
      };
    })().catch(() => setCollabStatus('error'));

    return () => {
      disposed = true;
      cleanup();
    };
    // activeContent bilerek bağımlılıkta değil: her tuş vuruşunda odayı yeniden kurmamak için.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collabOn, collab?.url, collab?.token, collab?.room, activeId, activePath, editorInstance]);

  const liveText = () => {
    const m = editorInstance?.getModel?.();
    return m && activeFile && !activeFile.diff ? (m.getValue() as string) : activeFile?.content;
  };
  const handleCopy = () => {
    const text = liveText();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([liveText() || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (activeFile && onSaveFile) {
      onSaveFile(activeFile);
      setSavedEffect(true);
      setTimeout(() => setSavedEffect(false), 1500);
    }
  };

  const crumbs = (() => {
    if (!activeFile) return [] as string[];
    const fp = activeFile.path ?? activeFile.diff?.filePath;
    if (!fp) return [activeFile.name];
    const np = fp.split('\\').join('/');
    const nr = (rootPath ?? '').split('\\').join('/').replace(/\/+$/, '');
    if (nr && np.toLowerCase().startsWith(nr.toLowerCase() + '/')) {
      return [rootName || nr.split('/').pop() || '', ...np.slice(nr.length + 1).split('/')].filter(Boolean);
    }
    return np.split('/').filter(Boolean).slice(-4);
  })();

  return (
    <div
      className="@container relative flex flex-col flex-1 h-full min-w-0 min-h-0 bg-nv-editor overflow-hidden"
      data-editor-group={groupId}
      onMouseDownCapture={split ? () => onFocusGroup?.(groupId) : undefined}
      onDragOverCapture={onDropTab ? (e) => {
        const z = zoneOf(e);
        if (!z) { if (dropZone) setDropZone(null); return; }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (z !== dropZone) setDropZone(z);
      } : undefined}
      onDragLeaveCapture={onDropTab ? (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropZone(null); } : undefined}
      onDropCapture={onDropTab ? (e) => {
        const z = zoneOf(e);
        setDropZone(null);
        if (!z) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          const d = JSON.parse(e.dataTransfer.getData(TAB_MIME)) as { id?: unknown; from?: unknown };
          if (typeof d.id !== 'string' || (d.from !== 'a' && d.from !== 'b')) return;
          if (z === 'self') { if (d.from !== groupId) onDropTab(d.id, d.from, groupId); }
          else onDropTab(d.id, d.from, z === 'right' ? 'new-right' : 'new-down');
        } catch { /* geçersiz sürükleme verisi */ }
      } : undefined}
    >
      {dropZone && (
        <div
          aria-hidden
          className={`pointer-events-none absolute z-20 border border-indigo-500/60 bg-indigo-500/10 ${dropZone === 'self' ? 'inset-0' : dropZone === 'right' ? 'top-0 bottom-0 right-0 w-[35%]' : 'left-0 right-0 bottom-0 h-[30%]'}`}
        />
      )}
      {/* Sekme çubuğu: açık sekme yokken hiç görünmez */}
      {openFiles.length > 0 && (
      <div className="animate-tabbar-in relative shrink-0 flex items-stretch justify-between bg-nv-side h-[38px] select-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-nv-border">
        <div ref={tabListRef} role="tablist" className="relative z-10 flex items-end gap-0.5 flex-1 min-w-[96px] overflow-x-auto pt-1.5 pe-1.5 scroll-px-2 [scrollbar-width:none] scroll-smooth">
          {openFiles.map((file) => (
            <EditorTab key={file.id} file={file} isActive={file.id === activeFileId} onSelect={onSelectTab} onClose={onCloseTab} group={groupId} />
          ))}
          <span aria-hidden className="shrink-0 w-2" /> {/* kaydırma kabında son sekmenin sağ yuvarlaması kırpılmasın */}
        </div>

        {/* Bölme düğmeleri */}
        {activeFile && (onSplitRight || (split && onCloseSplit)) && (
          <div className="hidden @md:flex items-center gap-0.5 pl-2 shrink-0">
            {onSplitRight && (
              <button onClick={onSplitRight} title={`${t('cmdSplitRight')}${getBindings().splitRight ? ` (${formatCombo(getBindings().splitRight)})` : ''}`} aria-label={t('cmdSplitRight')} className="icon-btn">
                <SquareSplitHorizontal size={15} />
              </button>
            )}
            {split && onCloseSplit && (
              <button onClick={onCloseSplit} title={t('cmdCloseSplit')} aria-label={t('cmdCloseSplit')} className="icon-btn">
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Eylem düğmeleri */}
        {activeFile && !activeFile.diff && (
          <div className="flex items-center gap-0.5 pl-2 @md:pl-3 pr-2 shrink-0">
            {collab?.enabled && (
              <span
                title={t('edCollabTitle')}
                className={`hidden @md:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded mr-1 ${
                  collabStatus === 'synced'
                    ? 'text-emerald-300 bg-emerald-500/10'
                    : collabStatus === 'error'
                      ? 'text-rose-300 bg-rose-500/10'
                      : 'text-zinc-400 bg-zinc-800'
                }`}
              >
                <Users size={11} />
                <span className="hidden @lg:inline whitespace-nowrap">{collabStatus === 'synced' ? t('edCollabOn') : collabStatus === 'error' ? t('edCollabErr') : collabStatus === 'connecting' ? t('edCollabConnecting') : t('edCollabOff')}</span>
              </span>
            )}
            {onSaveFile && (
              <button onClick={handleSave} title={`${t('cmdSave')} (Ctrl+S)`} aria-label={t('cmdSave')} className="icon-btn hidden @md:flex">
                {savedEffect ? <Check size={15} className="text-emerald-400" /> : <Save size={15} />}
              </button>
            )}
            <button onClick={handleCopy} title={t('mnCopy')} aria-label={t('mnCopy')} className="icon-btn hidden @md:flex">
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>
            <button onClick={handleDownload} title={t('edDownload')} aria-label={t('edDownload')} className="icon-btn hidden @md:flex">
              <Download size={15} />
            </button>
            {canPreview && onTogglePreview && (
              <button
                onClick={onTogglePreview}
                title={t('tbPreview')}
                aria-label={t('tbPreview')}
                aria-pressed={previewOpen}
                data-active={previewOpen}
                className="icon-btn hidden @md:flex"
              >
                <Columns size={15} />
              </button>
            )}
            <button
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMore({ x: r.right - 200, y: r.bottom + 4 }); }}
              title={t('edMore')}
              aria-label={t('edMore')}
              aria-haspopup="menu"
              className="icon-btn @md:hidden"
            >
              <Ellipsis size={15} />
            </button>
            <button
              onClick={onRunCode}
              title={t('edRunPreview')}
              aria-label={t('edRunPreview')}
              className="ml-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-2 @md:px-2.5 h-6 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              <Play size={11} className="fill-white" />
              <span className="hidden @md:inline">{t('mnRun')}</span>
            </button>
          </div>
        )}
      </div>
      )}

      {more && (() => {
        const items: MenuItem[] = [];
        if (onSaveFile) items.push({ label: t('cmdSave'), icon: <Save size={14} />, shortcut: 'Ctrl+S', onClick: handleSave });
        items.push({ label: t('mnCopy'), icon: <Copy size={14} />, onClick: handleCopy });
        items.push({ label: t('edDownload'), icon: <Download size={14} />, onClick: handleDownload });
        if (canPreview && onTogglePreview) items.push({ label: t('tbPreview'), icon: <Columns size={14} />, checked: !!previewOpen, onClick: onTogglePreview });
        if (onSplitRight) items.push({ separator: true }, { label: t('cmdSplitRight'), icon: <SquareSplitHorizontal size={14} />, onClick: onSplitRight });
        if (split && onCloseSplit) items.push({ label: t('cmdCloseSplit'), icon: <X size={14} />, onClick: onCloseSplit });
        return <PopupMenu x={more.x} y={more.y} items={items} onClose={() => setMore(null)} />;
      })()}

      {/* Yol göstergesi */}
      {activeFile && !activeFile.diff && values.showBreadcrumbs !== false && (
        <div className="flex items-center gap-1 h-[22px] shrink-0 px-3 text-[12px] text-zinc-500 bg-nv-editor select-none overflow-hidden whitespace-nowrap" aria-label={t('appBreadcrumbs')}>
          {crumbs.map((c, i) => (
            <React.Fragment key={crumbs.slice(0, i + 1).join('/')}>
              {i > 0 && <ChevronRight size={12} className="shrink-0 text-zinc-600" />}
              <span className={i === crumbs.length - 1 ? 'text-zinc-300' : ''}>{c}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Dosya diskte silindi / değişti uyarısı (B-05) */}
      {activeFile && !activeFile.diff && (activeFile.missing || activeFile.externalChange) && (
        <div role="alert" className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-nv-border bg-nv-side text-[12px] text-amber-300">
          <TriangleAlert size={13} className="shrink-0" />
          <span className="flex-1 min-w-0">{activeFile.missing ? t('appMissingOnDisk') : t('appChangedOnDisk')}</span>
          {activeFile.externalChange && !activeFile.missing && onReloadDisk && <button className="btn-ghost h-6!" onClick={() => onReloadDisk(activeFile.id)}>{t('appReloadDisk')}</button>}
          {activeFile.externalChange && !activeFile.missing && onKeepMine && <button className="btn-ghost h-6!" onClick={() => onKeepMine(activeFile.id)}>{t('appKeepMine')}</button>}
          {onSaveFile && <button className="btn-ghost h-6!" onClick={() => onSaveFile(activeFile)}>{t('cmdSave')}</button>}
        </div>
      )}

      {/* Editör (kod her zaman soldan sağa: RTL arayüzde de dir=ltr, I-01) */}
      <div className="flex-1 min-h-0 w-full h-full relative" dir="ltr">
        {activeFile?.diff ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 h-8 px-3 border-b border-nv-border text-[12px] text-zinc-400 bg-nv-editor shrink-0 select-none">
              <GitCompare size={13} className="text-indigo-400 shrink-0" />
              <span className="truncate text-zinc-300">{crumbs.join(' › ')}</span>
              <span className="flex-1" />
              <button onClick={() => setDiffInline((v) => !v)} className="icon-btn" title={diffInline ? t('scmDiffSide') : t('scmDiffInline')} aria-label={diffInline ? t('scmDiffSide') : t('scmDiffInline')}>
                {diffInline ? <Columns size={14} /> : <Rows2 size={14} />}
              </button>
              {onOpenPath && (
                <button onClick={() => onOpenPath(activeFile.diff!.filePath)} className="icon-btn" title={t('scmOpenFile')} aria-label={t('scmOpenFile')}>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0">
              {activeFile.diff.note ? (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm px-6 text-center">{activeFile.diff.note === 'binary' ? t('scmDiffBinary') : t('scmDiffTooLarge')}</div>
              ) : (
                <SafeDiff
                  key={`${activeFile.id}:${diffInline ? 'i' : 's'}`}
                  theme={theme}
                  beforeMount={(m: any) => { defineNovaThemes(m); setMonacoForExtensions(m); setProblemsMonaco(m); }}
                  language={activeFile.language || 'plaintext'}
                  original={activeFile.diff.original}
                  modified={activeFile.diff.modified}
                  options={{ ...(editorOptions as object), readOnly: true, originalEditable: false, renderSideBySide: !diffInline, ignoreTrimWhitespace: false, automaticLayout: true, minimap: { enabled: false } }}
                />
              )}
            </div>
          </div>
        ) : activeFile ? (
          <div className="animate-editor-in h-full">
          <Editor
            height="100%"
            theme={theme}
            path={fileModelPath(activeFile)}
            keepCurrentModel
            beforeMount={(monaco) => {
              monacoRef.current = monaco;
              defineNovaThemes(monaco);
              setMonacoForExtensions(monaco);
              setLspMonaco(monaco);
              setProblemsMonaco(monaco);
              setCompletionMonaco(monaco);
            }}
            language={activeFile.language || 'plaintext'}
            defaultValue={getInitialContent ? getInitialContent(activeFile) : activeFile.content || ''}
            onMount={(ed, mon) => {
              // Öneriyi satır satır kabul et (Tab = tümü, Ctrl+→ = kelime Monaco'da hazır)
              ed.addCommand(mon.KeyMod.CtrlCmd | mon.KeyMod.Alt | mon.KeyCode.RightArrow, () => ed.trigger('nova', 'editor.action.inlineSuggest.acceptNextLine', {}), 'inlineSuggestionVisible');
              setEditorInstance(ed);
              if (focusedRef.current) setActiveEditor(ed);
              ed.onDidFocusEditorText(() => { setActiveEditor(ed); reportRef.current(); onFocusGroup?.(groupId); });
              const report = () => {
                if (!focusedRef.current) return;
                const p = ed.getPosition();
                const sel = ed.getSelection();
                const m = ed.getModel();
                setCursor(p ? { line: p.lineNumber, col: p.column, selected: sel && m && !sel.isEmpty() ? m.getValueInRange(sel).length : 0 } : null);
              };
              reportRef.current = report;
              report();
              ed.onDidChangeCursorPosition(report);
              ed.onDidChangeCursorSelection(report);
              // İçerik değişimi: wrapper'ın onChange'i (her tuşta getValue) yerine kendi debounce'lu dinleyicimiz
              let pending: { id: string; model: { isDisposed: () => boolean; getValue: () => string } } | null = null;
              let timer: number | undefined;
              const flush = () => {
                window.clearTimeout(timer);
                if (!pending) return;
                const p = pending;
                pending = null;
                if (!p.model.isDisposed()) cb.current.onChangeContent(p.id, p.model.getValue());
              };
              flushRef.current = flush;
              ed.onDidChangeModelContent(() => {
                if (suppressRef.current) return;
                const id = activeIdRef.current;
                const model = ed.getModel();
                if (!id || !model) return;
                if (pending && pending.id !== id) flush();
                pending = { id, model };
                cb.current.onDirty?.(id);
                window.clearTimeout(timer);
                timer = window.setTimeout(flush, 250);
              });
              ed.onDidDispose(() => {
                flush();
                releaseActiveEditor(ed);
                if (focusedRef.current) setCursor(null);
                setEditorInstance((cur: unknown) => (cur === ed ? null : cur));
              });
            }}
            options={editorOptions}
          />
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-center justify-center h-full text-zinc-500 text-sm px-6 select-none">
            <Logo size={72} animated shadow className="mb-5" />
            <p className="text-zinc-300 text-lg font-light tracking-wide mb-1">NovaCode Studio</p>
            <p className="text-center max-w-md mb-6">{t('emptyHint')}</p>
            <div className="flex flex-col gap-1.5 w-full max-w-xs">
              {onOpenFolder && (
                <button onClick={onOpenFolder} className="group motion-press flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover">
                  <FolderOpen size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('openFolder')}</span>
                  <kbd className="motion-hint px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+O</kbd>
                </button>
              )}
              {onOpenFiles && (
                <button onClick={onOpenFiles} className="group motion-press flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover">
                  <FileCode size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('openFiles')}</span>
                  <kbd className="motion-hint px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+Shift+O</kbd>
                </button>
              )}
              {onNewFile && (
                <button onClick={onNewFile} className="group motion-press flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover">
                  <FilePlus size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('newFile')}</span>
                  <kbd className="motion-hint px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+N</kbd>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EditorArea = React.memo(EditorAreaImpl);
