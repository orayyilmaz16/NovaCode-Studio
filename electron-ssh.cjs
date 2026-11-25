'use strict';
// Uzak çalışma alanı (SSH): bağlantı, sunucu parmak izi onayı, SFTP dosya işlemleri ve uzak kabuk (PTY'ye köprülenir).
// Güvenlik özeti (ayrıntı: docs/brain/actions/remote-ssh.md):
//  • Parola / anahtar parolası yalnız bağlanma anında ana sürece gelir, bellekte tutulur, diske/loga yazılmaz.
//  • Sunucu parmak izi ilk bağlantıda kullanıcıya gösterilip onaylanır; değişirse bağlantı reddedilir (MITM koruması).
//  • Renderer yalnız `ssh://<anaId>/<yol>` sanal yollarını görür; her işlem etkin uzak klasörün içinde (sözcüksel + realpath) denetlenir.
//  • Özel anahtar yolu yalnız ana sürecin açtığı dosya diyaloğundan gelir; anahtar içeriği renderer'a geçmez.
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const core = require('./electron-ssh-core.cjs');

let Client = null;
const loadSsh2 = () => {
  if (Client !== null) return Client;
  try { Client = require('ssh2').Client; } catch { Client = false; }
  return Client;
};

const MAX_CONNS = 4;
const MAX_SHELLS = 8;
const CONNECT_TIMEOUT_MS = 20000;
const HOSTKEY_ANSWER_MS = 90000;
const MAX_OPEN_BYTES = 5 * 1024 * 1024;
const MAX_OPEN_BYTES_HARD = 64 * 1024 * 1024;
const MAX_WRITE_BYTES = 64 * 1024 * 1024;
const TREE_DEPTH = 3;       // uzak ağda gecikme var: yerel taramadan sığ
const TREE_BUDGET = 1500;
const TREE_CONCURRENCY = 6;
const DELETE_MAX_ENTRIES = 20000;

const S_IFMT = 0o170000;
const S_IFDIR = 0o040000;
const S_IFLNK = 0o120000;

