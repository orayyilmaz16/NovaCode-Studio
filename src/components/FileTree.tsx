import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  FilePlus,
  FolderPlus,
  RefreshCw,
  ListCollapse,
  ListFilter,
  Ellipsis,
  X,
  Pencil,
  Trash2,
  Copy,
  UploadCloud,
  ExternalLink,
  SquareTerminal,
  Search as SearchIcon,
  History
} from 'lucide-react';
import type { FileItem } from '../types';
import { t, type UiTextKey } from '../i18n/uiText';
import { useSettings } from '../services/SettingsContext';
import { FileTypeIcon } from './FileTypeIcon';
import { PopupMenu, type MenuItem } from './Menu';

type Density = 'compact' | 'comfortable' | 'spacious';
type SortMode = 'foldersFirst' | 'filesFirst' | 'mixed' | 'type';

export interface FileTreeProps {
  files: FileItem[];
  openFiles: FileItem[];
  activeFileId: string | null;
  rootName?: string;
  rootPath?: string | null;
  density: Density;
  indentGuides: boolean;
  showOpenEditors: boolean;
  isLoading?: boolean;
  /** Normalleştirilmiş mutlak yol -> Git durum harfi (M, A, U, D, R) veya 'dir' (içinde değişiklik var). */
  gitDecor?: Record<string, string>;
  onSelectFile: (file: FileItem) => void;
  onCloseOpenFile: (id: string) => void;
  onCloseAll?: () => void;
  onCreate: (name: string, isFolder: boolean, parentDir?: string) => void;
  onRename: (item: FileItem, newName: string) => void;
  /** Sürükle-bırak: mutlak kaynak yolu çalışma klasörü içindeki hedef klasöre taşınır. */
  onMove?: (srcPath: string, targetDir: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onOpenFolder?: () => void;
  onOpenFiles?: () => void;
  onOpenRecent?: (folderPath: string) => void;
  onOpenInTerminal?: (dir: string) => void;
}

const GIT_NAME_COLOR: Record<string, string> = {
  M: 'text-amber-300',
  A: 'text-emerald-300',
  U: 'text-emerald-300',
  D: 'text-rose-300 line-through',
  R: 'text-sky-300'
};
export const normGitPath = (p?: string) => (p ? p.split('\\').join('/').toLowerCase() : '');

const dirOf = (p: string) => {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i < 0 ? '' : p.slice(0, i);
};
const extOf = (n: string) => (n.includes('.') ? n.split('.').pop()!.toLowerCase() : '');
const trimSep = (p: string) => p.replace(/[\\/]+$/, '');
const sameDir = (a: string, b: string) => trimSep(a).split('\\').join('/').toLowerCase() === trimSep(b).split('\\').join('/').toLowerCase();

const CODE_EXT = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'go', 'rs', 'java', 'php', 'c', 'cpp', 'h', 'cs', 'rb', 'sh', 'ps1', 'html', 'css', 'scss', 'vue', 'svelte', 'sql', 'kt', 'swift', 'dart', 'lua']);

// Simge stili: renkli rozet (dosya türü) ya da sade tek renkli simgeler
function fileIcon(name: string, style: 'color' | 'minimal', size = 15) {
  if (style === 'color') return <FileTypeIcon name={name} size={size} />;
  const ext = extOf(name);
  const cls = 'shrink-0 text-zinc-400';
  if (ext === 'json') return <FileJson size={size} className={cls} />;
  return CODE_EXT.has(ext) ? <FileCode size={size} className={cls} /> : <FileText size={size} className={cls} />;
}

function folderIcon(open: boolean, style: 'color' | 'minimal', size = 15) {
  const cls = `shrink-0 ${style === 'color' ? 'text-amber-400' : 'text-zinc-400'}`;
  return open ? <FolderOpen size={size} className={cls} /> : <Folder size={size} className={cls} />;
}

// Yumuşak açılıp kapanan bölüm (grid satır geçişi): içerik yüksekliğini ölçmeden animasyon verir.
const Collapse: React.FC<{ open: boolean; children: React.ReactNode }> = ({ open, children }) => (
  <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 170ms var(--ease-out-soft)' }}>
    <div className="overflow-hidden min-h-0">{children}</div>
  </div>
);

