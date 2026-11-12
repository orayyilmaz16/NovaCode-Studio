import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { bindProblemDecorations, normPath, setProblemsMonaco, useProblems } from '../services/problems';
import { FileTypeIcon } from './FileTypeIcon';
import { bindDebugEditor } from '../services/debugEditor';
import { bindLsp, setLspMonaco } from '../services/lspClient';
import { setActiveEditor } from '../services/editorBridge';
import { setCursor } from '../services/cursorStore';
import { setCompletionConfig, setCompletionMonaco } from '../services/aiCompletion';
import { setMonacoForExtensions, useActiveEditorTheme } from '../services/extensionsService';
import { X, Play, Copy, Check, Download, FileCode, Save, Users, Plus, FolderOpen, FilePlus, ChevronRight, Columns, GitCompare, Rows2, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';
import { defineNovaThemes } from '../services/editorTheme';
import { useSettings } from '../services/SettingsContext';
import { toMonacoOptions } from '../services/settings';
import type { FileItem } from '../types';
import { t } from '../i18n/uiText';

export interface CollabConfig {
  enabled: boolean;
  url: string;      // wss:// veya yerel ws://
  token: string;    // sunucu NOVA_SYNC_TOKEN değeri
  room: string;     // proje kimliği (kök klasör yolu)
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
}

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

// Dosya türüne göre simge rengi (VS Code benzeri ayırt edicilik)
function extColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['ts', 'tsx'].includes(ext)) return 'text-sky-400';
  if (['js', 'jsx', 'mjs', 'cjs', 'json'].includes(ext)) return 'text-yellow-300';
  if (['html', 'htm'].includes(ext)) return 'text-orange-400';
  if (['css', 'scss', 'sass', 'less'].includes(ext)) return 'text-blue-400';
  if (['md', 'markdown'].includes(ext)) return 'text-zinc-300';
  if (['py'].includes(ext)) return 'text-emerald-400';
  return 'text-zinc-400';
}

