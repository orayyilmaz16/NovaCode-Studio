// Önizlenebilir dosya türleri (Preview bileşeninden bağımsız küçük modül: ana pakete tembel Preview'i çekmez).
export type PreviewKind = 'html' | 'svg' | 'md' | 'webasset' | 'none';

export const previewKind = (name?: string): PreviewKind => {
  const ext = (name ?? '').split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'svg') return 'svg';
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'css' || ext === 'js' || ext === 'mjs') return 'webasset';
  return 'none';
};
