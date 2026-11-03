import React, { useState, useEffect } from 'react';
import {
  Code,
  Files,
  Terminal as TerminalIcon,
  Play,
  Settings,
  Sparkles,
  Columns,
  Maximize2,
  Minimize2,
  FolderOpen,
  Save,
  Monitor
} from 'lucide-react';
import { FileTree } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { Preview } from './components/Preview';
import { AIAssistant } from './components/AIAssistant';
import { initialFiles } from './mockFiles';
import type { FileItem, ConsoleLog } from './types';

export function App() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Panels state
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'ai' | 'settings'>('files');
  const [showRightPanel, setShowRightPanel] = useState<'preview' | 'ai' | null>('preview');
  const [showBottomTerminal, setShowBottomTerminal] = useState(true);

  // Terminal Logs
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: '0',
      type: 'info',
      text: 'NovaCode IDE v1.0.0 başlatıldı. Web ve Masaüstü motoru aktif.',
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Editor Settings
  const [fontSize, setFontSize] = useState<number>(14);
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');

  // Varsayılan olarak index.html'i aç
  useEffect(() => {
    const srcFolder = initialFiles.find((f) => f.name === 'src');
    const indexHtml = srcFolder?.children?.find((f) => f.name === 'index.html');
    if (indexHtml) {
      setOpenFiles([indexHtml]);
      setActiveFileId(indexHtml.id);
    }
  }, []);

  // Iframe'den gelen logları dinle
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CONSOLE_LOG') {
        setLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            type: event.data.level || 'log',
            text: event.data.message,
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Dosya bulucu
  const findFileById = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFileById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelectFile = (file: FileItem) => {
    if (file.type === 'folder') return;
    if (!openFiles.some((f) => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFileId(file.id);
  };

  const handleCloseTab = (id: string) => {
    const nextOpen = openFiles.filter((f) => f.id !== id);
    setOpenFiles(nextOpen);
    if (activeFileId === id) {
      setActiveFileId(nextOpen.length > 0 ? nextOpen[nextOpen.length - 1].id : null);
    }
  };

  const handleContentChange = (id: string, newContent: string) => {
    // OpenFiles güncelle
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent } : f))
    );

    // Tree güncelle
    const updateRecursive = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, content: newContent };
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles((prev) => updateRecursive(prev));
  };

  const handleCreateFile = (name: string, isFolder: boolean) => {
    const ext = name.split('.').pop()?.toLowerCase();
    let language = 'plaintext';
    if (ext === 'js' || ext === 'jsx') language = 'javascript';
    else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'json') language = 'json';
    else if (ext === 'md') language = 'markdown';

    const newItem: FileItem = {
      id: Date.now().toString(),
      name,
      type: isFolder ? 'folder' : 'file',
      language,
      content: isFolder ? undefined : `// ${name}\n`,
      children: isFolder ? [] : undefined,
      isOpen: true
    };

    setFiles((prev) => [...prev, newItem]);
    if (!isFolder) {
      setOpenFiles((prev) => [...prev, newItem]);
      setActiveFileId(newItem.id);
    }
  };

  const handleDeleteFile = (id: string) => {
    const deleteRecursive = (items: FileItem[]): FileItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.children) {
            return { ...item, children: deleteRecursive(item.children) };
          }
          return item;
        });
    };
    setFiles((prev) => deleteRecursive(prev));
    handleCloseTab(id);
  };

  const handleRunCode = () => {
    const active = openFiles.find((f) => f.id === activeFileId);
    if (!active) return;

    if (active.language === 'javascript' || active.language === 'typescript') {
      try {
        setLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'info',
            text: `[Çalıştırılıyor: ${active.name}]`,
            time: new Date().toLocaleTimeString()
          }
        ]);
        // Basit safe eval çalıştır
        const fn = new Function('console', active.content || '');
        const customConsole = {
          log: (...args: any[]) =>
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random(),
                type: 'log',
                text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '),
                time: new Date().toLocaleTimeString()
              }
            ]),
          error: (...args: any[]) =>
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random(),
                type: 'error',
                text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '),
                time: new Date().toLocaleTimeString()
              }
            ]),
          info: (...args: any[]) =>
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random(),
                type: 'info',
                text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '),
                time: new Date().toLocaleTimeString()
              }
            ]),
          warn: (...args: any[]) =>
            setLogs((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random(),
                type: 'warn',
                text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '),
                time: new Date().toLocaleTimeString()
              }
            ])
        };
        fn(customConsole);
        setShowBottomTerminal(true);
      } catch (err: any) {
        setLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'error',
            text: `Hata: ${err.message}`,
            time: new Date().toLocaleTimeString()
          }
        ]);
        setShowBottomTerminal(true);
      }
    } else {
      setShowRightPanel('preview');
    }
  };

  const handleExecuteTerminalCommand = (cmd: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'info',
        text: `> ${cmd}`,
        time: new Date().toLocaleTimeString()
      }
    ]);
    try {
      const res = (0, eval)(cmd);
      setLogs((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'log',
          text: String(res),
          time: new Date().toLocaleTimeString()
        }
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'error',
          text: e.message,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  // Preview içerikleri
  const getFileContentByName = (name: string): string => {
    const search = (items: FileItem[]): string | null => {
      for (const item of items) {
        if (item.name === name) return item.content || '';
        if (item.children) {
          const res = search(item.children);
          if (res !== null) return res;
        }
      }
      return null;
    };
    return search(files) || '';
  };

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1017] text-zinc-300 font-sans">
      {/* Top Titlebar */}
      <header className="flex items-center justify-between px-3 h-10 bg-[#0f111a] border-b border-zinc-800/80 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold tracking-wide text-sm">
            <Code size={18} className="text-indigo-400" />
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              NovaCode Studio
            </span>
          </div>
          <span className="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
            v1.0.0
          </span>
        </div>

        <div className="text-xs text-zinc-400 truncate max-w-md hidden md:block">
          {activeFile ? `${activeFile.name} — NovaCode Editor` : 'NovaCode Workspace'}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowRightPanel(showRightPanel === 'preview' ? null : 'preview')}
            title="Canlı Önizleme Panelini Aç/Kapat"
            className={`p-1.5 rounded transition-colors ${
              showRightPanel === 'preview'
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Columns size={15} />
          </button>
          <button
            onClick={() => setShowBottomTerminal(!showBottomTerminal)}
            title="Terminali Aç/Kapat"
            className={`p-1.5 rounded transition-colors ${
              showBottomTerminal
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <TerminalIcon size={15} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (Icons) */}
        <div className="w-12 bg-[#090b10] border-r border-zinc-800/80 flex flex-col items-center py-3 justify-between select-none">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setActiveSidebarTab('files')}
              title="Dosyalar"
              className={`p-2 rounded-lg transition-colors ${
                activeSidebarTab === 'files'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Files size={18} />
            </button>
            <button
              onClick={() => {
                setActiveSidebarTab('ai');
                setShowRightPanel('ai');
              }}
              title="AI Asistan"
              className={`p-2 rounded-lg transition-colors ${
                activeSidebarTab === 'ai' || showRightPanel === 'ai'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sparkles size={18} />
            </button>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setActiveSidebarTab('settings')}
              title="Ayarlar"
              className={`p-2 rounded-lg transition-colors ${
                activeSidebarTab === 'settings'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar View */}
        {activeSidebarTab === 'files' && (
          <div className="w-60 h-full border-r border-zinc-800/80">
            <FileTree
              files={files}
              activeFileId={activeFileId}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          </div>
        )}

        {activeSidebarTab === 'settings' && (
          <div className="w-60 h-full bg-[#131620] border-r border-zinc-800/80 p-3 select-none flex flex-col space-y-4">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              Editör Ayarları
            </span>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Yazı Boyutu ({fontSize}px)</label>
              <input
                type="range"
                min="11"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Tema</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
              >
                <option value="vs-dark">VS Dark (Karanlık)</option>
                <option value="light">Light (Aydınlık)</option>
              </select>
            </div>
            <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500">
              <p className="font-semibold text-zinc-400">Platform Bilgisi:</p>
              <p>Masaüstü (Electron) & Web Tarayıcı desteği aktif.</p>
            </div>
          </div>
        )}

        {/* Central Editor + Terminal */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <div className="flex-1 min-h-0">
            <EditorArea
              openFiles={openFiles}
              activeFileId={activeFileId}
              onSelectTab={(id) => setActiveFileId(id)}
              onCloseTab={handleCloseTab}
              onChangeContent={handleContentChange}
              onRunCode={handleRunCode}
              fontSize={fontSize}
              theme={editorTheme}
            />
          </div>

          {/* Bottom Terminal */}
          {showBottomTerminal && (
            <div className="h-48 border-t border-zinc-800">
              <Terminal
                logs={logs}
                onClear={() => setLogs([])}
                onExecuteCommand={handleExecuteTerminalCommand}
              />
            </div>
          )}
        </div>

        {/* Right Side Panel (Preview or AI) */}
        {showRightPanel === 'preview' && (
          <div className="w-[45%] h-full border-l border-zinc-800">
            <Preview
              htmlContent={getFileContentByName('index.html')}
              cssContent={getFileContentByName('styles.css')}
              jsContent={getFileContentByName('app.js')}
              onRefresh={() => {
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    type: 'info',
                    text: 'Önizleme yenilendi.',
                    time: new Date().toLocaleTimeString()
                  }
                ]);
              }}
            />
          </div>
        )}

        {showRightPanel === 'ai' && (
          <div className="w-80 h-full border-l border-zinc-800">
            <AIAssistant
              currentCode={activeFile?.content || ''}
              onApplyCode={(c) => {
                if (activeFileId) handleContentChange(activeFileId, c);
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-[#090b10] border-t border-zinc-800/80 px-3 flex items-center justify-between text-[11px] text-zinc-500 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hazır</span>
          </div>
          <span>UTF-8</span>
          <span>{activeFile?.language?.toUpperCase() || 'METİN'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Boşluklar: 2</span>
          <span>NovaCode IDE Studio</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
