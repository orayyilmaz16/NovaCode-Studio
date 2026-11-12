import React, { useState, useEffect, useRef } from 'react';
import {
  Files,
  Settings,
  Sparkles,
  Columns,
  House,
  GitBranch,
  BookOpen,
  FolderOpen,
  Check,
  Search,
  PanelLeft,
  PanelBottom,
  UserRound
} from 'lucide-react';
import { FileTree, normGitPath } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { Preview } from './components/Preview';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { GitPanel } from './components/GitPanel';
import { GithubAccount } from './components/GithubAccount';
import { Logo } from './components/Logo';
import { SettingsPage } from './components/SettingsPage';
import { builtInSnippets } from './snippets/defaultSnippets';
import { useSettings } from './services/SettingsContext';
import { useCollabToken } from './services/useCollabToken';
import { loadSettings } from './services/settings';
import { useGithubAuth } from './services/useGithubAuth';
import { SnippetsPanel } from './components/SnippetsPanel';
import { SearchPanel } from './components/SearchPanel';
import { CommandPalette, type PaletteCommand } from './components/CommandPalette';
import { goToLine, insertSnippetAtCursor, runEditorAction, hasEditor } from './services/editorBridge';
import { baseName, languageFromName } from './services/lang';
import { ResizeHandle, clamp, loadStoredNumber, saveStoredNumber } from './components/ResizeHandle';
import { t } from './i18n/uiText';
import type { FileItem, ConsoleLog, GitStatus, Snippet } from './types';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  // VS Code gibi: açılışta karşılama sayfası gösterilir (kullanıcı kapatabilir).
  const [showLanding, setShowLanding] = useState(() => loadSettings().values.welcomeOnStartup !== false);
  const [showSettings, setShowSettings] = useState(false);
  // Açılışta hiçbir proje/dosya otomatik açılmaz: ağaç yalnız kullanıcının açtığı klasörden gelir.
  const [files, setFiles] = useState<FileItem[]>([]);
  const untitledCounter = useRef(0);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const openFilesRef = useRef<FileItem[]>([]);
  const handleSaveFileRef = useRef<(f: FileItem) => Promise<void>>(async () => {});
  const refreshGitStatusRef = useRef<() => Promise<void>>(async () => {});
  openFilesRef.current = openFiles;
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Yerel Proje ve Git Durumu
  const [currentRootPath, setCurrentRootPath] = useState<string | null>(null);
  const [currentRootName, setCurrentRootName] = useState<string>('NovaCode-Studio');
  const [gitStatus, setGitStatus] = useState<GitStatus>({ isRepo: false, changes: [] });

  // Paneller
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'search' | 'git' | 'snippets'>('files');
  // Önizleme varsayılan olarak kapalı; yalnız HTML dosyasında düğmesi görünür.
  const [showRightPanel, setShowRightPanel] = useState<'preview' | 'ai' | null>(null);
  const [showBottomTerminal, setShowBottomTerminal] = useState(false);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [sbMounted, setSbMounted] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Sürüklenebilir panel boyutları (tercihler tarayıcıda saklanır)
  const [sidebarWidth, setSidebarWidth] = useState(() => loadStoredNumber('nova.sidebarWidth', 256));
  const [terminalHeight, setTerminalHeight] = useState(() => loadStoredNumber('nova.terminalHeight', 208));
  const [previewWidth, setPreviewWidth] = useState(() => loadStoredNumber('nova.previewWidth', 560));

  useEffect(() => { saveStoredNumber('nova.sidebarWidth', sidebarWidth); }, [sidebarWidth]);
  useEffect(() => { saveStoredNumber('nova.terminalHeight', terminalHeight); }, [terminalHeight]);
  useEffect(() => { saveStoredNumber('nova.previewWidth', previewWidth); }, [previewWidth]);

  // Ortak düzenleme (kendi sunucun, açık kaynak Yjs). Ayarlar tarayıcıda saklanır.
  // Ayarlar (gerçek zamanlı, tek kaynak: SettingsContext)
  const { values: settings, set: setSetting, userSnippets } = useSettings();
  const [palette, setPalette] = useState<null | '' | '>' | ':' | '$'>(null);
  const { token: collabToken } = useCollabToken();
  const collabEnabled = settings.collabEnabled === true;
  const collabUrl = String(settings.collabUrl);

  // Son açılan klasörler (yalnız yerelde, ana süreçte tutulur)
  const [recentFolders, setRecentFolders] = useState<{ path: string; name: string }[]>([]);
  const loadRecent = () => {
    void window.electronAPI?.recentFolders?.().then(setRecentFolders).catch(() => setRecentFolders([]));
  };
  useEffect(loadRecent, []);
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

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { auth } = useGithubAuth();

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
    const offAuth = window.electronAPI?.github?.onAuth(() => {
      void refreshGitStatusRef.current();
    });
    // .git içindeki HEAD/index/refs değişimi (terminal, başka araç) anında yansır.
    const offGit = window.electronAPI?.onGitChanged?.(() => {
      void refreshGitStatusRef.current();
    });
    return () => {
      offAuth?.();
      offGit?.();
    };
  }, []);

  // Kısayol tuşları. Dinleyici tek sefer kurulur; her render'da güncel işleyiciye yönlenir.
  const shortcutHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutHandler.current(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  shortcutHandler.current = (e: KeyboardEvent) => {
    if (e.key === 'F1') { e.preventDefault(); setPalette('>'); return; }
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();

    // Komut paleti ve arama (VS Code ile aynı): Ctrl+P dosya, Ctrl+Shift+P komut, Ctrl+G satır, Ctrl+Shift+F proje araması
    if (key === 'p') { e.preventDefault(); setPalette(e.shiftKey ? '>' : ''); return; }
    if (key === 'g' && !e.shiftKey) { e.preventDefault(); setPalette(':'); return; }
    if (key === 'f' && e.shiftKey) { e.preventDefault(); pickSidebarForce('search'); return; }
    if (key === 'l' && e.shiftKey) { e.preventDefault(); setShowLanding(false); setShowSettings(false); setShowRightPanel('ai'); return; }

    if (key === 'q') { e.preventDefault(); handleQuit(); return; }
    if (key === 'b') { e.preventDefault(); setSidebarVisible((v) => !v); return; }
    if (key === ',') { e.preventDefault(); setShowLanding(false); setShowSettings((v) => !v); return; }
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

  // Dosya ağacı için Git durumu: dosya -> harf, üst klasörler -> 'dir'
  const gitDecor = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (!currentRootPath || !gitStatus.isRepo || settings.showGitDecorations === false) return map;
    const root = currentRootPath.split('\\').join('/').replace(/\/+$/, '');
    for (const f of gitStatus.files ?? []) {
      const letter = f.untracked ? 'U' : f.worktree || f.index || 'M';
      const abs = `${root}/${f.path}`;
      map[normGitPath(abs)] = letter;
      let dir = abs.slice(0, abs.lastIndexOf('/'));
      while (dir.length > root.length) {
        const k = normGitPath(dir);
        if (!map[k]) map[k] = 'dir';
        dir = dir.slice(0, dir.lastIndexOf('/'));
      }
    }
    return map;
  }, [gitStatus, currentRootPath, settings.showGitDecorations]);

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
    setShowSettings(false);
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
  const applyWorkspace = (result: { rootPath: string; rootName: string; tree: FileItem[] }) => {
    setCurrentRootPath(result.rootPath);
    setCurrentRootName(result.rootName);
    setFiles(result.tree);
    setShowLanding(false);
    setShowSettings(false);
    setActiveSidebarTab('files');
    setSidebarVisible(true);
    addLog('info', `Çalışma alanı açıldı: ${result.rootPath}`);
    refreshGitStatus(result.rootPath);
    loadRecent();
  };

  const handleOpenFolderDialog = async () => {
    if (window.electronAPI?.openFolderDialog) {
      setIsLoadingProject(true);
      try {
        const result = await window.electronAPI.openFolderDialog();
        if (result && 'error' in result) {
          addLog('error', `Klasör açılamadı: ${result.error}`);
          return;
        }
        if (result && 'rootPath' in result) applyWorkspace(result);
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

  const handleOpenRecent = async (folderPath: string) => {
    if (!window.electronAPI?.openRecentFolder) return;
    setIsLoadingProject(true);
    try {
      const result = await window.electronAPI.openRecentFolder(folderPath);
      if ('error' in result) {
        addLog('error', `Klasör açılamadı: ${result.error}`);
        loadRecent();
        return;
      }
      applyWorkspace(result);
    } catch (err) {
      addLog('error', `Klasör açılamadı: ${String(err)}`);
    } finally {
      setIsLoadingProject(false);
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
    setShowSettings(false);
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
    setShowSettings(false);
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
      // Ayarlara göre kayıt dönüşümleri
      let content = file.content || '';
      if (settings.trimTrailingWhitespace === true) content = content.replace(/[ \t]+$/gm, '');
      if (settings.insertFinalNewline === true && content && !content.endsWith('\n')) content += '\n';
      const res = await window.electronAPI.writeFile(file.path, content);
      if (res.success) {
        addLog('info', `Kaydedildi: ${file.name}`);
        setOpenFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, content, isModified: false } : f))
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

  handleSaveFileRef.current = handleSaveFile;

  // Otomatik kayıt: gecikmeyle (yazmayı bırakınca) veya pencere odağını kaybedince
  const autoSave = String(settings.autoSave);
  const autoSaveDelay = Number(settings.autoSaveDelay);
  useEffect(() => {
    if (autoSave !== 'afterDelay') return;
    const dirty = openFiles.filter((f) => f.isModified && f.path);
    if (dirty.length === 0) return;
    const timer = setTimeout(() => dirty.forEach((f) => void handleSaveFileRef.current(f)), autoSaveDelay);
    return () => clearTimeout(timer);
  }, [openFiles, autoSave, autoSaveDelay]);
  useEffect(() => {
    if (autoSave !== 'onFocusChange') return;
    const onBlur = () => openFilesRef.current.filter((f) => f.isModified && f.path).forEach((f) => void handleSaveFileRef.current(f));
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [autoSave]);

  const refreshTree = async () => {
    if (currentRootPath && window.electronAPI) {
      setFiles(await window.electronAPI.readDirectory(currentRootPath));
      refreshGitStatus();
    }
  };

  const handleCreateFile = async (name: string, isFolder: boolean, parentDir?: string) => {
    if (currentRootPath && window.electronAPI) {
      const baseDir = parentDir || currentRootPath;
      // Klasörün kendi ayırıcısını kullan (Windows'ta '\', diğerlerinde '/')
      const sep = baseDir.includes('\\') ? '\\' : '/';
      const relative = name.split(/[\\/]+/).filter(Boolean).join(sep);
      const targetPath = baseDir.replace(/[\\/]+$/, '') + sep + relative;
      const res = isFolder ? await window.electronAPI.createFolder(targetPath) : await window.electronAPI.createFile(targetPath);
      if (res && res.success === false) {
        addLog('error', `Oluşturulamadı: ${res.error ?? name}`);
        return;
      }
      await refreshTree();
      addLog('info', `Yeni ${isFolder ? 'klasör' : 'dosya'} oluşturuldu: ${name}`);
      if (!isFolder) {
        const created = getAllFiles(await window.electronAPI.readDirectory(currentRootPath)).find((f) => f.path === targetPath);
        if (created) void handleSelectFile(created);
      }
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

  const findItem = (items: FileItem[], id: string): FileItem | undefined => {
    for (const it of items) {
      if (it.id === id) return it;
      const hit = it.children && findItem(it.children, id);
      if (hit) return hit;
    }
    return undefined;
  };

  const handleRename = async (item: FileItem, newName: string) => {
    if (!item.path || !window.electronAPI?.renameItem) return;
    const oldPath = item.path;
    const sep = oldPath.includes('\\') ? '\\' : '/';
    const next = oldPath.slice(0, oldPath.lastIndexOf(sep)) + sep + newName;
    const res = await window.electronAPI.renameItem(oldPath, next);
    if (!res.success) {
      addLog('error', `Yeniden adlandırılamadı: ${res.error ?? newName}`);
      return;
    }
    // Açık sekmeleri yeni yola taşı (klasör adı değiştiyse içindeki dosyalar da)
    const remap = (id: string) => (id === oldPath ? next : id.startsWith(oldPath + sep) ? next + id.slice(oldPath.length) : id);
    setOpenFiles((prev) =>
      prev.map((f) => {
        const nid = remap(f.id);
        return nid === f.id ? f : { ...f, id: nid, path: nid, name: nid === next ? newName : f.name };
      })
    );
    setActiveFileId((cur) => (cur ? remap(cur) : cur));
    await refreshTree();
    addLog('info', `Yeniden adlandırıldı: ${item.name} → ${newName}`);
  };

  const handleDeleteFile = async (id: string) => {
    const file = openFiles.find(f => f.id === id) || findItem(files, id);
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
    if (hasEditor() && insertSnippetAtCursor(snippetBody.replace(/[\\$}]/g, '\\$&'))) {
      addLog('info', 'Kod parçası (snippet) imlece eklendi.');
      return;
    }
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
  const isElectron = !!window.electronAPI?.isElectron;
  const projectName = currentRootPath ? currentRootName : '';
  const sidebarShown = sidebarVisible && !showLanding;
  const sidebarRight = settings.sidebarPosition === 'right';
  const tabSize = Number(settings.tabSize) || 2;

  // Kenar çubuğu kapanırken içerik genişlik animasyonu bitene kadar bağlı kalır
  useEffect(() => {
    if (sidebarShown) {
      setSbMounted(true);
      return;
    }
    const id = setTimeout(() => setSbMounted(false), 230);
    return () => clearTimeout(id);
  }, [sidebarShown]);
  const changeCount = gitStatus.changes.length;
  const isHtml = activeFile?.language === 'html';

  // Etkinlik çubuğu: etkin sekmeye tekrar basmak kenar çubuğunu kapatır (VS Code davranışı)
  const pickSidebar = (tab: 'files' | 'search' | 'git' | 'snippets') => {
    if (!showLanding && activeSidebarTab === tab && sidebarVisible) {
      setSidebarVisible(false);
      return;
    }
    setShowLanding(false);
    setShowSettings(false);
    setActiveSidebarTab(tab);
    setSidebarVisible(true);
    if (tab === 'git') refreshGitStatus();
  };

  // Kısayoldan açılışta (ör. Ctrl+Shift+F) sekme zaten açıksa kapatmaz
  const pickSidebarForce = (tab: 'files' | 'search' | 'git' | 'snippets') => {
    setShowLanding(false);
    setShowSettings(false);
    setActiveSidebarTab(tab);
    setSidebarVisible(true);
  };

  const openFileAt = async (path: string, line?: number) => {
    setShowLanding(false);
    setShowSettings(false);
    const name = baseName(path);
    await handleSelectFile({ id: path, name, path, type: 'file', language: languageFromName(name) });
    if (line) window.setTimeout(() => goToLine(line), 150);
  };

  const insertSnippetObject = (sn: Snippet) => {
    const isBuiltIn = builtInSnippets.some((b) => b.id === sn.id);
    // Hazır snippet'ler düz koddur; \ $ } kaçırılır (snippetProvider ile aynı kural)
    const tpl = isBuiltIn ? sn.body.replace(/[\\$}]/g, '\\$&') : sn.body;
    if (!insertSnippetAtCursor(tpl)) handleInsertSnippet(sn.body);
  };

  const paletteCommands: PaletteCommand[] = [
    { id: 'quickOpen', label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', run: () => setPalette('') },
    { id: 'goLine', label: t('cmdGoToLine'), shortcut: 'Ctrl+G', run: () => setPalette(':') },
    { id: 'goSymbol', label: t('cmdGoToSymbol'), run: () => runEditorAction('editor.action.quickOutline') },
    { id: 'findInFiles', label: t('cmdFindInFiles'), shortcut: 'Ctrl+Shift+F', run: () => pickSidebarForce('search') },
    { id: 'find', label: t('cmdFind'), shortcut: 'Ctrl+F', run: () => runEditorAction('actions.find') },
    { id: 'replace', label: t('cmdReplace'), shortcut: 'Ctrl+H', run: () => runEditorAction('editor.action.startFindReplace') },
    { id: 'format', label: t('cmdFormat'), run: () => runEditorAction('editor.action.formatDocument') },
    { id: 'insertSnippet', label: t('cmdInsertSnippet'), run: () => setPalette('$') },
    { id: 'newFile', label: t('newFile'), shortcut: 'Ctrl+N', run: handleNewUntitled },
    { id: 'openFolder', label: t('openFolder'), shortcut: 'Ctrl+O', run: () => void handleOpenFolderDialog() },
    { id: 'save', label: t('cmdSave'), shortcut: 'Ctrl+S', run: () => { const f = openFiles.find((x) => x.id === activeFileId); if (f) void handleSaveFile(f); } },
    { id: 'closeTab', label: t('cmdCloseTab'), shortcut: 'Ctrl+W', run: () => { if (activeFileId) handleCloseTab(activeFileId); } },
    { id: 'sidebar', label: t('tbSidebar'), shortcut: 'Ctrl+B', run: () => setSidebarVisible((v) => !v) },
    { id: 'terminal', label: t('tbTerminal'), shortcut: 'Ctrl+`', run: () => setShowBottomTerminal((v) => !v) },
    { id: 'git', label: t('actGit'), run: () => pickSidebarForce('git') },
    { id: 'snippets', label: t('actSnippets'), run: () => pickSidebarForce('snippets') },
    { id: 'ai', label: t('cmdOpenAI'), shortcut: 'Ctrl+Shift+L', run: () => { setShowLanding(false); setShowSettings(false); setShowRightPanel('ai'); } },
    { id: 'settings', label: t('actSettings'), shortcut: 'Ctrl+,', run: () => { setShowLanding(false); setShowSettings(true); } },
    { id: 'theme', label: t('cmdToggleTheme'), run: () => setSetting('themeMode', document.documentElement.dataset.theme === 'light' ? 'dark' : 'light') }
  ];

  const barBtn = (active: boolean) => ({ 'data-active': active, className: 'ab-item' }) as const;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-nv-editor text-zinc-300 font-sans relative">
      {/* Açılış animasyonu */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {palette !== null && (
        <CommandPalette
          initial={palette}
          rootPath={currentRootPath}
          commands={paletteCommands}
          snippets={[...userSnippets, ...builtInSnippets]}
          fallbackFiles={getAllFiles(files).map((f) => f.path ?? f.name)}
          onOpenFile={(p) => void openFileAt(p)}
          onGoToLine={goToLine}
          onInsertSnippet={insertSnippetObject}
          onClose={() => setPalette(null)}
        />
      )}

      {/* Başlık çubuğu */}
      <header className="app-drag relative flex items-center justify-between h-9 bg-nv-side border-b border-nv-border select-none shrink-0">
        <div className="flex items-center gap-2 pl-3 min-w-0">
          <Logo size={18} />
          <span className="text-[12px] text-zinc-400 hidden sm:inline">NovaCode Studio</span>
        </div>

        {/* Orta: komut merkezi görünümlü proje alanı */}
        <button
          onClick={() => setPalette('')}
          title={`${t('cpTitle')} (Ctrl+P)`}
          className="app-no-drag absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 h-6 w-[min(44vw,460px)] rounded-md bg-nv-input/70 border border-transparent hover:border-zinc-600 text-[12px] text-zinc-300 transition-colors"
        >
          <Search size={12} className="text-zinc-500 shrink-0" />
          <span className="truncate">
            {showSettings
              ? t('setTitle')
              : showLanding
              ? t('actHome')
              : activeFile
                ? `${activeFile.name}${activeFile.isModified ? ' •' : ''}${projectName ? ` — ${projectName}` : ''}`
                : projectName || 'NovaCode Studio'}
          </span>
        </button>

        <div className="app-no-drag flex items-center gap-0.5 pr-2" style={{ marginRight: isElectron ? 138 : 0 }}>
          <button onClick={handleOpenFolderDialog} title={`${t('openFolder')} (Ctrl+O)`} aria-label={t('openFolder')} className="icon-btn">
            <FolderOpen size={15} />
          </button>
          {isHtml && (
            <button
              onClick={() => setShowRightPanel(showRightPanel === 'preview' ? null : 'preview')}
              title={t('tbPreview')}
              aria-label={t('tbPreview')}
              data-active={showRightPanel === 'preview'}
              className="icon-btn"
            >
              <Columns size={15} />
            </button>
          )}
          {settings.activityBarVisible === false && (
            <button
              onClick={() => {
                setShowLanding(false);
                setShowSettings((v) => !v);
              }}
              title={`${t('actSettings')} (Ctrl+,)`}
              aria-label={t('actSettings')}
              data-active={showSettings}
              className="icon-btn"
            >
              <Settings size={15} />
            </button>
          )}
          <button onClick={() => setSidebarVisible((v) => !v)} title={t('tbSidebar')} aria-label={t('tbSidebar')} data-active={sidebarShown} className="icon-btn">
            <PanelLeft size={15} />
          </button>
          <button onClick={() => setShowBottomTerminal((v) => !v)} title={t('tbTerminal')} aria-label={t('tbTerminal')} data-active={showBottomTerminal} className="icon-btn">
            <PanelBottom size={15} />
          </button>
        </div>
      </header>

      {/* Çalışma alanı */}
      <div className={`flex flex-1 min-h-0 overflow-hidden ${sidebarRight ? 'flex-row-reverse' : ''}`}>
        {/* Etkinlik çubuğu */}
        {settings.activityBarVisible !== false && (
        <nav aria-label="Activity bar" className={`w-12 bg-nv-side ${sidebarRight ? 'border-l' : 'border-r'} border-nv-border flex flex-col items-center justify-between select-none shrink-0`}>
          <div className="flex flex-col">
            <button {...barBtn(sidebarShown && activeSidebarTab === 'files')} title={t('actExplorer')} aria-label={t('actExplorer')} onClick={() => pickSidebar('files')}>
              <Files size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'search')} title={`${t('actSearch')} (Ctrl+Shift+F)`} aria-label={t('actSearch')} onClick={() => pickSidebar('search')}>
              <Search size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'git')} title={t('actGit')} aria-label={t('actGit')} onClick={() => pickSidebar('git')}>
              <GitBranch size={24} strokeWidth={1.5} />
              {changeCount > 0 && (
                <span className="absolute bottom-2 right-1.5 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] leading-4 text-center font-semibold">
                  {changeCount > 99 ? '99+' : changeCount}
                </span>
              )}
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'snippets')} title={t('actSnippets')} aria-label={t('actSnippets')} onClick={() => pickSidebar('snippets')}>
              <BookOpen size={24} strokeWidth={1.5} />
            </button>
            <button
              {...barBtn(!showLanding && showRightPanel === 'ai')}
              title={t('actAI')}
              aria-label={t('actAI')}
              onClick={() => {
                setShowLanding(false);
    setShowSettings(false);
                setShowRightPanel(showRightPanel === 'ai' ? null : 'ai');
              }}
            >
              <Sparkles size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col">
            <button {...barBtn(showLanding)} title={t('actHome')} aria-label={t('actHome')} onClick={() => {
              setShowSettings(false);
              setShowLanding(!showLanding);
            }}>
              <House size={24} strokeWidth={1.5} />
            </button>
            <button
              {...barBtn(false)}
              title={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}
              aria-label={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}
              onClick={() => pickSidebar('git')}
            >
              {auth.connected && auth.profile?.avatarUrl ? (
                <img src={auth.profile.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full ring-1 ring-zinc-700" />
              ) : (
                <UserRound size={24} strokeWidth={1.5} />
              )}
            </button>
            <button
              {...barBtn(showSettings)}
              title={`${t('actSettings')} (Ctrl+,)`}
              aria-label={t('actSettings')}
              onClick={() => {
                setShowLanding(false);
                setShowSettings((v) => !v);
              }}
            >
              <Settings size={24} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
        )}

        {/* Kenar çubuğu (kapanırken genişlik animasyonla daralır) */}
        <div className="sidebar-shell h-full shrink-0 overflow-hidden" style={{ width: sidebarShown ? sidebarWidth : 0 }}>
          {sbMounted && (
            <div style={{ width: sidebarWidth }} className={`h-full ${sidebarRight ? 'border-l' : 'border-r'} border-nv-border bg-nv-side`}>
              {activeSidebarTab === 'files' && (
                <div key="files" className="animate-sidebar-in h-full">
                  <FileTree
                    isLoading={isLoadingProject}
                    gitDecor={gitDecor}
                    files={files}
                    openFiles={openFiles}
                    activeFileId={activeFileId}
                    rootName={projectName}
                    rootPath={currentRootPath}
                    density={settings.treeDensity === 'comfortable' ? 'comfortable' : 'compact'}
                    indentGuides={settings.treeIndentGuides !== false}
                    showOpenEditors={settings.showOpenEditors !== false}
                    onSelectFile={(f) => {
                      setShowLanding(false);
                      setShowSettings(false);
                      void handleSelectFile(f);
                    }}
                    onCloseOpenFile={handleCloseTab}
                    onCreate={handleCreateFile}
                    onRename={handleRename}
                    onDelete={handleDeleteFile}
                    onRefresh={refreshTree}
                    onOpenFolder={handleOpenFolderDialog}
                    onOpenFiles={handleOpenFileDialog}
                  />
                </div>
              )}
              {activeSidebarTab === 'search' && (
                <div key="search" className="animate-sidebar-in h-full">
                  <SearchPanel hasFolder={!!currentRootPath} onOpenResult={(p, line) => void openFileAt(p, line)} />
                </div>
              )}
              {activeSidebarTab === 'git' && (
                <div key="git" className="animate-sidebar-in h-full flex flex-col">
                  <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('actGit')}</div>
                  <GithubAccount />
                  <div className="flex-1 min-h-0">
                    <GitPanel status={gitStatus} currentRepoPath={currentRootPath} onRefresh={() => refreshGitStatus()} onLog={(type, text) => addLog(type, text)} />
                  </div>
                </div>
              )}
              {activeSidebarTab === 'snippets' && (
                <div key="snippets" className="animate-sidebar-in h-full">
                  <SnippetsPanel onInsertSnippet={handleInsertSnippet} />
                </div>
              )}
            </div>
          )}
        </div>
        {sidebarShown && <ResizeHandle direction="horizontal" title="Kenar çubuğu genişliği" onResize={(d) => setSidebarWidth((w) => clamp(sidebarRight ? w - d : w + d, 180, 560))} />}

        {/* Ana sütun: görünüm (ayarlar / karşılama / editör) + terminal paneli (oturumlar panel gizliyken de canlı kalır) */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <div className="flex-1 min-h-0 flex flex-col min-w-0">
            {showSettings ? (
          <SettingsPage onClose={() => setShowSettings(false)} builtInSnippetCount={builtInSnippets.length} />
        ) : showLanding ? (
          <LandingPage
            onNewFile={handleNewUntitled}
            onOpenFiles={handleOpenFileDialog}
            onOpenFolder={handleOpenFolderDialog}
            onOpenGit={() => pickSidebar('git')}
            onOpenAI={() => {
              setShowLanding(false);
    setShowSettings(false);
              setShowRightPanel('ai');
            }}
            onOpenTerminal={() => {
              setShowLanding(false);
    setShowSettings(false);
              setShowBottomTerminal(true);
            }}
            onOpenRecent={handleOpenRecent}
            recentFolders={recentFolders}
            githubLogin={auth.connected ? auth.profile?.login : null}
            showOnStartup={settings.welcomeOnStartup === true}
            onToggleStartup={(v) => setSetting('welcomeOnStartup', v)}
          />
            ) : (
              <EditorArea
                openFiles={openFiles}
                activeFileId={activeFileId}
                onSelectTab={(id) => setActiveFileId(id)}
                onCloseTab={handleCloseTab}
                onNewFile={handleNewUntitled}
                onOpenFolder={handleOpenFolderDialog}
                onOpenFiles={handleOpenFileDialog}
                rootPath={currentRootPath}
                rootName={projectName}
                onChangeContent={handleContentChange}
                onSaveFile={handleSaveFile}
                onRunCode={handleRunCode}
                collab={{ enabled: collabEnabled && collabUrlValid, url: collabUrl.trim(), token: collabToken, room: currentRootPath || '' }}
              />
            )}
          </div>

          {showBottomTerminal && (
            <ResizeHandle
              direction="vertical"
              title="Terminal yüksekliği"
              onResize={(d) => {
                setTerminalMaximized(false);
                setTerminalHeight((h) => clamp(h - d, 120, 640));
              }}
            />
          )}
          <div
            data-terminal=""
            className="terminal-shell shrink-0 overflow-hidden border-nv-border"
            style={{ height: showBottomTerminal ? (terminalMaximized ? '70%' : terminalHeight) : 0, borderTopWidth: showBottomTerminal ? 1 : 0 }}
          >
            <Terminal
              logs={logs}
              onClear={() => setLogs([])}
              cwd={currentRootPath}
              branch={gitStatus.isRepo && settings.terminalShowBranch !== false ? gitStatus.branch : null}
              visible={showBottomTerminal}
              maximized={terminalMaximized}
              onToggleMaximize={() => setTerminalMaximized((v) => !v)}
              onClose={() => {
                setShowBottomTerminal(false);
                setTerminalMaximized(false);
              }}
              onOpenFolder={handleOpenFolderDialog}
            />
          </div>
        </div>

        {/* Sağ panel: önizleme veya yapay zekâ */}
        {!showLanding && showRightPanel === 'preview' && isHtml && (
          <>
            <ResizeHandle direction="horizontal" title="Önizleme genişliği" onResize={(d) => setPreviewWidth((w) => clamp(w - d, 320, 1200))} />
            <div style={{ width: previewWidth }} className="animate-fade-in h-full border-l border-nv-border shrink-0">
              <Preview
                htmlContent={activeFile?.content || ''}
                cssContent={getFileContentByName('styles.css')}
                jsContent={getFileContentByName('app.js')}
                onRefresh={() => {
                  setLogs((prev) => [
                    ...prev,
                    { id: Date.now().toString(), type: 'info', text: 'Önizleme yenilendi.', time: new Date().toLocaleTimeString() }
                  ]);
                }}
              />
            </div>
          </>
        )}

        {!showLanding && showRightPanel === 'ai' && (
          <div className="animate-fade-in w-80 h-full border-l border-nv-border shrink-0">
            <AIAssistant
              activeFile={activeFile ? { name: activeFile.name, path: activeFile.path, language: activeFile.language, content: activeFile.content } : null}
              hasWorkspace={!!currentRootPath}
              onOpenSettings={() => { setShowLanding(false); setShowSettings(true); }}
            />
          </div>
        )}
      </div>

      {/* Durum çubuğu: yalnız anlamlı bilgiler */}
      {settings.statusBarVisible !== false && (
        <footer className="h-[22px] bg-nv-side border-t border-nv-border flex items-center justify-between text-[12px] text-zinc-400 select-none shrink-0">
          <div className="flex items-center h-full">
            {gitStatus.isRepo && (
              <button className="status-item" onClick={() => pickSidebar('git')} title={t('actGit')}>
                <GitBranch size={12} />
                <span className="font-mono">{gitStatus.branch}</span>
                {gitStatus.behind || gitStatus.ahead ? (
                  <span className="font-mono">
                    ↓{gitStatus.behind ?? 0} ↑{gitStatus.ahead ?? 0}
                  </span>
                ) : null}
                {changeCount > 0 && <span className="text-amber-400">±{changeCount}</span>}
              </button>
            )}
            <button className="status-item" onClick={() => pickSidebar('git')} title={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}>
              <UserRound size={12} />
              <span>{auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}</span>
            </button>
          </div>
          <div className="flex items-center h-full">
            {activeFile?.isModified && <span className="status-item text-amber-300">{t('stUnsaved')}</span>}
            {activeFile && (
              <>
                <span className="status-item">{t('stSpaces').replace(/\d+/, String(tabSize))}</span>
                <span className="status-item">UTF-8</span>
                <span className="status-item">{activeFile.language ? activeFile.language : t('stPlain')}</span>
              </>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
