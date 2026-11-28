import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Cloud, Copy, ExternalLink, GitBranch, GitCommitHorizontal, Target } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';
import { timeAgo } from '../services/timeAgo';
import { laneColor, layoutGraph, type GraphRow } from '../services/gitGraph';
import type { GitCommitInfo, GithubCommitAuthor } from '../types';

// Git geçmişi: dal topolojisi (şeritler, ayrılma/birleşme) + okunur satırlar. Satır yüksekliği sabit; şeritler satırlar arasında kesintisiz.
// Dosya listesi ve fark açma GitPanel'dedir (renderFiles ile gelir).
const ROW_H = 56; // sabit satır: içerik her zaman bu yükseklikte, şeritler satırlar arası kopmaz
const LANE_W = 16;
const NODE_Y = 18;
const NODE_R = 4.5;
const x = (i: number) => i * LANE_W + LANE_W / 2 + 2;

const curve = (x1: number, y1: number, x2: number, y2: number) =>
  x1 === x2 ? `M${x1} ${y1}L${x2} ${y2}` : `M${x1} ${y1}C${x1} ${y1 + (y2 - y1) * 0.6} ${x2} ${y1 + (y2 - y1) * 0.4} ${x2} ${y2}`;

const GraphCell: React.FC<{ row: GraphRow; width: number; hash: string; head: boolean }> = ({ row, width, hash, head }) => {
  const lines: React.ReactNode[] = [];
  row.top.forEach((h, i) => {
    if (!h) return;
    if (h === hash) lines.push(<path key={`t${i}`} d={curve(x(i), 0, x(row.lane), NODE_Y)} stroke={laneColor(i)} />);
    else if (row.bottom[i] === h) lines.push(<path key={`p${i}`} d={curve(x(i), 0, x(i), ROW_H)} stroke={laneColor(i)} />);
  });
  row.parentLanes.forEach((j, k) => lines.push(<path key={`b${k}`} d={curve(x(row.lane), NODE_Y, x(j), ROW_H)} stroke={laneColor(j)} />));
  const c = laneColor(row.lane);
  return (
    <svg width={width} height={ROW_H} className="absolute start-0 top-0 pointer-events-none" aria-hidden fill="none" strokeWidth={2} strokeLinecap="round" shapeRendering="geometricPrecision">
      {lines}
      {head ? (
        <>
          <circle cx={x(row.lane)} cy={NODE_Y} r={NODE_R + 2} fill="var(--color-nv-side)" stroke={c} strokeWidth={2} />
          <circle cx={x(row.lane)} cy={NODE_Y} r={2} fill={c} stroke="none" />
        </>
      ) : (
        <circle cx={x(row.lane)} cy={NODE_Y} r={NODE_R} fill={c} stroke="var(--color-nv-side)" strokeWidth={1.5} />
      )}
    </svg>
  );
};

const CARD_W = 300;
const CARD_H_EST = 250;

/** Commit'in üzerine gelince açılan ayrıntı kartı: konu, karma, yazar, tarih, değişiklik özeti, üst commit'ler, dallar. */
// Yazar profili önbelleği (hash → profil); aynı commit'e tekrar gelince ağ isteği yapılmaz
const authorCache = new Map<string, GithubCommitAuthor | null>();

// GitHub avatarı 30 px'de gösterilir; küçük (s=64) sürümü indirerek yükleme hızlanır (2x ekran için yeterli)
const avatarSized = (url: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set('s', '64');
    return u.toString();
  } catch {
    return url;
  }
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

