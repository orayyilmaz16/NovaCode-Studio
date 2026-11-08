import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { X, Play, Copy, Check, Download, FileCode, Save, Users, Plus, FolderOpen, FilePlus } from 'lucide-react';
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

  return (
    <div className="flex flex-col flex-1 h-full bg-[#1e1e2e] overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-[#11121d] border-b border-zinc-800 px-2 h-9 overflow-x-auto select-none">
        <div className="flex items-center space-x-1 h-full">
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectTab(file.id)}
                className={`flex items-center space-x-2 px-3 h-full cursor-pointer border-t-2 text-xs transition-colors group ${
                  isActive
                    ? 'bg-[#1e1e2e] border-indigo-500 text-zinc-100 font-medium'
                    : 'border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
                }`}
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                {file.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Kaydedilmemiş Değişiklik" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="hover:bg-zinc-700/60 p-0.5 rounded-full text-zinc-400 hover:text-zinc-200"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          {onNewFile && (
            <button
              onClick={onNewFile}
              title={`${t('newTab')} (Ctrl+N)`}
              aria-label={t('newTab')}
              className="flex items-center justify-center w-7 h-7 ml-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <Plus size={15} />
            </button>
          )}
        </div>

        {/* Action Tools */}
        {activeFile && (
          <div className="flex items-center space-x-1.5 ml-4">
            {collab?.enabled && (
              <span
                title="Ortak düzenleme durumu"
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${
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
              <button
                onClick={handleSave}
                title="Dosyayı Kaydet (Ctrl+S)"
                className="flex items-center space-x-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors"
              >
                {savedEffect ? <Check size={13} className="text-emerald-400" /> : <Save size={13} />}
                <span className="hidden sm:inline">Kaydet</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              title="Kodu Kopyala"
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleDownload}
              title="Dosyayı İndir"
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onRunCode}
              title="Kodu Çalıştır / Önizle"
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-sm shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Play size={12} className="fill-white" />
              <span>Çalıştır</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 w-full h-full relative">
        {activeFile ? (
          <Editor
            height="100%"
            theme={theme}
            language={activeFile.language || 'plaintext'}
            value={activeFile.content || ''}
            onMount={(ed) => setEditorInstance(ed)}
            onChange={(val) => onChangeContent(activeFile.id, val || '')}
            options={{
              fontSize: fontSize,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              tabSize: 2,
              bracketPairColorization: { enabled: true }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm space-y-5 px-6 select-none">
            <div className="p-4 bg-zinc-800/40 rounded-full">
              <FileCode size={36} className="text-zinc-600" />
            </div>
            <p className="text-center max-w-md">{t('emptyHint')}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onOpenFolder && (
                <button
                  onClick={onOpenFolder}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                >
                  <FolderOpen size={14} className="text-amber-400" />
                  <span>{t('openFolder')}</span>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400 font-mono">Ctrl+O</kbd>
                </button>
              )}
              {onOpenFiles && (
                <button
                  onClick={onOpenFiles}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                >
                  <FileCode size={14} className="text-sky-400" />
                  <span>{t('openFiles')}</span>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400 font-mono">Ctrl+Shift+O</kbd>
                </button>
              )}
              {onNewFile && (
                <button
                  onClick={onNewFile}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors"
                >
                  <FilePlus size={14} />
                  <span>{t('newFile')}</span>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-indigo-900/60 text-[10px] text-indigo-100 font-mono">Ctrl+N</kbd>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
