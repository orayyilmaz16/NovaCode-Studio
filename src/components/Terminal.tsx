import React, { useState } from 'react';
import { Terminal as TermIcon, Trash2, Send } from 'lucide-react';
import type { ConsoleLog } from '../types';

interface TerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear, onExecuteCommand }) => {
  const [cmd, setCmd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmd.trim()) {
      onExecuteCommand(cmd.trim());
      setCmd('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1017] text-zinc-300 font-mono text-xs border-t border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141724] border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <TermIcon size={13} className="text-indigo-400" />
          <span className="font-semibold text-zinc-300">Terminal & JS Console</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Node/Browser v1.0</span>
        </div>
        <button
          onClick={onClear}
          title="Konsolu Temizle"
          className="hover:bg-zinc-800 p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">Henüz bir çıktı yok. Kod çalıştırdığınızda veya komut yazdığınızda loglar burada belirir.</div>
        ) : (
          logs.map((log) => {
            let textColor = 'text-zinc-300';
            if (log.type === 'error') textColor = 'text-rose-400';
            if (log.type === 'warn') textColor = 'text-amber-300';
            if (log.type === 'info') textColor = 'text-sky-300';

            return (
              <div key={log.id} className="flex items-start space-x-2 font-mono leading-relaxed">
                <span className="text-zinc-500 text-[10px] select-none shrink-0">[{log.time}]</span>
                <span className={`break-all whitespace-pre-wrap ${textColor}`}>
                  {log.text}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex items-center px-3 py-1.5 bg-[#10131d] border-t border-zinc-800">
        <span className="text-emerald-400 font-bold mr-2 select-none">&gt;</span>
        <input
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="JS ifadesi çalıştır (örn: 2 + 2 veya console.log('merhaba'))"
          className="flex-1 bg-transparent text-zinc-100 outline-none text-xs"
        />
        <button type="submit" className="text-zinc-500 hover:text-indigo-400 ml-2">
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
