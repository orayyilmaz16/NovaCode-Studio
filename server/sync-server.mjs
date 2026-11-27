#!/usr/bin/env node
// NovaCode Studio gerçek zamanlı senkron sunucusu (Yjs protokolü, açık kaynak, kendi sunucunda çalışır).
// Kullanım:
//   NOVA_SYNC_TOKEN=<uzun-rastgele-token> PORT=1234 node server/sync-server.mjs
// Token zorunludur: istemci WebSocket alt protokolüyle gönderir (Sec-WebSocket-Protocol: nova-sync, nova-auth.<base64url(token)>);
// token URL'de taşınmaz, günlüğe yazılmaz. Eski istemciler için ?token= yalnız NOVA_SYNC_ALLOW_QUERY_TOKEN=1 ile kabul edilir.
// Token'sız açmak için NOVA_SYNC_ALLOW_ANON=1 gerekir (yalnız yerel test).
// Ek ayarlar (hepsi isteğe bağlı): NOVA_SYNC_ALLOWED_ORIGINS (virgülle ayrılmış Origin listesi; varsayılan: Origin'siz, file/null ve localhost),
// NOVA_SYNC_MAX_CONNS, NOVA_SYNC_MAX_CONNS_PER_IP, NOVA_SYNC_MAX_ROOMS, NOVA_SYNC_ROOM_TTL_MS, NOVA_SYNC_TRUST_PROXY=1 (X-Forwarded-For).
// İzleme: GET /metrics (Prometheus metni; Authorization: Bearer <token>), `server/deploy/status.sh` özetler. Veri yalnızca bellektedir; son bağlantı kapandıktan sonra oda silinir, istemciler dosya içeriğini yeniden gönderir.
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const PORT = Number(process.env.PORT || 1234);
const TOKEN = process.env.NOVA_SYNC_TOKEN || '';
const ALLOW_ANON = process.env.NOVA_SYNC_ALLOW_ANON === '1';
const MAX_ROOM_NAME = 512;
const MAX_MESSAGE_BYTES = 5 * 1024 * 1024;
const intEnv = (k, d) => { const n = Number(process.env[k]); return Number.isFinite(n) && n > 0 ? Math.floor(n) : d; };
const MAX_CONNS = intEnv('NOVA_SYNC_MAX_CONNS', 200);
const MAX_CONNS_PER_IP = intEnv('NOVA_SYNC_MAX_CONNS_PER_IP', 20);
const MAX_ROOMS = intEnv('NOVA_SYNC_MAX_ROOMS', 500);
const ROOM_TTL_MS = intEnv('NOVA_SYNC_ROOM_TTL_MS', 60_000);
const FAIL_LIMIT = 10; // pencere içinde izin verilen başarısız deneme
const FAIL_WINDOW_MS = 60_000;
const BLOCK_MS = 5 * 60_000;
const ALLOW_QUERY_TOKEN = process.env.NOVA_SYNC_ALLOW_QUERY_TOKEN === '1';
const TRUST_PROXY = process.env.NOVA_SYNC_TRUST_PROXY === '1';
const ALLOWED_ORIGINS = (process.env.NOVA_SYNC_ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
const PROTOCOL = 'nova-sync';
const AUTH_PREFIX = 'nova-auth.';

if (!TOKEN && !ALLOW_ANON) {
  console.error('NOVA_SYNC_TOKEN tanımlı değil. Güvenlik için sunucu başlatılmadı.');
  process.exit(1);
}

// Beklenmeyen hata süreci düşürmesin; ayrıntı (token/içerik) yazılmaz.
process.on('uncaughtException', (e) => { stats.errors += 1; console.error('uncaughtException:', e && e.name); });
process.on('unhandledRejection', (e) => { stats.errors += 1; console.error('unhandledRejection:', e && e.name); });

// Metrikler (yalnız sayaç/ölçü: IP, oda adı, token, içerik YOK). GET /metrics, Authorization: Bearer <token> ister.
const startedAt = Date.now();
const stats = { connectionsTotal: 0, messagesTotal: 0, bytesIn: 0, errors: 0,
  rejects: { auth: 0, origin: 0, blocked: 0, limit: 0, badRequest: 0 } };

const messageSync = 0;
const messageAwareness = 1;
const docs = new Map();

function tokenOk(provided) {
  if (!TOKEN) return ALLOW_ANON;
  const a = Buffer.from(provided || '');
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

function originOk(origin) {
  if (ALLOWED_ORIGINS.length) return !origin || ALLOWED_ORIGINS.includes(origin);
  if (!origin || origin === 'null' || origin.startsWith('file://')) return true;
  try {
    const h = new URL(origin).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  } catch { return false; }
}

function clientIp(req) {
  if (TRUST_PROXY) {
    const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (xf) return xf;
  }
  return req.socket.remoteAddress || 'unknown';
}

// IP başına başarısız deneme sınırı (bellek içi, kayan pencere)
const failures = new Map(); // ip -> { count, first, blockedUntil }
function isBlocked(ip) {
  const f = failures.get(ip);
  return !!f && f.blockedUntil > Date.now();
}
function recordFailure(ip) {
  const now = Date.now();
  let f = failures.get(ip);
  if (!f || (now - f.first > FAIL_WINDOW_MS && f.blockedUntil < now)) f = { count: 0, first: now, blockedUntil: 0 };
  f.count += 1;
  if (f.count >= FAIL_LIMIT) f.blockedUntil = now + BLOCK_MS;
  failures.set(ip, f);
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, f] of failures) if (f.blockedUntil < now && now - f.first > FAIL_WINDOW_MS) failures.delete(ip);
}, 60_000).unref();

