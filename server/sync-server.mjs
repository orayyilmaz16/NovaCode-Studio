#!/usr/bin/env node
// NovaCode Studio gerçek zamanlı senkron sunucusu (Yjs protokolü, açık kaynak, kendi sunucunda çalışır).
// Kullanım:
//   NOVA_SYNC_TOKEN=<uzun-rastgele-token> PORT=1234 node server/sync-server.mjs
// Token zorunludur: istemci ?token=... ile bağlanır. Token'sız açmak için NOVA_SYNC_ALLOW_ANON=1 gerekir (yalnız yerel test).
// Veri yalnızca bellektedir; sunucu yeniden başlarsa istemciler dosya içeriğini yeniden gönderir.
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

if (!TOKEN && !ALLOW_ANON) {
  console.error('NOVA_SYNC_TOKEN tanımlı değil. Güvenlik için sunucu başlatılmadı.');
  process.exit(1);
}

const messageSync = 0;
const messageAwareness = 1;
const docs = new Map();

function tokenOk(provided) {
  if (!TOKEN) return ALLOW_ANON;
  const a = Buffer.from(provided || '');
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

function closeConn(doc, conn) {
  const controlled = doc.conns.get(conn);
  if (controlled) {
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlled), null);
  }
  try { conn.close(); } catch (e) { /* zaten kapalı */ }
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
  if (doc) return doc;
  doc = new Y.Doc();
  doc.name = name;
  doc.conns = new Map();
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

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('NovaCode sync server');
});

const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const room = decodeURIComponent(url.pathname.slice(1));
  if (!room || room.length > MAX_ROOM_NAME || !tokenOk(url.searchParams.get('token'))) {
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (conn) => {
    const doc = getDoc(room);
    conn.binaryType = 'arraybuffer';
    doc.conns.set(conn, new Set());
    conn.on('message', (msg) => handleMessage(conn, doc, new Uint8Array(msg)));
    conn.on('close', () => closeConn(doc, conn));

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
});

server.listen(PORT, () => {
  console.log(`NovaCode sync server dinliyor: ws://localhost:${PORT}/<oda-adı>${TOKEN ? ' (token korumalı)' : ' (ANONİM — yalnız yerel test)'}`);
});
