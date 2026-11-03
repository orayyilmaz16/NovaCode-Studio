import React, { useEffect, useState } from 'react';
import { Code2, Sparkles, Terminal } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Modüller yükleniyor...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Monaco motoru ve sözdizimi ayrıştırıcı hazırlanıyor...');
    }, 350);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Yerel çalışma alanı senkronize ediliyor...');
    }, 750);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('NovaCode Studio hazır!');
    }, 1150);

    const timer4 = setTimeout(() => {
      onFinish();
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d1017] text-white select-none">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-400 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce duration-1000">
            <Code2 size={44} className="text-white drop-shadow" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles size={20} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-sky-300 bg-clip-text text-transparent">
          NovaCode Studio
        </h1>
        <p className="text-xs text-zinc-400 mt-1 mb-8">
          Modern Kod Editörü ve Canlı Web Simülatörü
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mb-3 p-[1px] border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
          <Terminal size={12} className="text-indigo-400" />
          <span className="truncate">{statusText}</span>
        </div>
      </div>
    </div>
  );
};
