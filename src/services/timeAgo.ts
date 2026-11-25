import { getUiLang } from '../i18n/uiText';

// "2 dk önce" gibi göreli zaman: arayüz dilinde (Intl.RelativeTimeFormat). Geçersiz/eksik zaman için boş döner.
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(ts: number | undefined, now = Date.now()): string {
  if (!ts || !Number.isFinite(ts)) return '';
  let rtf: Intl.RelativeTimeFormat;
  try { rtf = new Intl.RelativeTimeFormat(getUiLang(), { numeric: 'auto', style: 'short' }); } catch { rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' }); }
  const sec = Math.round((ts - now) / 1000);
  const abs = Math.abs(sec);
  for (const [unit, size] of UNITS) {
    if (abs >= size) return rtf.format(Math.round(sec / size), unit);
  }
  return rtf.format(Math.min(0, Math.round(sec / 60)), 'minute');
}