export const EditorArea: React.FC<EditorAreaProps> = ({
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
}) => {
  // Ayarlar: yazı tipi, tema, imleç... değiştiği an editöre yansır (gerçek zamanlı)
  const { values } = useSettings();
  const theme = useActiveEditorTheme();
  const editorOptions = useMemo(() => toMonacoOptions(values), [values]);
  const [copied, setCopied] = React.useState(false);
  const [savedEffect, setSavedEffect] = React.useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [diffInline, setDiffInline] = useState(false);
  const monacoRef = useRef<any>(null);
  const problems = useProblems();
  const [collabStatus, setCollabStatus] = useState<'off' | 'connecting' | 'synced' | 'error'>('off');
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // Açık her dosyanın modeli sekme değiştirince yaşar (Sorunlar sayacı tüm açık dosyaları görsün, geri al geçmişi korunsun);
  // kapanan sekmenin modeli burada serbest bırakılır.
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    const want = new Set(openFiles.filter((f) => !f.diff).map((f) => m.Uri.parse(fileModelPath(f)).toString()));
    for (const model of m.editor.getModels()) {
      const u = model.uri;
      if ((u.scheme === 'file' || (u.scheme === 'inmemory' && u.authority === 'untitled')) && !want.has(u.toString())) model.dispose();
    }
  }, [openFiles]);

  // AI kod tamamlama ayarları (açık/kapalı, gecikme) anında yansır
  useEffect(() => {
    setCompletionConfig({ enabled: values.aiCompletion !== false, delay: Number(values.aiCompletionDelay) || 450 });
  }, [values.aiCompletion, values.aiCompletionDelay]);

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
    return bindLsp(editorInstance, activeFile.path, values.lspEnabled !== false);
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
      const [Y, { WebsocketProvider }, { MonacoBinding }] = await Promise.all([import('yjs'), import('y-websocket'), import('y-monaco')]);
      if (disposed) return;
      const doc = new Y.Doc();
      const roomName = `${encodeURIComponent(collab.room)}/${encodeURIComponent(activePath)}`;
      const provider = new WebsocketProvider(collab.url, roomName, doc, {
        params: collab.token ? { token: collab.token } : {},
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

  const handleCopy = () => {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content || ''], { type: 'text/plain;charset=utf-8' });
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
    <div className="@container flex flex-col flex-1 h-full min-w-0 bg-nv-editor overflow-hidden">
      {/* Sekme çubuğu: açık sekme yokken hiç görünmez */}
      {openFiles.length > 0 && (
      <div className="animate-tabbar-in flex items-stretch justify-between bg-nv-side border-b border-nv-border h-[35px] select-none">
        <div role="tablist" className="flex items-end gap-px flex-1 min-w-0 overflow-x-auto pt-1 pl-1 [scrollbar-width:none]">
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
            const pc = file.path ? problems.byPath[normPath(file.path)] : undefined;
            const nameTone = pc?.e ? 'text-rose-400' : pc?.w ? 'text-amber-300' : '';
            return (
              <div
                key={file.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => onSelectTab(file.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTab(file.id);
                  }
                }}
                onAuxClick={(e) => {
                  if (e.button === 1) onCloseTab(file.id);
                }}
                title={file.path || file.name}
                className={`animate-tab-in group relative flex items-center gap-2 pl-3 pr-2 h-full min-w-[96px] max-w-[200px] cursor-pointer rounded-t-lg border border-b-0 text-[13px] transition-[background-color,color,border-color] duration-150 ${
                  isActive
                    ? 'bg-nv-editor text-zinc-100 border-nv-border shadow-[inset_0_1px_0_var(--color-indigo-500)]'
                    : 'border-transparent text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
                }`}
              >
                {file.diff ? <GitCompare size={14} className="shrink-0 text-indigo-400" /> : <FileTypeIcon name={file.name} size={14} />}
                <span className={`truncate ${nameTone}`} title={pc ? `${pc.e} ✕ · ${pc.w} ⚠` : undefined}>{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  aria-label={`${file.name} — ${t('closeTab')}`}
                  title={t('closeTab')}
                  className="ml-auto relative flex items-center justify-center w-5 h-5 rounded text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                >
                  {file.isModified && (
                    <span className="absolute w-2 h-2 rounded-full bg-zinc-200 transition-opacity group-hover:opacity-0" />
                  )}
                  <X
                    size={14}
                    className={`transition-opacity ${file.isModified ? 'opacity-0 group-hover:opacity-100' : isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  />
                </button>
              </div>
            );
          })}
          {onNewFile && openFiles.length > 0 && (
            <button
              onClick={onNewFile}
              title={`${t('newTab')} (Ctrl+N)`}
              aria-label={t('newTab')}
              className="icon-btn self-center ml-1 shrink-0"
            >
              <Plus size={15} />
            </button>
          )}
        </div>

        {/* Eylem düğmeleri */}
        {activeFile && !activeFile.diff && (
          <div className="flex items-center gap-0.5 pl-2 @md:pl-3 pr-2 shrink-0">
            {collab?.enabled && (
              <span
                title={t('edCollabTitle')}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded mr-1 ${
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
              <button onClick={handleSave} title={`${t('cmdSave')} (Ctrl+S)`} aria-label={t('cmdSave')} className="icon-btn">
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
                className="icon-btn"
              >
                <Columns size={15} />
              </button>
            )}
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

      {/* Yol göstergesi */}
      {activeFile && !activeFile.diff && values.showBreadcrumbs !== false && (
        <div className="flex items-center gap-1 h-[22px] px-3 text-[12px] text-zinc-500 bg-nv-editor select-none overflow-hidden whitespace-nowrap" aria-label="Dosya yolu">
          {crumbs.map((c, i) => (
            <React.Fragment key={`${c}-${i}`}>
              {i > 0 && <ChevronRight size={12} className="shrink-0 text-zinc-600" />}
              <span className={i === crumbs.length - 1 ? 'text-zinc-300' : ''}>{c}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Editör */}
      <div className="flex-1 w-full h-full relative">
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
          <Editor
            key={activeFile.id}
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
            value={activeFile.content || ''}
            onMount={(ed) => {
              // Model sekmeler arasında yaşar: dışarıdan (diskten) yenilenen içerik varsa modele yansıt
              if (activeFile.content !== undefined && ed.getValue() !== activeFile.content) ed.setValue(activeFile.content);
              setEditorInstance(ed);
              setActiveEditor(ed);
              const report = () => {
                const p = ed.getPosition();
                const sel = ed.getSelection();
                const m = ed.getModel();
                setCursor(p ? { line: p.lineNumber, col: p.column, selected: sel && m && !sel.isEmpty() ? m.getValueInRange(sel).length : 0 } : null);
              };
              report();
              ed.onDidChangeCursorPosition(report);
              ed.onDidChangeCursorSelection(report);
              ed.onDidDispose(() => setCursor(null));
            }}
            onChange={(val) => onChangeContent(activeFile.id, val || '')}
            options={editorOptions}
          />
        ) : (
          <div className="animate-fade-in flex flex-col items-center justify-center h-full text-zinc-500 text-sm px-6 select-none">
            <Logo size={72} animated className="mb-5 opacity-90" />
            <p className="text-zinc-300 text-lg font-light tracking-wide mb-1">NovaCode Studio</p>
            <p className="text-center max-w-md mb-6">{t('emptyHint')}</p>
            <div className="flex flex-col gap-1.5 w-full max-w-xs">
              {onOpenFolder && (
                <button onClick={onOpenFolder} className="group flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover transition-colors">
                  <FolderOpen size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('openFolder')}</span>
                  <kbd className="px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+O</kbd>
                </button>
              )}
              {onOpenFiles && (
                <button onClick={onOpenFiles} className="group flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover transition-colors">
                  <FileCode size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('openFiles')}</span>
                  <kbd className="px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+Shift+O</kbd>
                </button>
              )}
              {onNewFile && (
                <button onClick={onNewFile} className="group flex items-center gap-3 px-3 h-8 rounded text-zinc-300 hover:bg-nv-hover transition-colors">
                  <FilePlus size={15} className="text-indigo-400" />
                  <span className="flex-1 text-left">{t('newFile')}</span>
                  <kbd className="px-1.5 rounded bg-zinc-800 text-[11px] text-zinc-400 font-mono">Ctrl+N</kbd>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
