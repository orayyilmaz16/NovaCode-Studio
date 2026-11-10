import React, { useId } from 'react';

interface LogoProps {
  size?: number;
  /** Açılışta ayraç çizilir, kıvılcım belirir. */
  animated?: boolean;
  className?: string;
}

// NovaCode işareti: kod ayracı (‹) + yapay zekâ kıvılcımı. public/logo.svg ile aynı çizim.
export const Logo: React.FC<LogoProps> = ({ size = 20, animated = false, className }) => {
  const gid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="NovaCode Studio"
      className={className}
    >
      <defs>
        <linearGradient id={gid} x1="10" y1="8" x2="92" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill={`url(#${gid})`} />
      <path
        className={animated ? 'logo-bracket' : undefined}
        d="M31 35 15 50l16 15"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={animated ? 'logo-star' : undefined}
        fill="#fff"
        d="M64 28Q67.4 48.6 88 52Q67.4 55.4 64 76Q60.6 55.4 40 52Q60.6 48.6 64 28Z"
      />
      <path
        className={animated ? 'logo-star-small' : undefined}
        fill="#fff"
        fillOpacity=".85"
        d="M82 15Q83.3 22.7 91 24Q83.3 25.3 82 33Q80.7 25.3 73 24Q80.7 22.7 82 15Z"
      />
    </svg>
  );
};