interface NameInputProps {
  depth: number;
  rowH: number;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  error: boolean;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

const NameInput: React.FC<NameInputProps> = ({ depth, rowH, icon, placeholder, value, error, onChange, onCommit, onCancel }) => (
  <div className="flex items-center gap-1.5 pr-2 animate-fade-in" style={{ height: rowH, paddingLeft: depth * 12 + 22 }}>
    {icon}
    <input
      autoFocus
      value={value}
      placeholder={placeholder}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') onCommit();
        else if (e.key === 'Escape') onCancel();
      }}
      onBlur={onCancel}
      onFocus={(e) => e.currentTarget.select()}
      title={error ? t('expInvalidName') : undefined}
      aria-invalid={error}
      className={`flex-1 min-w-0 h-[19px] px-1 text-[13px] bg-nv-input text-zinc-100 outline-none border ${error ? 'border-rose-500' : 'border-indigo-500'} rounded-sm`}
    />
  </div>
);

// Görüntülenen düğüm: sıralama / gizli dosya / klasör sıkıştırma / filtre uygulanmış hâli
interface DNode {
  item: FileItem;
  label: string;
  isFolder: boolean;
  children: DNode[];
}
type Row = { node: DNode; depth: number };

const tk = (key: string) => t(key as UiTextKey);

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  openFiles,
  activeFileId,
  rootName,
  rootPath,
  density,
  indentGuides,
  showOpenEditors,
  isLoading = false,
  gitDecor,
  onSelectFile,
  onCloseOpenFile,
  onCloseAll,
  onCreate,
  onRename,
  onMove,
  onDelete,
  onRefresh,
  onOpenFolder,
  onOpenFiles,
  onOpenRecent,
  onOpenInTerminal
}) => {
  const { values, set } = useSettings();
  const sort = (['foldersFirst', 'filesFirst', 'mixed', 'type'].includes(String(values.treeSort)) ? values.treeSort : 'foldersFirst') as SortMode;
  const showHidden = values.treeShowHidden !== false;
  const compact = values.treeCompactFolders === true;
  const iconStyle: 'color' | 'minimal' = values.treeIconStyle === 'minimal' ? 'minimal' : 'color';
  const autoReveal = values.treeAutoReveal !== false;
  const gitOn = values.showGitDecorations !== false;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [everOpened, setEverOpened] = useState<Record<string, boolean>>({});
  const [openEditorsOpen, setOpenEditorsOpen] = useState(true);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [creating, setCreating] = useState<{ parentDir: string; isFolder: boolean } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [nameError, setNameError] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; item: FileItem | null } | null>(null);
  const [viewMenu, setViewMenu] = useState<{ x: number; y: number } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [dropId, setDropId] = useState<string | null>(null);
  const [recent, setRecent] = useState<{ path: string; name: string }[]>([]);
  const treeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<FileItem | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const filesRef = useRef(files);
  filesRef.current = files;

  const rowH = density === 'spacious' ? 34 : density === 'comfortable' ? 28 : 22;
  const q = filter.trim().toLowerCase();
  const filtering = q.length > 0;
  const noFolder = !rootPath;

  // Son açılan klasörler (klasör açık değilken boş durumda gösterilir)
  useEffect(() => {
    if (rootName || !window.electronAPI?.recentFolders) return;
    void window.electronAPI.recentFolders().then((r) => setRecent(r.slice(0, 5))).catch(() => undefined);
  }, [rootName]);

  const isOpen = useCallback((it: FileItem) => filtering || (expanded[it.id] ?? it.isOpen ?? false), [expanded, filtering]);

  // ---- Görüntülenen ağaç ----
  const tree = useMemo<DNode[]>(() => {
    const cmp = (a: FileItem, b: FileItem) => {
      const af = a.type === 'folder';
      const bf = b.type === 'folder';
      if (sort === 'foldersFirst' && af !== bf) return af ? -1 : 1;
      if (sort === 'filesFirst' && af !== bf) return af ? 1 : -1;
      if (sort === 'type') {
        if (af !== bf) return af ? -1 : 1;
        if (!af) {
          const e = extOf(a.name).localeCompare(extOf(b.name));
          if (e) return e;
        }
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    };
    const visibleKids = (it: FileItem) => (it.children ?? []).filter((k) => showHidden || !k.name.startsWith('.'));
    const build = (items: FileItem[], parentMatched: boolean): DNode[] => {
      const out: DNode[] = [];
      for (const it of [...items].sort(cmp)) {
        if (!showHidden && it.name.startsWith('.')) continue;
        if (it.type !== 'folder') {
          if (filtering && !parentMatched && !it.name.toLowerCase().includes(q)) continue;
          out.push({ item: it, label: it.name, isFolder: false, children: [] });
          continue;
        }
        let cur = it;
        let label = it.name;
        if (compact && !filtering) {
          // VS Code "klasörleri sıkıştır": tek alt klasörü olan zincir tek satırda (a / b / c)
          for (;;) {
            const kids = visibleKids(cur);
            if (kids.length === 1 && kids[0].type === 'folder') {
              cur = kids[0];
              label += ' / ' + cur.name;
            } else break;
          }
        }
        const selfMatch = filtering && label.toLowerCase().includes(q);
        const kids = build(cur.children ?? [], parentMatched || selfMatch);
        if (filtering && !parentMatched && !selfMatch && kids.length === 0) continue;
        out.push({ item: cur, label, isFolder: true, children: kids });
      }
      return out;
    };
    return build(files, false);
  }, [files, sort, showHidden, compact, filtering, q]);

  // Klavye gezinmesi için görünen satırların düz listesi
  const visible = useMemo(() => {
    const out: Row[] = [];
    const walk = (nodes: DNode[], depth: number) => {
      for (const n of nodes) {
        out.push({ node: n, depth });
        if (n.isFolder && isOpen(n.item)) walk(n.children, depth + 1);
      }
    };
    walk(tree, 0);
    return out;
  }, [tree, isOpen]);

  const matchCount = useMemo(() => visible.filter((r) => !r.node.isFolder).length, [visible]);

  const findById = useCallback((id: string | null) => (id ? visible.find((r) => r.node.item.id === id)?.node.item ?? null : null), [visible]);

  const toggle = (it: FileItem, force?: boolean) => {
    const next = force ?? !isOpen(it);
    setExpanded((s) => ({ ...s, [it.id]: next }));
    if (next) setEverOpened((s) => ({ ...s, [it.id]: true }));
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    const walk = (items: FileItem[]) => items.forEach((it) => it.type === 'folder' && ((all[it.id] = false), it.children && walk(it.children)));
    walk(files);
    setExpanded(all);
  };

  // Etkin dosyayı ağaçta otomatik göster: üst klasörleri aç ve görünür yap (yalnız etkin dosya değişince)
  useEffect(() => {
    if (!autoReveal || !activeFileId) return;
    const chain: string[] = [];
    const find = (items: FileItem[]): boolean => {
      for (const it of items) {
        if (it.id === activeFileId) return true;
        if (it.type === 'folder' && it.children) {
          chain.push(it.id);
          if (find(it.children)) return true;
          chain.pop();
        }
      }
      return false;
    };
    if (!find(filesRef.current) || chain.length === 0) return;
    setExpanded((s) => {
      const next = { ...s };
      chain.forEach((id) => (next[id] = true));
      return next;
    });
    setEverOpened((s) => {
      const next = { ...s };
      chain.forEach((id) => (next[id] = true));
      return next;
    });
    const id = window.setTimeout(() => {
      treeRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(activeFileId)}"]`)?.scrollIntoView({ block: 'nearest' });
    }, 220);
    return () => window.clearTimeout(id);
  }, [activeFileId, autoReveal]);

  // Yeni öğe nereye eklenecek: odaktaki klasör, odaktaki dosyanın klasörü ya da kök
  const targetDir = (item?: FileItem | null): string => {
    const base = item ?? findById(focusedId);
    if (base?.path) return base.type === 'folder' ? base.path : dirOf(base.path);
    return rootPath ?? '';
  };

  const startCreate = (isFolder: boolean, item?: FileItem | null) => {
    if (noFolder) return;
    const dir = targetDir(item);
    const folder = (item ?? findById(focusedId)) as FileItem | null;
    if (folder?.type === 'folder') toggle(folder, true);
    setWorkspaceOpen(true);
    setRenamingId(null);
    setDraft('');
    setNameError(false);
    setCreating({ parentDir: dir, isFolder });
  };

  const startRename = (item: FileItem) => {
    setCreating(null);
    setDraft(item.name);
    setNameError(false);
    setRenamingId(item.id);
  };

  const validName = (n: string) => n.trim().length > 0 && !/[\\/]/.test(n.trim());

  const commitCreate = () => {
    if (!creating) return;
    if (!validName(draft)) return setNameError(true);
    onCreate(draft.trim(), creating.isFolder, creating.parentDir || undefined);
    setCreating(null);
  };

  const commitRename = (item: FileItem) => {
    const n = draft.trim();
    if (n === item.name) return setRenamingId(null);
    if (!validName(n)) return setNameError(true);
    onRename(item, n);
    setRenamingId(null);
  };

  const askDelete = (item: FileItem) => {
    if (window.confirm(t('expDeleteConfirm').replace('{name}', item.name))) onDelete(item.id);
  };

  const copy = (text: string) => {
    try {
      void navigator.clipboard.writeText(text);
    } catch {
      /* pano kapalı */
    }
  };
  // Kök klasöre göre yol (ayırıcı ve büyük/küçük harf farkından etkilenmez)
  const relPath = (p: string) => {
    if (!rootPath) return p;
    const np = p.split('\\').join('/');
    const nr = rootPath.split('\\').join('/').replace(/\/+$/, '');
    if (np.toLowerCase().startsWith(nr.toLowerCase() + '/')) return np.slice(nr.length + 1);
    return np.toLowerCase() === nr.toLowerCase() ? '' : p;
  };

  // ---- Sürükle-bırak taşıma ----
  const canDrop = (targetDirPath: string) => {
    const src = dragRef.current?.path;
    if (!src || !onMove || !targetDirPath) return false;
    if (sameDir(dirOf(src), targetDirPath)) return false; // zaten orada
    const s = src.split('\\').join('/').toLowerCase();
    const d = targetDirPath.split('\\').join('/').toLowerCase();
    return d !== s && !d.startsWith(s + '/'); // klasör kendi içine taşınamaz
  };
  const endDrag = () => {
    dragRef.current = null;
    setDropId(null);
    window.clearTimeout(hoverTimer.current);
  };
  const dropOn = (targetDirPath: string) => {
    const src = dragRef.current?.path;
    const ok = canDrop(targetDirPath);
    endDrag();
    if (ok && src && onMove) onMove(src, targetDirPath);
  };

  // ---- Bağlam menüsü ----
  const dirForTerminal = (item: FileItem) => (item.type === 'folder' ? item.path : item.path ? dirOf(item.path) : '');
  const menuItems = (item: FileItem | null): MenuItem[] => {
    const base: MenuItem[] = [
      { label: t('newFile'), icon: <FilePlus size={13} />, onClick: () => startCreate(false, item) },
      { label: t('expNewFolder'), icon: <FolderPlus size={13} />, onClick: () => startCreate(true, item) }
    ];
    if (!item) {
      return [...base, { separator: true }, { label: t('expRefresh'), icon: <RefreshCw size={13} />, onClick: onRefresh }, { label: t('expCollapseAll'), icon: <ListCollapse size={13} />, onClick: collapseAll }];
    }
    const dir = dirForTerminal(item);
    return [
      ...base,
      { separator: true },
      { label: t('expRename'), icon: <Pencil size={13} />, shortcut: 'F2', onClick: () => startRename(item) },
      { label: t('expDelete'), icon: <Trash2 size={13} />, shortcut: 'Del', danger: true, onClick: () => askDelete(item) },
      { separator: true },
      { label: t('expCopyPath'), icon: <Copy size={13} />, disabled: !item.path, onClick: () => item.path && copy(item.path) },
      { label: t('expCopyRelPath'), icon: <Copy size={13} />, disabled: !item.path, onClick: () => item.path && copy(relPath(item.path)) },
      { separator: true },
      { label: t('expReveal'), icon: <ExternalLink size={13} />, disabled: !item.path, onClick: () => item.path && void window.electronAPI?.revealInFolder(item.path) },
      { label: t('expOpenInTerminal'), icon: <SquareTerminal size={13} />, disabled: !dir || !onOpenInTerminal, onClick: () => dir && onOpenInTerminal?.(dir) }
    ];
  };

  // ---- Görünüm seçenekleri menüsü (… düğmesi): her seçenek bir ayardır, anında uygulanır ve saklanır ----
  const viewItems = (): MenuItem[] => {
    const choice = (id: string, value: string, labelKey: string, current: string): MenuItem => ({ label: tk(labelKey), checked: current === value, onClick: () => set(id, value) });
    const toggleItem = (id: string, on: boolean): MenuItem => ({ label: tk(`set_${id}`), checked: on, onClick: () => set(id, !on) });
    return [
      { label: t('expSortBy'), disabled: true },
      choice('treeSort', 'foldersFirst', 'optSortFoldersFirst', sort),
      choice('treeSort', 'filesFirst', 'optSortFilesFirst', sort),
      choice('treeSort', 'mixed', 'optSortMixed', sort),
      choice('treeSort', 'type', 'optSortType', sort),
      { separator: true },
      toggleItem('treeShowHidden', showHidden),
      toggleItem('treeCompactFolders', compact),
      toggleItem('treeAutoReveal', autoReveal),
      toggleItem('treeIndentGuides', indentGuides),
      toggleItem('showOpenEditors', showOpenEditors),
      toggleItem('showGitDecorations', gitOn),
      { separator: true },
      { label: tk('set_treeIconStyle'), disabled: true },
      choice('treeIconStyle', 'color', 'optIconColor', iconStyle),
      choice('treeIconStyle', 'minimal', 'optIconMinimal', iconStyle),
      { separator: true },
      { label: tk('set_treeDensity'), disabled: true },
      choice('treeDensity', 'compact', 'optCompact', density),
      choice('treeDensity', 'comfortable', 'optComfortable', density),
      choice('treeDensity', 'spacious', 'optSpacious', density)
    ];
  };

  // ---- Klavye ----
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (renamingId || creating) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setFilterOpen(true);
      return;
    }
    const idx = visible.findIndex((r) => r.node.item.id === focusedId);
    const cur = idx >= 0 ? visible[idx] : null;
    const focus = (i: number) => {
      const r = visible[Math.max(0, Math.min(visible.length - 1, i))];
      if (r) setFocusedId(r.node.item.id);
    };
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focus(idx + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focus(idx < 0 ? 0 : idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        focus(0);
        break;
      case 'End':
        e.preventDefault();
        focus(visible.length - 1);
        break;
      case 'ArrowRight':
        if (cur?.node.isFolder) {
          e.preventDefault();
          if (!isOpen(cur.node.item)) toggle(cur.node.item, true);
          else focus(idx + 1);
        }
        break;
      case 'ArrowLeft':
        if (cur) {
          e.preventDefault();
          if (cur.node.isFolder && isOpen(cur.node.item)) toggle(cur.node.item, false);
          else {
            const parent = [...visible.slice(0, idx)].reverse().find((r) => r.depth < cur.depth);
            if (parent) setFocusedId(parent.node.item.id);
          }
        }
        break;
      case 'Enter':
      case ' ':
        if (cur) {
          e.preventDefault();
          if (cur.node.isFolder) toggle(cur.node.item);
          else onSelectFile(cur.node.item);
        }
        break;
      case 'F2':
        if (cur) {
          e.preventDefault();
          startRename(cur.node.item);
        }
        break;
      case 'Delete':
        if (cur) {
          e.preventDefault();
          askDelete(cur.node.item);
        }
        break;
    }
  };

  // Odaktaki satırı görünür tut
  useEffect(() => {
    if (!focusedId) return;
    const el = treeRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(focusedId)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedId]);

  // Satır içi ad girişi için ortak özellikler (bileşen en üstte tanımlı: yeniden bağlanıp odağı kaybetmez)
  const inputProps = {
    rowH,
    value: draft,
    error: nameError,
    onChange: (v: string) => {
      setDraft(v);
      setNameError(false);
    }
  };

  // Filtre eşleşmesini vurgula
  const hl = (label: string) => {
    if (!filtering) return label;
    const i = label.toLowerCase().indexOf(q);
    if (i < 0) return label;
    return (
      <>
        {label.slice(0, i)}
        <mark className="bg-indigo-500/35 text-inherit rounded-sm">{label.slice(i, i + q.length)}</mark>
        {label.slice(i + q.length)}
      </>
    );
  };

  const renderRows = (nodes: DNode[], depth: number): React.ReactNode =>
    nodes.map((node) => {
      const item = node.item;
      const isFolder = node.isFolder;
      const open = isFolder && isOpen(item);
      const decor = gitOn ? gitDecor?.[normGitPath(item.path)] : undefined;
      const selected = !isFolder && item.id === activeFileId;
      const focused = focusedId === item.id;
      const renaming = renamingId === item.id;
      const nameCls = decor && decor !== 'dir' ? GIT_NAME_COLOR[decor] ?? '' : '';
      const dropping = dropId === item.id;

      return (
        <div key={item.id}>
          {renaming ? (
            <NameInput
              {...inputProps}
              depth={depth}
              icon={isFolder ? folderIcon(false, iconStyle) : fileIcon(item.name, iconStyle)}
              onCommit={() => commitRename(item)}
              onCancel={() => setRenamingId(null)}
            />
          ) : (
            <div
              data-row-id={item.id}
              role="treeitem"
              aria-expanded={isFolder ? open : undefined}
              aria-selected={selected}
              title={item.path}
              draggable={!!item.path && !!onMove}
              onDragStart={(e) => {
                dragRef.current = item;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.path ?? item.name);
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                if (!isFolder || !item.path || !canDrop(item.path)) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                if (dropId !== item.id) {
                  setDropId(item.id);
                  window.clearTimeout(hoverTimer.current);
                  // Kapalı klasörün üzerinde bekleyince kendiliğinden açılır
                  if (!open) hoverTimer.current = window.setTimeout(() => toggle(item, true), 700);
                }
              }}
              onDragLeave={() => dropId === item.id && setDropId(null)}
              onDrop={(e) => {
                if (!isFolder || !item.path) return;
                e.preventDefault();
                e.stopPropagation();
                dropOn(item.path);
              }}
              onClick={() => {
                setFocusedId(item.id);
                if (isFolder) toggle(item);
                else onSelectFile(item);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setFocusedId(item.id);
                setMenu({ x: e.clientX, y: e.clientY, item });
              }}
              className={`relative flex items-center gap-1 pr-2 cursor-pointer text-[13px] transition-colors ${
                dropping
                  ? 'bg-indigo-500/25 outline outline-1 -outline-offset-1 outline-indigo-400'
                  : selected
                    ? 'bg-nv-active text-zinc-50 shadow-[inset_2px_0_0_var(--color-indigo-500)]'
                    : 'text-zinc-300 hover:bg-nv-hover'
              } ${focused && !dropping ? 'outline outline-1 -outline-offset-1 outline-indigo-500/70' : ''}`}
              style={{ height: rowH, paddingLeft: depth * 12 + 6 }}
            >
              {indentGuides &&
                Array.from({ length: depth }).map((_, i) => (
                  <span key={i} className="absolute top-0 bottom-0 w-px bg-zinc-600/25 group-hover/tree:bg-zinc-600/60 transition-colors" style={{ left: 13 + i * 12 }} />
                ))}
              {isFolder ? (
                <ChevronRight size={14} className={`shrink-0 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
              ) : (
                <span className="w-[14px] shrink-0" />
              )}
              {isFolder ? folderIcon(open, iconStyle) : fileIcon(item.name, iconStyle)}
              <span className={`truncate flex-1 ml-0.5 ${nameCls}`}>{hl(node.label)}</span>
              {item.isModified && <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />}
              {decor === 'dir' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />}
              {decor && decor !== 'dir' && (
                <span className={`font-mono text-[11px] shrink-0 w-3 text-center ${GIT_NAME_COLOR[decor]?.split(' ')[0] ?? 'text-zinc-400'}`}>{decor}</span>
              )}
            </div>
          )}

          {isFolder && (
            <Collapse open={open}>
              {(open || everOpened[item.id]) && (
                <>
                  {creating && creating.parentDir === item.path && (
                    <NameInput
                      {...inputProps}
                      depth={depth + 1}
                      icon={creating.isFolder ? folderIcon(false, iconStyle) : <FileText size={15} className="text-zinc-500 shrink-0" />}
                      placeholder={creating.isFolder ? t('expFolderPlaceholder') : t('expFilePlaceholder')}
                      onCommit={commitCreate}
                      onCancel={() => setCreating(null)}
                    />
                  )}
                  {renderRows(node.children, depth + 1)}
                </>
              )}
            </Collapse>
          )}
        </div>
      );
    });

  const hasContent = files.length > 0;
  const sectionHead = 'group/head flex items-center h-[24px] pl-1 pr-2 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-zinc-300 hover:bg-nv-hover/60 transition-colors';
  const headBtn = 'icon-btn !w-5 !h-5 opacity-0 group-hover/head:opacity-100 focus:opacity-100 transition-opacity';
  // Başlık araç çubuğu: klasör yokken soluk (aria-disabled), üzerine gelince nedenini söyler
  const tool = (label: string, needsFolder = true) => (needsFolder && noFolder ? ({ 'aria-disabled': true, title: `${label} — ${t('mnHintNoFolder')}` } as const) : { title: label });

  return (
    <div className="flex flex-col h-full min-w-0 bg-nv-side text-zinc-300 select-none">
      {/* Başlık + araç çubuğu */}
      <div className="flex items-center justify-between h-9 pl-4 pr-1.5 shrink-0 gap-1">
        <span className="text-[11px] uppercase tracking-wide text-zinc-400 truncate min-w-0">{t('actExplorer')}</span>
        <div className="flex items-center shrink-0">
          <button {...tool(t('newFile'))} aria-label={t('newFile')} onClick={() => startCreate(false)} className="icon-btn"><FilePlus size={15} /></button>
          <button {...tool(t('expNewFolder'))} aria-label={t('expNewFolder')} onClick={() => startCreate(true)} className="icon-btn"><FolderPlus size={15} /></button>
          <button {...tool(t('expRefresh'))} aria-label={t('expRefresh')} onClick={() => !noFolder && onRefresh()} className="icon-btn"><RefreshCw size={14} /></button>
          <button {...tool(`${t('expFilter')} (Ctrl+F)`)} aria-label={t('expFilter')} data-active={filterOpen || filtering} onClick={() => !noFolder && setFilterOpen((v) => !v)} className="icon-btn"><ListFilter size={15} /></button>
          <button
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setViewMenu({ x: Math.max(8, r.right - 230), y: r.bottom + 2 });
            }}
            title={t('expViewOptions')}
            aria-label={t('expViewOptions')}
            className="icon-btn"
          >
            <Ellipsis size={15} />
          </button>
        </div>
      </div>

      {/* Filtre kutusu */}
      {filterOpen && (
        <div className="px-3 pb-2 shrink-0 animate-fade-in">
          <div className="flex items-center gap-1.5 h-7 px-2 rounded bg-nv-input border border-zinc-700 focus-within:border-indigo-500 transition-colors">
            <SearchIcon size={12} className="text-zinc-500 shrink-0" />
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setFilter('');
                  setFilterOpen(false);
                  treeRef.current?.focus();
                }
              }}
              placeholder={t('expFilterPlaceholder')}
              aria-label={t('expFilter')}
              spellCheck={false}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-zinc-100 placeholder:text-zinc-500"
            />
            {filtering && <span className="text-[10.5px] text-zinc-500 shrink-0">{matchCount}</span>}
            {(filter || filterOpen) && (
              <button onClick={() => { setFilter(''); setFilterOpen(false); }} title={t('expFilterClear')} aria-label={t('expFilterClear')} className="text-zinc-500 hover:text-zinc-200 shrink-0"><X size={13} /></button>
            )}
          </div>
        </div>
      )}

      <div
        ref={treeRef}
        role="tree"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setMenu({ x: e.clientX, y: e.clientY, item: null });
          }
        }}
        // Boş alana bırakınca kök klasöre taşınır
        onDragOver={(e) => {
          if (rootPath && canDrop(rootPath)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dropId !== '__root') setDropId('__root');
          }
        }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setDropId(null); }}
        onDrop={(e) => {
          if (rootPath) {
            e.preventDefault();
            dropOn(rootPath);
          }
        }}
        className={`group/tree flex-1 min-h-0 overflow-y-auto overflow-x-hidden outline-none pb-3 transition-colors ${dropId === '__root' ? 'bg-indigo-500/10' : ''}`}
      >
        {isLoading ? (
          <div className="px-4 py-3 flex items-center gap-2 text-zinc-500 text-[12px]">
            <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            {t('expLoading')}
          </div>
        ) : (
          <>
            {/* Açık düzenleyiciler */}
            {showOpenEditors && openFiles.length > 0 && (
              <section aria-label={t('expOpenEditors')}>
                <div className={sectionHead} onClick={() => setOpenEditorsOpen((v) => !v)}>
                  <ChevronRight size={14} className={`shrink-0 text-zinc-500 transition-transform duration-150 ${openEditorsOpen ? 'rotate-90' : ''}`} />
                  <span className="ml-0.5 truncate">{t('expOpenEditors')}</span>
                  <span className="flex-1" />
                  {onCloseAll && (
                    <button onClick={(e) => { e.stopPropagation(); onCloseAll(); }} title={t('expCloseAll')} aria-label={t('expCloseAll')} className={`${headBtn} mr-1`}>
                      <X size={13} />
                    </button>
                  )}
                  <span className="text-[10px] px-1.5 rounded-full bg-indigo-500/25 text-indigo-300 font-medium">{openFiles.length}</span>
                </div>
                <Collapse open={openEditorsOpen}>
                  {openFiles.map((f) => {
                    const on = f.id === activeFileId;
                    return (
                      <div
                        key={f.id}
                        onClick={() => onSelectFile(f)}
                        title={f.path}
                        className={`group/oe flex items-center gap-1.5 pl-5 pr-1 cursor-pointer text-[13px] transition-colors ${on ? 'bg-nv-active text-zinc-50 shadow-[inset_2px_0_0_var(--color-indigo-500)]' : 'text-zinc-300 hover:bg-nv-hover'}`}
                        style={{ height: rowH }}
                      >
                        {fileIcon(f.name, iconStyle)}
                        <span className="shrink-0">{f.name}</span>
                        {f.path && relPath(dirOf(f.path)) && <span className="truncate text-[11px] text-zinc-500">{relPath(dirOf(f.path))}</span>}
                        <span className="flex-1" />
                        {f.isModified && <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 group-hover/oe:hidden" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseOpenFile(f.id);
                          }}
                          title={t('expCloseEditor')}
                          aria-label={t('expCloseEditor')}
                          className="opacity-0 group-hover/oe:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </Collapse>
              </section>
            )}

            {/* Çalışma alanı */}
            {hasContent || rootName ? (
              <section aria-label={rootName}>
                <div className={`${sectionHead} sticky top-0 z-[1] bg-nv-side`} onClick={() => setWorkspaceOpen((v) => !v)}>
                  <ChevronRight size={14} className={`shrink-0 text-zinc-500 transition-transform duration-150 ${workspaceOpen ? 'rotate-90' : ''}`} />
                  <span className="ml-0.5 truncate">{rootName || t('actExplorer')}</span>
                  <span className="flex-1" />
                  {rootPath && (
                    <span className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={collapseAll} title={t('expCollapseAll')} aria-label={t('expCollapseAll')} className={headBtn}>
                        <ListCollapse size={13} />
                      </button>
                    </span>
                  )}
                </div>
                <Collapse open={workspaceOpen}>
                  {creating && creating.parentDir === (rootPath ?? '') && (
                    <NameInput
                      {...inputProps}
                      depth={0}
                      icon={creating.isFolder ? folderIcon(false, iconStyle) : <FileText size={15} className="text-zinc-500 shrink-0" />}
                      placeholder={creating.isFolder ? t('expFolderPlaceholder') : t('expFilePlaceholder')}
                      onCommit={commitCreate}
                      onCancel={() => setCreating(null)}
                    />
                  )}
                  {renderRows(tree, 0)}
                  {filtering && tree.length === 0 && <p className="px-4 py-3 text-[12px] text-zinc-500">{t('expNoMatches')}</p>}
                  {!filtering && !hasContent && (
                    <div className="px-4 py-4 text-[12px] text-zinc-500 space-y-2 animate-fade-in">
                      <p>{t('expEmptyFolder')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => startCreate(false)} className="flex items-center gap-1.5 h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap transition-colors"><FilePlus size={13} />{t('newFile')}</button>
                        <button onClick={() => startCreate(true)} className="flex items-center gap-1.5 h-7 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 whitespace-nowrap transition-colors"><FolderPlus size={13} />{t('expNewFolder')}</button>
                      </div>
                    </div>
                  )}
                </Collapse>
              </section>
            ) : (
              <div className="px-3 py-4 animate-fade-in">
                <div className="flex flex-col items-center text-center px-2 pt-2 pb-4">
                  <div className="w-11 h-11 rounded-xl bg-nv-active flex items-center justify-center mb-3"><FolderOpen size={22} className="text-indigo-300" /></div>
                  <p className="text-[12.5px] text-zinc-300 leading-snug">{t('expNoFolder')}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {onOpenFolder && (
                    <button onClick={onOpenFolder} className="flex items-center justify-center gap-2 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[12.5px] whitespace-nowrap transition-colors">
                      <FolderOpen size={14} />
                      <span className="truncate">{t('openFolder')}</span>
                      <kbd className="ml-1 px-1 rounded bg-white/15 text-[10px] font-mono hidden min-[240px]:inline">Ctrl+O</kbd>
                    </button>
                  )}
                  {onOpenFiles && (
                    <button onClick={onOpenFiles} className="flex items-center justify-center gap-2 h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[12.5px] whitespace-nowrap transition-colors">
                      <UploadCloud size={14} />
                      <span className="truncate">{t('openFiles')}</span>
                    </button>
                  )}
                </div>
                {recent.length > 0 && onOpenRecent && (
                  <div className="mt-5">
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-zinc-500 mb-1"><History size={12} />{t('expRecent')}</div>
                    {recent.map((r) => (
                      <button key={r.path} onClick={() => onOpenRecent(r.path)} title={r.path} className="w-full flex flex-col items-start px-2 py-1 rounded hover:bg-nv-hover text-left transition-colors min-w-0">
                        <span className="text-[12.5px] text-zinc-200 truncate w-full">{r.name}</span>
                        <span className="text-[10.5px] text-zinc-500 truncate w-full">{r.path}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {menu && (
        <PopupMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={
            menu.item
              ? menuItems(menu.item)
              : [
                  ...menuItems(null),
                  ...(onOpenFolder || onOpenFiles ? ([{ separator: true }] as MenuItem[]) : []),
                  ...(onOpenFolder ? [{ label: t('openFolder'), icon: <FolderOpen size={13} />, onClick: onOpenFolder }] : []),
                  ...(onOpenFiles ? [{ label: t('openFiles'), icon: <UploadCloud size={13} />, onClick: onOpenFiles }] : [])
                ]
          }
        />
      )}
      {viewMenu && <PopupMenu x={viewMenu.x} y={viewMenu.y} onClose={() => setViewMenu(null)} items={viewItems()} />}
    </div>
  );
};
