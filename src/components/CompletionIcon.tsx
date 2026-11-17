import React from 'react';
import { Sparkles } from 'lucide-react';

/** AI kod tamamlama simgesi (✦). `off` iken üzerine çapraz çizgi çekilir (devre dışı göstergesi). */
export const CompletionIcon: React.FC<{ size?: number; off?: boolean; className?: string }> = ({ size = 12, off = false, className }) => (
  <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} data-off={off || undefined}>
    <Sparkles size={size} className={className} />
    {off && (
      <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} />
      </svg>
    )}
  </span>
);
