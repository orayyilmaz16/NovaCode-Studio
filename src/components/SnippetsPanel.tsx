import React, { useState } from 'react';
import { BookOpen, Copy, Check, Search, PlusCircle } from 'lucide-react';
import { builtInSnippets } from '../snippets/defaultSnippets';
import type { Snippet } from '../types';

interface SnippetsPanelProps {
  onInsertSnippet: (snippetText: string) => void;
}

export const SnippetsPanel: React.FC<SnippetsPanelProps> = ({ onInsertSnippet }) => {
  const [snippets, setSnippets] = useState<Snippet[]>(builtInSnippets);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = snippets.filter(
    (s) =>
      s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (snippet: Snippet, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.body);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#131620] text-zinc-300 select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <BookOpen size={14} className="text-amber-400" />
          <span className="font-semibold text-zinc-200">KOD SNIPPETLARI</span>
        </div>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
          {snippets.length} Parça
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-zinc-800/80">
        <div className="flex items-center bg-[#0d1017] border border-zinc-700/80 rounded px-2 py-1">
          <Search size={13} className="text-zinc-500 mr-1.5" />
          <input
            type="text"
            placeholder="Snippet ara (örn: html5, fetch, react)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-200 outline-none"
          />
        </div>
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((snippet) => (
          <div
            key={snippet.id}
            onClick={() => onInsertSnippet(snippet.body)}
            className="p-2.5 rounded-lg bg-[#0d1017] border border-zinc-800/80 hover:border-indigo-500/50 hover:bg-zinc-800/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-zinc-100 group-hover:text-indigo-300">
                {snippet.label}
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                  {snippet.prefix}
                </span>
                <button
                  onClick={(e) => handleCopy(snippet, e)}
                  title="Kopyala"
                  className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedId === snippet.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-2">
              {snippet.description}
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/40 pt-1.5">
              <span className="uppercase text-indigo-400/80 font-mono">{snippet.language}</span>
              <span className="flex items-center group-hover:text-indigo-400 transition-colors">
                <PlusCircle size={11} className="mr-1" /> Editöre Ekle
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
