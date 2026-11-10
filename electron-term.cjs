// Entegre terminal (ana süreç): çoklu kabuk oturumları (PowerShell / CMD), kalıcı ve kimlikli.
// PTY değil, stdin/stdout borusu: çoğu komut çalışır; tam ekran programlar ve Ctrl+C kesme desteklenmez.
// Her oturum bir `id` ile tanımlanır; arayüz istediği kadar terminal açabilir (en çok MAX_SESSIONS).
const { app, ipcMain } = require('electron');
const fs = require('fs');
const { execFileSync, spawn } = require('child_process');

const MAX_SESSIONS = 12;
const ID_RE = /^[a-z0-9-]{1,40}$/;
const CWD_MARK = '@@NOVA_CWD@@';

// Her komuttan sonra kabuğa çalışma klasörünü yazdırtırız; bu satırları yakalayıp arayüzde istemde gösteririz.
function cwdProbe(shell) {
  return shell === 'cmd' ? `echo ${CWD_MARK}%CD%\r\n` : `Write-Host "${CWD_MARK}$((Get-Location).Path)"\n`;
}

// Akıştaki işaret satırlarını ayıklar. Tamamlanmamış satır işaretin başlangıcıysa bir sonraki parçaya kadar bekletilir.
// emitCwd(yol): işaret satırı görülünce çağrılır.
function makeCwdFilter(shell, emitCwd) {
  let buf = '';
  // CMD, kodlama değişmeden önce (bozuk karakterli) açılış başlığını basar; ilk işarete kadar çıktıyı at.
  let waitFirstMark = shell === 'cmd';
  return (text) => {
    buf += text;
    const parts = buf.split('\n');
    const tail = parts.pop();
    let out = '';
    for (const line of parts) {
      const clean = line.replace(/\r$/, '');
      const idx = clean.indexOf(CWD_MARK);
      if (idx >= 0) {
        waitFirstMark = false;
        emitCwd(clean.slice(idx + CWD_MARK.length).trim());
        // İşaretten önce gerçek çıktı varsa (satır sonu olmayan program çıktısı) onu koru.
        const before = clean.slice(0, idx).replace(/\x1b\[[0-9;]*m/g, '');
        if (before.trim()) out += clean.slice(0, idx) + '\n';
      } else if (!waitFirstMark) {
        out += clean + '\n';
      }
    }
    if (waitFirstMark) {
      buf = tail.length < 4096 ? tail : '';
      return out;
    }
    const bare = tail.replace(/\x1b\[[0-9;]*m/g, '');
    if (bare && (CWD_MARK.startsWith(bare) || bare.startsWith(CWD_MARK))) {
      buf = tail;
    } else {
      buf = '';
      out += tail;
    }
    return out;
  };
}

let cachedPwsh = null;
function hasPwsh() {
  if (cachedPwsh !== null) return cachedPwsh;
  if (process.platform !== 'win32') return (cachedPwsh = false);
  try {
    execFileSync('where.exe', ['pwsh'], { windowsHide: true, stdio: 'ignore' });
    cachedPwsh = true;
  } catch {
    cachedPwsh = false;
  }
  return cachedPwsh;
}

function register({ getWindow, isValidPath }) {
  const sessions = new Map(); // id -> { proc, cwd, shell }

  const send = (channel, payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send(channel, payload);
  };

  const stop = (id) => {
    const entry = sessions.get(id);
    if (entry) {
      try { entry.proc.kill(); } catch { /* zaten kapalı */ }
      sessions.delete(id);
    }
  };

  ipcMain.handle('term:start', async (_event, shellName, cwd, id) => {
    const shell = shellName === 'cmd' ? 'cmd' : 'powershell';
    if (typeof id !== 'string' || !ID_RE.test(id)) return { success: false, error: 'invalid-id' };
    if (!isValidPath(cwd) || !fs.existsSync(cwd)) {
      return { success: false, error: 'no-folder' };
    }
    const existing = sessions.get(id);
    if (existing && existing.cwd === cwd && existing.proc.exitCode === null) {
      existing.proc.stdin.write(cwdProbe(shell)); // arayüz istemi güncel çalışma klasörünü öğrensin
      return { success: true, shell, reused: true };
    }
    stop(id);
    if (sessions.size >= MAX_SESSIONS) return { success: false, error: 'too-many' };

    const isCmd = shell === 'cmd';
    const command = isCmd ? 'cmd.exe' : process.platform === 'win32' ? (hasPwsh() ? 'pwsh.exe' : 'powershell.exe') : 'bash';
    const args = isCmd ? ['/Q'] : process.platform === 'win32' ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '-'] : [];
    let proc;
    try {
      proc = spawn(command, args, {
        cwd,
        windowsHide: true,
        env: { ...process.env, FORCE_COLOR: '1', CLICOLOR_FORCE: '1', TERM: 'xterm-256color' }
      });
    } catch (err) {
      return { success: false, error: err.message };
    }
    sessions.set(id, { proc, cwd, shell });

    // Türkçe karakterler için çıktı kodlamasını UTF-8'e al (Windows varsayılanı OEM kod sayfası).
    if (isCmd) {
      // chcp: UTF-8; prompt: CMD boru girdisinde bile istem basar, onu görünmez yapıp istemi arayüz çizer.
      proc.stdin.write('chcp 65001 >nul\r\nprompt $E[0m\r\n');
    } else if (process.platform === 'win32') {
      // PowerShell 7.2+ renkli (ANSI) çıktı verir; 5.1'de $PSStyle yoktur, koşul bunu korur.
      proc.stdin.write('[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $OutputEncoding = [System.Text.Encoding]::UTF8; if ($PSStyle) { $PSStyle.OutputRendering = "Ansi" }\n');
    }
    proc.stdin.write(cwdProbe(shell));
    const filter = makeCwdFilter(shell, (dir) => send('term:cwd', { id, shell, cwd: dir }));
    proc.stdout.on('data', (chunk) => {
      const text = filter(chunk.toString('utf8'));
      if (text) send('term:output', { id, shell, text, stream: 'stdout' });
    });
    proc.stderr.on('data', (chunk) => send('term:output', { id, shell, text: chunk.toString('utf8'), stream: 'stderr' }));
    proc.on('error', (err) => send('term:output', { id, shell, text: `\n[shell] ${err.message}\n`, stream: 'stderr' }));
    proc.on('exit', (code) => {
      if (sessions.get(id)?.proc === proc) sessions.delete(id);
      send('term:exit', { id, shell, code });
    });
    return { success: true, shell: command };
  });

  ipcMain.handle('term:input', async (_event, id, line) => {
    const entry = typeof id === 'string' ? sessions.get(id) : undefined;
    if (!entry || typeof line !== 'string' || line.length > 10000) return { success: false, error: 'not-running' };
    if (line.includes('\0')) return { success: false, error: 'invalid-input' };
    entry.proc.stdin.write(line + '\n' + cwdProbe(entry.shell));
    return { success: true };
  });

  ipcMain.handle('term:stop', async (_event, id) => {
    if (typeof id === 'string') stop(id);
    return { success: true };
  });

  app.on('before-quit', () => {
    for (const id of [...sessions.keys()]) stop(id);
  });
}

module.exports = { register, makeCwdFilter, cwdProbe, CWD_MARK, MAX_SESSIONS };
