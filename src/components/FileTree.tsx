import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  Trash2,
  FilePlus,
  FolderPlus,
  FolderOpen,
  UploadCloud
} from 'lucide-react';
import type { FileItem } from '../types';

interface FileTreeProps {
  files: FileItem[];
  activeFileId: string | null;
  currentRootName?: string;
  onSelectFile: (file: FileItem) => void;
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (id: string) => void;
  onOpenFolder?: () => void;
  onOpenFiles?: () => void;
  isLoading?: boolean;
  /** Normalleştirilmiş mutlak yol -> Git durum harfi (M, A, U, D, R) veya 'dir' (içinde değişiklik var). */
  gitDecor?: Record<string, string>;
}

const GIT_NAME_COLOR: Record<string, string> = {
  M: 'text-amber-300',
  A: 'text-emerald-300',
  U: 'text-emerald-300',
  D: 'text-rose-300 line-through',
  R: 'text-sky-300'
};
export const normGitPath = (p?: string) => (p ? p.split('\\').join('/').toLowerCase() : '');

export const FileTree: React.FC<FileTreeProps> = ({
  gitDecor,
  files,
  activeFileId,
  currentRootName,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onOpenFolder,
  onOpenFiles,
  isLoading = false
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), isCreating === 'folder');
      setNewFileName('');
      setIsCreating(null);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <span className="text-yellow-400 font-bold text-xs mr-1.5">JS</span>;
      case 'ts':
      case 'tsx':
        return <span className="text-blue-400 font-bold text-xs mr-1.5">TS</span>;
      case 'html':
        return <span className="text-orange-500 font-bold text-xs mr-1.5">&lt;&gt;</span>;
      case 'css':
      case 'scss':
        return <span className="text-sky-400 font-bold text-xs mr-1.5">#</span>;
      case 'json':
        return <span className="text-amber-300 font-bold text-xs mr-1.5">&#123;&#125;</span>;
      case 'md':
        return <span className="text-zinc-400 font-bold text-xs mr-1.5">M↓</span>;
      case 'py':
        return <span className="text-emerald-400 font-bold text-xs mr-1.5">PY</span>;
      default:
        return <FileCode size={14} className="mr-1.5 text-zinc-400 shrink-0" />;
    }
  };

  const renderTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isSelected = item.id === activeFileId;

      if (item.type === 'folder') {
        return (
          <div key={item.id} className="select-none">
            <div
              className="flex items-center px-2 py-1 cursor-pointer hover:bg-zinc-800/60 rounded text-xs text-zinc-300 transition-colors group"
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              onClick={() => {
                item.isOpen = !item.isOpen;
                onSelectFile({ ...item });
              }}
            >
              {item.isOpen ? (
                <ChevronDown size={14} className="mr-1 text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight size={14} className="mr-1 text-zinc-400 shrink-0" />
              )}
              <Folder size={14} className="mr-1.5 text-amber-400 fill-amber-400/20 shrink-0" />
              <span className="truncate flex-1 font-medium">{item.name}</span>
              {gitDecor?.[normGitPath(item.path)] === 'dir' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 ml-1.5 shrink-0" />}
            </div>

            {item.isOpen && item.children && (
              <div>{renderTree(item.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={item.id}
          className={`flex items-center justify-between px-2 py-1 cursor-pointer group rounded text-xs transition-colors ${
            isSelected
              ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500'
              : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
          }`}
          style={{ paddingLeft: `${depth * 14 + 16}px` }}
          onClick={() => onSelectFile(item)}
        >
          <div className="flex items-center truncate flex-1">
            {getFileIcon(item.name)}
            <span className={`truncate ${GIT_NAME_COLOR[gitDecor?.[normGitPath(item.path)] ?? ''] ?? ''}`}>{item.name}</span>
            {gitDecor?.[normGitPath(item.path)] && gitDecor[normGitPath(item.path)] !== 'dir' && (
              <span className={`ml-auto pl-2 font-mono text-[10px] shrink-0 ${GIT_NAME_COLOR[gitDecor[normGitPath(item.path)]]?.split(' ')[0] ?? 'text-zinc-400'}`}>
                {gitDecor[normGitPath(item.path)]}
              </span>
            )}
            {item.isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1.5 shrink-0" />
            )}
          </div>

          <button
            title="Dosyayı Sil"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(item.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
          >
            <Trash2 size={12} />
          </button>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-nv-side text-zinc-300 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase truncate">
            {currentRootName ? currentRootName : 'GEZGİN'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {onOpenFolder && (
            <button
              onClick={onOpenFolder}
              title="Yerel Klasör Aç"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-300 transition-colors"
            >
              <FolderOpen size={14} />
            </button>
          )}
          {onOpenFiles && (
            <button
              onClick={onOpenFiles}
              title="Dosya Yükle / Seç"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-300 transition-colors"
            >
              <UploadCloud size={14} />
            </button>
          )}
          <button
            onClick={() => setIsCreating('file')}
            title="Yeni Dosya"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => setIsCreating('folder')}
            title="Yeni Klasör"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-zinc-800/80 bg-zinc-900/40">
          <input
            autoFocus
            type="text"
            placeholder={isCreating === 'folder' ? 'Klasör adı...' : 'Dosya adı (örn: test.js)...'}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              if (!newFileName.trim()) setIsCreating(null);
            }}
            className="w-full bg-zinc-800 border border-indigo-500/50 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-indigo-400"
          />
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center gap-2 text-zinc-400 text-xs">
            <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Proje yükleniyor...
          </div>
        ) : files.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-xs space-y-2">
            <p>Açık dosya veya klasör yok.</p>
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-xs transition-colors cursor-pointer"
              >
                Klasör Aç
              </button>
            )}
          </div>
        ) : (
          renderTree(files)
        )}
      </div>
    </div>
  );
};
