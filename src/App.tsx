import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import {
  Files,
  Settings,
  Sparkles,
  Puzzle,
  Columns,
  House,
  GitBranch,
  FolderOpen,
  Check,
  Search,
  PanelLeft,
  PanelBottom,
  UserRound
} from 'lucide-react';
import { FileTree, normGitPath } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
const Terminal = lazy(() => import('./components/Terminal').then((m) => ({ default: m.Terminal })));
const Preview = lazy(() => import('./components/Preview').then((m) => ({ default: m.Preview })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then((m) => ({ default: m.AIAssistant })));
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
import { SplashScreen } from './components/SplashScreen';
const GitPanel = lazy(() => import('./components/GitPanel').then((m) => ({ default: m.GitPanel })));
const GithubAccount = lazy(() => import('./components/GithubAccount').then((m) => ({ default: m.GithubAccount })));
import { Logo } from './components/Logo';
const SettingsPage = lazy(() => import('./components/SettingsPage').then((m) => ({ default: m.SettingsPage })));
import { useSettings } from './services/SettingsContext';
import { useCollabToken } from './services/useCollabToken';
import { loadSettings } from './services/settings';
import { useGithubAuth } from './services/useGithubAuth';
const SearchPanel = lazy(() => import('./components/SearchPanel').then((m) => ({ default: m.SearchPanel })));
const ExtensionsPanel = lazy(() => import('./components/ExtensionsPanel').then((m) => ({ default: m.ExtensionsPanel })));
import type { PaletteCommand } from './components/CommandPalette';
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
import { goToLine, runEditorAction, copySelection, pasteClipboard } from './services/editorBridge';
import { MenuBar, type MenuGroup } from './components/MenuBar';
import { WindowControls } from './components/WindowControls';
import { UpdateDialog, UpdateIndicator } from './components/UpdateDialog';
import { checkForUpdates } from './services/updateService';
import { BUILTIN_THEMES, autoUpdateExtensions, listExtThemes, useExtensions } from './services/extensionsService';
import { sendTerminal, runCommandFor } from './services/terminalBridge';
import { baseName, languageFromName } from './services/lang';
import { ResizeHandle, clamp, loadStoredNumber, saveStoredNumber } from './components/ResizeHandle';
import { t } from './i18n/uiText';
import { previewKind } from './services/previewKind';
import type { FileItem, ConsoleLog, GitStatus } from './types';

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
  const rootPathRef = useRef<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Yerel Proje ve Git Durumu
  const [currentRootPath, setCurrentRootPath] = useState<string | null>(null);
  rootPathRef.current = currentRootPath;
  const [currentRootName, setCurrentRootName] = useState<string>('NovaCode-Studio');
  const [gitStatus, setGitStatus] = useState<GitStatus>({ isRepo: false, changes: [] });

  // Paneller
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'search' | 'git' | 'extensions'>('files');
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
  // Pencere genişliği: dar ekranda paneller editörü ezmesin (sağ paneller üstüne biner, kenar çubuğu daralır)
  const [vw, setVw] = useState(() => window.innerWidth);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const compactRight = vw < 1100;
  const compactMenu = vw < 1280; // dar pencerede menü başlıkları tek "Menü" düğmesine toplanır
  const sbW = Math.min(sidebarWidth, Math.max(180, Math.round(vw * 0.34)));
  const [aiWidth, setAiWidth] = useState(() => loadStoredNumber('nova.aiWidth', 380));

  useEffect(() => { saveStoredNumber('nova.sidebarWidth', sidebarWidth); }, [sidebarWidth]);
  useEffect(() => { saveStoredNumber('nova.terminalHeight', terminalHeight); }, [terminalHeight]);
  useEffect(() => { saveStoredNumber('nova.previewWidth', previewWidth); }, [previewWidth]);
  useEffect(() => { saveStoredNumber('nova.aiWidth', aiWidth); }, [aiWidth]);

  // Ortak düzenleme (kendi sunucun, açık kaynak Yjs). Ayarlar tarayıcıda saklanır.
  // Ayarlar (gerçek zamanlı, tek kaynak: SettingsContext)
  const { values: settings, set: setSetting } = useSettings();
  const [palette, setPalette] = useState<null | '' | '>' | ':' | 'theme'>(null);
  const themeOrig = useRef({ editorTheme: 'auto', extTheme: '' }); // tema seçici açılırken özgün tema (Esc ile geri yüklenir)
  const [updateDlg, setUpdateDlg] = useState<null | 'update' | 'notes'>(null);
  const { installed: extInstalled } = useExtensions();
  const [localUrl, setLocalUrl] = useState<string | null>(null); // terminalde yakalanan yerel sunucu adresi (önizleme için)
  const autoPreviewed = useRef<Set<string>>(new Set());
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
        // Yalnız şu an açık olan klasörün değişiklikleri işlenir (yeniden başlatmada eski izleyici ağacı sızdırmasın).
        if (rootPath && rootPath === rootPathRef.current) {
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

  // HTML dosyası etkin olunca önizleme kendiliğinden açılır (ayar: previewAutoOpen; oturumda dosya başına bir kez;
  // dar pencerede ve başka bir sağ panel (ör. yapay zekâ) açıkken açılmaz)
  useEffect(() => {
    if (settings.previewAutoOpen === false || !activeFileId || vw < 1100) return;
    const f = openFiles.find((x) => x.id === activeFileId);
    if (!f || previewKind(f.name) !== 'html' || autoPreviewed.current.has(f.id) || showRightPanel !== null) return;
    autoPreviewed.current.add(f.id);
    setShowRightPanel('preview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId]);

  // Ayarlar penceresi: Esc ile kapanır (palet veya güncelleme penceresi açıksa onlar önce kapanır)
  useEffect(() => {
    if (!showSettings) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && palette === null && updateDlg === null) setShowSettings(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSettings, palette, updateDlg]);

  // Eklentileri açılıştan kısa süre sonra ve 6 saatte bir sessizce güncelle (ayar: extAutoUpdate)
  useEffect(() => {
    if (!window.electronAPI?.ext || settings.extAutoUpdate === false) return;
    const run = () => void autoUpdateExtensions();
    const first = window.setTimeout(run, 12000);
    const every = window.setInterval(run, 6 * 60 * 60 * 1000);
    return () => { window.clearTimeout(first); window.clearInterval(every); };
  }, [settings.extAutoUpdate]);

  // Terminal çıktısında yakalanan yerel sunucu adresi (http://localhost:PORT): önizleme panelinde tek tıkla açılır
  useEffect(() => {
    const on = (e: Event) => setLocalUrl(String((e as CustomEvent).detail || '') || null);
    window.addEventListener('nova:localhost', on);
    return () => window.removeEventListener('nova:localhost', on);
  }, []);

  // Güncelleme: açılıştan kısa süre sonra ve 6 saatte bir sessizce denetle (ayar açıksa; indirme yalnız ayarla otomatik)
  useEffect(() => {
    if (!window.electronAPI?.update || settings.updateAutoCheck === false) return;
    const run = () => void checkForUpdates(settings.updateAutoDownload === true);
    const first = window.setTimeout(run, 8000);
    const every = window.setInterval(run, 6 * 60 * 60 * 1000);
    return () => { window.clearTimeout(first); window.clearInterval(every); };
  }, [settings.updateAutoCheck, settings.updateAutoDownload]);

  // Kısayol tuşları. Dinleyici tek sefer kurulur; her render'da güncel işleyiciye yönlenir.
  const shortcutHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutHandler.current(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  shortcutHandler.current = (e: KeyboardEvent) => {
    if (e.key === 'F1') { e.preventDefault(); setPalette('>'); return; }
    if (e.key === 'F5') { e.preventDefault(); handleRunCode(); return; }
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();

    // Komut paleti ve arama (VS Code ile aynı): Ctrl+P dosya, Ctrl+Shift+P komut, Ctrl+G satır, Ctrl+Shift+F proje araması
    if (key === 'p') { e.preventDefault(); setPalette(e.shiftKey ? '>' : ''); return; }
    if (key === 'g' && !e.shiftKey) { e.preventDefault(); setPalette(':'); return; }
    if (key === 'f' && e.shiftKey) { e.preventDefault(); if (currentRootPath) pickSidebarForce('search'); return; }
    if (key === 'x' && e.shiftKey) { e.preventDefault(); pickSidebarForce('extensions'); return; }
    if (key === 'l' && e.shiftKey) { e.preventDefault(); setShowLanding(false); setShowSettings(false); setShowRightPanel((v) => (v === 'ai' ? null : 'ai')); return; }

    if (key === 'q') { e.preventDefault(); handleQuit(); return; }
    if (key === 'b') { e.preventDefault(); setSidebarVisible((v) => !v); return; }
    if (key === ',') { e.preventDefault(); setShowLanding(false); setShowSettings((v) => !v); return; }
    if (e.key === '`') { e.preventDefault(); if (currentRootPath) setShowBottomTerminal((v) => !v); return; }
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
    // Başka bir klasöre geçilirken eski projenin kaydedilmiş sekmeleri kapanır (kaydedilmemişler korunur).
    if (rootPathRef.current && rootPathRef.current !== result.rootPath) {
      const kept = openFilesRef.current.filter((f) => f.isModified || !f.path);
      setOpenFiles(kept);
      setActiveFileId((cur) => (kept.some((f) => f.id === cur) ? cur : kept[0]?.id ?? null));
    }
    rootPathRef.current = result.rootPath;
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

  // Sürükle-bırak taşıma (Gezgin): kaynak, çalışma klasörü içindeki hedef klasöre taşınır; açık sekmeler yeni yola geçer.
  // Güvenlik ana süreçte de denetlenir (fs:renameItem: kapsam + üzerine yazmama).
  const handleMove = async (srcPath: string, targetDir: string) => {
    if (!window.electronAPI?.renameItem) return;
    const sep = srcPath.includes('\\') ? '\\' : '/';
    const name = srcPath.slice(srcPath.lastIndexOf(sep) + 1);
    const next = targetDir.replace(/[\\/]+$/, '') + sep + name;
    const res = await window.electronAPI.renameItem(srcPath, next);
    if (!res.success) {
      addLog('error', `Taşınamadı: ${res.error ?? name}`);
      return;
    }
    const remap = (id: string) => (id === srcPath ? next : id.startsWith(srcPath + sep) ? next + id.slice(srcPath.length) : id);
    setOpenFiles((prev) => prev.map((f) => { const nid = remap(f.id); return nid === f.id ? f : { ...f, id: nid, path: nid }; }));
    setActiveFileId((cur) => (cur ? remap(cur) : cur));
    await refreshTree();
    addLog('info', `Taşındı: ${name} → ${targetDir}`);
  };

  const handleCloseAll = () => {
    if (openFiles.some((f) => f.isModified) && !window.confirm(t('expCloseAllConfirm'))) return;
    setOpenFiles([]);
    setActiveFileId(null);
  };

  const handleOpenInTerminal = (dir: string) => {
    setShowBottomTerminal(true);
    window.setTimeout(() => sendTerminal({ action: 'cd', dir }), 80);
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

  // Kaydedilmemiş (diskte olmayan) JS'i uygulamanın sayfasında DEĞİL, sandbox'lı bir iframe'de çalıştırır (uygulama API'lerine erişemez)
  const runSandboxed = (code: string) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.display = 'none';
    const done = () => { window.removeEventListener('message', onMsg); frame.remove(); };
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow || !e.data || e.data.nova !== 2) return;
      addLog(e.data.level === 'error' ? 'error' : e.data.level === 'warn' ? 'warn' : e.data.level === 'info' ? 'info' : 'log', String(e.data.text).slice(0, 2000));
    };
    window.addEventListener('message', onMsg);
    const src = JSON.stringify(code).replace(/</g, '\\u003c');
    frame.srcdoc = `<script>var send=function(l,a){parent.postMessage({nova:2,level:l,text:[].slice.call(a).map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')},'*')};['log','info','warn','error'].forEach(function(l){console[l]=function(){send(l,arguments)}});try{(0,eval)(${src})}catch(e){send('error',[e&&e.message||e])}<\/script>`;
    document.body.appendChild(frame);
    window.setTimeout(done, 8000);
  };

  const handleRunCode = () => {
    const current = openFiles.find((f) => f.id === activeFileId);
    if (!current) return;
    const k = previewKind(current.name);
    if (k === 'html' || k === 'svg' || k === 'md') { setShowLanding(false); setShowRightPanel('preview'); return; }
    if (current.path) { runActiveFile(); return; }
    if (current.language === 'javascript') {
      addLog('info', `[Çalıştırılıyor: ${current.name}]`);
      runSandboxed(current.content || '');
      setShowBottomTerminal(true);
    } else {
      addLog('warn', t('mnRunNoFile'));
      setShowBottomTerminal(true);
    }
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
  const previewable = previewKind(activeFile?.name) !== 'none';
  const canPreview = previewable || !!localUrl; // yerel sunucu adresi yakalandıysa dosya olmasa da önizlenebilir

  // Etkinlik çubuğu: etkin sekmeye tekrar basmak kenar çubuğunu kapatır (VS Code davranışı)
  const pickSidebar = (tab: 'files' | 'search' | 'git' | 'extensions') => {
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
  const pickSidebarForce = (tab: 'files' | 'search' | 'git' | 'extensions') => {
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

  const runInTerminal = (command: string) => {
    setShowBottomTerminal(true);
    window.setTimeout(() => sendTerminal({ action: 'run', command }), 80);
  };

  const runActiveFile = () => {
    const f = openFiles.find((x) => x.id === activeFileId);
    if (!f?.path) { addLog('warn', t('mnRunNoFile')); setShowBottomTerminal(true); return; }
    const custom = { node: String(settings.runCommandNode || ''), ts: String(settings.runCommandTs || ''), python: String(settings.runCommandPython || ''), go: String(settings.runCommandGo || ''), php: String(settings.runCommandPhp || '') };
    const cmd = runCommandFor(f.path, f.language, custom);
    if (!cmd) { addLog('warn', t('mnRunNoRunner')); setShowBottomTerminal(true); return; }
    if (f.isModified && settings.runSaveBefore !== false) void handleSaveFile(f);
    if (settings.runClearTerminal === true) sendTerminal({ action: 'clear' });
    runInTerminal(cmd);
  };

  const openDocs = (path: string) => void window.electronAPI?.github.openExternal(`https://github.com/orayyilmaz16/NovaCode-Studio${path}`);
  const openSettingsAt = (cat: string) => {
    try { window.localStorage.setItem('nova.settings.category', cat); } catch { /* depolama kapalı */ }
    setShowLanding(false);
    setShowSettings(true);
  };
  // Kapalı menü öğeleri: soluk görünür, üzerine gelince nedenini söyler
  const F = { disabled: !activeFile, hint: !activeFile ? t('mnHintNoFile') : undefined };
  const D = { disabled: !currentRootPath, hint: !currentRootPath ? t('mnHintNoFolder') : undefined };
  const act = runEditorAction;
  // Bazı etiketler kısayolu parantez içinde taşır; menüde kısayol ayrı sütunda gösterilir
  const plain = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, '');

  // Renk teması seçici: gezilirken canlı uygulanır; Esc özgün temayı geri yükler
  const extThemeList = listExtThemes(extInstalled);
  const activeThemeId = extThemeList.some((th) => th.id === String(settings.extTheme || '')) ? String(settings.extTheme) : String(settings.editorTheme || 'auto');
  const openThemePicker = () => {
    themeOrig.current = { editorTheme: String(settings.editorTheme || 'auto'), extTheme: String(settings.extTheme || '') };
    setPalette('theme');
  };
  const previewTheme = (id: string) => { if (extThemeList.some((th) => th.id === id)) setSetting('extTheme', id); else setSetting('editorTheme', id); };
  const revertTheme = () => { setSetting('editorTheme', themeOrig.current.editorTheme); if (themeOrig.current.extTheme) setSetting('extTheme', themeOrig.current.extTheme); };

  const menus: MenuGroup[] = [
    { id: 'file', label: t('mnFile'), items: [
      { label: t('newFile'), shortcut: 'Ctrl+N', onClick: handleNewUntitled },
      { label: t('openFolder'), shortcut: 'Ctrl+O', onClick: () => void handleOpenFolderDialog() },
      { label: t('openFiles'), shortcut: 'Ctrl+Shift+O', onClick: () => void handleOpenFileDialog() },
      { separator: true },
      { label: t('cmdSave'), shortcut: 'Ctrl+S', ...F, onClick: () => { if (activeFile) void handleSaveFile(activeFile); } },
      { label: t('cmdCloseTab'), shortcut: 'Ctrl+W', ...F, onClick: () => { if (activeFileId) handleCloseTab(activeFileId); } },
      { separator: true },
      { label: t('actSettings'), shortcut: 'Ctrl+,', onClick: () => { setShowLanding(false); setShowSettings(true); } },
    ] },
    { id: 'edit', label: t('mnEdit'), items: [
      { label: t('mnUndo'), shortcut: 'Ctrl+Z', ...F, onClick: () => act('undo') },
      { label: t('mnRedo'), shortcut: 'Ctrl+Y', ...F, onClick: () => act('redo') },
      { separator: true },
      { label: t('mnCut'), shortcut: 'Ctrl+X', ...F, onClick: () => copySelection(true) },
      { label: t('mnCopy'), shortcut: 'Ctrl+C', ...F, onClick: () => copySelection(false) },
      { label: t('mnPaste'), shortcut: 'Ctrl+V', ...F, onClick: () => void pasteClipboard() },
      { separator: true },
      { label: t('cmdFind'), shortcut: 'Ctrl+F', ...F, onClick: () => act('actions.find') },
      { label: t('cmdReplace'), shortcut: 'Ctrl+H', ...F, onClick: () => act('editor.action.startFindReplace') },
      { label: t('cmdFindInFiles'), shortcut: 'Ctrl+Shift+F', ...D, onClick: () => pickSidebarForce('search') },
      { separator: true },
      { label: t('mnComment'), shortcut: 'Ctrl+/', ...F, onClick: () => act('editor.action.commentLine') },
      { label: t('cmdFormat'), shortcut: 'Shift+Alt+F', ...F, onClick: () => act('editor.action.formatDocument') }
    ] },
    { id: 'selection', label: t('mnSelection'), items: [
      { label: t('mnSelectAll'), shortcut: 'Ctrl+A', ...F, onClick: () => act('editor.action.selectAll') },
      { label: t('mnExpandLine'), ...F, onClick: () => act('expandLineSelection') },
      { label: t('mnNextMatch'), shortcut: 'Ctrl+D', ...F, onClick: () => act('editor.action.addSelectionToNextFindMatch') },
      { separator: true },
      { label: t('mnCopyLineDown'), shortcut: 'Shift+Alt+↓', ...F, onClick: () => act('editor.action.copyLinesDownAction') },
      { label: t('mnMoveLineUp'), shortcut: 'Alt+↑', ...F, onClick: () => act('editor.action.moveLinesUpAction') },
      { label: t('mnMoveLineDown'), shortcut: 'Alt+↓', ...F, onClick: () => act('editor.action.moveLinesDownAction') },
      { separator: true },
      { label: t('mnCursorAbove'), shortcut: 'Ctrl+Alt+↑', ...F, onClick: () => act('editor.action.insertCursorAbove') },
      { label: t('mnCursorBelow'), shortcut: 'Ctrl+Alt+↓', ...F, onClick: () => act('editor.action.insertCursorBelow') }
    ] },
    { id: 'view', label: t('mnView'), items: [
      { label: t('cpTitle'), shortcut: 'Ctrl+Shift+P', onClick: () => setPalette('>') },
      { label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', onClick: () => setPalette('') },
      { separator: true },
      { label: t('actExplorer'), onClick: () => pickSidebarForce('files') },
      { label: t('actSearch'), shortcut: 'Ctrl+Shift+F', ...D, onClick: () => pickSidebarForce('search') },
      { label: t('actGit'), onClick: () => pickSidebarForce('git') },
      { label: t('extTitle'), onClick: () => pickSidebarForce('extensions') },
      { separator: true },
      { label: plain(t('tbSidebar')), shortcut: 'Ctrl+B', onClick: () => setSidebarVisible((v) => !v) },
      { label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', ...D, onClick: () => setShowBottomTerminal((v) => !v) },
      { label: t('cmdOpenAI'), shortcut: 'Ctrl+Shift+L', onClick: () => { setShowLanding(false); setShowSettings(false); setShowRightPanel((v) => (v === 'ai' ? null : 'ai')); } },
      { label: t('tbPreview'), disabled: !canPreview, hint: !canPreview ? t('mnHintHtml') : undefined, onClick: () => setShowRightPanel((v) => (v === 'preview' ? null : 'preview')) },
      { separator: true },
      { label: t('mnZoomIn'), onClick: () => setSetting('uiZoom', Math.min(150, Number(settings.uiZoom || 100) + 10)) },
      { label: t('mnZoomOut'), onClick: () => setSetting('uiZoom', Math.max(80, Number(settings.uiZoom || 100) - 10)) },
      { label: t('mnZoomReset'), onClick: () => setSetting('uiZoom', 100) },
      { label: t('mnThemePicker'), onClick: openThemePicker },
      { label: t('cmdToggleTheme'), onClick: () => setSetting('themeMode', document.documentElement.dataset.theme === 'light' ? 'dark' : 'light') }
    ] },
    { id: 'go', label: t('mnGo'), items: [
      { label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', onClick: () => setPalette('') },
      { label: t('cmdGoToLine'), shortcut: 'Ctrl+G', ...F, onClick: () => setPalette(':') },
      { label: t('cmdGoToSymbol'), ...F, onClick: () => act('editor.action.quickOutline') },
      { separator: true },
      { label: t('mnNextTab'), shortcut: 'Ctrl+Tab', disabled: openFiles.length < 2, hint: openFiles.length < 2 ? t('mnHintTwoTabs') : undefined, onClick: () => { const i = openFiles.findIndex((f) => f.id === activeFileId); setActiveFileId(openFiles[(i + 1) % openFiles.length].id); } },
      { label: t('mnPrevTab'), shortcut: 'Ctrl+Shift+Tab', disabled: openFiles.length < 2, hint: openFiles.length < 2 ? t('mnHintTwoTabs') : undefined, onClick: () => { const i = openFiles.findIndex((f) => f.id === activeFileId); setActiveFileId(openFiles[(i - 1 + openFiles.length) % openFiles.length].id); } }
    ] },
    { id: 'run', label: t('mnRun'), items: [
      { label: t('mnRunFile'), shortcut: 'F5', ...F, onClick: handleRunCode },
      { label: t('tbPreview'), disabled: !canPreview, hint: !canPreview ? t('mnHintHtml') : undefined, onClick: () => setShowRightPanel((v) => (v === 'preview' ? null : 'preview')) },
      { separator: true },
      { label: t('mnRunSettings'), onClick: () => openSettingsAt('run') }
    ] },
    { id: 'terminal', label: t('mnTerminal'), items: [
      { label: t('mnNewTerminal'), ...D, onClick: () => { setShowBottomTerminal(true); window.setTimeout(() => sendTerminal({ action: 'new' }), 80); } },
      { label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', ...D, onClick: () => setShowBottomTerminal((v) => !v) },
      { label: t('termClear'), ...D, onClick: () => sendTerminal({ action: 'clear' }) },
      { separator: true },
      { label: t('mnRunFile'), ...F, onClick: runActiveFile }
    ] },
    { id: 'help', label: t('mnHelp'), items: [
      { label: t('mnWelcome'), onClick: () => { setShowSettings(false); setShowLanding(true); } },
      { label: t('mnShortcuts'), onClick: () => openSettingsAt('shortcuts') },
      { separator: true },
      { label: t('mnDocs'), onClick: () => openDocs('#readme') },
      { separator: true },
      { label: t('mnCheckUpdates'), onClick: () => { setUpdateDlg('update'); void checkForUpdates(settings.updateAutoDownload === true); } },
      { label: t('mnReleaseNotes'), onClick: () => setUpdateDlg('notes') },
      { label: t('mnReportIssue'), onClick: () => openDocs('/issues/new') },
      { separator: true },
      { label: t('mnAbout'), onClick: () => openSettingsAt('about') }
    ] }
  ];

  const paletteCommands: PaletteCommand[] = [
    { id: 'themePicker', label: t('mnThemePicker'), run: openThemePicker },
    { id: 'quickOpen', label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', run: () => setPalette('') },
    { id: 'goLine', label: t('cmdGoToLine'), shortcut: 'Ctrl+G', run: () => setPalette(':') },
    { id: 'goSymbol', label: t('cmdGoToSymbol'), run: () => runEditorAction('editor.action.quickOutline') },
    { id: 'findInFiles', label: t('cmdFindInFiles'), shortcut: 'Ctrl+Shift+F', run: () => pickSidebarForce('search') },
    { id: 'find', label: t('cmdFind'), shortcut: 'Ctrl+F', run: () => runEditorAction('actions.find') },
    { id: 'replace', label: t('cmdReplace'), shortcut: 'Ctrl+H', run: () => runEditorAction('editor.action.startFindReplace') },
    { id: 'format', label: t('cmdFormat'), run: () => runEditorAction('editor.action.formatDocument') },
    { id: 'newFile', label: t('newFile'), shortcut: 'Ctrl+N', run: handleNewUntitled },
    { id: 'openFolder', label: t('openFolder'), shortcut: 'Ctrl+O', run: () => void handleOpenFolderDialog() },
    { id: 'save', label: t('cmdSave'), shortcut: 'Ctrl+S', run: () => { const f = openFiles.find((x) => x.id === activeFileId); if (f) void handleSaveFile(f); } },
    { id: 'closeTab', label: t('cmdCloseTab'), shortcut: 'Ctrl+W', run: () => { if (activeFileId) handleCloseTab(activeFileId); } },
    { id: 'sidebar', label: plain(t('tbSidebar')), shortcut: 'Ctrl+B', run: () => setSidebarVisible((v) => !v) },
    { id: 'terminal', label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', run: () => setShowBottomTerminal((v) => !v) },
    { id: 'git', label: t('actGit'), run: () => pickSidebarForce('git') },
    { id: 'extensions', label: t('extTitle'), run: () => pickSidebarForce('extensions') },
    { id: 'ai', label: t('cmdOpenAI'), shortcut: 'Ctrl+Shift+L', run: () => { setShowLanding(false); setShowSettings(false); setShowRightPanel('ai'); } },
    { id: 'settings', label: t('actSettings'), shortcut: 'Ctrl+,', run: () => { setShowLanding(false); setShowSettings(true); } },
    { id: 'themeToggle', label: t('cmdToggleTheme'), run: () => setSetting('themeMode', document.documentElement.dataset.theme === 'light' ? 'dark' : 'light') }
  ];

  // Projesiz/dosyasız işe yaramayan düğmeler: soluk görünür, üzerine gelince nedenini söyler, tıklayınca bir şey yapmaz
  const dis = (off: boolean, hint: string) => (off ? ({ 'aria-disabled': true, 'data-disabled': true, title: hint } as const) : {});

  const barBtn = (active: boolean) => ({ 'data-active': active, className: 'ab-item' }) as const;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-nv-editor text-zinc-300 font-sans relative">
      {/* Açılış animasyonu */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Ayarlar: uygulamanın üstünde, ayrı pencere (z-katmanı: bkz. ui-design.md → Katman sırası) */}
      {showSettings && (
        <div className="app-no-drag fixed inset-0 z-[150] flex items-center justify-center bg-black/65 p-3 sm:p-6 animate-fade-in" onMouseDown={() => setShowSettings(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('setTitle')}
            onMouseDown={(e) => e.stopPropagation()}
            className="animate-menu flex w-[min(1120px,100%)] h-[min(780px,100%)] rounded-xl border border-nv-border bg-nv-editor shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <Suspense fallback={null}><SettingsPage onClose={() => setShowSettings(false)} onOpenExtensions={() => { setShowSettings(false); pickSidebarForce('extensions'); }} /></Suspense>
          </div>
        </div>
      )}

      {updateDlg && <UpdateDialog initialTab={updateDlg} autoDownload={settings.updateAutoDownload === true} onClose={() => setUpdateDlg(null)} />}

      {palette !== null && (
        <Suspense fallback={null}>
        <CommandPalette
          key={palette} // mod değişince (ör. komuttan tema seçiciye) palet yeniden kurulur: eski yazı kalmaz
          initial={palette === 'theme' ? '' : palette}
          themes={palette === 'theme' ? [...BUILTIN_THEMES.map((b) => ({ id: b.id, label: b.label })), ...extThemeList.map((th) => ({ id: th.id, label: th.label, ext: th.ext }))] : undefined}
          currentTheme={activeThemeId}
          onThemePreview={previewTheme}
          onThemeRevert={revertTheme}
          rootPath={currentRootPath}
          commands={paletteCommands}
          fallbackFiles={getAllFiles(files).map((f) => f.path ?? f.name)}
          onOpenFile={(p) => void openFileAt(p)}
          onGoToLine={goToLine}
          onClose={() => setPalette(null)}
        />
        </Suspense>
      )}

      {/* Başlık çubuğu */}
      <header
        className="app-drag relative grid items-center h-9 bg-nv-side border-b border-nv-border select-none shrink-0"
        // Üç bölge: sol (logo + menü) · orta (arama, pencereye göre ortalı) · sağ (düğmeler; pencere denetimlerinden önce biter)
        style={{ gridTemplateColumns: `minmax(0,1fr) minmax(130px,min(${compactMenu ? 460 : 360}px,calc(100% - ${isElectron ? 584 : 328}px))) minmax(0,1fr)` }}
      >
        <div className="flex items-center h-full min-w-0 overflow-hidden">
          <div className="flex items-center pl-3 pr-1 h-full shrink-0"><Logo size={18} /></div>
          <MenuBar menus={menus} compact={compactMenu} />
        </div>

        {/* Orta: komut merkezi görünümlü arama / proje alanı */}
        <button
          onClick={() => setPalette('')}
          title={`${t('cpTitle')} (Ctrl+P)`}
          className="app-no-drag w-full min-w-0 flex items-center justify-center gap-2 h-6 px-2 rounded-md bg-nv-input/70 border border-transparent hover:border-zinc-600 text-[12px] text-zinc-300 transition-colors"
        >
          <Search size={12} className="text-zinc-500 shrink-0" />
          <span className="truncate min-w-0">
            {showLanding
              ? t('actHome')
              : activeFile
                ? `${activeFile.name}${activeFile.isModified ? ' •' : ''}${projectName ? ` — ${projectName}` : ''}`
                : projectName || 'NovaCode Studio'}
          </span>
        </button>

        <div className="flex items-center justify-end h-full min-w-0">
        <div className="app-no-drag flex items-center justify-end gap-0.5 min-w-0 pr-2">
          <button onClick={handleOpenFolderDialog} title={`${t('openFolder')} (Ctrl+O)`} aria-label={t('openFolder')} className="icon-btn">
            <FolderOpen size={15} />
          </button>
          <button
            onClick={() => { if (canPreview) setShowRightPanel(showRightPanel === 'preview' ? null : 'preview'); }}
            {...dis(!canPreview, `${t('tbPreview')} — ${t('mnHintHtml')}`)}
            title={canPreview ? t('tbPreview') : `${t('tbPreview')} — ${t('mnHintHtml')}`}
            aria-label={t('tbPreview')}
            data-active={showRightPanel === 'preview'}
            className="icon-btn"
          >
            <Columns size={15} />
          </button>
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
          <button
            onClick={() => { if (currentRootPath) setShowBottomTerminal((v) => !v); }}
            {...dis(!currentRootPath, `${t('tbTerminal')} — ${t('mnHintNoFolder')}`)}
            title={currentRootPath ? t('tbTerminal') : `${t('tbTerminal')} — ${t('mnHintNoFolder')}`}
            aria-label={t('tbTerminal')}
            data-active={showBottomTerminal}
            className="icon-btn"
          >
            <PanelBottom size={15} />
          </button>
        </div>
        {isElectron && <WindowControls />}
        </div>
      </header>

      {/* Çalışma alanı */}
      <div className={`relative flex flex-1 min-h-0 overflow-hidden ${sidebarRight ? 'flex-row-reverse' : ''}`}>
        {/* Etkinlik çubuğu */}
        {settings.activityBarVisible !== false && (
        <nav aria-label="Activity bar" className={`w-12 bg-nv-side ${sidebarRight ? 'border-l' : 'border-r'} border-nv-border flex flex-col items-center justify-between select-none shrink-0`}>
          <div className="flex flex-col">
            <button {...barBtn(sidebarShown && activeSidebarTab === 'files')} title={t('actExplorer')} aria-label={t('actExplorer')} onClick={() => pickSidebar('files')}>
              <Files size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'search')} {...dis(!currentRootPath, `${t('actSearch')} — ${t('mnHintNoFolder')}`)} title={currentRootPath ? `${t('actSearch')} (Ctrl+Shift+F)` : `${t('actSearch')} — ${t('mnHintNoFolder')}`} aria-label={t('actSearch')} onClick={() => { if (currentRootPath) pickSidebar('search'); }}>
              <Search size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'extensions')} title={t('extTitle')} aria-label={t('extTitle')} onClick={() => pickSidebar('extensions')}>
              <Puzzle size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'git')} title={t('actGit')} aria-label={t('actGit')} onClick={() => pickSidebar('git')}>
              <GitBranch size={24} strokeWidth={1.5} />
              {changeCount > 0 && (
                <span className="absolute bottom-2 right-1.5 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] leading-4 text-center font-semibold">
                  {changeCount > 99 ? '99+' : changeCount}
                </span>
              )}
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
        <div className="sidebar-shell h-full shrink-0 overflow-hidden" style={{ width: sidebarShown ? sbW : 0 }}>
          {sbMounted && (
            <div style={{ width: sbW }} className={`h-full ${sidebarRight ? 'border-l' : 'border-r'} border-nv-border bg-nv-side`}>
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
                    density={settings.treeDensity === 'comfortable' ? 'comfortable' : settings.treeDensity === 'spacious' ? 'spacious' : 'compact'}
                    indentGuides={settings.treeIndentGuides !== false}
                    showOpenEditors={settings.showOpenEditors !== false}
                    onSelectFile={(f) => {
                      setShowLanding(false);
                      setShowSettings(false);
                      void handleSelectFile(f);
                    }}
                    onCloseOpenFile={handleCloseTab}
                    onCreate={handleCreateFile}
                    onMove={handleMove}
                    onCloseAll={handleCloseAll}
                    onOpenInTerminal={handleOpenInTerminal}
                    onOpenRecent={(p) => void handleOpenRecent(p)}
                    onRename={handleRename}
                    onDelete={handleDeleteFile}
                    onRefresh={refreshTree}
                    onOpenFolder={handleOpenFolderDialog}
                    onOpenFiles={handleOpenFileDialog}
                  />
                </div>
              )}
              {activeSidebarTab === 'extensions' && (
                <div key="extensions" className="animate-sidebar-in h-full">
                  <Suspense fallback={null}><ExtensionsPanel /></Suspense>
                </div>
              )}
              {activeSidebarTab === 'search' && (
                <div key="search" className="animate-sidebar-in h-full">
                  <Suspense fallback={null}><SearchPanel hasFolder={!!currentRootPath} onOpenResult={(p, line) => void openFileAt(p, line)} /></Suspense>
                </div>
              )}
              {activeSidebarTab === 'git' && (
                <div key="git" className="animate-sidebar-in h-full flex flex-col">
                  <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('actGit')}</div>
                  <Suspense fallback={null}><GithubAccount /></Suspense>
                  <div className="flex-1 min-h-0">
                    <Suspense fallback={null}><GitPanel status={gitStatus} currentRepoPath={currentRootPath} onRefresh={() => refreshGitStatus()} onLog={(type, text) => addLog(type, text)} /></Suspense>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {sidebarShown && <ResizeHandle direction="horizontal" title="Kenar çubuğu genişliği" onResize={(d) => setSidebarWidth((w) => clamp(sidebarRight ? w - d : w + d, 180, 560))} />}

        {/* Ana sütun: görünüm (ayarlar / karşılama / editör) + terminal paneli (oturumlar panel gizliyken de canlı kalır) */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <div className="flex-1 min-h-0 flex flex-col min-w-0">
            {showLanding ? (
          <Suspense fallback={null}><LandingPage
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
          /></Suspense>
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
                canPreview={previewable}
                previewOpen={showRightPanel === 'preview'}
                onTogglePreview={() => setShowRightPanel((v) => (v === 'preview' ? null : 'preview'))}
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
            <Suspense fallback={null}><Terminal
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
            /></Suspense>
          </div>
        </div>

        {/* Sağ panel: önizleme veya yapay zekâ */}
        {!showLanding && showRightPanel === 'preview' && canPreview && (
          <div className={compactRight ? 'absolute right-0 top-0 bottom-0 z-30 flex shadow-[-14px_0_32px_rgba(0,0,0,0.4)]' : 'contents'}>
            <ResizeHandle direction="horizontal" title={t('tbPreview')} onResize={(d) => setPreviewWidth((w) => clamp(w - d, 320, 1200))} />
            <div style={{ width: Math.min(previewWidth, compactRight ? vw - 56 : Math.round(vw * 0.5)) }} className="animate-fade-in h-full border-l border-nv-border bg-nv-side shrink-0 min-w-0">
              <Suspense fallback={null}><Preview
                file={activeFile ? { name: activeFile.name, path: activeFile.path, language: activeFile.language, content: activeFile.content } : null}
                rootPath={currentRootPath}
                live={openFiles.map((f) => ({ path: f.path, content: f.content }))}
                localUrl={localUrl}
                onClose={() => setShowRightPanel(null)}
                onOpenFile={(p) => void openFileAt(p)}
              /></Suspense>
            </div>
          </div>
        )}

        {!showLanding && showRightPanel === 'ai' && (
          <div className={compactRight ? 'absolute right-0 top-0 bottom-0 z-30 flex shadow-[-14px_0_32px_rgba(0,0,0,0.4)]' : 'contents'}>
          <ResizeHandle direction="horizontal" title={t('aiTitle')} onResize={(d) => setAiWidth((w) => clamp(w - d, 300, 720))} />
          <div style={{ width: Math.min(aiWidth, compactRight ? vw - 56 : Math.round(vw * 0.4)) }} className="animate-fade-in h-full shrink-0 min-w-0">
            <Suspense fallback={null}>
            <AIAssistant
              activeFile={activeFile ? { name: activeFile.name, path: activeFile.path, language: activeFile.language, content: activeFile.content } : null}
              hasWorkspace={!!currentRootPath}
              onOpenSettings={() => { setShowLanding(false); setShowSettings(true); }}
            />
            </Suspense>
          </div>
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
          <div className="flex items-center h-full min-w-0 overflow-hidden">
            <UpdateIndicator onOpen={() => setUpdateDlg('update')} />
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
