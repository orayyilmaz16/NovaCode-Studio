import React from 'react';

// Dosya türü simgeleri: uzantıya (ve bazı özel dosya adlarına) göre renkli rozet. Ek bağımlılık yok, yalnız satır içi SVG.
// Etiket kısa tutulur (en çok 3 karakter); koyu zeminde okunsun diye açık renklerde koyu yazı kullanılır.
interface Badge {
  label: string;
  bg: string;
  fg?: string;
  title: string;
}

const LIGHT = '#1f1f1f';

const EXT: Record<string, Badge> = {
  ts: { label: 'TS', bg: '#3178c6', title: 'TypeScript' },
  tsx: { label: 'TSX', bg: '#3178c6', title: 'TypeScript React' },
  js: { label: 'JS', bg: '#f0db4f', fg: LIGHT, title: 'JavaScript' },
  jsx: { label: 'JSX', bg: '#f0db4f', fg: LIGHT, title: 'JavaScript React' },
  mjs: { label: 'JS', bg: '#f0db4f', fg: LIGHT, title: 'JavaScript (ESM)' },
  cjs: { label: 'JS', bg: '#f0db4f', fg: LIGHT, title: 'JavaScript (CJS)' },
  json: { label: '{}', bg: '#cbcb41', fg: LIGHT, title: 'JSON' },
  html: { label: '<>', bg: '#e44d26', title: 'HTML' },
  htm: { label: '<>', bg: '#e44d26', title: 'HTML' },
  css: { label: 'CSS', bg: '#2965f1', title: 'CSS' },
  scss: { label: 'SC', bg: '#cd6799', title: 'SCSS' },
  sass: { label: 'SA', bg: '#cd6799', title: 'Sass' },
  less: { label: 'LS', bg: '#1d365d', title: 'Less' },
  py: { label: 'PY', bg: '#3776ab', title: 'Python' },
  php: { label: 'PHP', bg: '#777bb4', title: 'PHP' },
  java: { label: 'JV', bg: '#e76f00', title: 'Java' },
  kt: { label: 'KT', bg: '#7f52ff', title: 'Kotlin' },
  c: { label: 'C', bg: '#5c6bc0', title: 'C' },
  h: { label: 'H', bg: '#5c6bc0', title: 'C/C++ başlık' },
  cpp: { label: 'C++', bg: '#00599c', title: 'C++' },
  hpp: { label: 'H++', bg: '#00599c', title: 'C++ başlık' },
  cs: { label: 'C#', bg: '#68217a', title: 'C#' },
  go: { label: 'GO', bg: '#00add8', fg: LIGHT, title: 'Go' },
  rs: { label: 'RS', bg: '#dea584', fg: LIGHT, title: 'Rust' },
  rb: { label: 'RB', bg: '#cc342d', title: 'Ruby' },
  swift: { label: 'SW', bg: '#f05138', title: 'Swift' },
  dart: { label: 'DT', bg: '#00b4ab', fg: LIGHT, title: 'Dart' },
  lua: { label: 'LUA', bg: '#000080', title: 'Lua' },
  sh: { label: 'SH', bg: '#4eaa25', title: 'Shell' },
  bash: { label: 'SH', bg: '#4eaa25', title: 'Shell' },
  zsh: { label: 'SH', bg: '#4eaa25', title: 'Shell' },
  ps1: { label: 'PS', bg: '#2671be', title: 'PowerShell' },
  bat: { label: 'BAT', bg: '#4d4d4d', title: 'Batch' },
  cmd: { label: 'CMD', bg: '#4d4d4d', title: 'Batch' },
  sql: { label: 'SQL', bg: '#e38c00', fg: LIGHT, title: 'SQL' },
  md: { label: 'MD', bg: '#519aba', fg: LIGHT, title: 'Markdown' },
  markdown: { label: 'MD', bg: '#519aba', fg: LIGHT, title: 'Markdown' },
  txt: { label: 'TXT', bg: '#6d6d6d', title: 'Metin' },
  yaml: { label: 'YML', bg: '#cb171e', title: 'YAML' },
  yml: { label: 'YML', bg: '#cb171e', title: 'YAML' },
  toml: { label: 'TML', bg: '#9c4221', title: 'TOML' },
  xml: { label: 'XML', bg: '#e37933', fg: LIGHT, title: 'XML' },
  vue: { label: 'VUE', bg: '#41b883', fg: LIGHT, title: 'Vue' },
  svelte: { label: 'SV', bg: '#ff3e00', title: 'Svelte' },
  svg: { label: 'SVG', bg: '#ffb13b', fg: LIGHT, title: 'SVG' },
  png: { label: 'IMG', bg: '#a074c4', title: 'Görsel' },
  jpg: { label: 'IMG', bg: '#a074c4', title: 'Görsel' },
  jpeg: { label: 'IMG', bg: '#a074c4', title: 'Görsel' },
  gif: { label: 'GIF', bg: '#a074c4', title: 'Görsel' },
  webp: { label: 'IMG', bg: '#a074c4', title: 'Görsel' },
  ico: { label: 'ICO', bg: '#a074c4', title: 'Simge' },
  zip: { label: 'ZIP', bg: '#8a6d3b', title: 'Arşiv' },
  gz: { label: 'GZ', bg: '#8a6d3b', title: 'Arşiv' },
  lock: { label: 'LCK', bg: '#5a5a5a', title: 'Kilit dosyası' },
  env: { label: 'ENV', bg: '#ecd53f', fg: LIGHT, title: 'Ortam değişkenleri' },
  log: { label: 'LOG', bg: '#6d6d6d', title: 'Günlük' }
};

