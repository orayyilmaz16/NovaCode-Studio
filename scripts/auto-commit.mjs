#!/usr/bin/env node
// Stop hook: her Claude turu bitince değişiklikleri commit eder ve origin'e gönderir.
// main korumalı olduğu için (ruleset: PR zorunlu) değişiklikler doğrudan main'e değil,
// `auto/<zaman>` dalına gider; GitHub PR açılır ve CI yeşil olunca auto-merge ile birleşir.
// Güvenlik: gizli dosyalar, build çıktıları (dist/, release/) ve -force HİÇBİR ZAMAN kullanılmaz.
// Gizli dosya bulunursa o turda hiçbir şey commit edilmez, yalnız uyarı verilir.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const git = (...a) =>
  execFileSync("git", ["-c", "core.quotepath=off", ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trimEnd();

// Windows'ta gh, kurulum sonrası PATH'te olmayabilir: bilinen konuma da bak.
const GH_WIN = "C:\\Program Files\\GitHub CLI\\gh.exe";
const GH = process.env.GH_BIN || (existsSync(GH_WIN) ? GH_WIN : "gh");
const gh = (...a) => execFileSync(GH, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

// Yalnız geçici/yerel klasörler hariç tutulur (dist dahil). Gizli dosyalar RISKY ile zaten engellenir.
const EXCLUDE = /^(dist-electron\/|release\/|build\/|node_modules\/)/;
const RISKY = /(^|\/)(\.env(\..*)?|.*\.(pem|key|pfx|p12)|id_rsa.*|credentials.*)$/i;

const say = (msg) => process.stdout.write(JSON.stringify({ systemMessage: msg }));

// Turdan önce yerel main'i uzak ile eşitle (yalnız temizse, ileri sarma)
const syncMain = () => {
  try {
    git("fetch", "-q", "origin", "main");
    if (git("status", "--porcelain")) return;
    git("merge", "--ff-only", "-q", "origin/main");
  } catch { /* senkron edilemezse devam; push aşamasında kontrol edilir */ }
};

try {
  const startBranch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (startBranch === "main") syncMain();

  // Proje beyni: STATE.md'yi koddan yeniden üret; değişiklikler aynı commit'e girer. Hata commit'i engellemez.
  try {
    execFileSync(process.execPath, ["scripts/brain.mjs", "--quiet"], { stdio: "ignore", timeout: 30000 });
  } catch { /* beyin güncellenemezse devam */ }

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

  // main'deyse ayrı bir auto/ dalına taşı; yerel main uzakla eşitlenir.
  let branch = startBranch;
  if (startBranch === "main") {
    const stamp = new Date().toISOString().replace(/\.\d+Z$/, "").replace(/[-:]/g, "").replace("T", "-");
    branch = `auto/${stamp}`;
    git("switch", "-q", "-c", branch);
    git("branch", "-f", "main", "origin/main");
  }

  git("push", "-q", "-u", "origin", branch);

  if (startBranch !== "main") {
    say(`Commit + push tamam (${branch}): ${subject}. PR açılmadı; bu dal main değil.`);
    process.exit(0);
  }

  const stat2 = stat.trim();
  const body = [
    "Otomatik oturum kaydı (Claude Code Stop hook).",
    "",
    `Değişen dosyalar (${list.length}):`,
    ...list.map((f) => `- ${f}`),
    "",
    `Özet: ${stat2}`,
    "",
    "CI (quality) yeşil olunca auto-merge ile birleşir. Çakışma varsa PR açık kalır.",
  ].join("\n");

  let prUrl;
  try {
    prUrl = gh("pr", "create", "--base", "main", "--head", branch, "--title", subject, "--body", body);
  } catch (err) {
    const msg = String(err.stderr || err.message || err).split("\n").find(Boolean) || "bilinmeyen hata";
    say(`Dal ${branch} push edildi ama PR açılamadı: ${msg}. Elle: gh pr create --base main --head ${branch}`);
    process.exit(0);
  }

  let merge = "auto-merge açıldı";
  try {
    gh("pr", "merge", branch, "--auto", "--squash", "--delete-branch");
  } catch (err) {
    merge = "auto-merge açılamadı, PR elle birleştirilmeli";
  }

  let conflict = "";
  try {
    const state = JSON.parse(gh("pr", "view", branch, "--json", "mergeStateStatus")).mergeStateStatus;
    if (state === "DIRTY") conflict = " ÇAKIŞMA VAR: PR'ı elle çöz.";
  } catch { /* durum okunamadı */ }

  say(`PR açıldı: ${prUrl} (${stat2}); ${merge}.${conflict}`);
} catch (err) {
  say(`Auto-commit hatası: ${String(err.message || err).split("\n")[0]}`);
}
