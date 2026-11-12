// Dosya adından Monaco dil kimliği (electron-main.cjs içindeki languageFromExt ile aynı tablo).
const MAP: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', html: 'html', htm: 'html',
  css: 'css', scss: 'css', sass: 'css', less: 'css', json: 'json',
  md: 'markdown', markdown: 'markdown', py: 'python', rs: 'rust', go: 'go',
  c: 'cpp', cpp: 'cpp', h: 'cpp', hpp: 'cpp', java: 'java', sql: 'sql',
  sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'shell', yaml: 'yaml', yml: 'yaml'
};

export const languageFromName = (name: string): string => MAP[(name.split('.').pop() ?? '').toLowerCase()] ?? 'plaintext';
export const baseName = (p: string): string => p.split(/[\\/]/).pop() ?? p;
