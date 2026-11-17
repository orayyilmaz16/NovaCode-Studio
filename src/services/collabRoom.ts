// Ortak düzenleme oda kimliği ve token taşıma yardımcıları.
// KVKK: sunucuya yerel mutlak yol (Windows kullanıcı adı içerebilir) gitmez; oda adı rastgele kimlik + göreli yolun özetidir.
const KEY = 'nova.collab.rooms';

function readMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function randomId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

// Klasör için kalıcı rastgele oda kimliği (yerel depoda yolla eşlenir; yol sunucuya gitmez).
// Aynı projede çalışacak kişiler kimliği paylaşır: setCollabRoomId ile girilebilir.
export function getCollabRoomId(rootPath: string): string {
  if (!rootPath) return '';
  const map = readMap();
  if (map[rootPath]) return map[rootPath];
  const id = randomId();
  try {
    map[rootPath] = id;
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* depolama kapalı: bu oturum için geçici kimlik */
  }
  return id;
}

export function setCollabRoomId(rootPath: string, id: string): void {
  const clean = id.trim().slice(0, 128);
  if (!rootPath || !clean) return;
  try {
    const map = readMap();
    map[rootPath] = clean;
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* depolama kapalı */
  }
}

function relativePath(root: string, file: string): string {
  const norm = (p: string) => p.replace(/\\/g, '/');
  const r = norm(root).replace(/\/+$/, '');
  const f = norm(file);
  return f.toLowerCase().startsWith(r.toLowerCase() + '/') ? f.slice(r.length + 1) : f.split('/').pop() || f;
}

// Dosya odası: <oda-kimliği>/<göreli yolun SHA-256 özeti>. Mutlak yol ve dosya adı sunucuya gitmez.
export async function collabFileRoom(roomId: string, rootPath: string, filePath: string): Promise<string> {
  const rel = relativePath(rootPath, filePath);
  let digest = '';
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rel));
    digest = Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('');
  } catch {
    digest = encodeURIComponent(rel);
  }
  return `${encodeURIComponent(roomId)}/${digest}`;
}

// Token URL yerine WebSocket alt protokolüyle gider (sunucu günlüklerine/URL'ye düşmez)
export function collabProtocols(token: string): string[] {
  if (!token) return ['nova-sync'];
  const bytes = new TextEncoder().encode(token);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return ['nova-sync', `nova-auth.${b64}`];
}