const NAMES: Record<string, Badge> = {
  'package.json': { label: 'NPM', bg: '#cb3837', title: 'npm' },
  'package-lock.json': { label: 'NPM', bg: '#7a2221', title: 'npm kilidi' },
  'tsconfig.json': { label: 'TS', bg: '#2b5d94', title: 'TypeScript ayarı' },
  'dockerfile': { label: 'DK', bg: '#2496ed', title: 'Docker' },
  'docker-compose.yml': { label: 'DK', bg: '#2496ed', title: 'Docker Compose' },
  '.gitignore': { label: 'GIT', bg: '#f05032', title: 'Git' },
  '.gitattributes': { label: 'GIT', bg: '#f05032', title: 'Git' },
  'license': { label: 'LIC', bg: '#8a8a8a', title: 'Lisans' },
  'readme.md': { label: 'MD', bg: '#2f80ed', title: 'README' },
  'composer.json': { label: 'PHP', bg: '#885630', title: 'Composer' },
  'cargo.toml': { label: 'RS', bg: '#a0522d', title: 'Cargo' },
  'go.mod': { label: 'GO', bg: '#007d9c', title: 'Go modülü' },
  '.env': { label: 'ENV', bg: '#ecd53f', fg: LIGHT, title: 'Ortam değişkenleri' }
};

export function fileTypeInfo(name: string): Badge {
  const lower = name.toLowerCase();
  if (NAMES[lower]) return NAMES[lower];
  if (lower.startsWith('.env')) return NAMES['.env'];
  if (/^vite\.config\./.test(lower)) return { label: 'VT', bg: '#8b5cf6', title: 'Vite' };
  if (/^(tailwind|postcss|eslint|prettier)\./.test(lower)) return { label: 'CFG', bg: '#5a5a5a', title: 'Ayar' };
  const ext = lower.includes('.') ? lower.split('.').pop()! : '';
  return EXT[ext] ?? { label: ext ? ext.slice(0, 3).toUpperCase() : 'TXT', bg: '#5f5f5f', title: ext ? ext.toUpperCase() : 'Dosya' };
}

