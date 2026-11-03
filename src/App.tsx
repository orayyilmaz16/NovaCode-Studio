import React, { useState, useEffect } from 'react';
import {
  Code,
  Files,
  Terminal as TerminalIcon,
  Settings,
  Sparkles,
  Columns,
  Home,
  GitBranch,
  BookOpen,
  FolderOpen,
  UploadCloud,
  Save,
  Check
} from 'lucide-react';
import { FileTree } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { Preview } from './components/Preview';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { GitPanel } from './components/GitPanel';
import { SnippetsPanel } from './components/SnippetsPanel';
import { initialFiles } from './mockFiles';
import type { FileItem, ConsoleLog, GitStatus } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Yerel Proje ve Git Durumu
  const [currentRootPath, setCurrentRootPath] = useState<string | null>(null);
  const [currentRootName, setCurrentRootName] = useState<string>('NovaCode-Studio');
  const [gitStatus, setGitStatus] = useState<GitStatus>({ isRepo: false, changes: [] });

  // Paneller
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'git' | 'snippets' | 'ai' | 'settings'>('files');
  const [showRightPanel, setShowRightPanel] = useState<'preview' | 'ai' | null>('preview');
  const [showBottomTerminal, setShowBottomTerminal] = useState(true);

  // Terminal Logları
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: '0',
      type: 'info',
      text: 'NovaCode IDE v1.0.0 başlatıldı. Gerçek zamanlı dosya & Git motoru devrede.',
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Editör Ayarları
  const [fontSize, setFontSize] = useState<number>(14);
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');

  // Varsayılan açılış dosyası
  useEffect(() => {
    const srcFolder = initialFiles.find((f) => f.name === 'src');
    const indexHtml = srcFolder?.children?.find((f) => f.name === 'index.html');
    if (indexHtml) {
      setOpenFiles([indexHtml]);
      setActiveFileId(indexHtml.id);
    }
  }, []);

  // Iframe console dinleyicisi
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

  // Gerçek Zamanlı Disk Değişikliği Dinleyicisi (File Watcher)
  useEffect(() => {
    if (window.electronAPI?.onFileChanged) {
      window.electronAPI.onFileChanged(async ({ filename, rootPath }) => {
        addLog('info', `Disk üzerinde dosya değişimi algılandı: ${filename || 'Proje'}`);
        if (rootPath) {
          const updatedTree = await window.electronAPI.readDirectory(rootPath);
          setFiles(updatedTree);
          refreshGitStatus(rootPath);
        }
      });
    }
  }, []);

  // Kısayol tuşları (Ctrl+S kaydet)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const activeFile = openFiles.find((f) => f.id === activeFileId);
        if (activeFile) {
          handleSaveFile(activeFile);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openFiles, activeFileId]);

  const addLog = (type: 'info' | 'log' | 'warn' | 'error', text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type,
        text,
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  // ----------------------------------------------------
  // Gerçek Klasör ve Dosya Seçimi
  // ----------------------------------------------------
  const handleOpenFolderDialog = async () => {
    if (window.electronAPI?.openFolderDialog) {
      const result = await window.electronAPI.openFolderDialog();
      if (result) {
        setCurrentRootPath(result.rootPath);
        setCurrentRootName(result.rootName);
        setFiles(result.tree);
        setShowLanding(false);
        setActiveSidebarTab('files');
        addLog('info', `Çalışma alanı açıldı: ${result.rootPath}`);
        refreshGitStatus(result.rootPath);
      }
    } else {
      // Web fallback dosya yükleme
      handleOpenFilesViaInput();
    }
  };

  const handleOpenFilesViaInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const fileList = e.target.files as FileList;
      if (!fileList || fileList.length === 0) return;
      
      const newItems: FileItem[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const content = await file.text();
        const ext = file.name.split('.').pop()?.toLowerCase();
        let language = 'plaintext';
        if (['js', 'jsx'].includes(ext || '')) language = 'javascript';
        else if (['ts', 'tsx'].includes(ext || '')) language = 'typescript';
        else if (['html'].includes(ext || '')) language = 'html';
        else if (['css'].includes(ext || '')) language = 'css';
        else if (['json'].includes(ext || '')) language = 'json';

        newItems.push({
          id: file.name + '-' + Date.now(),
          name: file.name,
          type: 'file',
          content,
          language
        });
      }
      setFiles((prev) => [...newItems, ...prev]);
      setOpenFiles((prev) => [...newItems, ...prev]);
      setActiveFileId(newItems[0].id);
      setShowLanding(false);
      addLog('info', `${newItems.length} dosya çalışma alanına yüklendi.`);
    };
    input.click();
  };

  const handleOpenFileDialog = async () => {
    if (window.electronAPI?.openFileDialog) {
      const opened = await window.electronAPI.openFileDialog();
      if (opened.length > 0) {
        setOpenFiles((prev) => {
          const ids = new Set(prev.map(f => f.id));
          return [...prev, ...opened.filter(f => !ids.has(f.id))];
        });
        setActiveFileId(opened[0].id);
        setShowLanding(false);
        addLog('info', `${opened.length} dosya editörde açıldı.`);
      }
    } else {
      handleOpenFilesViaInput();
    }
  };

  // ----------------------------------------------------
  // Gerçek Git Entegrasyonu
  // ----------------------------------------------------
  const refreshGitStatus = async (repoPath?: string) => {
    const target = repoPath || currentRootPath;
    if (window.electronAPI?.getGitStatus && target) {
      const status = await window.electronAPI.getGitStatus(target);
      setGitStatus(status);
    }
  };

  const handleGitCommit = async (message: string): Promise<boolean> => {
    if (!currentRootPath || !window.electronAPI?.gitCommit) return false;
    const res = await window.electronAPI.gitCommit(currentRootPath, message);
    if (res.success) {
      addLog('info', `Git commit oluşturuldu: "${message}"`);
      await refreshGitStatus();
      return true;
    } else {
      addLog('error', `Git commit hatası: ${res.stderr}`);
      return false;
    }
  };

  const handleGitPush = async (): Promise<boolean> => {
    if (!currentRootPath || !window.electronAPI?.gitPush) return false;
    addLog('info', 'Git Push başlatılıyor...');
    const res = await window.electronAPI.gitPush(currentRootPath);
    if (res.success) {
      addLog('info', 'Git Push başarıyla tamamlandı.');
      await refreshGitStatus();
      return true;
    } else {
      addLog('error', `Git Push hatası: ${res.stderr}`);
      return false;
    }
  };

  const handleGitPull = async (): Promise<boolean> => {
    if (!currentRootPath || !window.electronAPI?.gitPull) return false;
    addLog('info', 'Git Pull başlatılıyor...');
    const res = await window.electronAPI.gitPull(currentRootPath);
    if (res.success) {
      addLog('info', 'Git Pull tamamlandı.');
      if (currentRootPath) {
        const tree = await window.electronAPI.readDirectory(currentRootPath);
        setFiles(tree);
      }
      await refreshGitStatus();
      return true;
    } else {
      addLog('error', `Git Pull hatası: ${res.stderr}`);
      return false;
    }
  };

  // ----------------------------------------------------
  // Dosya Seçim & Okuma & Kaydetme
  // ----------------------------------------------------
  const handleSelectFile = async (file: FileItem) => {
    if (file.type === 'folder') return;

    let targetFile = file;
    // Eğer disktdeki bir dosyaysa ve içeriği henüz okunmadıysa doğrudan diskten oku
    if (file.path && file.content === undefined && window.electronAPI?.readFile) {
      try {
        const loadedContent = await window.electronAPI.readFile(file.path);
        targetFile = { ...file, content: loadedContent };
      } catch (err: any) {
        addLog('error', `Dosya okunamadı: ${err.message}`);
        return;
      }
    }

    if (!openFiles.some((f) => f.id === targetFile.id)) {
      setOpenFiles((prev) => [...prev, targetFile]);
    } else {
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === targetFile.id && targetFile.content !== undefined ? { ...f, content: targetFile.content } : f))
      );
    }
    setActiveFileId(targetFile.id);
  };

  const handleCloseTab = (id: string) => {
    const nextOpen = openFiles.filter((f) => f.id !== id);
    setOpenFiles(nextOpen);
    if (activeFileId === id) {
      setActiveFileId(nextOpen.length > 0 ? nextOpen[nextOpen.length - 1].id : null);
    }
  };

  const handleContentChange = (id: string, newContent: string) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent, isModified: true } : f))
    );

    const updateRecursive = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, content: newContent, isModified: true };
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles((prev) => updateRecursive(prev));
  };

  const handleSaveFile = async (file: FileItem) => {
    if (file.path && window.electronAPI?.writeFile) {
      const res = await window.electronAPI.writeFile(file.path, file.content || '');
      if (res.success) {
        addLog('info', `Kaydedildi: ${file.name}`);
        setOpenFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, isModified: false } : f))
        );
        refreshGitStatus();
      } else {
        addLog('error', `Kaydetme hatası: ${res.error}`);
      }
    } else {
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isModified: false } : f))
      );
      addLog('info', `Yerel belleğe kaydedildi: ${file.name}`);
    }
  };

  const handleCreateFile = async (name: string, isFolder: boolean) => {
    if (currentRootPath && window.electronAPI) {
      const targetPath = `${currentRootPath}/${name}`;
      if (isFolder) {
        await window.electronAPI.createFolder(targetPath);
      } else {
        await window.electronAPI.createFile(targetPath);
      }
      const tree = await window.electronAPI.readDirectory(currentRootPath);
      setFiles(tree);
      addLog('info', `Yeni ${isFolder ? 'klasör' : 'dosya'} oluşturuldu: ${name}`);
      refreshGitStatus();
      return;
    }

    // Mock fallback
    const ext = name.split('.').pop()?.toLowerCase();
    let language = 'plaintext';
    if (['js', 'jsx'].includes(ext || '')) language = 'javascript';
    else if (['ts', 'tsx'].includes(ext || '')) language = 'typescript';
    else if (['html'].includes(ext || '')) language = 'html';
    else if (['css'].includes(ext || '')) language = 'css';
    else if (['json'].includes(ext || '')) language = 'json';

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

  const handleDeleteFile = async (id: string) => {
    const file = openFiles.find(f => f.id === id) || getAllFiles(files).find(f => f.id === id);
    if (file?.path && window.electronAPI?.deleteItem) {
      await window.electronAPI.deleteItem(file.path);
      if (currentRootPath) {
        const tree = await window.electronAPI.readDirectory(currentRootPath);
        setFiles(tree);
      }
      handleCloseTab(id);
      addLog('warn', `Silindi: ${file.name}`);
      refreshGitStatus();
      return;
    }

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
    const current = openFiles.find((f) => f.id === activeFileId);
    if (!current) return;

    if (current.language === 'javascript' || current.language === 'typescript') {
      try {
        addLog('info', `[Çalıştırılıyor: ${current.name}]`);
        const runFn = new Function('console', current.content || '');
        runFn({
          log: (...args: any[]) => addLog('log', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
          error: (...args: any[]) => addLog('error', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
          info: (...args: any[]) => addLog('info', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
          warn: (...args: any[]) => addLog('warn', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '))
        });
        setShowBottomTerminal(true);
      } catch (err: any) {
        addLog('error', `Hata: ${err.message}`);
        setShowBottomTerminal(true);
      }
    } else {
      setShowRightPanel('preview');
    }
  };

  const handleExecuteTerminalCommand = (command: string) => {
    addLog('info', `> ${command}`);
    try {
      const result = eval(command);
      addLog('log', String(result));
    } catch (err: any) {
      addLog('error', err.message);
    }
  };

  const handleInsertSnippet = (snippetBody: string) => {
    if (!activeFileId) return;
    const current = openFiles.find((f) => f.id === activeFileId);
    const updated = (current?.content || '') + '\n' + snippetBody;
    handleContentChange(activeFileId, updated);
    addLog('info', 'Kod parçası (snippet) editöre eklendi.');
  };

  const getFileContentByName = (name: string): string => {
    const searchRecursive = (items: FileItem[]): string | null => {
      for (const item of items) {
        if (item.name === name) return item.content || '';
        if (item.children) {
          const found = searchRecursive(item.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    return searchRecursive(files) || '';
  };

  const getAllFiles = (items: FileItem[]): FileItem[] => {
    let result: FileItem[] = [];
    for (const item of items) {
      if (item.type === 'file') result.push(item);
      if (item.children) result = result.concat(getAllFiles(item.children));
    }
    return result;
  };

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1017] text-zinc-300 font-sans relative">
      {/* Splash Screen Animation */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

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
            v1.0.0 Pro
          </span>
          {currentRootPath && (
            <span className="text-[11px] text-zinc-400 border-l border-zinc-700/80 pl-3 hidden sm:inline">
              📂 {currentRootName}
            </span>
          )}
        </div>

        <div className="text-xs text-zinc-400 truncate max-w-md hidden md:block">
          {showLanding
            ? 'Hoş Geldiniz — NovaCode Başlangıç'
            : activeFile
            ? `${activeFile.name}${activeFile.isModified ? ' •' : ''} — NovaCode Editor`
            : 'NovaCode Workspace'}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleOpenFolderDialog}
            title="Yerel Klasör Aç"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <FolderOpen size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Klasör Aç</span>
          </button>

          <button
            onClick={() => setShowLanding(!showLanding)}
            title="Başlangıç / Landing Sayfası"
            className={`p-1.5 rounded transition-colors ${
              showLanding ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Home size={15} />
          </button>
          <button
            onClick={() => setShowRightPanel(showRightPanel === 'preview' ? null : 'preview')}
            title="Canlı Önizleme Panelini Aç/Kapat"
            className={`p-1.5 rounded transition-colors ${
              showRightPanel === 'preview' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Columns size={15} />
          </button>
          <button
            onClick={() => setShowBottomTerminal(!showBottomTerminal)}
            title="Terminali Aç/Kapat"
            className={`p-1.5 rounded transition-colors ${
              showBottomTerminal ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-400'
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
              onClick={() => {
                setShowLanding(false);
                setActiveSidebarTab('files');
              }}
              title="Dosyalar & Gezgin"
              className={`p-2 rounded-lg transition-colors ${
                !showLanding && activeSidebarTab === 'files'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Files size={18} />
            </button>
            <button
              onClick={() => {
                setShowLanding(false);
                setActiveSidebarTab('git');
                refreshGitStatus();
              }}
              title="Git Kaynak Kontrolü"
              className={`p-2 rounded-lg transition-colors relative ${
                !showLanding && activeSidebarTab === 'git'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <GitBranch size={18} />
              {gitStatus.changes.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-[#090b10]" />
              )}
            </button>
            <button
              onClick={() => {
                setShowLanding(false);
                setActiveSidebarTab('snippets');
              }}
              title="Kod Snippetları"
              className={`p-2 rounded-lg transition-colors ${
                !showLanding && activeSidebarTab === 'snippets'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BookOpen size={18} />
            </button>
            <button
              onClick={() => setShowLanding(true)}
              title="Başlangıç Paneli"
              className={`p-2 rounded-lg transition-colors ${
                showLanding ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Home size={18} />
            </button>
            <button
              onClick={() => {
                setShowLanding(false);
                setActiveSidebarTab('ai');
                setShowRightPanel('ai');
              }}
              title="AI Asistan"
              className={`p-2 rounded-lg transition-colors ${
                !showLanding && (activeSidebarTab === 'ai' || showRightPanel === 'ai')
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sparkles size={18} />
            </button>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                setShowLanding(false);
                setActiveSidebarTab('settings');
              }}
              title="Ayarlar"
              className={`p-2 rounded-lg transition-colors ${
                !showLanding && activeSidebarTab === 'settings'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar View */}
        {!showLanding && activeSidebarTab === 'files' && (
          <div className="w-64 h-full border-r border-zinc-800/80">
            <FileTree
              files={files}
              activeFileId={activeFileId}
              currentRootName={currentRootName}
              onSelectFile={(f) => {
                setShowLanding(false);
                handleSelectFile(f);
              }}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onOpenFolder={handleOpenFolderDialog}
              onOpenFiles={handleOpenFileDialog}
            />
          </div>
        )}

        {!showLanding && activeSidebarTab === 'git' && (
          <div className="w-64 h-full border-r border-zinc-800/80">
            <GitPanel
              status={gitStatus}
              currentRepoPath={currentRootPath}
              onRefresh={() => refreshGitStatus()}
              onCommit={handleGitCommit}
              onPush={handleGitPush}
              onPull={handleGitPull}
            />
          </div>
        )}

        {!showLanding && activeSidebarTab === 'snippets' && (
          <div className="w-64 h-full border-r border-zinc-800/80">
            <SnippetsPanel onInsertSnippet={handleInsertSnippet} />
          </div>
        )}

        {!showLanding && activeSidebarTab === 'settings' && (
          <div className="w-64 h-full bg-[#131620] border-r border-zinc-800/80 p-3 select-none flex flex-col space-y-4">
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
            <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-400">Sistem & Disk Bilgisi:</p>
              <p>Aktif Dizin: <span className="text-zinc-300 font-mono text-[10px]">{currentRootPath || 'Bellek (Memory)'}</span></p>
              <p>Git Branch: <span className="text-indigo-400 font-mono text-[10px]">{gitStatus.branch || 'Yok'}</span></p>
            </div>
          </div>
        )}

        {/* Landing Page or Central Editor */}
        {showLanding ? (
          <LandingPage
            onOpenProject={() => setShowLanding(false)}
            onOpenFile={(file) => {
              handleSelectFile(file);
              setShowLanding(false);
            }}
            recentFiles={getAllFiles(files).slice(0, 5)}
          />
        ) : (
          <div className="flex flex-col flex-1 h-full min-w-0">
            <div className="flex-1 min-h-0">
              <EditorArea
                openFiles={openFiles}
                activeFileId={activeFileId}
                onSelectTab={(id) => setActiveFileId(id)}
                onCloseTab={handleCloseTab}
                onChangeContent={handleContentChange}
                onSaveFile={handleSaveFile}
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
        )}

        {/* Right Side Panel (Preview or AI) */}
        {!showLanding && showRightPanel === 'preview' && (
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

        {!showLanding && showRightPanel === 'ai' && (
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
          {gitStatus.isRepo && (
            <div className="flex items-center space-x-1 text-indigo-400 font-mono">
              <GitBranch size={11} />
              <span>{gitStatus.branch}</span>
              {gitStatus.changes.length > 0 && (
                <span className="text-amber-400">({gitStatus.changes.length})</span>
              )}
            </div>
          )}
          <span>UTF-8</span>
          <span>{activeFile?.language?.toUpperCase() || 'METİN'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>{activeFile?.isModified ? 'Kaydedilmedi' : 'Kaydedildi'}</span>
          <span>Boşluklar: 2</span>
          <span>NovaCode IDE Studio</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
