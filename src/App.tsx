import React, { lazy, useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import {
  Files,
  Bug,
  Settings,
  Sparkles,
  Puzzle,
  Columns,
  House,
  GitBranch,
  GitCommitHorizontal,
  FolderOpen,
  Search,
  PanelLeft,
  PanelBottom,
  UserRound,
  RefreshCcw,
  Server
} from 'lucide-react';
import { FileTree, normGitPath } from './components/FileTree';
import { EditorArea } from './components/EditorArea';
const Terminal = lazy(() => import('./components/Terminal').then((m) => ({ default: m.Terminal })));
const KeybindingsEditor = lazy(() => import('./components/KeybindingsEditor').then((m) => ({ default: m.KeybindingsEditor })));
const Preview = lazy(() => import('./components/Preview').then((m) => ({ default: m.Preview })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then((m) => ({ default: m.AIAssistant })));
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
import { SplashScreen } from './components/SplashScreen';
const GitPanel = lazy(() => import('./components/GitPanel').then((m) => ({ default: m.GitPanel })));
const GithubAccount = lazy(() => import('./components/GithubAccount').then((m) => ({ default: m.GithubAccount })));
import { Logo } from './components/Logo';
const SettingsPage = lazy(() => import('./components/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const TrustDialog = lazy(() => import('./components/TrustDialog').then((m) => ({ default: m.TrustDialog })));
const TrustBadge = lazy(() => import('./components/TrustDialog').then((m) => ({ default: m.TrustBadge })));
const RemoteDialog = lazy(() => import('./components/RemoteDialog').then((m) => ({ default: m.RemoteDialog })));
import { trustOnOpen, useTrust } from './services/trustService';
import { useSettings } from './services/SettingsContext';
import { useCollabToken } from './services/useCollabToken';
import { getCollabRoomId } from './services/collabRoom';
import { loadSettings } from './services/settings';
import { useGithubAuth } from './services/useGithubAuth';
const SearchPanel = lazy(() => import('./components/SearchPanel').then((m) => ({ default: m.SearchPanel })));
const RemoteMenu = lazy(() => import('./components/RemoteMenu').then((m) => ({ default: m.RemoteMenu })));
const CommitHistoryMenu = lazy(() => import('./components/CommitHistoryMenu').then((m) => ({ default: m.CommitHistoryMenu })));
const CompletionMenu = lazy(() => import('./components/CompletionMenu').then((m) => ({ default: m.CompletionMenu })));
const BranchPicker = lazy(() => import('./components/BranchPicker').then((m) => ({ default: m.BranchPicker })));
const TaskPicker = lazy(() => import('./components/TaskPicker').then((m) => ({ default: m.TaskPicker })));
const DebugPanel = lazy(() => import('./components/DebugPanel').then((m) => ({ default: m.DebugPanel })));
const TimelinePanel = lazy(() => import('./components/TimelinePanel').then((m) => ({ default: m.TimelinePanel })));
const SnippetsEditor = lazy(() => import('./components/SnippetsEditor').then((m) => ({ default: m.SnippetsEditor })));
const ExtensionsPanel = lazy(() => import('./components/ExtensionsPanel').then((m) => ({ default: m.ExtensionsPanel })));
import type { PaletteCommand } from './components/CommandPalette';
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
import { goToLine, runEditorAction, formatActiveDocument, copySelection, pasteClipboard, flushEditorChanges } from './services/editorBridge';
import { MenuBar, type MenuGroup } from './components/MenuBar';
import { WindowControls } from './components/WindowControls';
import './i18n/uiTextDev'; // hata ayıklama/dil sunucusu/terminal metinleri (menü ve komutlarda gerekir)
import './i18n/uiTextRemote'; // uzak sunucu (SSH) metinleri (menü, komut ve durum çubuğunda gerekir)
import { getDebugState, initDebug, isDebuggable, resumeDebug, setLocationHandler, startDebug, stepInto, stepOut, stepOver, stopDebug, subscribeDebug } from './services/debugStore';
import { UpdateDialog, UpdateIndicator } from './components/UpdateDialog';
import { checkForUpdates } from './services/updateService';
import { BUILTIN_THEMES, autoUpdateExtensions, listExtThemes, useExtensions } from './services/extensionsService';
import { sendTerminal, sendTerminalWhenReady, runCommandFor } from './services/terminalBridge';
import { baseName, languageFromName, languageLabel } from './services/lang';
import { ResizeHandle, clamp, loadStoredNumber, saveStoredNumber } from './components/ResizeHandle';
import { splitInto, moveToGroup, removeFromGroup, selectInGroup, focusGroup, normalizeSplit, neighborIn, otherGroup, savedToSplit, activeOf, type SplitState, type GroupId, type SplitDir } from './services/splitLayout';
import { getBindings, getOverrides, subscribeBindings, commandForEvent, comboFromEvent, shadowedEditorDefaults, remapShortcutLabel, getCommand } from './services/keybindings';
import { t, getUiLang } from './i18n/uiText';
import { previewKind } from './services/previewKind';
import type { FileItem, ConsoleLog, GitStatus } from './types';
import type { PickerMode } from './components/BranchPicker';
import { normPath } from './services/problems';
import './i18n/uiTextScm';
import './i18n/uiTextComp'; // oturum, onay ve günlük metinleri (açılışta gerekir)
import { LazyPanel } from './components/ErrorBoundary';
import { UnsavedDialog, RestoreSessionDialog, AnalyticsConsentDialog, type UnsavedChoice } from './components/AppDialogs';
import { track, langEvent, useAnalytics } from './services/analytics';
import { timeAgo } from './services/timeAgo';
import { StatusProblems, StatusCursor, StatusCompletion, StatusLsp } from './components/StatusCursor';
import { useEvent } from './services/useEvent';
import { useFocusTrap } from './services/useFocusTrap';
import { getRecentFolders, invalidateRecentFolders } from './services/recentFolders';
import { reloadSnippets } from './services/userSnippets';
import { loadSession, saveSession, clearSession, isRestorable, rememberClosed, popClosed, type Session } from './services/session';

interface ReadResult { ok: boolean; text: string; error: string; reason?: 'large' | 'binary' }
/** fs:readFile sonucunu (metin veya {success:false,error}) tek biçime çevirir. */
async function readText(path: string): Promise<ReadResult> {
  try {
    const r = await window.electronAPI!.readFile(path);
    if (typeof r === 'string') return { ok: true, text: r, error: '' };
    if (r && r.success === false) return { ok: false, text: '', error: r.error, reason: r.error === 'file-too-large' ? 'large' : r.error === 'binary-file' ? 'binary' : undefined };
    return { ok: false, text: '', error: 'unknown' };
  } catch (e) {
    return { ok: false, text: '', error: e instanceof Error ? e.message : String(e) };
  }
}
const sepOf = (p: string) => (p.includes('\\') ? '\\' : '/');
/** Yolu (ayırıcı ve büyük/küçük harf farkı gözetmeden) from → to taşır; etkilenmezse aynısını döner (B-10). */
function remapPath(p: string, from: string, to: string): string {
  const a = normPath(p);
  const b = normPath(from);
  if (a === b) return to;
  if (a.startsWith(b + '/')) return to + p.slice(from.length).replace(/[\\/]/g, sepOf(to));
  return p;
}
const setNodeContent = (items: FileItem[], id: string, content: string): FileItem[] =>
  items.map((it) => (it.id === id ? { ...it, content, isModified: false } : it.children ? { ...it, children: setNodeContent(it.children, id, content) } : it));
const useDebugStatus = () => useSyncExternalStore(subscribeDebug, () => getDebugState().status, () => getDebugState().status);

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  // VS Code gibi: açılışta karşılama sayfası gösterilir (kullanıcı kapatabilir).
  const [showLanding, setShowLanding] = useState(() => loadSettings().values.welcomeOnStartup !== false);
  const [showSettings, setShowSettings] = useState(false);
  // Açılışta hiçbir proje/dosya otomatik açılmaz: ağaç yalnız kullanıcının açtığı klasörden gelir.
  const [files, setFiles] = useState<FileItem[]>([]);
  const filesRef = useRef(files);
  filesRef.current = files;
  const untitledCounter = useRef(0);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const openFilesRef = useRef<FileItem[]>([]);
  const handleSaveFileRef = useRef<(f: FileItem, manual?: boolean) => Promise<boolean>>(async () => true);
  const refreshGitStatusRef = useRef<() => Promise<void>>(async () => {});
  openFilesRef.current = openFiles;
  // İçerik editörün modelinde yaşar; burada yalnız kaydedilmemiş son metinler tutulur (P-01/P-07). liveTick: değişiklik toplu geldiğinde artar.
  const liveContent = useRef(new Map<string, string>());
  const [liveTick, setLiveTick] = useState(0);
  const recentSaves = useRef(new Map<string, number>());
  const getContent = (f: { id: string; content?: string }) => liveContent.current.get(f.id) ?? f.content ?? '';
  const rootPathRef = useRef<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Bölünmüş editör (F-03): en çok iki grup; activeFileId her zaman ODAKTAKİ grubun etkin dosyasıdır (kaydet/çalıştır/önizleme değişmeden çalışır).
  const [splitRaw, setSplitRaw] = useState<SplitState | null>(null);
  const [splitRatio, setSplitRatio] = useState(() => clamp(loadStoredNumber('nova.split.ratio', 0.5), 0.2, 0.8));
  const closeNextHint = useRef<string | null>(null);
  const [showKeybindings, setShowKeybindings] = useState(false);
  useSyncExternalStore(subscribeBindings, getOverrides, getOverrides); // kısayol değişince yeniden çiz (menü/palet etiketleri)
  const kbBindings = getBindings();

  // Yerel Proje ve Git Durumu
  const [currentRootPath, setCurrentRootPath] = useState<string | null>(null);
  rootPathRef.current = currentRootPath;
  const [currentRootName, setCurrentRootName] = useState<string>('NovaCode-Studio');
  // Uzak (SSH) çalışma alanı açıksa ana bilgisayar; kök yol `ssh://<ana>/<yol>` biçimindedir (docs/brain/actions/remote-ssh.md)
  const [remoteHost, setRemoteHost] = useState<{ hostId: string; name: string } | null>(null);
  const remoteRef = useRef(remoteHost);
  remoteRef.current = remoteHost;
  const [showRemote, setShowRemote] = useState(false);
  const [remoteMenu, setRemoteMenu] = useState(false);
  useEffect(() => window.electronAPI?.ssh?.onEvent((ev) => {
    const r = remoteRef.current;
    if (ev.type !== 'disconnected' || !r || r.hostId !== ev.id) return;
    if (ev.reason !== 'closed') addLog('warn', t('rmLost').replace('{h}', r.name)); // kullanıcı kapattıysa uyarı yok
    setRemoteHost(null); // bağlantı gidince uzak ağaç anlamsızdır: klasörsüz duruma dön (kaydedilmemiş sekmeler kalır)
    rootPathRef.current = null;
    treeSeq.current++;
    setCurrentRootPath(null);
    setFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  const [gitStatus, setGitStatus] = useState<GitStatus>({ isRepo: false, changes: [] });
  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [devDlg, setDevDlg] = useState<null | 'timeline' | 'snippets'>(null); // zaman çizelgesi (F-07) / snippet düzenleyici (F-06)
  const [taskPicker, setTaskPicker] = useState(false);
  // Görev/bul-değiştir/çoklu imleç metinleri gecikmeli sözlükte (paket bütçesi): boşta yüklenir, menüler yenilenir
  const [extraTexts, setExtraTexts] = useState(false);
  useEffect(() => { void import('./i18n/uiTextAi').then(() => setExtraTexts(true)); }, []);
  const [gitNotice, setGitNotice] = useState<{ id: number; ok: boolean; text: string } | null>(null);
  const [noticeShown, setNoticeShown] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [compMenu, setCompMenu] = useState<{ x: number; y: number } | null>(null);
  const [histMenu, setHistMenu] = useState<{ x: number; y: number } | null>(null);
  // Durum çubuğundaki "son commit" özeti: depo/dal/ileri sayısı/değişiklik sayısı değişince tazelenir (commit sonrası liste küçülür)
  const [lastCommit, setLastCommit] = useState<{ author: string; ts?: number; when: string } | null>(null);
  const [agoTick, setAgoTick] = useState(0);
  useEffect(() => {
    if (!currentRootPath || !gitStatus.isRepo || !window.electronAPI?.gitLog) { setLastCommit(null); return; }
    let alive = true;
    void window.electronAPI.gitLog(currentRootPath, 1).then((r) => {
      if (!alive) return;
      const c = r.success ? r.commits[0] : undefined;
      setLastCommit(c ? { author: c.author, ts: c.ts, when: c.when } : null);
    }).catch(() => { if (alive) setLastCommit(null); });
    return () => { alive = false; };
  }, [currentRootPath, gitStatus.isRepo, gitStatus.branch, gitStatus.ahead, gitStatus.files?.length]);
  useEffect(() => {
    if (!lastCommit?.ts) return;
    const id = window.setInterval(() => setAgoTick((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, [lastCommit?.ts]);

  // Paneller
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'search' | 'git' | 'extensions' | 'debug'>('files');
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
  // Tam ekran/büyütülmüş değilse (pencereli/sekme görünümü) üst çubuk kompakt olur: <html data-win="windowed"> (style.css)
  const markWindowed = () => {
    const windowed = window.outerWidth < window.screen.availWidth - 8;
    document.documentElement.dataset.win = windowed ? 'windowed' : 'full';
    setWindowed((cur) => (cur === windowed ? cur : windowed));
  };
  const [windowed, setWindowed] = useState(() => window.outerWidth < window.screen.availWidth - 8);
  useEffect(markWindowed, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setVw((cur) => (cur === window.innerWidth ? cur : window.innerWidth));
        markWindowed();
      });
    };
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const compactRight = vw < 1100;
  const compactMenu = vw < 1340 || windowed; // dar pencerede menü başlıkları tek "Menü" düğmesine toplanır
  // Telefon/dar tablet: kenar çubuğu editörü ezmez, üstüne biner (sağ paneller gibi); dışına dokunmak veya dosya seçmek kapatır
  const compactLeft = vw < 760;
  const sbW = compactLeft ? Math.max(200, Math.min(sidebarWidth, 320, vw - 96)) : Math.min(sidebarWidth, Math.max(180, Math.round(vw * 0.34)));
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

  // Son açılan klasörler (yalnız yerelde, ana süreçte tutulur): tek paylaşılan çağrı (P-21)
  const [recentFolders, setRecentFolders] = useState<{ path: string; name: string }[]>([]);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const loadRecent = (force = false) => {
    void getRecentFolders(force).then((l) => { setRecentFolders(l); setRecentLoaded(true); });
  };
  useEffect(() => {
    loadRecent();
    const fallback = window.setTimeout(() => setRecentLoaded(true), 3000);
    return () => window.clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const collabUrlValid = /^(wss:\/\/|ws:\/\/(localhost|127\.0\.0\.1)[:/])/.test(collabUrl.trim());

  // Terminal Logları (en çok 500 satır; yoğun yazımda kare başına tek güncelleme: P-12)
  const [logs, setLogs] = useState<ConsoleLog[]>(() => [
    {
      id: '0',
      type: 'info',
      text: t('appBootLog').replace('{v}', __APP_VERSION__),
      time: new Date().toLocaleTimeString()
    }
  ]);
  const logBuf = useRef<ConsoleLog[]>([]);
  const logRaf = useRef(0);
  const logSeq = useRef(0);
  const pushLog = (type: ConsoleLog['type'], text: string) => {
    logBuf.current.push({ id: `${Date.now()}-${++logSeq.current}`, type, text, time: new Date().toLocaleTimeString() });
    if (logRaf.current) return;
    logRaf.current = requestAnimationFrame(() => {
      logRaf.current = 0;
      const batch = logBuf.current;
      logBuf.current = [];
      setLogs((prev) => [...prev, ...batch].slice(-500));
    });
  };

  const [sidebarVisible, setSidebarVisible] = useState(() => window.innerWidth >= 760); // telefonda kapalı başlar (üstüne biner)
  const sbInitial = useRef(true);
  const { auth, ready: authReady } = useGithubAuth();

  // Iframe console dinleyicisi: yalnız sayfadaki bir iframe'den gelen iletiler kabul edilir (S-28)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'CONSOLE_LOG') return;
      if (!event.source || event.source === window) return;
      const fromFrame = Array.from(document.querySelectorAll('iframe')).some((f) => f.contentWindow === event.source);
      if (!fromFrame) return;
      const level = ['log', 'info', 'warn', 'error'].includes(event.data.level) ? event.data.level : 'log';
      pushLog(level, String(event.data.message ?? '').slice(0, 2000));
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gerçek Zamanlı Disk Değişikliği Dinleyicisi (File Watcher)
  // Ağaç yenilemesi birleştirilir (B-11): bir okuma sürerken gelen olaylar tek bir ek okumaya indirilir, eski sonuç yeniyi ezmez.
  const watchBusy = useRef(false);
  const watchQueued = useRef(false);
  const treeSeq = useRef(0);
  const loadTree = async (root: string) => {
    const api = window.electronAPI;
    if (!api) return;
    const n = ++treeSeq.current;
    const tree = await api.readDirectory(root);
    if (n === treeSeq.current && root === rootPathRef.current) setFiles(tree);
  };
  // P-04: izleyici değişen yolları verir; yalnız o klasörler yeniden okunup ağaca yamanır (az sayıdaysa), aksi halde tam okuma.
  const watchDirs = useRef<Set<string> | null>(null); // null = tam yenileme gerekli
  const dirOf = (p: string) => p.replace(/[\\/][^\\/]*$/, '');
  const patchDirs = async (root: string, dirs: Set<string>): Promise<boolean> => {
    const api = window.electronAPI;
    if (!api) return true;
    const rootN = normPath(root);
    const known = new Set<string>();
    const collect = (items: FileItem[]) => { for (const it of items) if (it.type === 'folder') { known.add(normPath(it.path ?? it.id)); if (it.children) collect(it.children); } };
    collect(filesRef.current);
    // Ağaçta olmayan klasör: bilinen en yakın üst klasöre çıkılır; kök çıkarsa tam okuma
    const targets = new Map<string, string>();
    for (const d of dirs) {
      let cur = d;
      while (normPath(cur) !== rootN && !known.has(normPath(cur))) {
        const up = dirOf(cur);
        if (!up || up === cur) return false;
        cur = up;
      }
      if (normPath(cur) === rootN) return false;
      targets.set(normPath(cur), cur);
    }
    // Başka bir hedefin altındaki hedefler gereksizdir
    const keys = [...targets.keys()];
    const list = keys.filter((k) => !keys.some((o) => o !== k && k.startsWith(o + '/'))).map((k) => targets.get(k) as string);
    if (list.length === 0 || list.length > 6) return false;
    const read = await Promise.all(list.map((d) => api.readDirectory(d)));
    if (root !== rootPathRef.current) return true;
    const byDir = new Map(list.map((d, i) => [normPath(d), read[i]]));
    const mergeOpen = (fresh: FileItem[], old: FileItem[] = []): FileItem[] => {
      const prev = new Map(old.map((o) => [o.id, o]));
      return fresh.map((f) => {
        if (f.type !== 'folder') return f;
        const o = prev.get(f.id);
        return { ...f, isOpen: o?.isOpen ?? false, children: mergeOpen(f.children ?? [], o?.children) };
      });
    };
    const apply = (items: FileItem[]): FileItem[] =>
      items.map((it) => {
        if (it.type !== 'folder') return it;
        const hit = byDir.get(normPath(it.path ?? it.id));
        if (hit) return { ...it, children: mergeOpen(hit, it.children) };
        return it.children ? { ...it, children: apply(it.children) } : it;
      });
    treeSeq.current++; // uçuştaki eski tam okuma bu yamayı ezmesin
    setFiles((prev) => apply(prev));
    return true;
  };
  const scheduleTreeReload = async (root: string, changed?: string[]) => {
    if (!changed || changed.length === 0 || changed.length >= 200) watchDirs.current = null;
    else {
      watchDirs.current ??= new Set();
      for (const p of changed) watchDirs.current.add(dirOf(p));
      if (watchDirs.current.size > 6) watchDirs.current = null;
    }
    if (watchBusy.current) { watchQueued.current = true; return; }
    watchBusy.current = true;
    try {
      do {
        watchQueued.current = false;
        const dirs = watchDirs.current;
        watchDirs.current = new Set();
        if (!dirs || dirs.size === 0 || !(await patchDirs(root, dirs))) await loadTree(root);
      } while (watchQueued.current && root === rootPathRef.current);
    } finally {
      watchBusy.current = false;
    }
  };
  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onFileChanged) return;
    const unsubscribe = api.onFileChanged(async ({ filename, rootPath, changed }) => {
      try {
        // Yalnız şu an açık olan klasörün değişiklikleri işlenir (yeniden başlatmada eski izleyici ağacı sızdırmasın).
        if (rootPath && rootPath === rootPathRef.current) {
          void scheduleTreeReload(rootPath, changed);
          refreshGitStatus(rootPath);
        }
        // Açık sekmeler (B-05): değişmemiş sekme diskten yenilenir; kaydedilmemiş düzenlemesi olan sekmede uyarı gösterilir;
        // diskten silinen/taşınan dosyanın sekmesi "diskte yok" olarak işaretlenir (içerik korunur).
        const changedSet = new Set((changed ?? []).map((p) => normPath(p)));
        const targets = openFilesRef.current.filter((f) => f.path && changedSet.has(normPath(f.path)));
        for (const f of targets) {
          const r = await readText(f.path as string);
          if (!r.ok) {
            if (!r.reason && /ENOENT|no such file/i.test(r.error)) {
              setOpenFiles((prev) => prev.map((o) => (o.id === f.id && !o.missing ? { ...o, missing: true } : o)));
            }
            continue;
          }
          const text = r.text;
          const savedAt = recentSaves.current.get(f.id);
          const own = savedAt !== undefined && Date.now() - savedAt < 1500; // kendi kaydımızın yankısı
          setOpenFiles((prev) =>
            prev.map((o) => {
              if (o.id !== f.id) return o;
              if (!o.isModified) {
                return o.content === text && !o.missing && !o.externalChange ? o : { ...o, content: text, missing: false, externalChange: false };
              }
              if (text === o.content || own) return o.missing ? { ...o, missing: false } : o;
              return o.externalChange && !o.missing ? o : { ...o, externalChange: true, missing: false };
            })
          );
        }
      } catch (err) {
        addLog('error', t('appTreeRefreshFail').replace('{e}', `${filename || ''} ${String(err)}`.trim()));
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yerel geçmiş ayarı ana sürece iletilir (F-07); kapatılınca tüm yerel geçmiş silinir (KVKK: kullanıcı kontrolü)
  useEffect(() => {
    const h = window.electronAPI?.history;
    if (!h) return;
    const enabled = settings.localHistory !== false;
    void h.config({ enabled, maxVersions: Number(settings.localHistoryMax) || 30 });
    if (!enabled) void h.clear('all');
  }, [settings.localHistory, settings.localHistoryMax]);
  // Kullanıcı snippet'leri: açılışta ve çalışma klasörü değişince yeniden okunur (F-06)
  useEffect(() => { void reloadSnippets(); }, [currentRootPath]);

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
  // Dar ekranda (kenar çubuğu üstüne biner) dosya seçilince kenar çubuğu kapanır; editör hemen görünür
  useEffect(() => {
    if (sbInitial.current) { sbInitial.current = false; return; }
    if (window.innerWidth < 760) setSidebarVisible(false);
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
  // Hata ayıklama: durum deposu, kesme noktaları çalışma klasörüne göre yüklenir; durunca dosya ve satır açılır
  const dbgStatus = useDebugStatus();
  const prevDbgStatus = useRef(dbgStatus);
  useEffect(() => { initDebug(currentRootPath); }, [currentRootPath]);
  useEffect(() => {
    if (dbgStatus === 'paused' && prevDbgStatus.current !== 'paused') { setActiveSidebarTab('debug'); setSidebarVisible(true); }
    prevDbgStatus.current = dbgStatus;
  }, [dbgStatus]);

  // ---- Bölünmüş editör: türetilmiş durum ve işlemler ----
  const poolIds = useMemo(() => openFiles.map((f) => f.id), [openFiles]);
  const split = useMemo(() => normalizeSplit(splitRaw, poolIds, activeFileId), [splitRaw, poolIds, activeFileId]);
  useEffect(() => { if (split !== splitRaw) setSplitRaw(split); }, [split, splitRaw]);
  const splitRef = useRef(split);
  splitRef.current = split;
  const groupFiles = useMemo(() => {
    if (!split) return null;
    const by = new Map(openFiles.map((f) => [f.id, f]));
    const pick = (ids: string[]) => ids.map((id) => by.get(id)).filter((f): f is FileItem => !!f);
    return { a: pick(split.a), b: pick(split.b) };
  }, [split, openFiles]);
  useEffect(() => {
    const id = window.setTimeout(() => saveStoredNumber('nova.split.ratio', splitRatio), 300);
    return () => window.clearTimeout(id);
  }, [splitRatio]);

  const doSplit = (dir: SplitDir) => {
    const next = splitInto(splitRef.current, openFilesRef.current.map((f) => f.id), activeFileId, dir);
    if (!next || next === splitRef.current) return;
    setSplitRaw(next);
    setActiveFileId(activeOf(next, next.focus));
  };
  const closeSplitView = () => setSplitRaw(null);
  const focusGroupId = (g: GroupId) => {
    const s0 = splitRef.current;
    if (!s0 || s0.focus === g) return;
    setSplitRaw(focusGroup(s0, g));
    const id = activeOf(s0, g);
    if (id) setActiveFileId(id);
  };
  const focusOtherGroup = () => { const s0 = splitRef.current; if (s0) focusGroupId(otherGroup(s0.focus)); };
  /** Sekmeyi bir gruptan kapatır: dosya öteki grupta da açıksa yalnız bu gruptan çıkar, değilse normal kapatma (kirli onayı dahil). */
  const closeInGroup = (id: string, g: GroupId) => {
    const s0 = splitRef.current;
    if (!s0) { void handleCloseTab(id); return; }
    const here = g === 'a' ? s0.a : s0.b;
    const there = g === 'a' ? s0.b : s0.a;
    if (there.includes(id)) {
      const next = removeFromGroup(s0, id, g);
      setSplitRaw(next);
      if (s0.focus === g && activeFileId === id) { const n = activeOf(next, g); if (n) setActiveFileId(n); }
      return;
    }
    closeNextHint.current = neighborIn(here, id);
    void handleCloseTab(id).finally(() => { closeNextHint.current = null; });
  };
  const selectInGroupTab = (id: string, g: GroupId) => {
    const s0 = splitRef.current;
    if (s0) setSplitRaw(selectInGroup(s0, g, id));
    setActiveFileId(id);
  };
  const dropTab = (id: string, from: GroupId, to: GroupId | 'new-right' | 'new-down') => {
    const s0 = splitRef.current;
    const pool = openFilesRef.current.map((f) => f.id);
    if (!pool.includes(id)) return;
    if (to === 'new-right' || to === 'new-down') {
      if (s0) return;
      const base = splitInto(null, pool, id, to === 'new-right' ? 'row' : 'col');
      if (!base) return;
      setSplitRaw(pool.length > 1 ? removeFromGroup(base, id, 'a') : base);
      setActiveFileId(id);
      return;
    }
    if (!s0) return;
    setSplitRaw(moveToGroup(s0, id, from, to));
    setActiveFileId(id);
  };

  const shortcutHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutHandler.current(e);
    window.addEventListener('keydown', onKeyDown);
    // Editör komutlarına atanan özel kısayollar (F-04): Monaco tuşu yakalamadan önce, yakalama aşamasında en dar yolla çalıştırılır.
    // Kullanıcının değiştirdiği/kaldırdığı komutun eski Monaco tuşu yutulur (varsa o tuşu tutan uygulama komutu çalışır).
    const onKeyCapture = (e: KeyboardEvent) => {
      if (document.body.dataset.kbCapture) return;
      const combo = comboFromEvent(e);
      if (!combo) return;
      const inEditor = !!(e.target as HTMLElement | null)?.closest?.('.monaco-editor');
      if (!inEditor) return;
      const b = getBindings();
      const id = commandForEvent(e, b, 'editor');
      if (id) {
        const c = getCommand(id);
        if (c?.monaco && c.def !== combo) { e.preventDefault(); e.stopPropagation(); runEditorAction(c.monaco); }
        return;
      }
      if (shadowedEditorDefaults(b).has(combo)) {
        e.preventDefault();
        e.stopPropagation();
        if (commandForEvent(e, b, 'app')) shortcutHandler.current(e);
      }
    };
    window.addEventListener('keydown', onKeyCapture, true);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keydown', onKeyCapture, true); };
  }, []);

  shortcutHandler.current = (e: KeyboardEvent) => {
    if (e.key === 'F1') { e.preventDefault(); setPalette('>'); return; }
    // Hata ayıklama kısayolları (VS Code ile aynı): duraklamadayken F5 devam, F10 adım at, F11 içine gir, Shift+F11 dışına çık, Shift+F5 durdur
    const dbgStatus = getDebugState().status;
    if (e.key === 'F5' && e.shiftKey && dbgStatus !== 'idle') { e.preventDefault(); void stopDebug(); return; }
    if (e.key === 'F5' && dbgStatus === 'paused') { e.preventDefault(); void resumeDebug(); return; }
    if (e.key === 'F10' && dbgStatus === 'paused') { e.preventDefault(); void stepOver(); return; }
    if (e.key === 'F11' && dbgStatus === 'paused') { e.preventDefault(); void (e.shiftKey ? stepOut() : stepInto()); return; }
    if (e.key === 'F5') { e.preventDefault(); handleRunCode(); return; }
    if (document.body.dataset.kbCapture) return; // kısayol düzenleyicisi tuş yakalıyor

    // Komut -> kısayol eşlemesi services/keybindings.ts'te (varsayılanlar + kullanıcı geçersiz kılmaları, F-04)
    const cmd = commandForEvent(e, getBindings(), 'app');
    if (!cmd) return;
    const go = (fn: () => void) => { e.preventDefault(); fn(); };
    // Komut paleti ve arama (VS Code ile aynı): Ctrl+P dosya, Ctrl+Shift+P komut, Ctrl+G satır, Ctrl+Shift+F proje araması
    switch (cmd) {
      case 'commandPalette': return go(() => setPalette('>'));
      case 'quickOpen': return go(() => setPalette(''));
      case 'goLine': return go(() => setPalette(':'));
      case 'findInFiles': return go(() => { if (currentRootPath) pickSidebarForce('search'); });
      case 'extensions': return go(() => pickSidebarForce('extensions'));
      case 'ai': return go(toggleAI);
      case 'problems': return go(openProblems);
      case 'quit': return go(handleQuit);
      case 'sidebar': return go(() => setSidebarVisible((v) => !v));
      case 'settings': return go(() => { setShowLanding(false); setShowSettings((v) => !v); });
      case 'terminal': return go(() => { if (currentRootPath) setShowBottomTerminal((v) => !v); });
      case 'save': return go(() => {
        const activeFile = openFiles.find((f) => f.id === activeFileId);
        if (activeFile) handleSaveFile(activeFile);
      });
      case 'run': return go(handleRunCode);
      case 'keybindings': return go(() => setShowKeybindings(true));
    }

    // Terminalde yazarken Ctrl+N/O/W/Tab gibi tuşlar kabuğa aittir.
    if ((e.target as HTMLElement | null)?.closest?.('[data-terminal]')) return;

    switch (cmd) {
      case 'openFolder': return go(handleOpenFolderDialog);
      case 'openFiles': return go(handleOpenFileDialog);
      case 'newFile': return go(handleNewUntitled);
      case 'reopenTab': return go(() => void reopenClosedTab());
      case 'closeTab': if (activeFileId) go(() => closeInGroup(activeFileId, splitRef.current?.focus ?? 'a')); return;
      case 'nextTab': if (openFiles.length > 1) go(() => cycleTab(1)); return;
      case 'prevTab': if (openFiles.length > 1) go(() => cycleTab(-1)); return;
      case 'splitRight': return go(() => doSplit('row'));
      case 'splitDown': return go(() => doSplit('col'));
      case 'focusOtherGroup': return go(focusOtherGroup);
      case 'closeSplit': return go(closeSplitView);
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
    const api = window.electronAPI;
    // Pencere kapatma yolu kaydedilmemiş değişiklik onayından geçer (B-02)
    if (api?.onCloseRequest && api.windowControls?.close) void api.windowControls.close();
    else if (api?.quitApp) void api.quitApp();
    else window.close();
  };

  const addLog = (type: 'info' | 'log' | 'warn' | 'error', text: string) => pushLog(type, text);

  // ----------------------------------------------------
  // Kaydedilmemiş değişiklik onayı (B-01/B-02)
  // ----------------------------------------------------
  const [unsavedAsk, setUnsavedAsk] = useState<{ files: FileItem[]; resolve: (c: UnsavedChoice) => void } | null>(null);
  const askUnsaved = (list: FileItem[]) =>
    new Promise<UnsavedChoice>((resolve) => {
      setUnsavedAsk((prev) => {
        prev?.resolve('cancel');
        return { files: list, resolve };
      });
    });

  // ----------------------------------------------------
  // Gerçek Klasör ve Dosya Seçimi
  // ----------------------------------------------------
  const trustState = useTrust();
  const applyWorkspace = (result: { rootPath: string; rootName: string; trusted?: boolean; remote?: { hostId: string; name: string }; tree: FileItem[] }) => {
    trustOnOpen(result.rootPath, result.trusted); // güvenilmeyen klasör: güven penceresi + kısıtlı mod rozeti
    // Başka bir klasöre geçilirken eski projenin kaydedilmiş sekmeleri kapanır (kaydedilmemişler korunur).
    if (rootPathRef.current && rootPathRef.current !== result.rootPath) {
      const kept = openFilesRef.current.filter((f) => f.isModified || !f.path);
      const keptIds = new Set(kept.map((f) => f.id));
      for (const k of [...liveContent.current.keys()]) if (!keptIds.has(k)) liveContent.current.delete(k);
      setOpenFiles(kept);
      setActiveFileId((cur) => (kept.some((f) => f.id === cur) ? cur : kept[0]?.id ?? null));
    }
    rootPathRef.current = result.rootPath;
    treeSeq.current++;
    setCurrentRootPath(result.rootPath);
    setCurrentRootName(result.rootName);
    setRemoteHost(result.remote ?? null);
    setFiles(result.tree);
    setShowLanding(false);
    setShowSettings(false);
    setActiveSidebarTab('files');
    setSidebarVisible(true);
    addLog('info', t('appWorkspaceOpened').replace('{p}', result.rootPath));
    refreshGitStatus(result.rootPath);
    invalidateRecentFolders();
    loadRecent(true);
  };

  const handleOpenFolderDialog = async () => {
    if (window.electronAPI?.openFolderDialog) {
      setIsLoadingProject(true);
      try {
        const result = await window.electronAPI.openFolderDialog();
        if (result && 'error' in result) {
          addLog('error', t('appFolderOpenFail').replace('{e}', result.error));
          return;
        }
        if (result && 'rootPath' in result) applyWorkspace(result);
      } catch (err) {
        addLog('error', t('appFolderOpenFail').replace('{e}', String(err)));
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
        addLog('error', t('appFolderOpenFail').replace('{e}', result.error));
        invalidateRecentFolders();
        loadRecent(true);
        return;
      }
      applyWorkspace(result);
    } catch (err) {
      addLog('error', t('appFolderOpenFail').replace('{e}', String(err)));
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
        newItems.push({
          id: file.name + '-' + Date.now(),
          name: file.name,
          type: 'file',
          content,
          language: languageFromName(file.name)
        });
      }
      setFiles((prev) => [...newItems, ...prev]);
      setOpenFiles((prev) => [...newItems, ...prev]);
      setActiveFileId(newItems[0].id);
      setShowLanding(false);
      setShowSettings(false);
      addLog('info', t('appFilesLoaded').replace('{n}', String(newItems.length)));
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
        addLog('info', t('appFilesOpened').replace('{n}', String(opened.length)));
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
      // İçerik aynıysa durumu bırak: gitDecor/ağaç boşuna yeniden hesaplanmaz (P-17)
      setGitStatus((prev) => (JSON.stringify(prev) === JSON.stringify(status) ? prev : status));
    }
  };

  refreshGitStatusRef.current = refreshGitStatus;

  // ----------------------------------------------------
  // Dosya Seçim & Okuma & Kaydetme
  // ----------------------------------------------------
  const logReadFail = (r: ReadResult, name: string) => {
    if (r.reason === 'large') addLog('warn', t('appFileTooLarge').replace('{n}', name));
    else if (r.reason === 'binary') addLog('warn', t('appFileBinary').replace('{n}', name));
    else addLog('error', t('appReadFail').replace('{e}', r.error));
  };

  const handleSelectFile = async (file: FileItem) => {
    if (file.type === 'folder') return;
    // Zaten açıksa yalnız etkinleştir: kaydedilmemiş düzenlemenin üzerine yazılmaz
    if (openFilesRef.current.some((f) => f.id === file.id)) {
      setActiveFileId(file.id);
      return;
    }
    let targetFile = file;
    // Disktedki bir dosyaysa ve içeriği henüz okunmadıysa doğrudan diskten oku
    if (file.path && file.content === undefined && window.electronAPI?.readFile) {
      const r = await readText(file.path);
      if (!r.ok) {
        logReadFail(r, file.name);
        return;
      }
      targetFile = { ...file, content: r.text };
    }
    setOpenFiles((prev) => (prev.some((f) => f.id === targetFile.id) ? prev : [...prev, targetFile]));
    setActiveFileId(targetFile.id);
  };

  /** Sekmeleri onaysız kapatır (onay çağıranın işi). */
  const closeTabsNow = (ids: string[], remember = true) => {
    const idSet = new Set(ids);
    for (const f of openFilesRef.current) {
      if (!idSet.has(f.id)) continue;
      if (remember) rememberClosed(f);
      liveContent.current.delete(f.id);
    }
    const next = openFilesRef.current.filter((f) => !idSet.has(f.id));
    openFilesRef.current = next;
    setOpenFiles((prev) => prev.filter((f) => !idSet.has(f.id)));
    const hint = closeNextHint.current;
    setActiveFileId((cur) => (cur && idSet.has(cur) ? (hint && next.some((f) => f.id === hint) ? hint : next[next.length - 1]?.id ?? null) : cur));
  };

  /** Kaydedilmemiş değişiklik varsa Kaydet/Kaydetme/İptal sorar; devam edilebilirse true döner. */
  const confirmDirty = async (list: FileItem[]): Promise<boolean> => {
    if (list.length === 0) return true;
    const c = await askUnsaved(list);
    if (c === 'cancel') return false;
    if (c === 'save') {
      for (const f of list) if (!(await handleSaveFile(f, false))) return false;
    }
    return true;
  };

  const handleCloseTab = async (id: string) => {
    flushEditorChanges();
    const f = openFilesRef.current.find((x) => x.id === id);
    if (!f) return;
    if (f.isModified && !f.diff && !(await confirmDirty([f]))) return;
    closeTabsNow([id]);
  };

  // İçerik editörde (model) yaşar; buraya 250 ms sessizlikten sonra toplu gelir ve durum yerine bir bellek haritasına yazılır (P-01).
  const markDirty = (id: string) => {
    const f = openFilesRef.current.find((x) => x.id === id);
    if (!f || f.isModified || f.diff) return;
    openFilesRef.current = openFilesRef.current.map((x) => (x.id === id ? { ...x, isModified: true } : x));
    setOpenFiles((prev) => prev.map((x) => (x.id === id && !x.isModified ? { ...x, isModified: true } : x)));
  };
  const handleContentChange = (id: string, newContent: string) => {
    if (!openFilesRef.current.some((x) => x.id === id)) return; // sekme bu arada kapandı
    liveContent.current.set(id, newContent);
    markDirty(id);
    setLiveTick((n) => n + 1);
  };

  // manual=false: otomatik kayıt/çalıştırma öncesi kayıt; yazarken biçimlendirme yapılmaz (yalnız Ctrl+S, menü, düğme, palet)
  const handleSaveFile = async (file: FileItem, manual = true): Promise<boolean> => {
    if (file.diff) return true; // fark sekmesi salt okunur
    if (manual) track('file_save');
    flushEditorChanges();
    const cur = openFilesRef.current.find((f) => f.id === file.id) ?? file;
    let content = getContent(cur);
    if (cur.path && window.electronAPI?.writeFile) {
      // Kayıtta biçimlendir: yalnız etkin sekme (düzenleyici o dosyayı tutar), makul boyutta dosyalar
      if (manual && settings.formatOnSave === true && cur.id === activeFileId && content.length <= 1_000_000) {
        const formatted = await formatActiveDocument();
        if (formatted !== null) content = formatted;
      }
      const edited = content; // dönüşümlerden önceki, editördeki sürüm
      // Ayarlara göre kayıt dönüşümleri
      if (settings.trimTrailingWhitespace === true) content = content.replace(/[ \t]+$/gm, '');
      if (settings.insertFinalNewline === true && content && !content.endsWith('\n')) content += '\n';
      recentSaves.current.set(cur.id, Date.now());
      const res = await window.electronAPI.writeFile(cur.path, content);
      recentSaves.current.set(cur.id, Date.now());
      if (!res.success) {
        addLog('error', t('appSaveFail').replace('{e}', res.error ?? ''));
        return false;
      }
      // Yazma sürerken kullanıcı yazdıysa yeni yazılanın üzerine dokunma (B-06): yalnız temel sürüm güncellenir
      flushEditorChanges();
      const now = liveContent.current.get(cur.id);
      const typedMeanwhile = now !== undefined && now !== edited;
      if (!typedMeanwhile) liveContent.current.delete(cur.id);
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === cur.id ? { ...f, content, isModified: typedMeanwhile, missing: false, externalChange: false } : f))
      );
      addLog('info', t('appSaved').replace('{n}', cur.name));
      refreshGitStatus();
      return true;
    }
    // Diskte olmayan dosya
    if (findItem(files, cur.id)) {
      setFiles((prev) => setNodeContent(prev, cur.id, content));
      liveContent.current.delete(cur.id);
      setOpenFiles((prev) => prev.map((f) => (f.id === cur.id ? { ...f, content, isModified: false } : f)));
      addLog('info', t('appSavedLocal').replace('{n}', cur.name));
      return true;
    }
    // Adsız dosya: farklı kaydet penceresi olmadığı için bilgisayara indirilir
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cur.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    liveContent.current.delete(cur.id);
    setOpenFiles((prev) => prev.map((f) => (f.id === cur.id ? { ...f, content, isModified: false } : f)));
    addLog('info', t('appDownloaded').replace('{n}', cur.name));
    return true;
  };

  handleSaveFileRef.current = handleSaveFile;

  // Otomatik kayıt: gecikmeyle (yazmayı bırakınca) veya pencere odağını kaybedince
  // (diskte değişmiş/silinmiş dosyalar sessizce ezilmez)
  const autoSave = String(settings.autoSave);
  const autoSaveDelay = Number(settings.autoSaveDelay);
  useEffect(() => {
    if (autoSave !== 'afterDelay') return;
    const dirty = openFiles.filter((f) => f.isModified && f.path && !f.externalChange && !f.missing);
    if (dirty.length === 0) return;
    const timer = setTimeout(() => dirty.forEach((f) => void handleSaveFileRef.current(f, false)), autoSaveDelay);
    return () => clearTimeout(timer);
  }, [openFiles, liveTick, autoSave, autoSaveDelay]);
  useEffect(() => {
    if (autoSave !== 'onFocusChange') return;
    const onBlur = () => openFilesRef.current.filter((f) => f.isModified && f.path && !f.externalChange && !f.missing).forEach((f) => void handleSaveFileRef.current(f, false));
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [autoSave]);

  const refreshTree = async () => {
    if (currentRootPath && window.electronAPI) {
      await loadTree(currentRootPath);
      refreshGitStatus();
    }
  };

  const handleCreateFile = async (name: string, isFolder: boolean, parentDir?: string) => {
    if (currentRootPath && window.electronAPI) {
      const baseDir = parentDir || currentRootPath;
      // Klasörün kendi ayırıcısını kullan (Windows'ta '\', diğerlerinde '/')
      const sep = sepOf(baseDir);
      const relative = name.split(/[\\/]+/).filter(Boolean).join(sep);
      const targetPath = baseDir.replace(/[\\/]+$/, '') + sep + relative;
      const res = isFolder ? await window.electronAPI.createFolder(targetPath) : await window.electronAPI.createFile(targetPath);
      if (res && res.success === false) {
        addLog('error', t('appCreateFail').replace('{e}', res.error ?? name));
        return;
      }
      await refreshTree();
      addLog('info', t(isFolder ? 'appCreatedFolder' : 'appCreatedFile').replace('{n}', name));
      if (!isFolder) {
        const created = getAllFiles(await window.electronAPI.readDirectory(currentRootPath)).find((f) => f.path === targetPath);
        if (created) void handleSelectFile(created);
      }
      return;
    }

    // Mock fallback
    const newItem: FileItem = {
      id: Date.now().toString(),
      name,
      type: isFolder ? 'folder' : 'file',
      language: languageFromName(name),
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

  /** Açık sekmeleri (ve bellekteki düzenlemeleri) taşınan/yeniden adlandırılan yola çevirir (B-10: ayırıcıdan bağımsız eşleşme). */
  const remapTabs = (from: string, to: string, newName?: string) => {
    for (const f of openFilesRef.current) {
      if (!f.path) continue;
      const np = remapPath(f.path, from, to);
      if (np === f.path) continue;
      const live = liveContent.current.get(f.id);
      if (live !== undefined) { liveContent.current.set(np, live); liveContent.current.delete(f.id); }
    }
    setOpenFiles((prev) =>
      prev.map((f) => {
        if (!f.path) return f;
        const np = remapPath(f.path, from, to);
        return np === f.path ? f : { ...f, id: np, path: np, name: normPath(np) === normPath(to) && newName ? newName : f.name };
      })
    );
    setActiveFileId((cur) => {
      const f = cur ? openFilesRef.current.find((x) => x.id === cur) : undefined;
      return f?.path ? remapPath(f.path, from, to) : cur;
    });
  };

  const handleRename = async (item: FileItem, newName: string) => {
    if (!item.path || !window.electronAPI?.renameItem) return;
    const oldPath = item.path;
    const sep = sepOf(oldPath);
    const next = oldPath.slice(0, Math.max(oldPath.lastIndexOf('\\'), oldPath.lastIndexOf('/'))) + sep + newName;
    const res = await window.electronAPI.renameItem(oldPath, next);
    if (!res.success) {
      addLog('error', t('appRenameFail').replace('{e}', res.error ?? newName));
      return;
    }
    // Açık sekmeleri yeni yola taşı (klasör adı değiştiyse içindeki dosyalar da)
    remapTabs(oldPath, next, newName);
    await refreshTree();
    addLog('info', t('appRenamed').replace('{a}', item.name).replace('{b}', newName));
  };

  // Sürükle-bırak taşıma (Gezgin): kaynak, çalışma klasörü içindeki hedef klasöre taşınır; açık sekmeler yeni yola geçer.
  // Güvenlik ana süreçte de denetlenir (fs:renameItem: kapsam + üzerine yazmama).
  const handleMove = async (srcPath: string, targetDir: string) => {
    if (!window.electronAPI?.renameItem) return;
    const sep = sepOf(srcPath);
    const name = srcPath.slice(Math.max(srcPath.lastIndexOf('\\'), srcPath.lastIndexOf('/')) + 1);
    const next = targetDir.replace(/[\\/]+$/, '') + sep + name;
    const res = await window.electronAPI.renameItem(srcPath, next);
    if (!res.success) {
      addLog('error', t('appMoveFail').replace('{e}', res.error ?? name));
      return;
    }
    remapTabs(srcPath, next);
    await refreshTree();
    addLog('info', t('appMoved').replace('{a}', name).replace('{b}', targetDir));
  };

  const handleCloseAll = async () => {
    flushEditorChanges();
    const dirty = openFilesRef.current.filter((f) => f.isModified && !f.diff);
    if (!(await confirmDirty(dirty))) return;
    closeTabsNow(openFilesRef.current.map((f) => f.id));
  };

  /** Projeyi kapatır: kaydedilmemiş sekmeler sorulur, sekmeler ve ağaç temizlenir, karşılama sayfasına dönülür. */
  const handleCloseFolder = async () => {
    if (!rootPathRef.current) return;
    flushEditorChanges();
    const dirty = openFilesRef.current.filter((f) => f.isModified && !f.diff);
    if (!(await confirmDirty(dirty))) return;
    closeTabsNow(openFilesRef.current.map((f) => f.id), false);
    if (remoteRef.current) void window.electronAPI?.ssh?.disconnect?.(remoteRef.current.hostId);
    setRemoteHost(null);
    rootPathRef.current = null;
    treeSeq.current++;
    setCurrentRootPath(null);
    setCurrentRootName('');
    setFiles([]);
    setGitStatus({ isRepo: false, changes: [] });
    setShowSettings(false);
    setShowLanding(true);
    loadRecent(true);
  };

  const handleOpenInTerminal = (dir: string) => {
    setShowBottomTerminal(true);
    void sendTerminalWhenReady({ action: 'cd', dir });
  };

  const handleDeleteFile = async (id: string) => {
    const file = openFilesRef.current.find(f => f.id === id) || findItem(files, id);
    if (file?.path && window.electronAPI?.deleteItem) {
      // Önce çöp kutusu (B-04); taşınamazsa kullanıcıya sorulur, onaylarsa kalıcı silinir
      let res = await window.electronAPI.deleteItem(file.path);
      if (!res?.success && res?.trashFailed && window.confirm(t('appDeletePermanentConfirm'))) {
        res = await window.electronAPI.deleteItem(file.path, { permanent: true });
      }
      // Silme başarısızsa sekme kapanmaz, "Silindi" yazılmaz (B-03)
      if (!res?.success) {
        addLog('error', t('appDeleteFail').replace('{e}', res?.error ?? file.name));
        return;
      }
      // Klasör silindiyse içindeki açık dosyaların sekmeleri de kapanır (B-04); kaydedilmemiş düzenleme silinen dosyaya ait olduğundan sorulmaz
      const gone = normPath(file.path);
      const ids = openFilesRef.current
        .filter((f) => f.path && (normPath(f.path) === gone || normPath(f.path).startsWith(gone + '/')))
        .map((f) => f.id);
      if (ids.length > 0) closeTabsNow(ids, false);
      if (currentRootPath) await loadTree(currentRootPath);
      addLog('warn', t('appDeleted').replace('{n}', file.name));
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
    closeTabsNow([id], false);
  };

  // Disk değişti uyarısı: diskten yükle (düzenlemeler atılır) veya benimkini koru (kayıtta disk ezilir)
  const reloadFromDisk = async (id: string) => {
    const f = openFilesRef.current.find((x) => x.id === id);
    if (!f?.path) return;
    const r = await readText(f.path);
    if (!r.ok) { logReadFail(r, f.name); return; }
    liveContent.current.delete(id);
    setOpenFiles((prev) => prev.map((o) => (o.id === id ? { ...o, content: r.text, isModified: false, externalChange: false, missing: false } : o)));
  };
  // Yerel geçmişten geri yükleme (F-07): sürüm diske yazılır (mevcut içerik ana süreçte geçmişe alınır), açık sekme yenilenir.
  // Silinmiş dosya için üst klasör yeniden oluşturulur; sekme yoksa dosya açılır.
  const restoreFromHistory = async (p: string, content: string): Promise<boolean> => {
    const api = window.electronAPI;
    if (!api?.writeFile) return false;
    const dir = p.replace(/[\\/][^\\/]*$/, '');
    if (dir && dir !== p) await api.createFolder?.(dir);
    const res = await api.writeFile(p, content);
    if (!res.success) {
      addLog('error', t('tlRestoreFail').replace('{e}', res.error ?? p));
      return false;
    }
    const open = openFilesRef.current.find((f) => f.path && normPath(f.path) === normPath(p));
    if (open) await reloadFromDisk(open.id);
    else await openFileAt(p);
    if (currentRootPath) void loadTree(currentRootPath);
    refreshGitStatus();
    addLog('info', t('tlRestored').replace('{n}', p.split(/[\\/]/).pop() ?? p));
    return true;
  };
  const keepMine = async (id: string) => {
    const f = openFilesRef.current.find((x) => x.id === id);
    if (!f?.path) return;
    const r = await readText(f.path);
    setOpenFiles((prev) => prev.map((o) => (o.id === id ? { ...o, ...(r.ok ? { content: r.text } : {}), externalChange: false } : o)));
  };

  // Kapatılan sekmeyi yeniden aç (Ctrl+Shift+T, F-01)
  const reopenClosedTab = async () => {
    for (let i = 0; i < 20; i++) {
      const c = popClosed();
      if (!c) return;
      if (openFilesRef.current.some((f) => f.id === c.path)) continue;
      await openFileAt(c.path);
      return;
    }
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
    track('code_run');
    const current = openFiles.find((f) => f.id === activeFileId);
    if (!current) return;
    const k = previewKind(current.name);
    if (k === 'html' || k === 'svg' || k === 'md') { setShowLanding(false); setShowRightPanel('preview'); return; }
    if (current.path) { runActiveFile(); return; }
    if (current.language === 'javascript') {
      addLog('info', t('appRunning').replace('{n}', current.name));
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
  // Önizleme/AI paneline giden metin: editör değişiklikleri toplu geldiğinde (liveTick) yenilenir
  const activeView = useMemo(
    () => (activeFile ? { name: activeFile.name, path: activeFile.path, language: activeFile.language, content: getContent(activeFile) } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFile, liveTick]
  );
  const previewLive = useMemo(
    () => openFiles.map((o) => ({ path: o.path, content: getContent(o) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openFiles, liveTick]
  );
  const isElectron = !!window.electronAPI?.isElectron;
  const projectName = currentRootPath ? currentRootName : '';
  // Yapay zekâ paneli: üst çubuktaki simgeyle (ve Ctrl+Shift+L) açılıp kapanır; panel sağda yerleşik kalır
  const aiOpen = !showLanding && showRightPanel === 'ai';
  const toggleAI = () => {
    if (aiOpen) { setShowRightPanel(null); return; }
    setShowLanding(false);
    setShowSettings(false);
    setShowRightPanel('ai');
    track('panel_ai');
  };
  // Kenar çubuğu (Gezgin) ana sayfada da açık kalır; yalnız kullanıcı kapatırsa kapanır
  const sidebarShown = sidebarVisible;
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
  const pickSidebar = (tab: 'files' | 'search' | 'git' | 'extensions' | 'debug') => {
    if (activeSidebarTab === tab && sidebarVisible) {
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
  const pickSidebarForce = (tab: 'files' | 'search' | 'git' | 'extensions' | 'debug') => {
    setShowLanding(false);
    setShowSettings(false);
    setActiveSidebarTab(tab);
    setSidebarVisible(true);
  };

  // Git farkı: salt okunur sekme (aynı dosyanın sekmesi varsa yerinde yenilenir)
  const openDiffTab = (item: FileItem) => {
    setShowLanding(false);
    setShowSettings(false);
    setOpenFiles((prev) => (prev.some((f) => f.id === item.id) ? prev.map((f) => (f.id === item.id ? item : f)) : [...prev, item]));
    setActiveFileId(item.id);
  };

  // Alt panelde Sorunlar sekmesini aç
  const openProblems = () => {
    setShowBottomTerminal(true);
    void sendTerminalWhenReady({ action: 'tab', tab: 'problems' });
  };

  // Dal seçici / durum çubuğu eşzamanlama gibi işlemlerin sonucu: günlüğe yazılır, durum çubuğunda kısa süre görünür, Git paneline iletilir
  const pushGitNotice = (ok: boolean, text: string) => {
    setGitNotice({ id: Date.now(), ok, text });
    addLog(ok ? 'info' : 'error', text);
    void refreshGitStatus();
  };
  useEffect(() => {
    if (!gitNotice) return;
    setNoticeShown(true);
    const id = window.setTimeout(() => setNoticeShown(false), 6000);
    return () => window.clearTimeout(id);
  }, [gitNotice]);

  const statusBarSync = async () => {
    const api = window.electronAPI;
    if (!api?.gitSync || !currentRootPath || syncing) return;
    setSyncing(true);
    try {
      const res = await api.gitSync(currentRootPath);
      pushGitNotice(res.success, res.success ? t('gitSyncDone') : res.stderr === 'diverged' ? t('gitDiverged') : res.stderr && res.stderr.length < 300 ? res.stderr : t('gitFailed'));
    } finally {
      setSyncing(false);
    }
  };

  // Açık fark sekmeleri (çalışma ağacı/sahne) git durumu değişince tazelenir
  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.gitDiffFile) return;
    const tabs = openFilesRef.current.filter((f) => f.diff?.source);
    if (tabs.length === 0) return;
    let off = false;
    void Promise.all(
      tabs.map(async (f) => {
        const s = f.diff!.source!;
        return { id: f.id, r: await api.gitDiffFile(s.repo, { path: s.path, orig: s.orig, staged: s.staged }) };
      })
    ).then((res) => {
      if (off) return;
      setOpenFiles((prev) =>
        prev.map((f) => {
          const hit = res.find((x) => x.id === f.id);
          if (!hit || !hit.r.success || !f.diff) return f;
          const original = hit.r.original ?? '';
          const modified = hit.r.modified ?? '';
          const note = hit.r.binary ? 'binary' : hit.r.tooLarge ? 'tooLarge' : undefined;
          if (original === f.diff.original && modified === f.diff.modified && note === f.diff.note) return f;
          return { ...f, diff: { ...f.diff, original, modified, note } };
        })
      );
    });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitStatus]);

  const openFileAt = async (path: string, line?: number) => {
    setShowLanding(false);
    setShowSettings(false);
    const name = baseName(path);
    await handleSelectFile({ id: path, name, path, type: 'file', language: languageFromName(name) });
    if (line) window.setTimeout(() => goToLine(line), 150);
  };

  const runInTerminal = (command: string) => {
    setShowBottomTerminal(true);
    void sendTerminalWhenReady({ action: 'run', command });
  };

  const runActiveFile = () => {
    const f = openFiles.find((x) => x.id === activeFileId);
    if (!f?.path) { addLog('warn', t('mnRunNoFile')); setShowBottomTerminal(true); return; }
    const custom = { node: String(settings.runCommandNode || ''), ts: String(settings.runCommandTs || ''), python: String(settings.runCommandPython || ''), go: String(settings.runCommandGo || ''), php: String(settings.runCommandPhp || '') };
    const cmd = runCommandFor(f.path, f.language, custom);
    if (!cmd) { addLog('warn', t('mnRunNoRunner')); setShowBottomTerminal(true); return; }
    if (f.isModified && settings.runSaveBefore !== false) void handleSaveFile(f, false);
    if (settings.runClearTerminal === true) sendTerminal({ action: 'clear' });
    runInTerminal(cmd);
  };

  // ----------------------------------------------------
  // Oturum kalıcılığı (B-14), kapanış denetimi (B-02), web'de çıkış uyarısı
  // Veri yalnız bu bilgisayarda (localStorage) tutulur; sonraki açılışta kullanıcıya geri yükleme sorulur, onaysız hiçbir şey açılmaz.
  // ----------------------------------------------------
  const [restoreOffer, setRestoreOffer] = useState<Session | null>(null);
  const sessionLive = useRef(false);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeFileId;
  const rootNameRef = useRef('');
  rootNameRef.current = currentRootName;
  useEffect(() => {
    const s = loadSession();
    if (isRestorable(s)) setRestoreOffer(s);
    else sessionLive.current = true;
  }, []);
  const persistSession = (withDrafts = true, flush = false) => {
    if (flush) flushEditorChanges();
    if (remoteRef.current) return; // uzak oturum kaydedilmez: bağlantısız açılışta ssh:// yolları geri yüklenemez, yerel oturum da ezilmesin
    saveSession({
      root: rootPathRef.current,
      rootName: rootNameRef.current,
      activeId: activeIdRef.current,
      files: openFilesRef.current,
      getContent: (id) => liveContent.current.get(id) ?? openFilesRef.current.find((f) => f.id === id)?.content,
      withDrafts,
      split: splitRef.current
    });
  };
  useEffect(() => {
    if (!sessionLive.current) return;
    const id = window.setTimeout(() => persistSession(), 800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFiles, activeFileId, currentRootPath, liveTick, restoreOffer, split]);
  useEffect(() => {
    const onHide = () => { if (sessionLive.current) persistSession(true, true); };
    // Tarayıcıda (Electron dışı) kaydedilmemiş değişiklik varken sekme kapatılırsa tarayıcı uyarısı
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (window.electronAPI?.onCloseRequest) return;
      flushEditorChanges();
      if (openFilesRef.current.some((f) => f.isModified && !f.diff)) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => { window.removeEventListener('pagehide', onHide); window.removeEventListener('beforeunload', onBeforeUnload); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreSession = async (s: Session) => {
    setRestoreOffer(null);
    sessionLive.current = true;
    const api = window.electronAPI;
    if (s.root && api?.openRecentFolder) {
      setIsLoadingProject(true);
      try {
        const r = await api.openRecentFolder(s.root);
        if ('error' in r) addLog('error', t('appFolderOpenFail').replace('{e}', r.error));
        else applyWorkspace(r);
      } catch (err) {
        addLog('error', t('appFolderOpenFail').replace('{e}', String(err)));
      } finally {
        setIsLoadingProject(false);
      }
    }
    const items: FileItem[] = [];
    const idByTab: Record<number, string> = {};
    let activeId: string | null = null;
    for (let i = 0; i < s.tabs.length; i++) {
      const tab = s.tabs[i];
      let item: FileItem | null = null;
      if (tab.path) {
        item = { id: tab.path, name: tab.name, path: tab.path, type: 'file', language: tab.language ?? languageFromName(tab.name) };
        const r: ReadResult = api?.readFile ? await readText(tab.path) : { ok: false, text: '', error: 'no-api' };
        if (r.ok) item.content = r.text;
        else if (tab.draft !== undefined) { item.content = ''; item.missing = /ENOENT|no such file/i.test(r.error); }
        else continue;
        if (tab.draft !== undefined && tab.draft !== item.content) {
          liveContent.current.set(item.id, tab.draft);
          item.isModified = true;
        }
      } else if (tab.draft) {
        untitledCounter.current += 1;
        item = { id: `untitled-${Date.now()}-${i}`, name: tab.name, type: 'file', language: tab.language ?? 'plaintext', content: tab.draft, isModified: true };
      }
      if (!item) continue;
      if (i === s.active) activeId = item.id;
      idByTab[i] = item.id;
      items.push(item);
    }
    if (items.length > 0) {
      setOpenFiles((prev) => {
        const ids = new Set(prev.map((f) => f.id));
        return [...prev, ...items.filter((f) => !ids.has(f.id))];
      });
      const restoredSplit = savedToSplit(s.split, (i) => idByTab[i]);
      setSplitRaw(restoredSplit);
      setActiveFileId(restoredSplit ? activeOf(restoredSplit, restoredSplit.focus) ?? activeId ?? items[0].id : activeId ?? items[0].id);
      setShowLanding(false);
      setShowSettings(false);
    }
  };
  const dismissRestore = () => {
    setRestoreOffer(null);
    sessionLive.current = true;
    clearSession();
  };

  // Pencere kapatılmak istenince (X, Alt+F4, Ctrl+Q): kaydedilmemiş değişiklik varsa Kaydet/Kaydetme/İptal sorulur
  const onCloseRequest = useEvent(async () => {
    const api = window.electronAPI;
    if (!api?.respondClose) return;
    try {
      flushEditorChanges();
      const dirty = openFilesRef.current.filter((f) => f.isModified && !f.diff);
      if (dirty.length > 0) {
        api.closePending?.(); // kullanıcı karar verirken ana süreç 5 sn sonra zorla kapatmasın
        const c = await askUnsaved(dirty);
        if (c === 'cancel') { api.respondClose(false); return; }
        if (c === 'save') {
          for (const f of dirty) {
            if (!(await handleSaveFileRef.current(f, false))) { api.respondClose(false); return; }
          }
        } else {
          persistSession(false); // bilerek kaydedilmeyenler taslak olarak saklanmaz
          api.respondClose(true);
          return;
        }
      }
      persistSession(false);
      api.respondClose(true);
    } catch {
      // Beklenmedik hata pencereyi kilitlemesin; taslaklar oturum dosyasında durur
      try { persistSession(true); } catch { /* yoksay */ }
      api.respondClose(true);
    }
  });
  useEffect(() => {
    const off = window.electronAPI?.onCloseRequest?.(() => { void onCloseRequest(); });
    return () => off?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDocs = (path: string) => void window.electronAPI?.github.openExternal(`https://github.com/orayyilmaz16/NovaCode-Studio${path}`);
  const openSettingsAt = (cat: string) => {
    try { window.localStorage.setItem('nova.settings.category', cat); } catch { /* depolama kapalı */ }
    setShowLanding(false);
    setShowSettings(true);
  };

  // Renk teması seçici: gezilirken canlı uygulanır; Esc özgün temayı geri yükler
  const extThemeList = listExtThemes(extInstalled);
  const activeThemeId = extThemeList.some((th) => th.id === String(settings.extTheme || '')) ? String(settings.extTheme) : String(settings.editorTheme || 'auto');
  const openThemePicker = () => {
    themeOrig.current = { editorTheme: String(settings.editorTheme || 'auto'), extTheme: String(settings.extTheme || '') };
    setPalette('theme');
  };
  const previewTheme = (id: string) => { if (extThemeList.some((th) => th.id === id)) setSetting('extTheme', id); else setSetting('editorTheme', id); };
  const revertTheme = () => { setSetting('editorTheme', themeOrig.current.editorTheme); if (themeOrig.current.extTheme) setSetting('extTheme', themeOrig.current.extTheme); };

  // Terminal çıktısındaki yol:satır bağlantıları (Ctrl+Tık) ve dil sunucusu "tanıma git": dosyayı ilgili satırda aç
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ path?: string; line?: number; cwd?: string }>).detail;
      if (!d?.path) return;
      const base = d.cwd || currentRootPath || '';
      const sep = base.includes('\\') ? '\\' : '/';
      const abs = /^([A-Za-z]:[\\/]|\/)/.test(d.path) ? d.path : `${base.replace(/[\\/]+$/, '')}${sep}${d.path.replace(/^\.[\\/]/, '').split(/[\\/]/).join(sep)}`;
      void openFileAt(abs, d.line && d.line > 0 ? d.line : undefined);
    };
    window.addEventListener('nova:open-file', on);
    return () => window.removeEventListener('nova:open-file', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFiles, currentRootPath]);

  // Hata ayıklama: yalnız klasör açıkken ve etkin dosya JavaScript ise başlatılabilir
  const canDebug = !!currentRootPath && !!activeFile?.path && isDebuggable(activeFile.name);
  const startDebugActive = () => { if (canDebug && activeFile?.path) void startDebug(activeFile.path); };
  useEffect(() => {
    setLocationHandler((file, line) => { void openFileAt(file, line); });
    return () => setLocationHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFiles, currentRootPath]);

  // Menü/komut dizileri useMemo ile kurulur (P-19): işleyiciler her zaman en güncel sürümü çağıran vekil (L) üzerinden gider.
  const saveActive = () => { const f = openFilesRef.current.find((x) => x.id === activeFileId); if (f) void handleSaveFile(f); };
  const closeActive = () => { if (activeFileId) closeInGroup(activeFileId, splitRef.current?.focus ?? 'a'); };
  const cycleTab = (delta: number) => {
    const s0 = splitRef.current;
    const all = openFilesRef.current;
    const list = s0 ? (s0.focus === 'a' ? s0.a : s0.b).map((id) => all.find((f) => f.id === id)).filter((f): f is FileItem => !!f) : all;
    if (list.length < 2) return;
    const i = list.findIndex((f) => f.id === activeFileId);
    selectInGroupTab(list[(i + delta + list.length) % list.length].id, s0?.focus ?? 'a');
  };
  const zoomBy = (d: number) => setSetting('uiZoom', Math.max(80, Math.min(150, Number(settings.uiZoom || 100) + d)));
  const toggleThemeMode = () => setSetting('themeMode', document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  const checkUpdatesNow = () => { track('update_check'); setUpdateDlg('update'); void checkForUpdates(settings.updateAutoDownload === true); };
  const actions = {
    handleNewUntitled, handleOpenFolderDialog, handleOpenFileDialog, handleCloseFolder, saveActive, closeActive, cycleTab, handleRunCode, runActiveFile,
    splitRight: () => doSplit('row'), splitDown: () => doSplit('col'), focusOtherGroup, closeSplitView, openKeybindings: () => setShowKeybindings(true),
    startDebugActive, openSettingsAt, openDocs, openProblems, pickSidebarForce, toggleAI, openThemePicker, reopenClosedTab,
    zoomBy, toggleThemeMode, checkUpdatesNow, newTerminal: () => { setShowBottomTerminal(true); void sendTerminalWhenReady({ action: 'new' }); },
    clearTerminal: () => sendTerminal({ action: 'clear' }),
    openGitBranch: () => { if (rootRef.current && gitRepoRef.current) setPicker('checkout'); },
    openTaskPicker: () => { if (rootRef.current) setTaskPicker(true); else { addLog('warn', t('taskNoFolder')); setShowBottomTerminal(true); } },
    openAi: () => { setShowLanding(false); setShowSettings(false); setShowRightPanel('ai'); },
    openSettings: () => { setShowLanding(false); setShowSettings(true); },
    openTimeline: () => setDevDlg('timeline'),
    openSnippets: () => setDevDlg('snippets'),
  };
  const liveActions = useRef(actions);
  liveActions.current = actions;
  const L = useMemo(
    () => new Proxy({} as typeof actions, { get: (_t, k) => (...a: unknown[]) => (liveActions.current as unknown as Record<string, (...x: unknown[]) => unknown>)[k as string](...a) }),
    []
  );
  const rootRef = useRef(currentRootPath);
  rootRef.current = currentRootPath;
  const gitRepoRef = useRef(gitStatus.isRepo);
  gitRepoRef.current = gitStatus.isRepo;

  const uiLang = getUiLang();
  // Anonim kullanım sayacı: rıza ayarı ana sürece eşitlenir, ilk açılışta tek seferlik soru (docs/brain/actions/analytics.md)
  const analytics = useAnalytics(settings.analyticsEnabled === true, uiLang);
  useEffect(() => { if (sidebarVisible) track(('panel_' + activeSidebarTab) as Parameters<typeof track>[0]); }, [activeSidebarTab, sidebarVisible]);
  useEffect(() => { if (showBottomTerminal) track('panel_terminal'); }, [showBottomTerminal]);
  useEffect(() => { if (showSettings) track('panel_settings'); }, [showSettings]);
  // Dil dağılımı: aktif dosya değişince yalnız dilin kimliği sayılır (içerik/ad/yol yok)
  const analyticsFileId = activeFile?.id;
  const analyticsFileLang = activeFile?.language;
  useEffect(() => { if (analyticsFileId && analyticsFileLang) track(langEvent(analyticsFileLang)); }, [analyticsFileId]); // eslint-disable-line react-hooks/exhaustive-deps
  // GitHub oturumu: yalnız giriş/çıkış GEÇİŞİ sayılır (hesap adı yok; açılışta kayıtlı oturumun yüklenmesi giriş sayılmaz)
  const prevGhConnected = useRef<boolean | null>(null);
  useEffect(() => {
    if (!authReady) return;
    if (prevGhConnected.current !== null && prevGhConnected.current !== auth.connected) track(auth.connected ? 'github_login' : 'github_logout');
    prevGhConnected.current = auth.connected;
  }, [authReady, auth.connected]);
  const hasFile = !!activeFile;
  const hasRoot = !!currentRootPath;
  const dbgIdle = dbgStatus === 'idle';
  const fewTabs = openFiles.length < 2;
  const isSplit = !!split;
  const menusRaw: MenuGroup[] = useMemo(() => {
    // Kapalı menü öğeleri: soluk görünür, üzerine gelince nedenini söyler
    const F = { disabled: !hasFile, hint: !hasFile ? t('mnHintNoFile') : undefined };
    const D = { disabled: !hasRoot, hint: !hasRoot ? t('mnHintNoFolder') : undefined };
    const act = runEditorAction;
    // Bazı etiketler kısayolu parantez içinde taşır; menüde kısayol ayrı sütunda gösterilir
    const plain = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, '');
    const togglePreview = () => setShowRightPanel((v) => (v === 'preview' ? null : 'preview'));
    return [
    { id: 'file', label: t('mnFile'), items: [
      { label: t('newFile'), shortcut: 'Ctrl+N', onClick: L.handleNewUntitled },
      { label: t('openFolder'), shortcut: 'Ctrl+O', onClick: () => void L.handleOpenFolderDialog() },
      { label: t('openFiles'), shortcut: 'Ctrl+Shift+O', onClick: () => void L.handleOpenFileDialog() },
      { label: t('rmConnect'), onClick: () => setShowRemote(true) },
      { label: t('expCloseFolder'), ...D, onClick: () => void L.handleCloseFolder() },
      { separator: true },
      { label: t('cmdSave'), shortcut: 'Ctrl+S', ...F, onClick: L.saveActive },
      { label: t('cmdCloseTab'), shortcut: 'Ctrl+W', ...F, onClick: L.closeActive },
      { label: t('appReopenTab'), shortcut: 'Ctrl+Shift+T', onClick: () => void L.reopenClosedTab() },
      { separator: true },
      { label: t('actSettings'), shortcut: 'Ctrl+,', onClick: L.openSettings },
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
      { label: t('cmdFindInFiles'), shortcut: 'Ctrl+Shift+F', ...D, onClick: () => L.pickSidebarForce('search') },
      { separator: true },
      { label: t('mnComment'), shortcut: 'Ctrl+/', ...F, onClick: () => act('editor.action.commentLine') },
      { label: t('cmdFormat'), shortcut: 'Shift+Alt+F', ...F, onClick: () => act('editor.action.formatDocument') }
    ] },
    { id: 'selection', label: t('mnSelection'), items: [
      { label: t('mnSelectAll'), shortcut: 'Ctrl+A', ...F, onClick: () => act('editor.action.selectAll') },
      { label: t('mnExpandLine'), ...F, onClick: () => act('expandLineSelection') },
      { label: t('mnNextMatch'), shortcut: 'Ctrl+D', ...F, onClick: () => act('editor.action.addSelectionToNextFindMatch') },
      { label: t('mnSelectMatches'), ...F, onClick: () => act('editor.action.selectHighlights') },
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
      { label: t('actExplorer'), onClick: () => L.pickSidebarForce('files') },
      { label: t('actSearch'), shortcut: 'Ctrl+Shift+F', ...D, onClick: () => L.pickSidebarForce('search') },
      { label: t('actGit'), onClick: () => L.pickSidebarForce('git') },
      { label: t('extTitle'), onClick: () => L.pickSidebarForce('extensions') },
      { separator: true },
      { label: plain(t('tbSidebar')), shortcut: 'Ctrl+B', onClick: () => setSidebarVisible((v) => !v) },
      { label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', ...D, onClick: () => setShowBottomTerminal((v) => !v) },
      { label: t('cmdOpenAI'), shortcut: 'Ctrl+Shift+L', onClick: () => { L.toggleAI(); } },
      { label: t('tbPreview'), disabled: !canPreview, hint: !canPreview ? t('mnHintHtml') : undefined, onClick: togglePreview },
      { separator: true },
      { label: t('cmdSplitRight'), shortcut: 'Ctrl+\\', ...F, onClick: L.splitRight },
      { label: t('cmdSplitDown'), shortcut: 'Ctrl+Alt+\\', ...F, onClick: L.splitDown },
      { label: t('cmdFocusOtherGroup'), disabled: !isSplit, onClick: L.focusOtherGroup },
      { label: t('cmdCloseSplit'), disabled: !isSplit, onClick: L.closeSplitView },
      { separator: true },
      { label: t('mnZoomIn'), onClick: () => L.zoomBy(10) },
      { label: t('mnZoomOut'), onClick: () => L.zoomBy(-10) },
      { label: t('mnZoomReset'), onClick: () => setSetting('uiZoom', 100) },
      { label: t('mnThemePicker'), onClick: L.openThemePicker },
      { label: t('cmdToggleTheme'), onClick: L.toggleThemeMode }
    ] },
    { id: 'go', label: t('mnGo'), items: [
      { label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', onClick: () => setPalette('') },
      { label: t('cmdGoToLine'), shortcut: 'Ctrl+G', ...F, onClick: () => setPalette(':') },
      { label: t('cmdGoToSymbol'), ...F, onClick: () => act('editor.action.quickOutline') },
      { separator: true },
      { label: t('mnNextTab'), shortcut: 'Ctrl+Tab', disabled: fewTabs, hint: fewTabs ? t('mnHintTwoTabs') : undefined, onClick: () => L.cycleTab(1) },
      { label: t('mnPrevTab'), shortcut: 'Ctrl+Shift+Tab', disabled: fewTabs, hint: fewTabs ? t('mnHintTwoTabs') : undefined, onClick: () => L.cycleTab(-1) }
    ] },
    { id: 'run', label: t('mnRun'), items: [
      { label: t('mnRunFile'), shortcut: 'F5', ...F, onClick: L.handleRunCode },
      { label: t('taskRun'), disabled: !hasRoot, hint: !hasRoot ? t('mnHintNoFolder') : undefined, onClick: L.openTaskPicker },
      { label: t('tbPreview'), disabled: !canPreview, hint: !canPreview ? t('mnHintHtml') : undefined, onClick: togglePreview },
      { separator: true },
      dbgIdle
        ? { label: t('dbgStart'), disabled: !canDebug, hint: !canDebug ? t('dbgOnlyJs') : undefined, onClick: L.startDebugActive }
        : { label: t('dbgStop'), shortcut: 'Shift+F5', onClick: () => void stopDebug() },
      { label: t('dbgToggleBp'), shortcut: 'F9', ...F, onClick: () => runEditorAction('nova.toggleBreakpoint') },
      { separator: true },
      { label: t('mnRunSettings'), onClick: () => L.openSettingsAt('run') }
    ] },
    { id: 'terminal', label: t('mnTerminal'), items: [
      { label: t('mnNewTerminal'), ...D, onClick: L.newTerminal },
      { label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', ...D, onClick: () => setShowBottomTerminal((v) => !v) },
      { label: t('termClear'), ...D, onClick: L.clearTerminal },
      { separator: true },
      { label: t('mnRunFile'), ...F, onClick: L.runActiveFile }
    ] },
    { id: 'help', label: t('mnHelp'), items: [
      { label: t('mnWelcome'), onClick: () => { setShowSettings(false); setShowLanding(true); } },
      { label: t('mnShortcuts'), onClick: () => L.openSettingsAt('shortcuts') },
      { separator: true },
      { label: t('mnDocs'), onClick: () => L.openDocs('#readme') },
      { separator: true },
      { label: t('mnCheckUpdates'), onClick: L.checkUpdatesNow },
      { label: t('mnReleaseNotes'), onClick: () => setUpdateDlg('notes') },
      { label: t('mnReportIssue'), onClick: () => L.openDocs('/issues/new') },
      { separator: true },
      { label: t('mnAbout'), onClick: () => L.openSettingsAt('about') }
    ] }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang, extraTexts, hasFile, hasRoot, canPreview, canDebug, dbgIdle, fewTabs, isSplit]);
  // Menü etiketlerindeki sabit kısayol metni, kullanıcının atadığı kısayola çevrilir (F-04)
  const menus: MenuGroup[] = useMemo(
    () => menusRaw.map((g) => ({ ...g, items: g.items.map((i) => ('shortcut' in i && i.shortcut ? { ...i, shortcut: remapShortcutLabel(i.shortcut, kbBindings) } : i)) })),
    [menusRaw, kbBindings]
  );

  const paletteCommandsRaw: PaletteCommand[] = useMemo(() => {
    const plain = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, '');
    return [
    { id: 'themePicker', label: t('mnThemePicker'), run: L.openThemePicker },
    { id: 'quickOpen', label: t('cmdQuickOpen'), shortcut: 'Ctrl+P', run: () => setPalette('') },
    { id: 'goLine', label: t('cmdGoToLine'), shortcut: 'Ctrl+G', run: () => setPalette(':') },
    { id: 'goSymbol', label: t('cmdGoToSymbol'), run: () => runEditorAction('editor.action.quickOutline') },
    { id: 'findInFiles', label: t('cmdFindInFiles'), shortcut: 'Ctrl+Shift+F', run: () => L.pickSidebarForce('search') },
    { id: 'timeline', label: t('cmdTimeline'), run: L.openTimeline },
    { id: 'snippets', label: t('cmdSnippets'), run: L.openSnippets },
    { id: 'find', label: t('cmdFind'), shortcut: 'Ctrl+F', run: () => runEditorAction('actions.find') },
    { id: 'replace', label: t('cmdReplace'), shortcut: 'Ctrl+H', run: () => runEditorAction('editor.action.startFindReplace') },
    { id: 'format', label: t('cmdFormat'), run: () => runEditorAction('editor.action.formatDocument') },
    { id: 'newFile', label: t('newFile'), shortcut: 'Ctrl+N', run: L.handleNewUntitled },
    { id: 'openFolder', label: t('openFolder'), shortcut: 'Ctrl+O', run: () => void L.handleOpenFolderDialog() },
    { id: 'closeFolder', label: t('expCloseFolder'), run: () => void L.handleCloseFolder() },
    { id: 'remoteConnect', label: t('rmConnect'), run: () => setShowRemote(true) },
    { id: 'remoteWindow', label: t('rwTitle'), run: () => setRemoteMenu(true) },
    { id: 'save', label: t('cmdSave'), shortcut: 'Ctrl+S', run: L.saveActive },
    { id: 'closeTab', label: t('cmdCloseTab'), shortcut: 'Ctrl+W', run: L.closeActive },
    { id: 'reopenTab', label: t('appReopenTab'), shortcut: 'Ctrl+Shift+T', run: () => void L.reopenClosedTab() },
    { id: 'sidebar', label: plain(t('tbSidebar')), shortcut: 'Ctrl+B', run: () => setSidebarVisible((v) => !v) },
    { id: 'terminal', label: plain(t('tbTerminal')), shortcut: 'Ctrl+`', run: () => setShowBottomTerminal((v) => !v) },
    { id: 'git', label: t('actGit'), run: () => L.pickSidebarForce('git') },
    { id: 'gitBranch', label: t('scmBranchTip'), run: L.openGitBranch },
    { id: 'problems', label: t('prbTab'), shortcut: 'Ctrl+Shift+M', run: L.openProblems },
    { id: 'extensions', label: t('extTitle'), run: () => L.pickSidebarForce('extensions') },
    { id: 'ai', label: t('cmdOpenAI'), shortcut: 'Ctrl+Shift+L', run: L.openAi },
    { id: 'settings', label: t('actSettings'), shortcut: 'Ctrl+,', run: L.openSettings },
    { id: 'themeToggle', label: t('cmdToggleTheme'), run: L.toggleThemeMode },
    { id: 'runTask', label: t('taskRun'), run: L.openTaskPicker },
    { id: 'addNextMatch', label: t('mnNextMatch'), shortcut: 'Ctrl+D', run: () => runEditorAction('editor.action.addSelectionToNextFindMatch') },
    { id: 'selectMatches', label: t('mnSelectMatches'), run: () => runEditorAction('editor.action.selectHighlights') },
    { id: 'cursorAbove', label: t('mnCursorAbove'), shortcut: 'Ctrl+Alt+↑', run: () => runEditorAction('editor.action.insertCursorAbove') },
    { id: 'cursorBelow', label: t('mnCursorBelow'), shortcut: 'Ctrl+Alt+↓', run: () => runEditorAction('editor.action.insertCursorBelow') },
    { id: 'splitRight', label: t('cmdSplitRight'), shortcut: 'Ctrl+\\', run: L.splitRight },
    { id: 'splitDown', label: t('cmdSplitDown'), shortcut: 'Ctrl+Alt+\\', run: L.splitDown },
    { id: 'focusOtherGroup', label: t('cmdFocusOtherGroup'), run: L.focusOtherGroup },
    { id: 'closeSplit', label: t('cmdCloseSplit'), run: L.closeSplitView },
    { id: 'keybindings', label: t('kbOpen'), run: L.openKeybindings }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang, extraTexts]);
  // Paletteki sabit kısayol metinleri kullanıcının atadığı kısayola çevrilir (F-04)
  const paletteCommands: PaletteCommand[] = useMemo(
    () => paletteCommandsRaw.map((c) => (c.shortcut ? { ...c, shortcut: remapShortcutLabel(c.shortcut, kbBindings) || undefined } : c)),
    [paletteCommandsRaw, kbBindings]
  );

  // Projesiz/dosyasız işe yaramayan düğmeler: soluk görünür, üzerine gelince nedenini söyler, tıklayınca bir şey yapmaz
  const dis = (off: boolean, hint: string) => (off ? ({ 'aria-disabled': true, 'data-disabled': true, title: hint } as const) : {});

  // Sabit kimlikli işleyiciler: React.memo'lu EditorArea/FileTree gereksiz yeniden çizilmez (P-01)
  const eOpenPath = useEvent((p: string) => void openFileAt(p));
  const eSelectA = useEvent((id: string) => selectInGroupTab(id, 'a'));
  const eSelectB = useEvent((id: string) => selectInGroupTab(id, 'b'));
  const eCloseTab = useEvent((id: string) => void handleCloseTab(id)); // Açık Editörler listesi: dosyayı her yerden kapatır
  const eCloseA = useEvent((id: string) => closeInGroup(id, 'a'));
  const eCloseB = useEvent((id: string) => closeInGroup(id, 'b'));
  const eFocusGroup = useEvent((g: GroupId) => focusGroupId(g));
  const eDropTab = useEvent((id: string, from: GroupId, to: GroupId | 'new-right' | 'new-down') => dropTab(id, from, to));
  const eSplitRight = useEvent(() => doSplit('row'));
  const eCloseSplit = useEvent(() => closeSplitView());
  const groupsRef = useRef<HTMLDivElement>(null);
  const stackCol = !!split && (split.dir === 'col' || vw < 860);
  const resizeGroups = (d: number) => {
    const el = groupsRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sign = !stackCol && getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    setSplitRatio((v) => clamp(v + (sign * d) / Math.max(200, stackCol ? r.height : r.width), 0.2, 0.8));
  };
  const eChangeContent = useEvent((id: string, c: string) => handleContentChange(id, c));
  const eDirty = useEvent((id: string) => markDirty(id));
  const eSave = useEvent((file: FileItem) => void handleSaveFile(file));
  const eRun = useEvent(() => handleRunCode());
  const eTogglePreview = useEvent(() => setShowRightPanel((v) => (v === 'preview' ? null : 'preview')));
  const eNewFile = useEvent(() => handleNewUntitled());
  const eOpenFolder = useEvent(() => void handleOpenFolderDialog());
  const eOpenFiles = useEvent(() => void handleOpenFileDialog());
  const eInitial = useEvent((file: FileItem) => getContent(file));
  const eReload = useEvent((id: string) => void reloadFromDisk(id));
  const eKeep = useEvent((id: string) => void keepMine(id));
  const eTreeSelect = useEvent((file: FileItem) => { setShowLanding(false); setShowSettings(false); void handleSelectFile(file); });
  const eCreate = useEvent((name: string, isFolder: boolean, parentDir?: string) => void handleCreateFile(name, isFolder, parentDir));
  const eMove = useEvent((src: string, dir: string) => void handleMove(src, dir));
  const eCloseAll = useEvent(() => void handleCloseAll());
  const eCloseFolder = useEvent(() => void handleCloseFolder());
  const eTerm = useEvent((dir: string) => handleOpenInTerminal(dir));
  const eRecent = useEvent((p: string) => void handleOpenRecent(p));
  const eRename = useEvent((item: FileItem, name: string) => void handleRename(item, name));
  const eDelete = useEvent((id: string) => void handleDeleteFile(id));
  const eRefresh = useEvent(() => void refreshTree());
  const collabCfg = useMemo(() => ({ enabled: collabEnabled && collabUrlValid, url: collabUrl.trim(), token: collabToken, room: collabEnabled && currentRootPath ? getCollabRoomId(currentRootPath) : '', root: currentRootPath || '' }), [collabEnabled, collabUrlValid, collabUrl, collabToken, currentRootPath]);
  const settingsRef = useRef<HTMLDivElement>(null);
  useFocusTrap(settingsRef, showSettings);

  const barBtn = (active: boolean) => ({ 'data-active': active, className: 'ab-item' }) as const;

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden bg-nv-side text-zinc-300 font-sans relative">
      {/* Açılış animasyonu */}
      {showSplash && <SplashScreen ready={recentLoaded} onFinish={() => setShowSplash(false)} />}

      {/* Ayarlar: uygulamanın üstünde, ayrı pencere (z-katmanı: bkz. ui-design.md → Katman sırası) */}
      {showSettings && (
        <div className="app-no-drag fixed inset-0 z-[150] flex items-center justify-center bg-black/65 p-3 sm:p-6 animate-editor-in" onMouseDown={() => setShowSettings(false)}>
          <div
            ref={settingsRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('setTitle')}
            onMouseDown={(e) => e.stopPropagation()}
            className="animate-dialog flex w-[min(1120px,100%)] h-[min(780px,100%)] rounded-xl border border-nv-border bg-nv-editor overflow-hidden"
          >
            <LazyPanel><SettingsPage onClose={() => setShowSettings(false)} onOpenExtensions={() => { setShowSettings(false); pickSidebarForce('extensions'); }} /></LazyPanel>
          </div>
        </div>
      )}

      {unsavedAsk && (
        <UnsavedDialog
          names={unsavedAsk.files.map((x) => x.name)}
          hasUntitled={unsavedAsk.files.some((x) => !x.path)}
          onChoose={(c) => { unsavedAsk.resolve(c); setUnsavedAsk(null); }}
        />
      )}
      {analytics.ask && !restoreOffer && (
        <AnalyticsConsentDialog
          onAllow={() => { setSetting('analyticsEnabled', true); analytics.answered(); }}
          onDecline={analytics.answered}
        />
      )}
      {restoreOffer && (
        <RestoreSessionDialog
          tabs={restoreOffer.tabs.length}
          unsaved={restoreOffer.tabs.filter((x) => x.draft !== undefined).length}
          onRestore={() => void restoreSession(restoreOffer)}
          onDismiss={dismissRestore}
        />
      )}

      {trustState.root && !trustState.trusted && trustState.prompt && <LazyPanel><TrustDialog /></LazyPanel>}
      {showKeybindings && <LazyPanel><KeybindingsEditor onClose={() => setShowKeybindings(false)} /></LazyPanel>}
      {remoteMenu && (
        <LazyPanel>
          <RemoteMenu
            repo={currentRootPath}
            branch={gitStatus.branch}
            hasRemote={gitStatus.hasRemote}
            onClose={() => setRemoteMenu(false)}
            onOpenSsh={() => setShowRemote(true)}
            onRunInTerminal={(command) => { setShowBottomTerminal(true); void sendTerminalWhenReady({ action: 'run', command }); }}
          />
        </LazyPanel>
      )}
      {showRemote && <LazyPanel><RemoteDialog onClose={() => setShowRemote(false)} onOpened={applyWorkspace} /></LazyPanel>}

      {updateDlg && <UpdateDialog initialTab={updateDlg} autoDownload={settings.updateAutoDownload === true} onClose={() => setUpdateDlg(null)} />}

      {palette !== null && (
        <LazyPanel>
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
        </LazyPanel>
      )}

      {/* Başlık çubuğu: ince kenarlıklı, yuvarlak çerçeve; üstteki dar boşluk da pencereyi sürüklemeye yarar */}
      <div className="app-drag absolute inset-x-0 top-0 h-[var(--frame)] z-10" aria-hidden />
      <header
        className="@container app-drag relative grid grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)] items-center gap-[var(--frame)] h-9 mx-[var(--frame)] mt-[var(--frame)] select-none shrink-0"
        // Duyarlı üç bölge (kap sorguları, başlık genişliğine göre): sol (logo + menü) · orta (arama, ortalı) · sağ (düğmeler + pencere denetimleri).
        // Dar kapta önce klasör/önizleme/ayarlar grubu, sonra arama yazısı ve yapay zekâ bölmesi gizlenir; bu eylemler menü ve kısayollarda durur.
      >
        <div className="flex items-center h-full min-w-0 max-w-full justify-self-start overflow-hidden rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-side">
          <div className="flex items-center pl-3 pr-1 h-full shrink-0"><Logo size={18} /></div>
          <span className="hdr-sep app-no-drag" aria-hidden />
          <MenuBar menus={menus} compact={compactMenu} />
        </div>

        {/* Orta: VS Code komut merkezi gibi tek hap: solda arama / proje alanı, en sağda ayrı bölmede yapay zekâ paneli düğmesi */}
        <div className="app-no-drag flex items-stretch min-w-9 w-9 @xl:w-[clamp(180px,24cqw,340px)] h-full rounded-[var(--frame-r)] float-card bg-nv-side border border-nv-border hover:border-white/[0.18] motion-press overflow-hidden">
          <button
            onClick={() => setPalette('')}
            title={`${t('cpTitle')} (Ctrl+P)`}
            aria-label={t('cpTitle')}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 px-2 text-[12px] text-zinc-300 hover:bg-white/5 motion-press"
          >
            <Search size={13} className="text-zinc-400 @xl:text-zinc-500 shrink-0" />
            <span className="hidden @xl:inline truncate min-w-0">
              {showLanding
                ? t('actHome')
                : activeFile
                  ? `${activeFile.name}${activeFile.isModified ? ' •' : ''}${projectName ? ` — ${projectName}` : ''}`
                  : projectName || 'NovaCode Studio'}
            </span>
          </button>
          <button
            onClick={toggleAI}
            title={`${t('actAI')} (Ctrl+Shift+L)`}
            aria-label={t('actAI')}
            aria-pressed={aiOpen}
            data-active={aiOpen}
            className={`hidden @xl:flex shrink-0 w-9 items-center justify-center border-s border-white/[0.09] motion-press ${aiOpen ? 'bg-indigo-500/25 text-indigo-100' : 'text-indigo-300 hover:bg-white/5 hover:text-indigo-100'}`}
          >
            <Sparkles size={13} />
          </button>
        </div>

        <div className="flex items-center justify-end h-full shrink-0 justify-self-end rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-side">
        <div className="app-no-drag flex items-center justify-end gap-1.5 shrink-0 pe-1">
          <div className="hdr-group hidden @3xl:inline-flex">
          <button onClick={handleOpenFolderDialog} title={`${t('openFolder')} (Ctrl+O)`} aria-label={t('openFolder')} className="hdr-btn">
            <FolderOpen size={15} />
          </button>
          <button
            onClick={() => { if (canPreview) setShowRightPanel(showRightPanel === 'preview' ? null : 'preview'); }}
            {...dis(!canPreview, `${t('tbPreview')} — ${t('mnHintHtml')}`)}
            title={canPreview ? t('tbPreview') : `${t('tbPreview')} — ${t('mnHintHtml')}`}
            aria-label={t('tbPreview')}
            data-active={showRightPanel === 'preview'}
            className="hdr-btn"
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
              className="hdr-btn"
            >
              <Settings size={15} />
            </button>
          )}
          </div>
          <div className="hdr-group inline-flex">
          <button onClick={() => setSidebarVisible((v) => !v)} title={t('tbSidebar')} aria-label={t('tbSidebar')} data-active={sidebarShown} className="hdr-btn">
            <PanelLeft size={15} />
          </button>
          <button
            onClick={() => { if (currentRootPath) setShowBottomTerminal((v) => !v); }}
            {...dis(!currentRootPath, `${t('tbTerminal')} — ${t('mnHintNoFolder')}`)}
            title={currentRootPath ? t('tbTerminal') : `${t('tbTerminal')} — ${t('mnHintNoFolder')}`}
            aria-label={t('tbTerminal')}
            data-active={showBottomTerminal}
            className="hdr-btn"
          >
            <PanelBottom size={15} />
          </button>
          </div>
        </div>
        {isElectron && <span className="hdr-sep app-no-drag" aria-hidden />}
        {isElectron && <WindowControls />}
        </div>
      </header>

      {/* Çalışma alanı */}
      <div className={`relative flex flex-1 min-h-0 overflow-hidden px-[var(--frame)] pt-[var(--frame)] ${settings.statusBarVisible === false ? 'pb-[var(--frame)]' : ''} ${sidebarRight ? 'flex-row-reverse' : ''}`}>
        {/* Etkinlik çubuğu */}
        {settings.activityBarVisible !== false && (
        <nav aria-label={t('appActivityBar')} className={`w-[48px] float-card bg-nv-side rounded-[var(--frame-r)] border border-nv-border ${sidebarRight ? 'ml-0.5' : 'mr-0.5'} py-1 flex flex-col items-center justify-between select-none shrink-0`}>
          <div className="flex flex-col">
            <button {...barBtn(sidebarShown && activeSidebarTab === 'files')} data-tip={t('actExplorer')} aria-label={t('actExplorer')} onClick={() => pickSidebar('files')}>
              <Files size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'search')} {...(!currentRootPath ? { 'aria-disabled': true, 'data-disabled': true } : {})} data-tip={currentRootPath ? `${t('actSearch')} (Ctrl+Shift+F)` : `${t('actSearch')} — ${t('mnHintNoFolder')}`} aria-label={t('actSearch')} onClick={() => { if (currentRootPath) pickSidebar('search'); }}>
              <Search size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'extensions')} data-tip={t('extTitle')} aria-label={t('extTitle')} onClick={() => pickSidebar('extensions')}>
              <Puzzle size={24} strokeWidth={1.5} />
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'git')} data-tip={t('actGit')} aria-label={t('actGit')} onClick={() => pickSidebar('git')}>
              <GitBranch size={24} strokeWidth={1.5} />
              {changeCount > 0 && (
                <span className="absolute bottom-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] leading-4 text-center font-semibold">
                  {changeCount > 99 ? '99+' : changeCount}
                </span>
              )}
            </button>
            <button {...barBtn(sidebarShown && activeSidebarTab === 'debug')} data-tip={t('dbgTitle')} aria-label={t('dbgTitle')} onClick={() => pickSidebar('debug')}>
              <Bug size={24} strokeWidth={1.5} />
              {dbgStatus === 'paused' && <span className="absolute bottom-2 right-2 size-2 rounded-full bg-amber-400" />}
            </button>
          </div>

          <div className="flex flex-col">
            <button {...barBtn(showLanding)} data-tip={t('actHome')} aria-label={t('actHome')} onClick={() => {
              setShowSettings(false);
              setShowLanding(!showLanding);
            }}>
              <House size={24} strokeWidth={1.5} />
            </button>
            <button
              {...barBtn(false)}
              data-tip={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}
              aria-label={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}
              onClick={() => pickSidebar('git')}
            >
              {auth.connected && auth.profile?.avatarUrl ? (
                <img src={auth.profile.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-6 rounded-full ring-1 ring-zinc-700" />
              ) : (
                <UserRound size={24} strokeWidth={1.5} />
              )}
            </button>
            <button
              {...barBtn(showSettings)}
              data-tip={`${t('actSettings')} (Ctrl+,)`}
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
        {compactLeft && sidebarShown && <div className="absolute inset-0 z-20 bg-black/30 animate-fade-in" onClick={() => setSidebarVisible(false)} aria-hidden />}
        <div
          className={`sidebar-shell h-full shrink-0 overflow-hidden ${compactLeft ? 'absolute z-30 top-[var(--frame)] bottom-0' : ''}`}
          data-open={sidebarShown}
          data-side={sidebarRight ? 'right' : 'left'}
          style={{ width: sidebarShown ? sbW : 0, ...(compactLeft ? { [sidebarRight ? 'right' : 'left']: `calc(var(--frame) + ${settings.activityBarVisible !== false ? 50 : 0}px)` } : {}) }}
        >
          {sbMounted && (
            <div style={{ width: sbW }} className="h-full rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-side overflow-hidden">
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
                    onSelectFile={eTreeSelect}
                    onCloseOpenFile={eCloseTab}
                    onCreate={eCreate}
                    onMove={eMove}
                    onCloseAll={eCloseAll}
                    onCloseFolder={eCloseFolder}
                    onOpenInTerminal={eTerm}
                    onOpenRecent={eRecent}
                    onRename={eRename}
                    onDelete={eDelete}
                    onRefresh={eRefresh}
                    onOpenFolder={eOpenFolder}
                    onOpenFiles={eOpenFiles}
                  />
                </div>
              )}
              {activeSidebarTab === 'extensions' && (
                <div key="extensions" className="animate-sidebar-in h-full">
                  <LazyPanel><ExtensionsPanel /></LazyPanel>
                </div>
              )}
              {activeSidebarTab === 'search' && (
                <div key="search" className="animate-sidebar-in h-full">
                  <LazyPanel><SearchPanel hasFolder={!!currentRootPath} onOpenResult={(p, line) => void openFileAt(p, line)} dirtyPaths={openFiles.filter((f) => f.isModified && f.path).map((f) => f.path as string)} /></LazyPanel>
                </div>
              )}
              {activeSidebarTab === 'git' && (
                <div key="git" className="animate-sidebar-in h-full flex flex-col">
                  <div className="h-9 flex items-center pl-4 text-[11px] uppercase tracking-wide text-zinc-400 shrink-0">{t('actGit')}</div>
                  <LazyPanel><GithubAccount /></LazyPanel>
                  <div className="flex-1 min-h-0">
                    <LazyPanel><GitPanel status={gitStatus} currentRepoPath={currentRootPath} onRefresh={() => refreshGitStatus()} onLog={(type, text) => addLog(type, text)} onOpenDiff={openDiffTab} onOpenFile={(p) => void openFileAt(p)} onPicker={setPicker} notice={gitNotice} /></LazyPanel>
                  </div>
                </div>
              )}
              {activeSidebarTab === 'debug' && (
                <div key="debug" className="animate-sidebar-in h-full">
                  <LazyPanel><DebugPanel rootPath={currentRootPath} activeFile={activeFile ? { path: activeFile.path, name: activeFile.name } : null} onOpenFile={(p, line) => void openFileAt(p, line)} /></LazyPanel>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Kenar çubuğu (açıkken) veya etkinlik çubuğu (kapalıyken) ile editör arası boşluk: sabit 8 px, açıkken sürükleme tutamacı ortada */}
        <div className="sidebar-gap h-full shrink-0 overflow-hidden flex justify-center" style={{ width: compactLeft ? 4 : 8 }}>
          {sidebarShown && !compactLeft && <ResizeHandle direction="horizontal" title={t('appSidebarWidth')} onResize={(d) => setSidebarWidth((w) => clamp(sidebarRight ? w - d : w + d, 180, 560))} />}
        </div>

        {/* Ana sütun: görünüm (ayarlar / karşılama / editör) + terminal paneli (oturumlar panel gizliyken de canlı kalır) */}
        <div className="flex flex-col flex-1 h-full min-w-0 rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-editor overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col min-w-0">
            {showLanding ? (
          <LazyPanel><LandingPage
            onNewFile={handleNewUntitled}
            onOpenFiles={handleOpenFileDialog}
            onOpenFolder={handleOpenFolderDialog}
            onOpenRemote={() => setShowRemote(true)}
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
          /></LazyPanel>
            ) : (
              <div ref={groupsRef} className={`flex flex-1 min-h-0 min-w-0 ${stackCol ? 'flex-col' : 'flex-row'}`}>
                <div className="flex min-w-0 min-h-0" style={split ? { flex: `0 0 ${(splitRatio * 100).toFixed(2)}%` } : { flex: '1 1 0%' }}>
                  <EditorArea
                    groupId="a"
                    split={!!split}
                    focused={!split || split.focus === 'a'}
                    poolFiles={openFiles}
                    onFocusGroup={eFocusGroup}
                    onDropTab={eDropTab}
                    onSplitRight={split ? undefined : eSplitRight}
                    onOpenPath={eOpenPath}
                    openFiles={groupFiles ? groupFiles.a : openFiles}
                    activeFileId={split ? split.aActive : activeFileId}
                    onSelectTab={eSelectA}
                    onCloseTab={eCloseA}
                    onNewFile={eNewFile}
                    onOpenFolder={eOpenFolder}
                    onOpenFiles={eOpenFiles}
                    rootPath={currentRootPath}
                    rootName={projectName}
                    onChangeContent={eChangeContent}
                    onDirty={eDirty}
                    getInitialContent={eInitial}
                    onReloadDisk={eReload}
                    onKeepMine={eKeep}
                    onSaveFile={eSave}
                    onRunCode={eRun}
                    canPreview={previewable}
                    previewOpen={showRightPanel === 'preview'}
                    onTogglePreview={eTogglePreview}
                    collab={collabCfg}
                  />
                </div>
                {split && groupFiles && (
                  <>
                    <ResizeHandle direction={stackCol ? 'vertical' : 'horizontal'} title={t('cmdSplitRight')} onResize={resizeGroups} />
                    <div className="flex flex-1 min-w-0 min-h-0">
                      <EditorArea
                        groupId="b"
                        split
                        focused={split.focus === 'b'}
                        poolFiles={openFiles}
                        onFocusGroup={eFocusGroup}
                        onDropTab={eDropTab}
                        onCloseSplit={eCloseSplit}
                        onOpenPath={eOpenPath}
                        openFiles={groupFiles.b}
                        activeFileId={split.bActive}
                        onSelectTab={eSelectB}
                        onCloseTab={eCloseB}
                        onNewFile={eNewFile}
                        rootPath={currentRootPath}
                        rootName={projectName}
                        onChangeContent={eChangeContent}
                        onDirty={eDirty}
                        getInitialContent={eInitial}
                        onReloadDisk={eReload}
                        onKeepMine={eKeep}
                        onSaveFile={eSave}
                        onRunCode={eRun}
                        canPreview={previewable}
                        previewOpen={showRightPanel === 'preview'}
                        onTogglePreview={eTogglePreview}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {showBottomTerminal && (
            <ResizeHandle
              direction="vertical"
              title={t('appTerminalHeight')}
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
            <LazyPanel><Terminal
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
            /></LazyPanel>
          </div>
        </div>

        {/* Sağ panel: önizleme veya yapay zekâ */}
        {!showLanding && showRightPanel === 'preview' && canPreview && (
          <div className={compactRight ? 'absolute right-[var(--frame)] top-[var(--frame)] bottom-0 z-30 flex border-s border-nv-border' : 'contents'}>
            <ResizeHandle direction="horizontal" title={t('tbPreview')} onResize={(d) => setPreviewWidth((w) => clamp(w - d, 320, 1200))} />
            <div style={{ width: Math.min(previewWidth, compactRight ? vw - 56 : Math.round(vw * 0.5)) }} className="animate-fade-in h-full rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-side overflow-hidden shrink-0 min-w-0">
              <LazyPanel><Preview
                file={activeView}
                rootPath={currentRootPath}
                live={previewLive}
                localUrl={localUrl}
                onClose={() => setShowRightPanel(null)}
                onOpenFile={(p) => void openFileAt(p)}
              /></LazyPanel>
            </div>
          </div>
        )}

        {!showLanding && showRightPanel === 'ai' && (
          <div className={compactRight ? 'absolute right-[var(--frame)] top-[var(--frame)] bottom-0 z-30 flex border-s border-nv-border' : 'contents'}>
          <ResizeHandle direction="horizontal" title={t('aiTitle')} onResize={(d) => setAiWidth((w) => clamp(w - d, 300, 720))} />
          <div style={{ width: Math.min(aiWidth, compactRight ? vw - 56 : Math.round(vw * 0.4)) }} className="animate-fade-in h-full rounded-[var(--frame-r)] float-card border border-nv-border overflow-hidden shrink-0 min-w-0">
            <LazyPanel>
            <AIAssistant
              activeFile={activeView}
              hasWorkspace={!!currentRootPath}
              rootPath={currentRootPath}
              onOpenFile={(p) => void openFileAt(p)}
              onOpenSettings={() => { setShowLanding(false); setShowSettings(true); }}
            />
            </LazyPanel>
          </div>
          </div>
        )}
      </div>

      {histMenu && currentRootPath && gitStatus.isRepo && (
        <LazyPanel>
          <CommitHistoryMenu anchor={histMenu} repo={currentRootPath} branch={gitStatus.branch} hasRemote={gitStatus.hasRemote} ahead={gitStatus.ahead} behind={gitStatus.behind} gitPanelOpen={sidebarShown && activeSidebarTab === 'git'} onClose={() => setHistMenu(null)} onOpenGit={() => pickSidebar('git')} />
        </LazyPanel>
      )}

      {compMenu && (
        <LazyPanel>
          <CompletionMenu anchor={compMenu} onClose={() => setCompMenu(null)} onOpenSettings={() => { setShowLanding(false); setShowSettings(true); }} />
        </LazyPanel>
      )}

      {taskPicker && currentRootPath && (
        <LazyPanel>
          <TaskPicker
            root={currentRootPath}
            onClose={() => setTaskPicker(false)}
            onPick={(task) => {
              setTaskPicker(false);
              setShowBottomTerminal(true);
              void import('./services/tasks').then((m) => m.runTask(task, currentRootPath));
            }}
          />
        </LazyPanel>
      )}

      {devDlg === 'timeline' && (
        <LazyPanel>
          <TimelinePanel
            filePath={activeFile && !activeFile.diff ? activeFile.path ?? null : null}
            enabled={settings.localHistory !== false}
            getCurrent={() => (activeFile ? getContent(activeFile) : '')}
            onOpenDiff={openDiffTab}
            onRestore={restoreFromHistory}
            onClose={() => setDevDlg(null)}
          />
        </LazyPanel>
      )}
      {devDlg === 'snippets' && (
        <LazyPanel>
          <SnippetsEditor hasFolder={!!currentRootPath} onSaved={() => void reloadSnippets()} onClose={() => setDevDlg(null)} />
        </LazyPanel>
      )}

      {picker && currentRootPath && gitStatus.isRepo && (
        <LazyPanel>
          <BranchPicker repo={currentRootPath} mode={picker} current={gitStatus.branch} onClose={() => setPicker(null)} onResult={(r) => pushGitNotice(r.ok, r.text)} />
        </LazyPanel>
      )}

      {/* Durum çubuğu: yalnız anlamlı bilgiler */}
      {settings.statusBarVisible !== false && (
        <footer className="@container h-6 m-[var(--frame)] rounded-[var(--frame-r)] float-card border border-nv-border bg-nv-side overflow-hidden flex items-center justify-between text-[12px] text-zinc-400 select-none shrink-0">
          <div className="flex items-center h-full min-w-0 overflow-hidden">
            <button
              className={`status-item ${remoteHost ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setRemoteMenu(true)}
              title={remoteHost ? t('rmStatusOn').replace('{h}', remoteHost.name) : t('rmStatusIdle')}
              aria-label={remoteHost ? t('rmStatusOn').replace('{h}', remoteHost.name) : t('rmStatusIdle')}
            >
              <Server size={12} />
              {remoteHost && <span className="font-mono">SSH: {remoteHost.name}</span>}
            </button>
            {gitStatus.isRepo && (
              <>
                <button className="status-item" onClick={() => setPicker('checkout')} title={t('scmBranchTip')} aria-label={t('scmBranchTip')}>
                  <GitBranch size={12} />
                  <span className="font-mono">{gitStatus.branch}</span>
                </button>
                {gitStatus.hasRemote && (
                  <button className="status-item" onClick={() => void statusBarSync()} title={t('scmSyncTip')} aria-label={t('scmSyncTip')}>
                    <RefreshCcw size={12} className={syncing ? 'animate-spin' : ''} />
                    {gitStatus.behind || gitStatus.ahead ? (
                      <span className="font-mono">
                        ↓{gitStatus.behind ?? 0} ↑{gitStatus.ahead ?? 0}
                      </span>
                    ) : null}
                  </button>
                )}
                {changeCount > 0 && (
                  <button className="status-item" onClick={() => pickSidebar('git')} title={t('actGit')}>
                    <span className="text-amber-400">±{changeCount}</span>
                  </button>
                )}
              </>
            )}
            {trustState.root && !trustState.trusted && <LazyPanel><TrustBadge /></LazyPanel>}
            <StatusProblems onOpen={openProblems} />
            <button className="status-item" onClick={() => pickSidebar('git')} title={auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}>
              <UserRound size={12} />
              <span>{auth.connected && auth.profile ? `@${auth.profile.login}` : t('actAccountOff')}</span>
            </button>
          </div>
          <div className="flex items-center h-full min-w-0 overflow-hidden">
            {noticeShown && gitNotice && <span className={`status-item ${gitNotice.ok ? 'text-emerald-300' : 'text-rose-300'} max-w-[40vw] truncate`} title={gitNotice.text}>{gitNotice.text}</span>}
            <UpdateIndicator onOpen={() => setUpdateDlg('update')} />
            {activeFile?.isModified && <span className="status-item text-amber-300">{t('stUnsaved')}</span>}
            {gitStatus.isRepo && currentRootPath && (
              <button
                className="status-item"
                data-active={!!histMenu}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setHistMenu(histMenu ? null : { x: r.left + r.width / 2, y: r.top });
                }}
                title={lastCommit ? `${t('histLastCommit')}: ${lastCommit.author}${lastCommit.ts ? ` · ${new Date(lastCommit.ts).toLocaleString()}` : ''}` : t('histTip')}
                aria-label={t('histTip')}
                aria-haspopup="dialog"
                aria-expanded={!!histMenu}
              >
                <GitCommitHorizontal size={13} />
                {lastCommit && (
                  <span className="hidden @2xl:inline max-w-[220px] truncate" data-tick={agoTick}>
                    {lastCommit.author}{lastCommit.ts ? ` · ${timeAgo(lastCommit.ts)}` : lastCommit.when ? ` · ${lastCommit.when}` : ''}
                  </span>
                )}
              </button>
            )}
            {activeFile && (
              <>
                {!activeFile.diff && <StatusCursor onOpen={() => setPalette(':')} />}
                <span className="status-item hidden @lg:inline-flex">{t('stSpaces').replace(/\d+/, String(tabSize))}</span>
                <span className="status-item hidden @lg:inline-flex">UTF-8</span>
                {!activeFile.diff && <StatusCompletion onOpenMenu={setCompMenu} />}
                <StatusLsp fileName={activeFile.name} />
                <span className="status-item">{activeFile.language ? languageLabel(activeFile.language) : t('stPlain')}</span>
              </>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
