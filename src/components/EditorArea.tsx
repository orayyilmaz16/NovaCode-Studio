import React from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, Copy, Check, Download, FileCode } from 'lucide-react';
import type { FileItem } from '../types';

interface EditorAreaProps {
  openFiles: FileItem[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onChangeContent: (id: string, content: string) => void;
  onRunCode: () => void;
  fontSize: number;
  theme: string;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onRunCode,
  fontSize,
  theme,
}) => {
  const [copied, setCopied] = React.useState(false);
  const activeFile = openFiles.find((f) => f.id === activeFileId);

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
                className={`flex items-center space-x-2 px-3 h-full cursor-pointer border-t-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-[#1e1e2e] border-indigo-500 text-zinc-100 font-medium'
                    : 'border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
                }`}
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
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
        </div>

        {/* Action Tools */}
        {activeFile && (
          <div className="flex items-center space-x-2 ml-4">
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
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm space-y-2">
            <div className="p-4 bg-zinc-800/40 rounded-full">
              <FileCode size={36} className="text-zinc-600" />
            </div>
            <p>Düzenlemek için sol menüden bir dosya seçin veya yeni oluşturun.</p>
          </div>
        )}
      </div>
    </div>
  );
};