const HoverCard: React.FC<{
  c: GitCommitInfo;
  anchor: DOMRect;
  currentBranch?: string;
  fetchAuthor?: (hash: string) => Promise<GithubCommitAuthor | null>;
  onEnter: () => void;
  onLeave: () => void;
}> = ({ c, anchor, currentBranch, fetchAuthor, onEnter, onLeave }) => {
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<GithubCommitAuthor | null | undefined>(() => authorCache.get(c.hash));
  const [avatarOk, setAvatarOk] = useState(true);
  useEffect(() => {
    if (!fetchAuthor || authorCache.has(c.hash)) return;
    let alive = true;
    void fetchAuthor(c.hash).then((p) => {
      authorCache.set(c.hash, p);
      if (alive) setProfile(p);
    }).catch(() => { if (alive) setProfile(null); });
    return () => { alive = false; };
  }, [c.hash, fetchAuthor]);
  const displayName = profile?.name || profile?.login || c.author;
  const hue = laneColor(Math.abs([...c.author].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % 8);
  const left = anchor.right + 8 + CARD_W > window.innerWidth ? Math.max(8, anchor.left - CARD_W - 8) : anchor.right + 8;
  const top = Math.max(8, Math.min(anchor.top, window.innerHeight - CARD_H_EST - 8));
  const parents = c.parents ?? [];
  const refs = c.refs ?? [];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* pano erişilemezse sessiz geç */ }
  };
  return (
    <div
      role="dialog"
      aria-label={c.subject}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ left, top, width: CARD_W, maxHeight: 'calc(100vh - 16px)', overflowY: 'auto' }}
      className="fixed z-50 rounded-lg border border-white/10 bg-[var(--color-nv-side)] p-3 text-start shadow-[var(--float-shadow)] transition-opacity duration-(--dur-fast)"
    >
      <div className="text-[12.5px] font-medium leading-snug text-zinc-100 break-words">{c.subject}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-300"><GitCommitHorizontal size={12} className="text-zinc-500" />{c.hash}</span>
        <button
          type="button"
          onClick={copy}
          tabIndex={-1}
          className="pointer-events-auto inline-flex items-center gap-1 h-[18px] px-1.5 rounded text-[10.5px] text-zinc-400 hover:bg-white/[0.08] transition-colors duration-(--dur-fast)"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}{t(copied ? 'histCardCopied' : 'histCardCopy')}
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        {profile?.avatarUrl && avatarOk ? (
          <img src={avatarSized(profile.avatarUrl)} alt="" width={30} height={30} loading="eager" decoding="async" fetchPriority="high" referrerPolicy="no-referrer" onError={() => setAvatarOk(false)} className="size-[30px] shrink-0 rounded-full border border-white/10 object-cover" />
        ) : (
          <span aria-hidden className="grid place-items-center size-[30px] shrink-0 rounded-full text-[11px] font-semibold text-zinc-950" style={{ background: hue }}>{initials(displayName)}</span>
        )}
        <span className="min-w-0 flex flex-col">
          <span className="truncate text-[12px] font-medium text-zinc-100">{displayName}</span>
          <span className="truncate text-[11px] text-zinc-500">{profile?.login ? `@${profile.login}` : t('histCardLocalAuthor')}</span>
        </span>
        {profile?.profileUrl && (
          <button
            type="button"
            onClick={() => void window.electronAPI?.github?.openExternal(profile.profileUrl!)}
            className="ms-auto shrink-0 inline-flex items-center gap-1 h-[20px] px-1.5 rounded text-[10.5px] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-100 transition-colors duration-(--dur-fast)"
          >
            <ExternalLink size={11} />{t('histCardOpenProfile')}
          </button>
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        <span className="text-zinc-500">{t('histCardDate')}</span>
        <span className="text-zinc-200">
          {c.ts ? new Date(c.ts).toLocaleString() : c.when}
          {c.ts !== undefined && <span className="text-zinc-500"> · {timeAgo(c.ts)}</span>}
        </span>
        {parents.length > 0 && (
          <>
            <span className="text-zinc-500">{parents.length > 1 ? t('histCardMerge') : t('histCardParents')}</span>
            <span className="font-mono text-zinc-300">{parents.map((p) => p.slice(0, 7)).join(' ')}</span>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap font-mono text-[11px] tabular-nums">
        {c.added !== undefined && <span className="text-emerald-400">+{c.added}</span>}
        {c.deleted !== undefined && <span className="text-rose-400">−{c.deleted}</span>}
        {c.files !== undefined && <span className="text-zinc-400">· {t('histFilesTip').replace('{n}', String(c.files))}</span>}
      </div>
      {refs.length > 0 && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {refs.map((r) => (
            <span key={r} className={`inline-flex items-center gap-1 h-[16px] px-1.5 rounded-md text-[10.5px] font-mono ${r === currentBranch ? 'bg-white/[0.12] text-zinc-100' : 'border border-white/15 text-zinc-300'}`}>
              {r === currentBranch ? <Target size={10} /> : r.includes('/') ? <Cloud size={10} className="text-zinc-400" /> : <GitBranch size={10} />}{r}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[10.5px] text-zinc-500">{t('histCardHint')}</div>
    </div>
  );
};

interface Props {
  commits: GitCommitInfo[];
  currentBranch?: string;
  openCommit: string | null;
  onToggle: (hash: string) => void;
  renderFiles: (hash: string) => React.ReactNode;
  /** GitHub profili getirir (bağlı hesap + GitHub remote); yoksa kart yerel bilgiyle çalışır */
  fetchAuthor?: (hash: string) => Promise<GithubCommitAuthor | null>;
}

export const GitHistory: React.FC<Props> = ({ commits, currentBranch, openCommit, onToggle, renderFiles, fetchAuthor }) => {
  // Üst commit bilgisi yoksa (eski ana süreç) liste doğrusal sayılır
  const noParents = commits.length > 1 && commits.every((c) => c.parents === undefined);
  const layout = useMemo(
    () => layoutGraph(commits.map((c, i) => ({ hash: c.hash, parents: c.parents ?? (commits[i + 1] ? [commits[i + 1].hash] : []) }))),
    [commits]
  );
  const gutter = layout.laneCount * LANE_W + 12;
  // Ayrıntı kartı: kısa bir gecikmeden sonra açılır; fare çıkınca kapanır
  const [hover, setHover] = useState<{ hash: string; rect: DOMRect } | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  // Satırdan karta geçerken kapanmasın diye kapanış kısa bir gecikmeyle yapılır; kart üzerine gelince iptal edilir
  const hoverOn = (hash: string, el: HTMLElement) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover({ hash, rect: el.getBoundingClientRect() }), 350);
  };
  const hoverOff = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover(null), 180);
  };
  const keepOpen = () => window.clearTimeout(hoverTimer.current);
  const closeNow = () => {
    window.clearTimeout(hoverTimer.current);
    setHover(null);
  };
  // Liste kayarsa kart sabit konumda kalmasın: kaydırmada kapat
  useEffect(() => {
    if (!hover) return;
    window.addEventListener('scroll', closeNow, true);
    return () => window.removeEventListener('scroll', closeNow, true);
  }, [hover]);
  const hoverCommit = hover ? commits.find((c) => c.hash === hover.hash) : undefined;

  return (
    <div role="list" className="min-w-0 pb-1">
      {noParents && <div className="mx-1 mb-1.5 px-2 py-1 rounded bg-amber-500/10 text-[11px] text-amber-300">{t('histNeedRestart')}</div>}
      {commits.map((c, i) => {
        const row = layout.rows[i];
        const open = openCommit === c.hash;
        const refs = c.refs ?? [];
        const isHead = !!currentBranch && refs.includes(currentBranch);
        const color = laneColor(row.lane);
        return (
          <div key={c.hash} role="listitem" className="min-w-0">
            <button
              onClick={() => onToggle(c.hash)}
              aria-expanded={open}
              onMouseEnter={(e) => hoverOn(c.hash, e.currentTarget)}
              onMouseLeave={hoverOff}
              onFocus={(e) => hoverOn(c.hash, e.currentTarget)}
              onBlur={hoverOff}
              style={{ height: ROW_H, paddingInlineStart: gutter }}
              className="group relative w-[calc(100%-8px)] mx-1 block overflow-hidden text-start pe-2 py-[3px] rounded-md hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none transition-colors duration-(--dur-fast)"
            >
              <GraphCell row={row} width={gutter} hash={c.hash} head={isHead} />
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="truncate flex-1 min-w-0 text-[12.5px] leading-tight text-zinc-100">{c.subject}</span>
                {c.added !== undefined && (
                  <span className="shrink-0 inline-flex items-center gap-1 h-[17px] px-1.5 rounded-md bg-white/[0.06] font-mono text-[10.5px] font-semibold tabular-nums">
                    <span className="text-emerald-400">+{c.added}</span>
                    <span className="text-rose-400">−{c.deleted ?? 0}</span>
                  </span>
                )}
              </span>
              {refs.length > 0 && (
                <span className="mt-0.5 flex items-center gap-1 min-w-0 overflow-hidden">
                  {refs.slice(0, 2).map((r) => {
                    const remote = r.includes('/');
                    const cur = r === currentBranch;
                    return remote ? (
                      <span key={r} title={r} className="inline-flex items-center gap-1 min-w-0 max-w-[60%] h-[16px] px-1.5 rounded-md border border-white/15 text-[10.5px] text-zinc-300">
                        <Cloud size={10} className="shrink-0 text-zinc-400" /><span className="truncate font-mono">{r.slice(r.indexOf('/') + 1)}</span>
                      </span>
                    ) : (
                      <span key={r} title={r} className="inline-flex items-center gap-1 min-w-0 max-w-[60%] h-[16px] px-1.5 rounded-md text-[10.5px] font-semibold text-zinc-950" style={{ background: color }}>
                        {cur ? <Target size={10} className="shrink-0" /> : <GitBranch size={10} className="shrink-0" />}<span className="truncate font-mono">{r}</span>
                      </span>
                    );
                  })}
                  {refs.length > 2 && <span className="shrink-0 text-[10px] text-zinc-500">+{refs.length - 2}</span>}
                </span>
              )}
              <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-zinc-500 min-w-0">
                <span className="font-mono shrink-0 text-zinc-400">{c.hash}</span>
                <span className="truncate min-w-0">· {c.author}</span>
                <span className="shrink-0">· {c.ts ? timeAgo(c.ts) : c.when}</span>
              </span>
            </button>
            {/* Açılış: yükseklik 0fr↔1fr ve opaklık aynı eğriyle; kapalıyken yer kaplamaz ve odak almaz */}
            <div
              inert={!open}
              aria-hidden={!open}
              style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0, transition: 'grid-template-rows var(--dur-slow) var(--ease-out-soft), opacity var(--dur-base) ease' }}
            >
              <div className="min-h-0 overflow-hidden">
                {/* mx-1: commit düğmesiyle aynı yatay ofset (düğme mx-1 kullanır); yoksa şeritler açılınca 4px kayıp kopma görünür */}
                <div className="relative mx-1" style={{ paddingInlineStart: gutter }}>
                  {/* Açık dosya listesinin altından geçen dal şeritleri (div ile: yükseklik içeriğe göre, sonraki commit'e kesintisiz bağlanır) */}
                  {row.bottom.map((h, k) => (h ? <span key={k} aria-hidden className="absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none" style={{ left: x(k) - 1, background: laneColor(k) }} /> : null))}
                  <div className="flex flex-col">{renderFiles(c.hash)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {hover && hoverCommit && createPortal(<HoverCard c={hoverCommit} anchor={hover.rect} currentBranch={currentBranch} fetchAuthor={fetchAuthor} onEnter={keepOpen} onLeave={closeNow} />, document.body)}
    </div>
  );
};
