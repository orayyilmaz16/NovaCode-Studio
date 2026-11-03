import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import type { FileItem } from '../types';

interface FileTreeProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (file: FileItem) => void;
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (id: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
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
        return <span className="text-blue-500 font-bold text-xs mr-1.5">#</span>;
      case 'json':
        return <span className="text-emerald-400 font-bold text-xs mr-1.5">{}</span>;
      case 'md':
        return <span className="text-indigo-400 font-bold text-xs mr-1.5">M↓</span>;
      default:
        return <FileCode size={14} className="text-zinc-400 mr-1.5 shrink-0" />;
    }
  };

  const renderTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isSelected = activeFileId === item.id;

      if (item.type === 'folder') {
        return (
          <div key={item.id} className="select-none">
            <div
              className={`flex items-center px-2 py-1 cursor-pointer hover:bg-zinc-800/60 rounded text-xs text-zinc-300 transition-colors group`}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              onClick={() => {
                item.isOpen = !item.isOpen;
                // Force update
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
            <span className="truncate">{item.name}</span>
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
    <div className="flex flex-col h-full bg-[#131620] text-zinc-300 select-none">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80">
        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Gezgin / Dosyalar
        </span>
        <div className="flex items-center space-x-1">
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

      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(files)}
      </div>
    </div>
  );
};
