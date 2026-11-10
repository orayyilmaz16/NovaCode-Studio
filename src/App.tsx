import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Power
} from 'lucide-react';
import { FileTree } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { Preview } from './components/Preview';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { GitPanel } from './components/GitPanel';
import { GithubAccount } from './components/GithubAccount';
import { SnippetsPanel } from './components/SnippetsPanel';
import { ResizeHandle, clamp, loadStoredNumber, saveStoredNumber } from './components/ResizeHandle';
import { t } from './i18n/uiText';
import type { FileItem, ConsoleLog, GitStatus } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  // Açılışta hiçbir proje/dosya otomatik açılmaz: ağaç yalnız kullanıcının açtığı klasörden gelir.
  const [files, setFiles] = useState<FileItem[]>([]);
  const untitledCounter = useRef(0);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const openFilesRef = useRef<FileItem[]>([]);
  const refreshGitStatusRef = useRef<() => Promise<void>>(async () => {});
  openFilesRef.current = openFiles;
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Yerel Proje ve Git Durumu
  const [currentRootPath, setCurrentRootPath] = useState<string | null>(null);
  const [currentRootName, setCurrentRootName] = useState<string>('NovaCode-Studio');
  const [gitStatus, setGitStatus] = useState<GitStatus>({ isRepo: false, changes: [] });

  // Paneller
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'git' | 'snippets' | 'ai' | 'settings'>('files');
  // Önizleme varsayılan olarak kapalı; yalnız HTML dosyasında düğmesi görünür.
  const [showRightPanel, setShowRightPanel] = useState<'preview' | 'ai' | null>(null);
  const [showBottomTerminal, setShowBottomTerminal] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Sürüklenebilir panel boyutları (tercihler tarayıcıda saklanır)
  const [sidebarWidth, setSidebarWidth] = useState(() => loadStoredNumber('nova.sidebarWidth', 256));
  const [terminalHeight, setTerminalHeight] = useState(() => loadStoredNumber('nova.terminalHeight', 208));
  const [previewWidth, setPreviewWidth] = useState(() => loadStoredNumber('nova.previewWidth', 560));

  useEffect(() => { saveStoredNumber('nova.sidebarWidth', sidebarWidth); }, [sidebarWidth]);
  useEffect(() => { saveStoredNumber('nova.terminalHeight', terminalHeight); }, [terminalHeight]);
  useEffect(() => { saveStoredNumber('nova.previewWidth', previewWidth); }, [previewWidth]);

  // Ortak düzenleme (kendi sunucun, açık kaynak Yjs). Ayarlar tarayıcıda saklanır.
  const readLS = (key: string, fallback: string) => {
    try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };
  const writeLS = (key: string, value: string) => {
    try { window.localStorage.setItem(key, value); } catch { /* depolama kapalı */ }
  };
  const [collabEnabled, setCollabEnabled] = useState(() => readLS('nova.collab.enabled', '0') === '1');
  const [collabUrl, setCollabUrl] = useState(() => readLS('nova.collab.url', ''));
  const [collabToken, setCollabToken] = useState(() => readLS('nova.collab.token', ''));
  useEffect(() => { writeLS('nova.collab.enabled', collabEnabled ? '1' : '0'); }, [collabEnabled]);
  useEffect(() => { writeLS('nova.collab.url', collabUrl); }, [collabUrl]);
  useEffect(() => { writeLS('nova.collab.token', collabToken); }, [collabToken]);
  const collabUrlValid = /^(wss:\/\/|ws:\/\/(localhost|127\.0\.0\.1)[:/])/.test(collabUrl.trim());

  // Terminal Logları
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: '0',
      type: 'info',
      text: `NovaCode IDE v${__APP_VERSION__} başlatıldı. Gerçek zamanlı dosya & Git motoru devrede.`,
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Editör Ayarları
  const [fontSize, setFontSize] = useState<number>(14);
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');

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
    const api = window.electronAPI;
    if (!api?.onFileChanged) return;
    const unsubscribe = api.onFileChanged(async ({ filename, rootPath, changed }) => {
      try {
        if (rootPath) {
          const updatedTree = await api.readDirectory(rootPath);
          setFiles(updatedTree);
          refreshGitStatus(rootPath);
        }
        // Açık, kaydedilmemiş değişikliği olmayan sekmeleri diskten canlı yenile.
        const changedSet = new Set(changed ?? []);
        const targets = openFilesRef.current.filter(
          (f) => f.path && !f.isModified && changedSet.has(f.path)
        );
        for (const f of targets) {
          try {
            const fresh = await api.readFile(f.path as string);
            setOpenFiles((prev) =>
              prev.map((o) => (o.id === f.id && !o.isModified && o.content !== fresh ? { ...o, content: fresh } : o))
            );
          } catch {
            /* dosya silinmiş veya okunamıyor olabilir */
          }
        }
      } catch (err) {
        addLog('error', `Dosya ağacı yenilenemedi: ${filename || ''} ${String(err)}`);
      }
    });
    return unsubscribe;
  }, []);

  // GitHub bağlanınca/çıkınca Git durumu hemen yenilenir (bağlı değilken Git verisi kilitlidir).
  useEffect(() => {
    const off = window.electronAPI?.github?.onAuth(() => {
      void refreshGitStatusRef.current();
    });
    return off;
  }, []);

  // Kısayol tuşları. Dinleyici tek sefer kurulur; her render'da güncel işleyiciye yönlenir.
  const shortcutHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutHandler.current(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  shortcutHandler.current = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();

    if (key === 'q') { e.preventDefault(); handleQuit(); return; }
    if (e.key === '`') { e.preventDefault(); setShowBottomTerminal((v) => !v); return; }
    if (key === 's') {
      e.preventDefault();
      const activeFile = openFiles.find((f) => f.id === activeFileId);
      if (activeFile) handleSaveFile(activeFile);
      return;
    }

    // Terminalde yazarken Ctrl+N/O/W/Tab gibi tuşlar kabuğa aittir.
    if ((e.target as HTMLElement | null)?.closest?.('[data-terminal]')) return;

    if (key === 'o') {
      e.preventDefault();
      if (e.shiftKey) handleOpenFileDialog();
      else handleOpenFolderDialog();
    } else if (key === 'n') {
      e.preventDefault();
      handleNewUntitled();
    } else if (key === 'w') {
      if (activeFileId) { e.preventDefault(); handleCloseTab(activeFileId); }
    } else if (e.key === 'Tab' && openFiles.length > 1) {
      e.preventDefault();
      const idx = openFiles.findIndex((f) => f.id === activeFileId);
      const step = e.shiftKey ? -1 : 1;
      const next = openFiles[(idx + step + openFiles.length) % openFiles.length];
      setActiveFileId(next.id);
    }
  };

  const handleNewUntitled = () => {
    untitledCounter.current += 1;
    const newItem: FileItem = {
      id: `untitled-${Date.now()}`,
      name: `untitled-${untitledCounter.current}.txt`,
      type: 'file',
      language: 'plaintext',
      content: '',
    };
    setOpenFiles((prev) => [...prev, newItem]);
    setActiveFileId(newItem.id);
    setShowLanding(false);
  };

  const handleQuit = () => {
    if (window.electronAPI?.quitApp) {
      window.electronAPI.quitApp();
    } else {
      window.close();
    }
  };

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
      setIsLoadingProject(true);
      try {
        const result = await window.electronAPI.openFolderDialog();
        if (result && 'error' in result) {
          addLog('error', `Klasör açılamadı: ${result.error}`);
          return;
        }
        if (result && 'rootPath' in result) {
          setCurrentRootPath(result.rootPath);
          setCurrentRootName(result.rootName);
          setFiles(result.tree);
          setShowLanding(false);
          setActiveSidebarTab('files');
          addLog('info', `Çalışma alanı açıldı: ${result.rootPath}`);
          refreshGitStatus(result.rootPath);
        }
      } catch (err) {
        addLog('error', `Klasör açılamadı: ${String(err)}`);
      } finally {
        setIsLoadingProject(false);
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

  refreshGitStatusRef.current = refreshGitStatus;

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
      // Klasörün kendi ayırıcısını kullan (Windows'ta '\', diğerlerinde '/')
      const sep = currentRootPath.includes('\\') ? '\\' : '/';
      const base = currentRootPath.split(sep).filter(Boolean).join(sep);
      const relative = name.split(/[\\/]+/).filter(Boolean).join(sep);
      const targetPath = currentRootPath.startsWith(sep) ? sep + base + sep + relative : base + sep + relative;
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
            v{__APP_VERSION__} Pro
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
          {/* Önizleme yalnız HTML dosyası açıkken görünür */}
          {openFiles.find((f) => f.id === activeFileId)?.language === 'html' && (
            <button
              onClick={() => setShowRightPanel(showRightPanel === 'preview' ? null : 'preview')}
              title="HTML Önizleme"
              className={`p-1.5 rounded transition-colors ${
                showRightPanel === 'preview' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              <Columns size={15} />
            </button>
          )}
          <button
            onClick={() => setShowBottomTerminal(!showBottomTerminal)}
            title="Terminali Aç/Kapat"
            className={`p-1.5 rounded transition-colors ${
              showBottomTerminal ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <TerminalIcon size={15} />
          </button>
          <button
            onClick={handleQuit}
            title={`${t('quit')} (Ctrl+Q)`}
            aria-label={t('quit')}
            className="p-1.5 rounded transition-colors hover:bg-rose-600/30 text-zinc-400 hover:text-rose-300"
          >
            <Power size={15} />
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
          <div style={{ width: sidebarWidth }} className="h-full border-r border-zinc-800/80 shrink-0">
            <FileTree
              isLoading={isLoadingProject}
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
          <div style={{ width: sidebarWidth }} className="h-full border-r border-zinc-800/80 shrink-0 flex flex-col">
            <GithubAccount />
            <div className="flex-1 min-h-0">
              <GitPanel
                status={gitStatus}
                currentRepoPath={currentRootPath}
                onRefresh={() => refreshGitStatus()}
                onCommit={handleGitCommit}
                onPush={handleGitPush}
                onPull={handleGitPull}
              />
            </div>
          </div>
        )}

        {!showLanding && activeSidebarTab === 'snippets' && (
          <div style={{ width: sidebarWidth }} className="h-full border-r border-zinc-800/80 shrink-0">
            <SnippetsPanel onInsertSnippet={handleInsertSnippet} />
          </div>
        )}

        {!showLanding && activeSidebarTab === 'settings' && (
          <div style={{ width: sidebarWidth }} className="h-full bg-[#131620] border-r border-zinc-800/80 p-3 select-none flex flex-col space-y-4 shrink-0">
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
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={collabEnabled}
                  onChange={(e) => setCollabEnabled(e.target.checked)}
                  className="accent-indigo-500"
                />
                Ortak düzenleme
              </label>
              <input
                type="text"
                value={collabUrl}
                onChange={(e) => setCollabUrl(e.target.value)}
                placeholder="wss://sunucun.example.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
              />
              <input
                type="password"
                value={collabToken}
                onChange={(e) => setCollabToken(e.target.value)}
                placeholder="Sunucu token'ı"
                autoComplete="off"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
              />
              {collabUrl && !collabUrlValid && (
                <p className="text-[11px] text-rose-400">Adres wss:// ile başlamalı (yerel test için ws://localhost).</p>
              )}
              <p className="text-[10px] text-zinc-500 leading-snug">
                Kodun yalnızca bu adrese gönderilir. Sunucu açık kaynaktır: <span className="font-mono">server/sync-server.mjs</span>
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-400">Sistem & Disk Bilgisi:</p>
              <p>Aktif Dizin: <span className="text-zinc-300 font-mono text-[10px]">{currentRootPath || 'Bellek (Memory)'}</span></p>
              <p>Git Branch: <span className="text-indigo-400 font-mono text-[10px]">{gitStatus.branch || 'Yok'}</span></p>
            </div>
          </div>
        )}

        {/* Sidebar genişliği: sağ kenardan sürükle */}
        {!showLanding && (
          <ResizeHandle
            direction="horizontal"
            title="Kenar çubuğu genişliği"
            onResize={(d) => setSidebarWidth((w) => clamp(w + d, 180, 560))}
          />
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
                onNewFile={handleNewUntitled}
                onOpenFolder={handleOpenFolderDialog}
                onOpenFiles={handleOpenFileDialog}
                onChangeContent={handleContentChange}
                onSaveFile={handleSaveFile}
                onRunCode={handleRunCode}
                fontSize={fontSize}
                theme={editorTheme}
                collab={{
                  enabled: collabEnabled && collabUrlValid,
                  url: collabUrl.trim(),
                  token: collabToken,
                  room: currentRootPath || ''
                }}
              />
            </div>

            {/* Bottom Terminal */}
            {showBottomTerminal && (
              <ResizeHandle
                direction="vertical"
                title="Terminal yüksekliği"
                onResize={(d) => setTerminalHeight((h) => clamp(h - d, 120, 640))}
              />
            )}
            {showBottomTerminal && (
              <div data-terminal="" style={{ height: terminalHeight }} className="border-t border-zinc-800 shrink-0">
                <Terminal
                  logs={logs}
                  onClear={() => setLogs([])}
                  cwd={currentRootPath}
                  branch={gitStatus.isRepo ? gitStatus.branch : null}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Side Panel (Preview or AI) */}
        {!showLanding && showRightPanel === 'preview' && openFiles.find((f) => f.id === activeFileId)?.language === 'html' && (
          <>
          <ResizeHandle
            direction="horizontal"
            title="Önizleme genişliği"
            onResize={(d) => setPreviewWidth((w) => clamp(w - d, 320, 1200))}
          />
          <div style={{ width: previewWidth }} className="h-full border-l border-zinc-800 shrink-0">
            <Preview
              htmlContent={openFiles.find((f) => f.id === activeFileId)?.content || ''}
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
          </>
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
