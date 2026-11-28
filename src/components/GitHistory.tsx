import React, { useMemo } from 'react';
import { Cloud, GitBranch, Target } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';
import { timeAgo } from '../services/timeAgo';
import { laneColor, layoutGraph, type GraphRow } from '../services/gitGraph';
import type { GitCommitInfo } from '../types';

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

interface Props {
  commits: GitCommitInfo[];
  currentBranch?: string;
  openCommit: string | null;
  onToggle: (hash: string) => void;
  renderFiles: (hash: string) => React.ReactNode;
}

export const GitHistory: React.FC<Props> = ({ commits, currentBranch, openCommit, onToggle, renderFiles }) => {
  // Üst commit bilgisi yoksa (eski ana süreç) liste doğrusal sayılır
  const noParents = commits.length > 1 && commits.every((c) => c.parents === undefined);
  const layout = useMemo(
    () => layoutGraph(commits.map((c, i) => ({ hash: c.hash, parents: c.parents ?? (commits[i + 1] ? [commits[i + 1].hash] : []) }))),
    [commits]
  );
  const gutter = layout.laneCount * LANE_W + 12;

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
              title={`${c.hash} — ${c.subject}\n${c.author} · ${c.ts ? new Date(c.ts).toLocaleString() : c.when}`}
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
                <div className="relative" style={{ paddingInlineStart: gutter }}>
                  <svg width={gutter} height="100%" className="absolute start-0 top-0 pointer-events-none" aria-hidden fill="none" strokeWidth={2} shapeRendering="geometricPrecision">
                    {row.bottom.map((h, k) => (h ? <line key={k} x1={x(k)} x2={x(k)} y1={0} y2="100%" stroke={laneColor(k)} /> : null))}
                  </svg>
                  <div className="flex flex-col">{renderFiles(c.hash)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