const connsPerIp = new Map();
let totalConns = 0;

function extractToken(req, url) {
  const protos = String(req.headers['sec-websocket-protocol'] || '').split(',').map((p) => p.trim());
  for (const p of protos) {
    if (p.startsWith(AUTH_PREFIX)) {
      try { return Buffer.from(p.slice(AUTH_PREFIX.length), 'base64url').toString('utf8'); } catch { return ''; }
    }
  }
  return ALLOW_QUERY_TOKEN ? url.searchParams.get('token') : '';
}

function reject(socket, status) {
  try { socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`); } catch { /* soket kapalı */ }
  socket.destroy();
}

function closeConn(doc, conn, code) {
  const controlled = doc.conns.get(conn);
  if (controlled) {
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlled), null);
    scheduleRoomCleanup(doc);
  }
  try { if (code) conn.close(code); else conn.close(); } catch (e) { /* zaten kapalı */ }
}

// Son bağlantı kapanınca oda kısa bir süre sonra bellekten silinir (bellek tüketimi sınırı)
function scheduleRoomCleanup(doc) {
  if (doc.conns.size > 0 || doc.cleanupTimer) return;
  doc.cleanupTimer = setTimeout(() => {
    doc.cleanupTimer = null;
    if (doc.conns.size === 0 && docs.get(doc.name) === doc) {
      docs.delete(doc.name);
      doc.awareness.destroy();
      doc.destroy();
    }
  }, ROOM_TTL_MS);
  doc.cleanupTimer.unref();
}

function send(doc, conn, data) {
  if (conn.readyState !== 1) return closeConn(doc, conn);
  try {
    conn.send(data, (err) => { if (err) closeConn(doc, conn); });
  } catch (e) {
    closeConn(doc, conn);
  }
}

function broadcast(doc, data) {
  doc.conns.forEach((_, conn) => send(doc, conn, data));
}

function getDoc(name) {
  let doc = docs.get(name);
  if (doc) {
    if (doc.cleanupTimer) { clearTimeout(doc.cleanupTimer); doc.cleanupTimer = null; }
    return doc;
  }
  if (docs.size >= MAX_ROOMS) return null;
  doc = new Y.Doc();
  doc.name = name;
  doc.conns = new Map();
  doc.cleanupTimer = null;
  doc.awareness = new awarenessProtocol.Awareness(doc);
  doc.awareness.setLocalState(null);

  doc.awareness.on('update', ({ added, updated, removed }, conn) => {
    const changed = added.concat(updated, removed);
    if (conn !== null) {
      const controlled = doc.conns.get(conn);
      if (controlled) added.concat(updated).forEach((id) => controlled.add(id));
    }
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, messageAwareness);
    encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changed));
    broadcast(doc, encoding.toUint8Array(enc));
  });

  doc.on('update', (update) => {
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, messageSync);
    syncProtocol.writeUpdate(enc, update);
    broadcast(doc, encoding.toUint8Array(enc));
  });

  docs.set(name, doc);
  return doc;
}

function handleMessage(conn, doc, message) {
  const decoder = decoding.createDecoder(message);
  const type = decoding.readVarUint(decoder);
  if (type === messageSync) {
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, messageSync);
    syncProtocol.readSyncMessage(decoder, enc, doc, conn);
    if (encoding.length(enc) > 1) send(doc, conn, encoding.toUint8Array(enc));
  } else if (type === messageAwareness) {
    awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn);
  }
}

function metricsText() {
  const m = process.memoryUsage();
  const blockedIps = [...failures.values()].filter((f) => f.blockedUntil > Date.now()).length;
  const lines = [
    ['nova_sync_up', 'gauge', 1],
    ['nova_sync_uptime_seconds', 'gauge', Math.floor((Date.now() - startedAt) / 1000)],
    ['nova_sync_connections', 'gauge', totalConns],
    ['nova_sync_connections_max', 'gauge', MAX_CONNS],
    ['nova_sync_rooms', 'gauge', docs.size],
    ['nova_sync_rooms_max', 'gauge', MAX_ROOMS],
    ['nova_sync_blocked_ips', 'gauge', blockedIps],
    ['nova_sync_connections_total', 'counter', stats.connectionsTotal],
    ['nova_sync_messages_total', 'counter', stats.messagesTotal],
    ['nova_sync_received_bytes_total', 'counter', stats.bytesIn],
    ['nova_sync_errors_total', 'counter', stats.errors],
    ['nova_sync_memory_rss_bytes', 'gauge', m.rss],
    ['nova_sync_memory_heap_used_bytes', 'gauge', m.heapUsed],
  ].map(([n, t, v]) => `# TYPE ${n} ${t}\n${n} ${v}`);
  lines.push('# TYPE nova_sync_rejected_total counter');
  for (const [reason, v] of Object.entries(stats.rejects)) lines.push(`nova_sync_rejected_total{reason="${reason}"} ${v}`);
  return lines.join('\n') + '\n';
}

const server = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];
  if (path === '/metrics') {
    // Yalnız token'la (sayaçlar bile herkese açık değil); önbelleğe alınmaz
    const h = String(req.headers.authorization || '');
    const given = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!TOKEN || !tokenOk(given)) { res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end('unauthorized'); }
    res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(metricsText());
  }
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('NovaCode sync server');
});
server.on('clientError', (_err, socket) => {
  try { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); } catch { socket.destroy(); }
});

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: MAX_MESSAGE_BYTES,
  // Token alt protokolü yanıtta geri yansıtılmaz; yalnız sabit protokol seçilir
  handleProtocols: (protocols) => (protocols.has(PROTOCOL) ? PROTOCOL : false)
});

