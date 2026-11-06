#!/usr/bin/env node
// Stop hook: her Claude turu bitince değişiklikleri commit edip origin'e push eder.
// Güvenlik: gizli dosyalar, build çıktıları (dist/, release/) ve -force HİÇBİR ZAMAN kullanılmaz.
// Gizli dosya bulunursa o turda hiçbir şey commit edilmez, yalnız uyarı verilir.
import { execFileSync } from "node:child_process";

const git = (...a) =>
  execFileSync("git", ["-c", "core.quotepath=off", ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trimEnd();

const EXCLUDE = /^(dist\/|dist-electron\/|release\/|build\/|node_modules\/)/;
const RISKY = /(^|\/)(\.env(\..*)?|.*\.(pem|key|pfx|p12)|id_rsa.*|credentials.*)$/i;

const say = (msg) => process.stdout.write(JSON.stringify({ systemMessage: msg }));

try {
  const entries = git("status", "--porcelain").split("\n").filter(Boolean);
  const paths = entries.map((l) => l.slice(3).replace(/^"|"$/g, ""));
  if (!paths.length) process.exit(0);

  const risky = paths.filter((p) => RISKY.test(p));
  if (risky.length) {
    say(`Auto-commit DURDU: gizli olabilecek dosya var, commit edilmedi: ${risky.join(", ")}`);
    process.exit(0);
  }

  const files = paths.filter((p) => !EXCLUDE.test(p));
  if (!files.length) process.exit(0);

  git("add", "-A", "--", ...files);
  if (!git("diff", "--cached", "--name-only")) process.exit(0);

  const stat = git("diff", "--cached", "--shortstat");
  const list = git("diff", "--cached", "--name-only").split("\n");
  const subject = `chore(auto): save session changes (${list.length} files)`;
  git("commit", "-q", "-m", subject, "-m", list.join("\n"));

  let pushed = true;
  try {
    git("push", "-q", "origin", "HEAD");
  } catch {
    // Uzak değişmişse (ör. CI sürüm commit'i) rebase edip tekrar dener; çakışma olursa durur.
    try {
      git("pull", "-q", "--rebase", "origin", "HEAD");
      git("push", "-q", "origin", "HEAD");
    } catch {
      pushed = false;
      try { git("rebase", "--abort"); } catch { /* rebase yoksa sorun değil */ }
    }
  }

  say(
    pushed
      ? `Otomatik commit + push tamam: ${subject} (${stat.trim()}).`
      : `Commit yapıldı ama push BAŞARISIZ (çakışma olabilir). Elle kontrol et: git status`
  );
} catch (err) {
  say(`Auto-commit hatası: ${String(err.message || err).split("\n")[0]}`);
}