function create({ getWindow, userDataDir, ignoredDirs, tmpPrefix, languageFromExt, fromMain, onWorkspaceOpened }) {
  const hosts = core.createHostStore(path.join(userDataDir, 'ssh-hosts.json'));
  const known = core.createKnownHosts(path.join(userDataDir, 'ssh-known-hosts.json'));
  const conns = new Map();            // hostId -> { client, sftp, profile, shells:Map<string,{close}> }
  const connecting = new Set();       // hostId (aynı anda tek bağlanma denemesi)
  const pendingKeys = new Map();      // reqId -> resolve(allow)
  const pickedKeys = new Set();       // diyalogla seçilmiş anahtar yolları
  let active = null;                  // { hostId, root, realRoot }
  const bom = new Set();

  const send = (payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send('ssh:event', payload);
  };

  const publicHost = (h) => ({ id: h.id, name: h.name, host: h.host, port: h.port, user: h.user, auth: h.auth, keyName: h.keyPath ? path.basename(h.keyPath) : '', root: h.root, connected: conns.has(h.id) });

  // ---- sftp yardımcıları (geri çağırma -> söz) ----
  const call = (sftp, method, ...args) => new Promise((resolve, reject) => {
    try {
      sftp[method](...args, (err, res) => (err ? reject(err) : resolve(res)));
    } catch (e) { reject(e); }
  });

  const errCode = (e) => {
    const m = String((e && e.message) || e || '');
    const lvl = e && e.level;
    if (e && e.sshCode) return e.sshCode;
    if (/passphrase/i.test(m)) return 'passphrase';
    if (lvl === 'client-authentication' || /All configured authentication methods failed/i.test(m)) return 'auth-failed';
    if (lvl === 'client-timeout' || /Timed out/i.test(m)) return 'timeout';
    if (e && e.code === 'ENOTFOUND') return 'host-not-found';
    if (e && e.code === 'ECONNREFUSED') return 'refused';
    if (e && (e.code === 'ECONNRESET' || e.code === 'EHOSTUNREACH' || e.code === 'ENETUNREACH')) return 'unreachable';
    return 'connect-failed';
  };

  // ---- sunucu parmak izi doğrulaması ----
  function verifyHostKey(profile) {
    return (key, verify) => {
      const fp = core.fingerprint(key);
      const stored = known.get(profile.host, profile.port);
      if (stored) {
        if (stored === fp) return verify(true);
        send({ type: 'hostkey-changed', host: profile.host, port: profile.port, fingerprint: fp, expected: stored });
        const e = new Error('host-key-changed'); e.sshCode = 'host-key-changed'; pendingFail = e;
        return verify(false);
      }
      const reqId = crypto.randomBytes(8).toString('hex');
      const timer = setTimeout(() => { if (pendingKeys.delete(reqId)) verify(false); }, HOSTKEY_ANSWER_MS);
      pendingKeys.set(reqId, (allow) => {
        clearTimeout(timer);
        if (allow) known.set(profile.host, profile.port, fp);
        else { const e = new Error('host-key-rejected'); e.sshCode = 'host-key-rejected'; pendingFail = e; }
        verify(!!allow);
      });
      send({ type: 'hostkey', reqId, host: profile.host, port: profile.port, fingerprint: fp });
    };
  }
  let pendingFail = null; // hostVerifier ret sebebini bağlantı hatasına taşır

  function readKey(file) {
    const st = fs.statSync(file);
    if (!st.isFile() || st.size > 64 * 1024) throw Object.assign(new Error('bad-key'), { sshCode: 'bad-key' });
    return fs.readFileSync(file);
  }

  function dropConn(id, reason) {
    const c = conns.get(id);
    if (!c) return;
    conns.delete(id);
    for (const sh of [...c.shells.values()]) { try { sh.close(); } catch { /* kapalı */ } }
    c.shells.clear();
    try { c.client.end(); } catch { /* kapalı */ }
    if (active && active.hostId === id) active = null;
    send({ type: 'disconnected', id, reason: reason || 'closed' });
  }

  async function connect(id, secret) {
    const SshClient = loadSsh2();
    if (!SshClient) return { success: false, error: 'no-ssh2' };
    const profile = hosts.get(id);
    if (!profile) return { success: false, error: 'unknown-host' };
    if (conns.has(id)) return { success: true, home: conns.get(id).home };
    if (connecting.has(id)) return { success: false, error: 'busy' };
    if (conns.size >= MAX_CONNS) return { success: false, error: 'too-many' };
    const pw = typeof secret === 'string' && secret.length <= 1024 ? secret : '';
    const cfg = {
      host: profile.host,
      port: profile.port,
      username: profile.user,
      readyTimeout: CONNECT_TIMEOUT_MS,
      keepaliveInterval: 15000,
      keepaliveCountMax: 4,
      hostVerifier: verifyHostKey(profile)
    };
    try {
      if (profile.auth === 'password') {
        if (!pw) return { success: false, error: 'secret-required' };
        cfg.password = pw;
        cfg.tryKeyboard = true;
      } else if (profile.auth === 'key') {
        cfg.privateKey = readKey(profile.keyPath);
        if (pw) cfg.passphrase = pw;
      } else {
        const sock = process.platform === 'win32' ? '\\\\.\\pipe\\openssh-ssh-agent' : process.env.SSH_AUTH_SOCK;
        if (!sock) return { success: false, error: 'no-agent' };
        cfg.agent = sock;
      }
    } catch (e) {
      return { success: false, error: errCode(e) === 'connect-failed' ? 'bad-key' : errCode(e) };
    }
    connecting.add(id);
    pendingFail = null;
    const client = new SshClient();
    try {
      await new Promise((resolve, reject) => {
        client.on('ready', resolve);
        client.on('error', reject);
        if (profile.auth === 'password') {
          // Yalnız tek istemli (parola) klavye-etkileşimli akışa parola verilir; çok adımlı doğrulama (2FA) desteklenmez.
          client.on('keyboard-interactive', (_n, _i, _l, prompts, finish) => finish(prompts.length === 1 ? [pw] : []));
        }
        client.connect(cfg);
      });
      const sftp = await new Promise((resolve, reject) => client.sftp((err, s) => (err ? reject(err) : resolve(s))));
      let home = '/';
      try { home = await call(sftp, 'realpath', '.'); } catch { /* ana dizin okunamadı */ }
      const rec = { client, sftp, profile, home, shells: new Map() };
      conns.set(id, rec);
      client.on('close', () => dropConn(id, 'lost'));
      client.on('error', () => dropConn(id, 'error'));
      return { success: true, home };
    } catch (e) {
      try { client.end(); } catch { /* kapalı */ }
      return { success: false, error: pendingFail ? pendingFail.sshCode : errCode(e) };
    } finally {
      connecting.delete(id);
      pendingFail = null;
    }
  }

  // ---- yol yetkisi ----
  // Etkin uzak klasörün içinde mi (sözcüksel) ve gerçek yol (symlink çözülmüş) hâlâ içinde mi?
  // followLast=false (silme/yeniden adlandırma): son bileşen symlink ise bağın kendisi işlenir, hedefi değil.
  async function authorize(p, { allowRoot = true, followLast = true } = {}) {
    const rp = core.parseRemote(p);
    if (!rp || !active || rp.hostId !== active.hostId) throw Object.assign(new Error('outside'), { sshCode: 'outside' });
    const c = conns.get(rp.hostId);
    if (!c) throw Object.assign(new Error('disconnected'), { sshCode: 'disconnected' });
    if (!core.insideRoot(active.root, rp.path, allowRoot)) throw Object.assign(new Error('outside'), { sshCode: 'outside' });
    let real = null;
    const viaParent = async () => path.posix.join(await call(c.sftp, 'realpath', path.posix.dirname(rp.path)), path.posix.basename(rp.path));
    if (!followLast) { try { real = await viaParent(); } catch { /* üst yok */ } } else try { real = await call(c.sftp, 'realpath', rp.path); } catch {
      try { real = path.posix.join(await call(c.sftp, 'realpath', path.posix.dirname(rp.path)), path.posix.basename(rp.path)); } catch { /* üst de yok */ }
    }
    if (real && !core.insideRoot(active.realRoot, real, allowRoot)) throw Object.assign(new Error('outside'), { sshCode: 'outside' });
    return { c, path: rp.path };
  }

  const fail = (e) => ({ success: false, error: e && e.sshCode ? e.sshCode : String((e && e.message) || e) });
  const isDirAttrs = (a) => a && (a.mode & S_IFMT) === S_IFDIR;

  // ---- ağaç taraması (sınırlı derinlik/bütçe/eşzamanlılık) ----
  async function scan(c, hostId, dir, budget, depth) {
    let list;
    try { list = await call(c.sftp, 'readdir', dir); } catch { return []; }
    const items = [];
    const subs = [];
    for (const e of list) {
      if (budget.left <= 0) break;
      const name = e.filename;
      if (!name || name === '.' || name === '..' || name.includes('/') || name.startsWith(tmpPrefix) || ignoredDirs.has(name)) continue;
      budget.left--;
      const full = dir === '/' ? '/' + name : dir + '/' + name;
      const vp = core.makeRemote(hostId, full);
      let isDir = isDirAttrs(e.attrs);
      if (!isDir && (e.attrs.mode & S_IFMT) === S_IFLNK) {
        try { isDir = isDirAttrs(await call(c.sftp, 'stat', full)); } catch { /* kırık bağ: dosya sayılır */ }
        if (isDir) { items.push({ id: vp, name, path: vp, type: 'folder', isOpen: false, children: [] }); continue; } // bağ içine inilmez (döngü)
      }
      if (isDir) {
        const node = { id: vp, name, path: vp, type: 'folder', isOpen: depth < 1, children: [] };
        items.push(node);
        if (depth < TREE_DEPTH) subs.push(node);
      } else {
        const ext = path.posix.extname(name).toLowerCase().replace('.', '');
        items.push({ id: vp, name, path: vp, type: 'file', language: languageFromExt(ext) });
      }
    }
    let next = 0;
    const worker = async () => { while (next < subs.length) { const n = subs[next++]; n.children = await scan(c, hostId, core.parseRemote(n.path).path, budget, depth + 1); } };
    await Promise.all(Array.from({ length: Math.min(TREE_CONCURRENCY, subs.length) }, worker));
    return items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
  }

  // ---- dosya işlemleri (electron-main fs:* işleyicileri uzak yolda buraya yönlenir) ----
  const fsOps = {
    async readDir(p) {
      try {
        const { c, path: rp } = await authorize(p);
        return await scan(c, active.hostId, rp, { left: TREE_BUDGET }, 0);
      } catch { return []; }
    },
    // -> içerik | { success:false, error }
    async readFile(p, opts) {
      const { c, path: rp } = await authorize(p);
      const max = Math.min(MAX_OPEN_BYTES_HARD, Math.max(1024, opts && Number.isFinite(opts.maxBytes) ? opts.maxBytes : MAX_OPEN_BYTES));
      const st = await call(c.sftp, 'stat', rp);
      if ((st.mode & S_IFMT) === S_IFDIR) throw new Error('Bu bir dosya değil.');
      if (st.size > max) return { success: false, error: 'file-too-large', size: st.size };
      const buf = await call(c.sftp, 'readFile', rp);
      const n = Math.min(buf.length, 8000);
      for (let i = 0; i < n; i++) if (buf[i] === 0) return { success: false, error: 'binary-file', size: buf.length };
      const hasBom = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
      if (hasBom) bom.add(p); else bom.delete(p);
      return buf.toString('utf8', hasBom ? 3 : 0);
    },
    async writeFile(p, content) {
      try {
        if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_WRITE_BYTES) return { success: false, error: 'outside' };
        const { c, path: rp } = await authorize(p);
        const data = Buffer.from(bom.has(p) && content.charCodeAt(0) !== 0xFEFF ? '﻿' + content : content, 'utf8');
        let mode;
        try { mode = (await call(c.sftp, 'stat', rp)).mode & 0o777; } catch { /* yeni dosya */ }
        const opts = mode === undefined ? {} : { mode };
        // Atomik: aynı klasörde geçici dosyaya yaz, OpenSSH posix-rename ile değiştir; desteklenmiyorsa doğrudan yaz.
        const tmp = path.posix.join(path.posix.dirname(rp), `${tmpPrefix}${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`);
        let done = false;
        if (typeof c.sftp.ext_openssh_rename === 'function') {
          try {
            await call(c.sftp, 'writeFile', tmp, data, opts);
            await call(c.sftp, 'ext_openssh_rename', tmp, rp);
            done = true;
          } catch { try { await call(c.sftp, 'unlink', tmp); } catch { /* yok */ } }
        }
        if (!done) await call(c.sftp, 'writeFile', rp, data, opts);
        return { success: true };
      } catch (e) { return fail(e); }
    },
    async createFile(p) {
      try {
        const { c, path: rp } = await authorize(p, { allowRoot: false });
        try { await call(c.sftp, 'stat', rp); return { success: true }; } catch { /* yok: oluştur */ }
        await call(c.sftp, 'writeFile', rp, Buffer.alloc(0), { flag: 'wx' });
        return { success: true };
      } catch (e) { return fail(e); }
    },
    async createFolder(p) {
      try {
        const { c, path: rp } = await authorize(p, { allowRoot: false });
        // mkdir -p: üstten alta, olanları atla
        const rel = path.posix.relative(active.root, rp).split('/').filter(Boolean);
        let cur = active.root;
        for (const part of rel) {
          cur = path.posix.join(cur, part);
          try { await call(c.sftp, 'stat', cur); } catch { await call(c.sftp, 'mkdir', cur); }
        }
        return { success: true };
      } catch (e) { return fail(e); }
    },
    async deleteItem(p, opts) {
      try {
        const { c, path: rp } = await authorize(p, { allowRoot: false, followLast: false });
        // Uzak sunucuda çöp kutusu yok: arayüz kalıcı silme için onay alır (trashFailed), sonra permanent:true gelir.
        if (!(opts && opts.permanent === true)) return { success: false, trashFailed: true, error: 'no-trash-remote' };
        const budget = { left: DELETE_MAX_ENTRIES };
        const rm = async (target) => {
          if (budget.left-- <= 0) throw Object.assign(new Error('too-many'), { sshCode: 'too-many' });
          const st = await call(c.sftp, 'lstat', target);
          if ((st.mode & S_IFMT) === S_IFDIR) {
            for (const e of await call(c.sftp, 'readdir', target)) if (e.filename !== '.' && e.filename !== '..') await rm(target + '/' + e.filename);
            await call(c.sftp, 'rmdir', target);
          } else await call(c.sftp, 'unlink', target);
        };
        await rm(rp);
        return { success: true, trashed: false };
      } catch (e) { return fail(e); }
    },
    async renameItem(a, b) {
      try {
        const x = await authorize(a, { allowRoot: false, followLast: false });
        const y = await authorize(b, { allowRoot: false, followLast: false });
        if (y.path.startsWith(x.path + '/')) return { success: false, error: 'Klasör kendi içine taşınamaz.' };
        const same = x.path.toLowerCase() === y.path.toLowerCase() && x.path !== y.path;
        if (!same) { try { await call(x.c.sftp, 'stat', y.path); return { success: false, error: 'Aynı adlı bir öğe zaten var.' }; } catch { /* yok: sorun değil */ } }
        await call(x.c.sftp, 'rename', x.path, y.path);
        return { success: true };
      } catch (e) { return fail(e); }
    }
  };

  // ---- uzak kabuk: electron-pty.cjs oturumuna köprü ----
  // Dönüş: { success, handle:{ write, resize, kill } } | { success:false, error }
  async function openShell(hostId, { cols, rows, cwd }, onData, onClose) {
    const c = conns.get(hostId);
    if (!c || !active || active.hostId !== hostId) return { success: false, error: 'disconnected' };
    if (c.shells.size >= MAX_SHELLS) return { success: false, error: 'too-many' };
    let startDir = active.root;
    if (cwd) {
      const rp = core.parseRemote(cwd);
      if (!rp || rp.hostId !== hostId || !core.insideRoot(active.root, rp.path, true)) return { success: false, error: 'no-folder' };
      startDir = rp.path;
    }
    return await new Promise((resolve) => {
      c.client.shell({ term: 'xterm-256color', cols, rows }, (err, stream) => {
        if (err) return resolve({ success: false, error: 'shell-failed' });
        const key = crypto.randomBytes(6).toString('hex');
        let closed = false;
        const finish = (code) => { if (closed) return; closed = true; c.shells.delete(key); onClose(code); };
        c.shells.set(key, { close: () => { try { stream.close(); } catch { /* kapalı */ } finish(0); } });
        stream.on('data', (d) => onData(d.toString('utf8')));
        stream.stderr.on('data', (d) => onData(d.toString('utf8')));
        stream.on('close', (code) => finish(typeof code === 'number' ? code : 0));
        stream.write(` cd -- ${core.shellQuote(startDir)}\n`); // baştaki boşluk: bash geçmişine girmez (HISTCONTROL=ignorespace)
        resolve({
          success: true,
          handle: {
            write: (data) => { stream.write(data); },
            resize: (cc, rr) => { try { stream.setWindow(rr, cc, 0, 0); } catch { /* kapalı */ } },
            kill: () => { try { stream.close(); } catch { /* kapalı */ } finish(0); }
          }
        });
      });
    });
  }

  // ---- çalışma alanı ----
  async function openWorkspace(id, remotePath) {
    const c = conns.get(id);
    if (!c) return { error: 'disconnected' };
    const rp = core.cleanPosix(remotePath || c.profile.root || c.home);
    if (!rp) return { error: 'bad-path' };
    let real;
    try {
      real = await call(c.sftp, 'realpath', rp);
      if (!isDirAttrs(await call(c.sftp, 'stat', real))) return { error: 'not-a-folder' };
    } catch { return { error: 'no-folder' }; }
    active = { hostId: id, root: rp, realRoot: real };
    if (typeof onWorkspaceOpened === 'function') onWorkspaceOpened(); // yerel izleyici durur, yerel çalışma klasörü boşalır
    const rootPath = core.makeRemote(id, rp);
    return {
      rootPath,
      rootName: rp === '/' ? '/' : path.posix.basename(rp),
      remote: { hostId: id, name: c.profile.name },
      trusted: true, // uzak dosyalar yerelde çalıştırılmaz (git kancası/LSP yerelde başlamaz); komutları yalnız kullanıcının uzak terminali çalıştırır
      tree: await scan(c, id, rp, { left: TREE_BUDGET }, 0)
    };
  }

  function disconnectAll() { for (const id of [...conns.keys()]) dropConn(id, 'closed'); }
  function leaveWorkspace() { if (active) dropConn(active.hostId, 'closed'); }

  // ---- IPC ----
  // Yalnız ana pencereden gelen çağrılar; hata ayrıntısı sızmaz (yalnız kod). Kanallar doğrudan ipcMain.handle ile kaydedilir (beyin denetimi bu kalıbı tarar).
  const guarded = (fn) => async (e, ...args) => {
    if (!fromMain(e)) return { success: false, error: 'forbidden' };
    try { return await fn(...args); } catch (err) { return { success: false, error: errCode(err) }; }
  };

  function register() {
    ipcMain.handle('ssh:status', guarded(() => ({ available: !!loadSsh2(), hosts: hosts.list().map(publicHost), active: active ? { hostId: active.hostId, root: core.makeRemote(active.hostId, active.root) } : null })));
    ipcMain.handle('ssh:hostSave', guarded((raw) => {
      const existing = raw && typeof raw.id === 'string' ? hosts.get(raw.id) : null;
      const keyPath = raw && typeof raw.keyPath === 'string' && raw.keyPath ? raw.keyPath : existing ? existing.keyPath : ''; // düzenlemede anahtar yeniden seçilmediyse eskisi korunur
      const p = core.cleanProfile({ ...raw, keyPath, id: existing ? existing.id : core.newId() }, existing ? existing.id : undefined);
      if (!p) return { success: false, error: 'invalid-host' };
      if (p.auth === 'key' && !pickedKeys.has(p.keyPath) && !(existing && existing.keyPath === p.keyPath)) return { success: false, error: 'key-not-picked' };
      if (existing && conns.has(existing.id) && (existing.host !== p.host || existing.port !== p.port || existing.user !== p.user)) dropConn(existing.id, 'closed');
      if (!hosts.upsert(p)) return { success: false, error: 'too-many' };
      return { success: true, host: publicHost(p) };
    }));
    ipcMain.handle('ssh:hostRemove', guarded((id) => {
      if (typeof id !== 'string') return { success: false };
      dropConn(id, 'closed');
      hosts.remove(id);
      return { success: true };
    }));
    ipcMain.handle('ssh:pickKey', guarded(async () => {
      const w = getWindow();
      const r = await dialog.showOpenDialog(w || undefined, { title: 'SSH', defaultPath: path.join(os.homedir(), '.ssh'), properties: ['openFile', 'showHiddenFiles'] });
      if (r.canceled || !r.filePaths[0]) return { success: false, error: 'cancelled' };
      pickedKeys.add(r.filePaths[0]);
      return { success: true, path: r.filePaths[0], name: path.basename(r.filePaths[0]) };
    }));
    ipcMain.handle('ssh:connect', guarded((id, secret) => (typeof id === 'string' ? connect(id, secret) : { success: false, error: 'unknown-host' })));
    ipcMain.handle('ssh:hostKeyAnswer', guarded((reqId, allow) => {
      const fn = typeof reqId === 'string' ? pendingKeys.get(reqId) : null;
      if (!fn) return { success: false };
      pendingKeys.delete(reqId);
      fn(allow === true);
      return { success: true };
    }));
    ipcMain.handle('ssh:forgetHostKey', guarded((id) => {
      const p = typeof id === 'string' ? hosts.get(id) : null;
      if (!p) return { success: false };
      known.remove(p.host, p.port);
      return { success: true };
    }));
    ipcMain.handle('ssh:disconnect', guarded((id) => { if (typeof id === 'string') dropConn(id, 'closed'); return { success: true }; }));
    // Klasör seçici: yalnız bağlı ana bilgisayarda, yalnız alt klasör adları (dosya içeriği/adı gitmez)
    ipcMain.handle('ssh:browse', guarded(async (id, dir) => {
      const c = typeof id === 'string' ? conns.get(id) : null;
      if (!c) return { success: false, error: 'disconnected' };
      const rp = core.cleanPosix(dir || c.home);
      if (!rp) return { success: false, error: 'bad-path' };
      const list = await call(c.sftp, 'readdir', rp);
      const dirs = [];
      for (const e of list) {
        if (e.filename === '.' || e.filename === '..' || e.filename.includes('/')) continue;
        if (isDirAttrs(e.attrs)) dirs.push(e.filename);
        else if ((e.attrs.mode & S_IFMT) === S_IFLNK) { try { if (isDirAttrs(await call(c.sftp, 'stat', rp === '/' ? '/' + e.filename : rp + '/' + e.filename))) dirs.push(e.filename); } catch { /* kırık bağ */ } }
        if (dirs.length >= 500) break;
      }
      dirs.sort((a, b) => a.localeCompare(b));
      return { success: true, path: rp, parent: rp === '/' ? null : path.posix.dirname(rp), dirs };
    }));
    ipcMain.handle('ssh:open', guarded((id, dir) => (typeof id === 'string' ? openWorkspace(id, typeof dir === 'string' ? dir : '') : { error: 'unknown-host' })));
    ipcMain.handle('ssh:close', guarded(() => { leaveWorkspace(); return { success: true }; }));
  }

  return {
    register,
    isRemote: core.isRemote,
    fs: fsOps,
    openShell,
    sshProfiles: () => [...conns.values()].map((c) => ({ id: 'ssh:' + c.profile.id, label: 'SSH: ' + c.profile.name })),
    activeHostId: () => (active ? active.hostId : null),
    leaveWorkspace,
    disconnectAll
  };
}

module.exports = { create };
