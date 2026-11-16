import React, { useId } from 'react';

interface LogoProps {
  size?: number;
  /** Açılışta ayraç çizilir, kıvılcım belirir. */
  animated?: boolean;
  className?: string;
  /** Temaya uyumlu plaka + gölge (koyu temada koyu, açık temada açık zemin). `size` plakanın toplam boyutudur. */
  plate?: boolean;
}

// NovaCode işareti: kod ayracı (‹) + yapay zekâ kıvılcımı. Arka plansızdır; public/logo.svg ile aynı çizim.
export const Logo: React.FC<LogoProps> = ({ size = 20, animated = false, className, plate = false }) => {
  const gid = useId();
  const fill = `url(#${gid})`;
  const mark = plate ? Math.round(size * 0.64) : size;
  const svg = (
    <svg width={mark} height={mark} viewBox="2 -5.5 100 100" fill="none" role="img" aria-label="NovaCode Studio" className={plate ? undefined : className}>
      <defs>
        <linearGradient id={gid} x1="8" y1="8" x2="98" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B7CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        className={animated ? 'logo-bracket' : undefined}
        d="M32 32 12 50l20 18"
        stroke={fill}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path className={animated ? 'logo-star' : undefined} fill={fill} d="M62 20Q66.8 45.2 92 50Q66.8 54.8 62 80Q57.2 54.8 32 50Q57.2 45.2 62 20Z" />
      <path className={animated ? 'logo-star-small' : undefined} fill={fill} d="M86 9Q87.8 18.2 97 20Q87.8 21.8 86 31Q84.2 21.8 75 20Q84.2 18.2 86 9Z" />
    </svg>
  );
  if (!plate) return svg;
  return (
    <span className={`logo-plate ${className ?? ''}`} style={{ width: size, height: size, borderRadius: Math.round(size * 0.27) }}>
      {svg}
    </span>
  );
};