// VS Code benzeri dile özgü simgeler (16x16, satır içi SVG). Burada olmayan türler rozet olarak çizilir.
const sq = (bg: string, label: string, fg: string) => (
  <>
    <rect x="1" y="1" width="14" height="14" rx="2" fill={bg} />
    <text x="14" y="14" textAnchor="end" fontFamily="Segoe UI, Arial, sans-serif" fontWeight="700" fontSize="8.5" fill={fg}>{label}</text>
  </>
);
const atom = (
  <g fill="none" stroke="#61dafb" strokeWidth="1">
    <ellipse cx="8" cy="8" rx="7" ry="2.8" />
    <ellipse cx="8" cy="8" rx="7" ry="2.8" transform="rotate(60 8 8)" />
    <ellipse cx="8" cy="8" rx="7" ry="2.8" transform="rotate(120 8 8)" />
    <circle cx="8" cy="8" r="1.2" fill="#61dafb" stroke="none" />
  </g>
);
const GLYPHS: Record<string, { title: string; node: React.ReactNode }> = {
  js: { title: 'JavaScript', node: sq('#f7df1e', 'JS', '#1f1f1f') },
  mjs: { title: 'JavaScript (ESM)', node: sq('#f7df1e', 'JS', '#1f1f1f') },
  cjs: { title: 'JavaScript (CJS)', node: sq('#f7df1e', 'JS', '#1f1f1f') },
  ts: { title: 'TypeScript', node: sq('#3178c6', 'TS', '#ffffff') },
  jsx: { title: 'React (JSX)', node: atom },
  tsx: { title: 'React (TSX)', node: atom },
  py: {
    title: 'Python',
    node: (
      <>
        <path fill="#3b7bb5" d="M7.9 1C5 1 5.2 2.3 5.2 2.3v1.4H8v.4H4S2 3.9 2 7s1.7 3 1.7 3h1V8.6s-.1-1.7 1.7-1.7h2.8s1.6 0 1.6-1.6V2.6S11.1 1 7.9 1z" />
        <path fill="#ffd43b" d="M8.1 15c2.9 0 2.7-1.3 2.7-1.3v-1.4H8v-.4h4s2 .2 2-2.9-1.7-3-1.7-3h-1v1.4s.1 1.7-1.7 1.7H6.8s-1.6 0-1.6 1.6v2.7S4.9 15 8.1 15z" />
        <circle cx="6.2" cy="2.5" r=".6" fill="#fff" />
        <circle cx="9.8" cy="13.5" r=".6" fill="#fff" />
      </>
    ),
  },
  php: {
    title: 'PHP',
    node: (
      <>
        <ellipse cx="8" cy="8" rx="7.5" ry="4.8" fill="#777bb4" />
        <text x="8" y="8.2" textAnchor="middle" dominantBaseline="central" fontFamily="Segoe UI, Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="6.2" fill="#fff">php</text>
      </>
    ),
  },
  sql: {
    title: 'SQL',
    node: (
      <g fill="none" stroke="#8fb4d8" strokeWidth="1.2">
        <ellipse cx="8" cy="3.8" rx="5" ry="2" />
        <path d="M3 3.8v8.4c0 1.1 2.2 2 5 2s5-.9 5-2V3.8" />
        <path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" />
      </g>
    ),
  },
  html: { title: 'HTML', node: <path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" fill="none" stroke="#e44d26" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
  htm: { title: 'HTML', node: <path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" fill="none" stroke="#e44d26" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
  css: { title: 'CSS', node: <path d="M6 2 5 14M11 2l-1 12M2.5 5.8h11.5M2 10.2h11.5" fill="none" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round" /> },
  json: { title: 'JSON', node: <path d="M6 2.5C4.5 2.5 4.5 4 4.5 5.5S4 7.8 2.5 8c1.5.2 2 .5 2 2.5s0 3 1.5 3M10 2.5c1.5 0 1.5 1.5 1.5 3s.5 2.3 2 2.5c-1.5.2-2 .5-2 2.5s0 3-1.5 3" fill="none" stroke="#cbcb41" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /> },
};

const FallbackIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 15, className = '' }) => {
  const lower = name.toLowerCase();
  const ext = lower.includes('.') ? lower.split('.').pop()! : '';
  const g = !NAMES[lower] && GLYPHS[ext];
  if (g) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={g.title} className={`shrink-0 ${className}`}>
        <title>{g.title}</title>
        {g.node}
      </svg>
    );
  }
  const b = fileTypeInfo(name);
  const fs = b.label.length <= 1 ? 11 : b.label.length === 2 ? 9 : 7;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={b.title} className={`shrink-0 ${className}`}>
      <title>{b.title}</title>
      <rect x="0.5" y="1.5" width="15" height="13" rx="3" fill={b.bg} />
      <text x="8" y="8" textAnchor="middle" dominantBaseline="central" fontFamily="Segoe UI, Arial, sans-serif" fontWeight="700" fontSize={fs} fill={b.fg ?? '#fff'}>
        {b.label}
      </text>
    </svg>
  );
};

// ---- Gerçek VS Code simgeleri: Material Icon Theme (MIT). Eşleme küçük bir JSON, SVG'ler gerektikçe yüklenir. ----
type IconMap = { d: string; e: Record<string, string>; n: Record<string, string> };
let mapPromise: Promise<IconMap> | null = null;
let iconMap: IconMap | null = null;
const loadMap = () => (mapPromise ??= import('../data/fileIcons.json').then((m) => (iconMap = (m.default ?? m) as IconMap)));
const loadLoaders = () => import('../data/fileIconLoaders');
const urlCache = new Map<string, string>();

function resolveIcon(name: string, m: IconMap): string {
  const lower = name.toLowerCase();
  if (m.n[lower]) return m.n[lower];
  // "a.test.ts" için sırayla "test.ts", "ts" denenir (en uzun eşleşme önce)
  const parts = lower.split('.');
  for (let i = 1; i < parts.length; i++) {
    const hit = m.e[parts.slice(i).join('.')];
    if (hit) return hit;
  }
  return m.d;
}

export const FileTypeIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 15, className = '' }) => {
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  const [failed, setFailed] = React.useState(false);
  const icon = iconMap ? resolveIcon(name, iconMap) : null;
  const url = icon ? urlCache.get(icon) : undefined;

  React.useEffect(() => {
    let alive = true;
    void loadMap().then((m) => {
      const ic = resolveIcon(name, m);
      if (urlCache.has(ic)) return alive && bump();
      return loadLoaders().then(({ loaderFor }) => {
        const load = loaderFor(ic);
        if (!load) { if (alive) setFailed(true); return; }
        return load().then((u) => { urlCache.set(ic, u); if (alive) bump(); });
      });
    }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [name]);

  if (url && !failed) {
    return <img src={url} width={size} height={size} alt="" aria-hidden draggable={false} className={`shrink-0 ${className}`} onError={() => setFailed(true)} />;
  }
  return <FallbackIcon name={name} size={size} className={className} />;
};
