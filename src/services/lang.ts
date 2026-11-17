// Dosya adından Monaco dil kimliği (electron-main.cjs içindeki languageFromExt ile aynı tablo).
const MAP: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', html: 'html', htm: 'html',
  css: 'css', scss: 'css', sass: 'css', less: 'css', json: 'json',
  cs: 'csharp', php: 'php', rb: 'ruby', lua: 'lua',
  md: 'markdown', markdown: 'markdown', py: 'python', rs: 'rust', go: 'go',
  c: 'cpp', cpp: 'cpp', h: 'cpp', hpp: 'cpp', java: 'java', sql: 'sql',
  sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'shell', yaml: 'yaml', yml: 'yaml'
};

export const languageFromName = (name: string): string => MAP[(name.split('.').pop() ?? '').toLowerCase()] ?? 'plaintext';
// Monaco dil kimliğinden görünen resmi ad (durum çubuğu vb.).
const LABELS: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', html: 'HTML', css: 'CSS', scss: 'SCSS', less: 'Less',
  json: 'JSON', jsonc: 'JSON with Comments', csharp: 'C#', fsharp: 'F#', cpp: 'C++', c: 'C', php: 'PHP',
  ruby: 'Ruby', lua: 'Lua', markdown: 'Markdown', python: 'Python', rust: 'Rust', go: 'Go', java: 'Java',
  sql: 'SQL', shell: 'Shell', shellscript: 'Shell', powershell: 'PowerShell', yaml: 'YAML', xml: 'XML',
  kotlin: 'Kotlin', swift: 'Swift', dart: 'Dart', objective_c: 'Objective-C', r: 'R', perl: 'Perl',
  vb: 'Visual Basic', bat: 'Batch', dockerfile: 'Dockerfile', ini: 'INI', toml: 'TOML', graphql: 'GraphQL',
  scala: 'Scala', clojure: 'Clojure', coffeescript: 'CoffeeScript', handlebars: 'Handlebars', razor: 'Razor',
  pug: 'Pug', plaintext: 'Plain Text'
};
export const languageLabel = (id: string): string =>
  LABELS[id.toLowerCase()] ?? id.charAt(0).toUpperCase() + id.slice(1);
export const baseName = (p: string): string => p.split(/[\\/]/).pop() ?? p;
