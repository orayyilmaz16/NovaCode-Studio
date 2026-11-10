import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { t } from '../i18n/uiText';

interface SplashScreenProps {
  onFinish: () => void;
}

// Sade açılış: logo çizilerek belirir, ince bir yükleme çizgisi akar, sonra yumuşakça kaybolur.
export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), 1250);
    const done = setTimeout(onFinish, 1520);
    return () => {
      clearTimeout(out);
      clearTimeout(done);
    };
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-label={t('splashLoading')}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-nv-side text-white select-none ${leaving ? 'animate-splash-out' : ''}`}
    >
      <Logo size={88} animated />
      <h1 className="mt-6 text-xl font-light tracking-[0.2em] text-zinc-200 uppercase animate-fade-in" style={{ animationDelay: '300ms' }}>
        NovaCode Studio
      </h1>
      <p className="mt-1.5 text-xs text-zinc-500 animate-fade-in" style={{ animationDelay: '450ms' }}>
        {t('splashTagline')}
      </p>
      <div className="mt-8 w-44 h-[2px] bg-zinc-800 overflow-hidden rounded-full load-bar" />
    </div>
  );
};
