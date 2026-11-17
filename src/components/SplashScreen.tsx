import React, { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { t } from '../i18n/uiText';

interface SplashScreenProps {
  onFinish: () => void;
  /** Uygulama hazır olunca true; verilmezse hazır sayılır. Asgari süre dolmadan kapanmaz. */
  ready?: boolean;
}

// Süreler hareket jetonlarından okunur (style.css :root); okunamazsa varsayılan.
function tokenMs(name: string, fallback: number): number {
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

// Sade açılış: logo çizilerek belirir, ince bir yükleme çizgisi akar; uygulama hazır olunca (asgari --dur-enter sonra) yumuşakça kaybolur.
export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, ready = true }) => {
  const [leaving, setLeaving] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const finish = useRef(onFinish);
  finish.current = onFinish;

  useEffect(() => {
    const id = setTimeout(() => setMinDone(true), tokenMs('--dur-enter', 380));
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!minDone || !ready) return;
    setLeaving(true);
    const id = setTimeout(() => finish.current(), tokenMs('--dur-base', 180));
    return () => clearTimeout(id);
  }, [minDone, ready]);

  return (
    <div
      role="status"
      aria-label={t('splashLoading')}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-nv-side text-white select-none ${leaving ? 'animate-splash-out' : ''}`}
    >
      <Logo size={88} animated shadow />
      <h1 className="mt-6 text-xl font-light tracking-[0.2em] text-zinc-200 uppercase animate-fade-in" style={{ animationDelay: 'var(--stagger)' }}>
        NovaCode Studio
      </h1>
      <p className="mt-1.5 text-xs text-zinc-500 animate-fade-in" style={{ animationDelay: 'calc(var(--stagger) * 2)' }}>
        {t('splashTagline')}
      </p>
      <div className="mt-8 w-44 h-[2px] bg-zinc-800 overflow-hidden rounded-full load-bar" />
    </div>
  );
};