server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => socket.destroy());
  try {
    const ip = clientIp(req);
    if (isBlocked(ip)) { stats.rejects.blocked += 1; return reject(socket, '429 Too Many Requests'); }
    if (!originOk(req.headers.origin)) { stats.rejects.origin += 1; return reject(socket, '403 Forbidden'); }
    const url = new URL(req.url || '/', 'http://localhost');
    if (!tokenOk(extractToken(req, url))) {
      recordFailure(ip);
      stats.rejects.auth += 1;
      return reject(socket, '401 Unauthorized');
    }
    let room;
    try { room = decodeURIComponent(url.pathname.slice(1)); } catch { stats.rejects.badRequest += 1; return reject(socket, '400 Bad Request'); }
    // eslint-disable-next-line no-control-regex
    if (!room || room.length > MAX_ROOM_NAME || /[\u0000-\u001f]/.test(room)) { stats.rejects.badRequest += 1; return reject(socket, '400 Bad Request'); }
    if (totalConns >= MAX_CONNS || (connsPerIp.get(ip) || 0) >= MAX_CONNS_PER_IP) { stats.rejects.limit += 1; return reject(socket, '503 Service Unavailable'); }
    if (!docs.has(room) && docs.size >= MAX_ROOMS) { stats.rejects.limit += 1; return reject(socket, '503 Service Unavailable'); }

    wss.handleUpgrade(req, socket, head, (conn) => {
      const doc = getDoc(room);
      if (!doc) return conn.close(1013);
      totalConns += 1;
      stats.connectionsTotal += 1;
      connsPerIp.set(ip, (connsPerIp.get(ip) || 0) + 1);
      conn.binaryType = 'arraybuffer';
      doc.conns.set(conn, new Set());
      conn.on('error', () => closeConn(doc, conn));
      conn.on('message', (msg) => {
        stats.messagesTotal += 1;
        stats.bytesIn += msg.byteLength || msg.length || 0;
        try {
          handleMessage(conn, doc, new Uint8Array(msg));
        } catch (e) {
          stats.errors += 1;
          closeConn(doc, conn, 1003); // bozuk Yjs/awareness mesajı süreci düşürmez
        }
      });
      conn.on('close', () => {
        totalConns = Math.max(0, totalConns - 1);
        const n = (connsPerIp.get(ip) || 1) - 1;
        if (n <= 0) connsPerIp.delete(ip); else connsPerIp.set(ip, n);
        closeConn(doc, conn);
      });

      // İlk senkron: istemcinin durumunu iste
      const enc = encoding.createEncoder();
      encoding.writeVarUint(enc, messageSync);
      syncProtocol.writeSyncStep1(enc, doc);
      send(doc, conn, encoding.toUint8Array(enc));

      if (doc.awareness.getStates().size > 0) {
        const aw = encoding.createEncoder();
        encoding.writeVarUint(aw, messageAwareness);
        encoding.writeVarUint8Array(aw, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(doc.awareness.getStates().keys())));
        send(doc, conn, encoding.toUint8Array(aw));
      }
    });
  } catch (e) {
    stats.errors += 1;
    stats.rejects.badRequest += 1;
    reject(socket, '400 Bad Request');
  }
});

server.listen(PORT, () => {
  console.log(`NovaCode sync server dinliyor: ws://localhost:${PORT}/<oda-kimliği>${TOKEN ? ' (token korumalı)' : ' (ANONİM — yalnız yerel test)'}`);
});
