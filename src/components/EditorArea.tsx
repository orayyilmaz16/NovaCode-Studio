import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { X, Play, Copy, Check, Download, FileCode, Save, Users, Plus, FolderOpen, FilePlus, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { defineNovaThemes } from '../services/editorTheme';
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
  onNewFile?: () => void;
  onOpenFolder?: () => void;
  onOpenFiles?: () => void;
  fontSize: number;
  theme: string;
  collab?: CollabConfig;
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
  onNewFile,
  onOpenFolder,
  onOpenFiles,
  fontSize,
  theme,
  collab,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [savedEffect, setSavedEffect] = React.useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [collabStatus, setCollabStatus] = useState<'off' | 'connecting' | 'synced' | 'error'>('off');
  const activeFile = openFiles.find((f) => f.id === activeFileId);

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

    const doc = new Y.Doc();
    const roomName = `${encodeURIComponent(collab.room)}/${encodeURIComponent(activePath)}`;
    const provider = new WebsocketProvider(collab.url, roomName, doc, {
      params: collab.token ? { token: collab.token } : {},
      connect: true
    });
    const ytext = doc.getText('monaco');
    const binding = new MonacoBinding(ytext, model, new Set([editorInstance]), provider.awareness);

    setCollabStatus('connecting');
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

    return () => {
      provider.off('status', onStatus);
      provider.off('sync', onSync);
      provider.off('connection-error', onConnErr);
      binding.destroy();
      provider.destroy();
      doc.destroy();
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

  const crumbs = activeFile?.path ? activeFile.path.split(/[\\/]/).filter(Boolean).slice(-4) : activeFile ? [activeFile.name] : [];

  return (
    <div className="flex flex-col flex-1 h-full bg-nv-editor overflow-hidden">
      {/* Sekme çubuğu */}
      <div className="flex items-stretch justify-between bg-nv-side border-b border-nv-border h-[35px] select-none">
        <div role="tablist" className="flex items-stretch min-w-0 overflow-x-auto [scrollbar-width:none]">
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
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
                className={`animate-tab-in group relative flex items-center gap-2 pl-3 pr-2 min-w-[96px] max-w-[200px] cursor-pointer border-r border-nv-border text-[13px] transition-colors ${
                  isActive
                    ? 'bg-nv-editor text-zinc-100 shadow-[inset_0_1px_0_var(--color-indigo-500)]'
                    : 'text-zinc-400 hover:bg-nv-hover hover:text-zinc-200'
                }`}
              >
                <FileCode size={14} className={`shrink-0 ${extColor(file.name)}`} />
                <span className="truncate">{file.name}</span>
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
          {onNewFile && (
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
        {activeFile && (
          <div className="flex items-center gap-0.5 pl-3 pr-2 shrink-0">
            {collab?.enabled && (
              <span
                title="Ortak düzenleme durumu"
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded mr-1 ${
                  collabStatus === 'synced'
                    ? 'text-emerald-300 bg-emerald-500/10'
                    : collabStatus === 'error'
                      ? 'text-rose-300 bg-rose-500/10'
                      : 'text-zinc-400 bg-zinc-800'
                }`}
              >
                <Users size={11} />
                {collabStatus === 'synced' ? 'Bağlı' : collabStatus === 'error' ? 'Bağlantı hatası' : collabStatus === 'connecting' ? 'Bağlanıyor' : 'Kapalı'}
              </span>
            )}
            {onSaveFile && (
              <button onClick={handleSave} title="Dosyayı Kaydet (Ctrl+S)" aria-label="Kaydet" className="icon-btn">
                {savedEffect ? <Check size={15} className="text-emerald-400" /> : <Save size={15} />}
              </button>
            )}
            <button onClick={handleCopy} title="Kodu Kopyala" aria-label="Kodu Kopyala" className="icon-btn">
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>
            <button onClick={handleDownload} title="Dosyayı İndir" aria-label="Dosyayı İndir" className="icon-btn">
              <Download size={15} />
            </button>
            <button
              onClick={onRunCode}
              title="Kodu Çalıştır / Önizle"
              className="ml-1 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 h-6 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              <Play size={11} className="fill-white" />
              <span>Çalıştır</span>
            </button>
          </div>
        )}
      </div>

      {/* Yol göstergesi */}
      {activeFile && (
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
        {activeFile ? (
          <Editor
            key={activeFile.id}
            height="100%"
            theme={theme}
            beforeMount={defineNovaThemes}
            language={activeFile.language || 'plaintext'}
            value={activeFile.content || ''}
            onMount={(ed) => setEditorInstance(ed)}
            onChange={(val) => onChangeContent(activeFile.id, val || '')}
            options={{
              fontSize: fontSize,
              fontFamily: "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              minimap: { enabled: true, renderCharacters: false, scale: 1 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              tabSize: 2,
              padding: { top: 8 },
              renderLineHighlight: 'all',
              roundedSelection: false,
              guides: { bracketPairs: true, indentation: true },
              bracketPairColorization: { enabled: true }
            }}
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
