import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  Hash,
  FilePlus,
  FolderPlus,
  RefreshCw,
  ListCollapse,
  Ellipsis,
  X,
  Pencil,
  Trash2,
  Copy,
  UploadCloud
} from 'lucide-react';
import type { FileItem } from '../types';
import { t } from '../i18n/uiText';
import { FileTypeIcon } from './FileTypeIcon';
import { PopupMenu, type MenuItem } from './Menu';

export interface FileTreeProps {
  files: FileItem[];
  openFiles: FileItem[];
  activeFileId: string | null;
  rootName?: string;
  rootPath?: string | null;
  density: 'compact' | 'comfortable';
  indentGuides: boolean;
  showOpenEditors: boolean;
  isLoading?: boolean;
  /** Normalleştirilmiş mutlak yol -> Git durum harfi (M, A, U, D, R) veya 'dir' (içinde değişiklik var). */
  gitDecor?: Record<string, string>;
  onSelectFile: (file: FileItem) => void;
  onCloseOpenFile: (id: string) => void;
  onCreate: (name: string, isFolder: boolean, parentDir?: string) => void;
  onRename: (item: FileItem, newName: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onOpenFolder?: () => void;
  onOpenFiles?: () => void;
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

function fileIcon(name: string, size = 15) {
  return <FileTypeIcon name={name} size={size} />;
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

type Row = { item: FileItem; depth: number };

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
  onCreate,
  onRename,
  onDelete,
  onRefresh,
  onOpenFolder,
  onOpenFiles
}) => {
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
  const treeRef = useRef<HTMLDivElement>(null);

  const rowH = density === 'comfortable' ? 28 : 22;
  const isOpen = useCallback((it: FileItem) => expanded[it.id] ?? it.isOpen ?? false, [expanded]);

  // Klavye gezinmesi için görünen satırların düz listesi
  const visible = useMemo(() => {
    const out: Row[] = [];
    const walk = (items: FileItem[], depth: number) => {
      for (const it of items) {
        out.push({ item: it, depth });
        if (it.type === 'folder' && isOpen(it) && it.children) walk(it.children, depth + 1);
      }
    };
    walk(files, 0);
    return out;
  }, [files, isOpen]);

  const findById = useCallback(
    (id: string | null) => (id ? visible.find((r) => r.item.id === id)?.item ?? null : null),
    [visible]
  );

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

  // Yeni öğe nereye eklenecek: odaktaki klasör, odaktaki dosyanın klasörü ya da kök
  const targetDir = (item?: FileItem | null): string => {
    const base = item ?? findById(focusedId);
    if (base?.path) return base.type === 'folder' ? base.path : dirOf(base.path);
    return rootPath ?? '';
  };

  const startCreate = (isFolder: boolean, item?: FileItem | null) => {
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

  // ---- Bağlam menüsü ----
  const menuItems = (item: FileItem | null): MenuItem[] => {
    const base: MenuItem[] = [
      { label: t('newFile'), icon: <FilePlus size={13} />, onClick: () => startCreate(false, item) },
      { label: t('expNewFolder'), icon: <FolderPlus size={13} />, onClick: () => startCreate(true, item) }
    ];
    if (!item) {
      return [...base, { separator: true }, { label: t('expRefresh'), icon: <RefreshCw size={13} />, onClick: onRefresh }, { label: t('expCollapseAll'), icon: <ListCollapse size={13} />, onClick: collapseAll }];
    }
    return [
      ...base,
      { separator: true },
      { label: t('expRename'), icon: <Pencil size={13} />, shortcut: 'F2', onClick: () => startRename(item) },
      { label: t('expDelete'), icon: <Trash2 size={13} />, shortcut: 'Del', danger: true, onClick: () => askDelete(item) },
      { separator: true },
      { label: t('expCopyPath'), icon: <Copy size={13} />, disabled: !item.path, onClick: () => item.path && copy(item.path) },
      { label: t('expCopyRelPath'), icon: <Copy size={13} />, disabled: !item.path, onClick: () => item.path && copy(relPath(item.path)) }
    ];
  };

  // ---- Klavye ----
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (renamingId || creating) return;
    const idx = visible.findIndex((r) => r.item.id === focusedId);
    const cur = idx >= 0 ? visible[idx] : null;
    const focus = (i: number) => {
      const r = visible[Math.max(0, Math.min(visible.length - 1, i))];
      if (r) setFocusedId(r.item.id);
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
        if (cur?.item.type === 'folder') {
          e.preventDefault();
          if (!isOpen(cur.item)) toggle(cur.item, true);
          else focus(idx + 1);
        }
        break;
      case 'ArrowLeft':
        if (cur) {
          e.preventDefault();
          if (cur.item.type === 'folder' && isOpen(cur.item)) toggle(cur.item, false);
          else {
            const parent = [...visible.slice(0, idx)].reverse().find((r) => r.depth < cur.depth);
            if (parent) setFocusedId(parent.item.id);
          }
        }
        break;
      case 'Enter':
      case ' ':
        if (cur) {
          e.preventDefault();
          if (cur.item.type === 'folder') toggle(cur.item);
          else onSelectFile(cur.item);
        }
        break;
      case 'F2':
        if (cur) {
          e.preventDefault();
          startRename(cur.item);
        }
        break;
      case 'Delete':
        if (cur) {
          e.preventDefault();
          askDelete(cur.item);
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

  const renderRows = (items: FileItem[], depth: number): React.ReactNode =>
    items.map((item) => {
      const isFolder = item.type === 'folder';
      const open = isFolder && isOpen(item);
      const decor = gitDecor?.[normGitPath(item.path)];
      const selected = !isFolder && item.id === activeFileId;
      const focused = focusedId === item.id;
      const renaming = renamingId === item.id;
      const nameCls = decor && decor !== 'dir' ? GIT_NAME_COLOR[decor] ?? '' : '';

      return (
        <div key={item.id}>
          {renaming ? (
            <NameInput
              {...inputProps}
              depth={depth}
              icon={isFolder ? <Folder size={15} className="text-amber-400 shrink-0" /> : fileIcon(item.name)}
              onCommit={() => commitRename(item)}
              onCancel={() => setRenamingId(null)}
            />
          ) : (
            <div
              data-row-id={item.id}
              role="treeitem"
              aria-expanded={isFolder ? open : undefined}
              aria-selected={selected}
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
                selected ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'
              } ${focused ? 'outline outline-1 -outline-offset-1 outline-indigo-500/70' : ''}`}
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
              {isFolder ? (
                open ? <FolderOpen size={15} className="text-amber-400 shrink-0" /> : <Folder size={15} className="text-amber-400 shrink-0" />
              ) : (
                fileIcon(item.name)
              )}
              <span className={`truncate flex-1 ml-0.5 ${nameCls}`}>{item.name}</span>
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
                      icon={creating.isFolder ? <Folder size={15} className="text-amber-400 shrink-0" /> : <FileText size={15} className="text-zinc-500 shrink-0" />}
                      placeholder={creating.isFolder ? t('expFolderPlaceholder') : t('expFilePlaceholder')}
                      onCommit={commitCreate}
                      onCancel={() => setCreating(null)}
                    />
                  )}
                  {item.children && renderRows(item.children, depth + 1)}
                </>
              )}
            </Collapse>
          )}
        </div>
      );
    });

  const hasContent = files.length > 0;
  const sectionHead = 'group/head flex items-center h-[22px] pl-1 pr-2 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-zinc-300 hover:bg-nv-hover/60 transition-colors';
  const headBtn = 'icon-btn !w-5 !h-5 opacity-0 group-hover/head:opacity-100 focus:opacity-100 transition-opacity';

  return (
    <div className="flex flex-col h-full bg-nv-side text-zinc-300 select-none">
      {/* Başlık */}
      <div className="flex items-center justify-between h-9 pl-4 pr-2 shrink-0">
        <span className="text-[11px] uppercase tracking-wide text-zinc-400">{t('actExplorer')}</span>
        <button
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setMenu({ x: r.left - 140, y: r.bottom + 2, item: null });
          }}
          title={t('expMore')}
          aria-label={t('expMore')}
          className="icon-btn"
        >
          <Ellipsis size={15} />
        </button>
      </div>

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
        className="group/tree flex-1 overflow-y-auto outline-none pb-3"
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
                  <span className="ml-auto text-[10px] px-1.5 rounded-full bg-indigo-500/25 text-indigo-300 font-medium">{openFiles.length}</span>
                </div>
                <Collapse open={openEditorsOpen}>
                  {openFiles.map((f) => {
                    const on = f.id === activeFileId;
                    return (
                      <div
                        key={f.id}
                        onClick={() => onSelectFile(f)}
                        className={`group/oe flex items-center gap-1.5 pl-5 pr-1 cursor-pointer text-[13px] transition-colors ${on ? 'bg-nv-active text-zinc-50' : 'text-zinc-300 hover:bg-nv-hover'}`}
                        style={{ height: rowH }}
                      >
                        {fileIcon(f.name)}
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
                <div className={sectionHead} onClick={() => setWorkspaceOpen((v) => !v)}>
                  <ChevronRight size={14} className={`shrink-0 text-zinc-500 transition-transform duration-150 ${workspaceOpen ? 'rotate-90' : ''}`} />
                  <span className="ml-0.5 truncate">{rootName || t('actExplorer')}</span>
                  <span className="flex-1" />
                  {rootPath && (
                    <span className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => startCreate(false)} title={t('newFile')} aria-label={t('newFile')} className={headBtn}>
                        <FilePlus size={13} />
                      </button>
                      <button onClick={() => startCreate(true)} title={t('expNewFolder')} aria-label={t('expNewFolder')} className={headBtn}>
                        <FolderPlus size={13} />
                      </button>
                      <button onClick={onRefresh} title={t('expRefresh')} aria-label={t('expRefresh')} className={headBtn}>
                        <RefreshCw size={12} />
                      </button>
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
                      icon={creating.isFolder ? <Folder size={15} className="text-amber-400 shrink-0" /> : <FileText size={15} className="text-zinc-500 shrink-0" />}
                      placeholder={creating.isFolder ? t('expFolderPlaceholder') : t('expFilePlaceholder')}
                      onCommit={commitCreate}
                      onCancel={() => setCreating(null)}
                    />
                  )}
                  {renderRows(files, 0)}
                </Collapse>
              </section>
            ) : (
              <div className="px-4 py-3 text-[12px] text-zinc-500 space-y-2 animate-fade-in">
                <p>{t('expNoFolder')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {onOpenFolder && (
                    <button onClick={onOpenFolder} className="flex items-center gap-1.5 h-7 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                      <FolderOpen size={13} />
                      {t('openFolder')}
                    </button>
                  )}
                  {onOpenFiles && (
                    <button onClick={onOpenFiles} className="flex items-center gap-1.5 h-7 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors">
                      <UploadCloud size={13} />
                      {t('openFiles')}
                    </button>
                  )}
                </div>
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
    </div>
  );
};
