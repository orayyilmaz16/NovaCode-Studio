import React from 'react';

// Güvenli mini markdown çizici: HTML basmaz (yalnız React öğeleri), görselleri çizmez, bağlantıyı yalnız https'e izin vererek açar.
// Desteklenen: başlıklar, kod çiti, satır içi kod, kalın/italik, bağlantı, madde/numaralı liste, alıntı, yatay çizgi.
function openLink(url: string) {
  if (/^https:\/\//i.test(url)) void window.electronAPI?.openLink(url);
}

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // sıra: `kod`, **kalın**, [metin](url), *italik*
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|!?\[([^\]]*)\]\(([^)\s]+)[^)]*\)|(?<![\w*])\*([^*\s][^*]*)\*(?![\w*])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[1] !== undefined) out.push(<code key={k} className="px-1 rounded bg-zinc-800 text-[0.92em] font-mono break-all">{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={k} className="text-zinc-100">{m[2]}</strong>);
    else if (m[4] !== undefined) {
      const isImage = m[0].startsWith('!');
      if (isImage) out.push(<span key={k} className="text-zinc-500">[{m[3] || 'image'}]</span>);
      else out.push(<button key={k} type="button" title={m[4]} onClick={() => openLink(m![4])} className="text-indigo-300 hover:underline text-left break-words">{m[3] || m[4]}</button>);
    } else if (m[5] !== undefined) out.push(<em key={k}>{m[5]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const Markdown: React.FC<{ source: string; compact?: boolean }> = ({ source, compact }) => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={key++} className="my-2 p-2 rounded bg-zinc-900/80 border border-zinc-800 overflow-x-auto text-[11px] font-mono text-zinc-200">{code.join('\n')}</pre>);
    } else if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      blocks.push(<div key={key++} className={`mt-3 mb-1 font-semibold text-zinc-100 ${level <= 2 ? 'text-[14px]' : 'text-[12.5px]'}`}>{inline(line.replace(/^#+\s*/, ''), `h${key}`)}</div>);
      i++;
    } else if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      const ordered = /^\s*\d+\./.test(line);
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(<li key={items.length} className="break-words">{inline(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''), `l${key}-${items.length}`)}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={key++} className="my-1 ml-5 list-decimal space-y-0.5">{items}</ol> : <ul key={key++} className="my-1 ml-5 list-disc space-y-0.5">{items}</ul>);
    } else if (/^>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key++} className="my-1 pl-2 border-l-2 border-zinc-600 text-zinc-400">{inline(q.join(' '), `q${key}`)}</blockquote>);
    } else if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      blocks.push(<hr key={key++} className="my-2 border-zinc-800" />);
      i++;
    } else if (!line.trim()) {
      i++;
    } else {
      const p: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,6}\s|>\s?|\s*([-*+]|\d+\.)\s+)/.test(lines[i])) p.push(lines[i++]);
      blocks.push(<p key={key++} className="my-1 break-words [overflow-wrap:anywhere]">{inline(p.join(' '), `p${key}`)}</p>);
    }
  }
  return <div className={`min-w-0 leading-relaxed ${compact ? 'text-[11.5px]' : 'text-[12.5px]'} text-zinc-300`}>{blocks}</div>;
};
