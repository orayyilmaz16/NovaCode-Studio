#!/usr/bin/env node
// Stop hook: her Claude turu bitince OTONOM git akışı — senkronla, commit et, push et, PR aç/koru, auto-merge aç.
// main korumalı (ruleset: PR zorunlu): değişiklikler `auto/<zaman>` dalına gider; PR açılır, CI yeşil olunca auto-merge ile birleşir,
// CI'ın sürüm işi etiket + release'i üretir (bkz. docs/brain/actions/release.md ve ci-cd.md).
//
// Davranış:
//  - main'deyse: değişiklikleri yeni auto/ dalına taşır, push + PR.
//  - auto/ dalındaysa: aynı dalda devam eder (push + PR yoksa aç). PR zaten birleşmişse ve yeni commit yoksa main'e döner.
//  - Uzak main ilerlediyse (ör. release commit'i) auto/ dalına birleştirilir; çakışmada birleştirme geri alınır ve rapor edilir.
//  - Her turda sürüm denetimi (scripts/check-version.mjs) ve yerel kalite kapısı (tsc + beyin) çalışır; sonuç PR gövdesine yazılır.
// Güvenlik: gizli dosyalar, build çıktıları (release/, build/) ve -force HİÇBİR ZAMAN kullanılmaz.
// Gizli dosya bulunursa o turda hiçbir şey commit edilmez, yalnız uyarı verilir.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trimEnd();
const git = (...a) => run("git", ["-c", "core.quotepath=off", ...a]);

// Windows'ta gh, kurulum sonrası PATH'te olmayabilir: bilinen konuma da bak.
const GH_WIN = "C:\\Program Files\\GitHub CLI\\gh.exe";
const GH = process.env.GH_BIN || (existsSync(GH_WIN) ? GH_WIN : "gh");
const gh = (...a) => run(GH, a).trim();
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const tryGh = (...a) => { try { return gh(...a); } catch { return null; } };

const EXCLUDE = /^(dist-electron\/|release\/|build\/|node_modules\/)/;
const RISKY = /(^|\/)(\.env(\..*)?|.*\.(pem|key|pfx|p12)|id_rsa.*|credentials.*)$/i;

const DRY = process.env.NOVA_AUTO_DRY === "1"; // kuru çalıştırma: karar verir ama hiçbir şeyi değiştirmez (test için)
const notes = [];
const dry = (label) => { if (DRY) notes.push(`[kuru] ${label}`); return DRY; };
const say = (msg) => process.stdout.write(JSON.stringify({ systemMessage: [msg, ...notes].filter(Boolean).join(" | ") }));
const err1 = (e) => String(e.stderr || e.message || e).split("\n").find(Boolean) || "bilinmeyen hata";

// ---------- Kalite kapısı + sürüm (bilgilendirici: push'u engellemez, CI zaten engeller) ----------
function gates() {
  const out = [];
  let versionLine = "";
  try {
    versionLine = run(process.execPath, ["scripts/check-version.mjs", "--quiet"], { timeout: 20000 });
  } catch (e) {
    versionLine = String(e.stdout || "").trim() || "sürüm denetimi başarısız";
    out.push("SÜRÜM HATASI");
  }
  const tsc = "node_modules/typescript/bin/tsc";
  if (existsSync(tsc)) {
    try { run(process.execPath, [tsc, "--noEmit"], { timeout: 70000 }); out.push("tip ✓"); } catch { out.push("tip ✗ (CI engeller)"); }
  }
  try { run(process.execPath, ["scripts/brain.mjs", "--check"], { timeout: 30000 }); out.push("beyin ✓"); } catch { out.push("beyin ✗"); }
  return { line: `${versionLine} · ${out.join(", ")}`, ok: !out.some((x) => x.includes("✗") || x.includes("HATA")) };
}

// ---------- PR ----------
function latestPr(branch) {
  const j = tryGh("pr", "list", "--head", branch, "--state", "all", "--limit", "1", "--json", "number,state,url,mergedAt");
  try { return JSON.parse(j || "[]")[0] || null; } catch { return null; }
}

function ensurePr(branch, title, body) {
  const open = (() => { try { return JSON.parse(tryGh("pr", "list", "--head", branch, "--state", "open", "--json", "number,url") || "[]")[0]; } catch { return null; } })();
  let url = open && open.url;
  if (dry(`PR ${url ? "zaten açık: " + url : "açılacak"}; auto-merge açılacak`)) return url;
  if (!url) {
    try { url = gh("pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body); }
    catch (e) { notes.push(`PR açılamadı: ${err1(e)}. Elle: gh pr create --base main --head ${branch}`); return null; }
  }
  let merge = "auto-merge açık";
  try { gh("pr", "merge", branch, "--auto", "--squash", "--delete-branch"); }
  catch { merge = "auto-merge açılamadı (PR elle birleştirilmeli)"; }
  let conflict = "";
  try { if (JSON.parse(gh("pr", "view", branch, "--json", "mergeStateStatus")).mergeStateStatus === "DIRTY") conflict = " ÇAKIŞMA VAR: PR'ı elle çöz."; } catch { /* durum okunamadı */ }
  notes.push(`PR: ${url} (${merge})${conflict}`);
  return url;
}

// ---------- Senkron ----------
function syncMainFastForward() {
  try { if (!git("status", "--porcelain")) git("merge", "--ff-only", "-q", "origin/main"); } catch { /* ileri sarılamadı */ }
}

// auto/ dalına uzak main'i birleştir (squash-merge sonrası release commit'i vb.). Çakışmada geri al.
function mergeMainInto(branch) {
  const behind = Number(tryGit("rev-list", "--count", `${branch}..origin/main`) || 0);
  if (!behind) return true;
  if (dry(`main'den ${behind} commit birleştirilecek`)) return true;
  try { git("merge", "--no-edit", "-q", "origin/main"); notes.push(`main'den ${behind} commit birleştirildi`); return true; }
  catch (e) {
    tryGit("merge", "--abort");
    notes.push(`main ile birleştirme ÇAKIŞTI (geri alındı): ${err1(e)} — dalı elle güncelle`);
    return false;
  }
}

// Birleşmiş (harcanmış) auto/ dalından main'e dön; yerel değişiklikler taşınır.
function leaveSpentBranch(branch) {
  const dirty = !!tryGit("status", "--porcelain");
  if (dirty) git("stash", "push", "-u", "-q", "-m", "nova-auto-carry");
  git("switch", "-q", "main");
  git("merge", "--ff-only", "-q", "origin/main");
  if (dirty) git("stash", "pop", "-q");
  tryGit("branch", "-D", branch);
  notes.push(`${branch} birleşmişti; main'e dönüldü`);
}

function finishDry() { say("KURU ÇALIŞTIRMA"); return 0; }

try {
  tryGit("fetch", "-q", "--tags", "origin");
  let startBranch = git("rev-parse", "--abbrev-ref", "HEAD");

  if (startBranch === "main") syncMainFastForward();
  else if (startBranch.startsWith("auto/")) {
    const pr = latestPr(startBranch);
    if (pr && pr.state === "MERGED" && pr.mergedAt) {
      const after = Number(tryGit("rev-list", "--count", `--since=${pr.mergedAt}`, "HEAD") || 0);
      if (after === 0) {
        if (dry(`${startBranch} birleşmiş, main'e dönülecek`)) process.exit(finishDry());
        leaveSpentBranch(startBranch);
        startBranch = "main";
      }
    }
  }

  // Proje beyni: STATE.md'yi koddan yeniden üret; değişiklikler aynı commit'e girer. Hata commit'i engellemez.
  try { run(process.execPath, ["scripts/brain.mjs", "--quiet"], { timeout: 30000 }); } catch { /* beyin güncellenemezse devam */ }

  const entries = git("status", "--porcelain").split("\n").filter(Boolean);
  const paths = entries.map((l) => l.slice(3).replace(/^"|"$/g, ""));

  const risky = paths.filter((p) => RISKY.test(p));
  if (risky.length) {
    say(`Auto-commit DURDU: gizli olabilecek dosya var, commit edilmedi: ${risky.join(", ")}`);
    process.exit(0);
  }

  const files = paths.filter((p) => !EXCLUDE.test(p));
  let subject = "";
  let list = [];
  let stat = "";
  if (files.length && DRY) { dry(`${files.length} dosya commit edilecek`); subject = "(kuru)"; }
  else if (files.length) {
    // Zaten sahnelenmiş silmeler (diskte yok, indekste yok) pathspec hatası verir; onları atla
    const indexed = new Set(git("ls-files").split("\n").filter(Boolean));
    const addable = files.filter((p) => existsSync(p) || indexed.has(p));
    if (addable.length) git("add", "-A", "--", ...addable);
    list = git("diff", "--cached", "--name-only").split("\n").filter(Boolean);
    if (list.length) {
      stat = git("diff", "--cached", "--shortstat").trim();
      subject = `chore(auto): save session changes (${list.length} files)`;
      git("commit", "-q", "-m", subject, "-m", list.join("\n"));
    }
  }

  const onMain = startBranch === "main";
  const onAuto = startBranch.startsWith("auto/");

  // main'de commit yoksa yapılacak bir şey yok
  if (onMain && !subject) process.exit(0);

  // main'deyse commit'i ayrı bir auto/ dalına taşı; yerel main uzakla eşitlenir.
  let branch = startBranch;
  if (DRY) { dry(`dal: ${startBranch}, ${onMain ? "yeni auto/ dalı açılacak" : onAuto ? "aynı dalda devam" : "auto/ değil"}`); }
  if (onMain && !DRY) {
    const stamp = new Date().toISOString().replace(/\.\d+Z$/, "").replace(/[-:]/g, "").replace("T", "-");
    branch = `auto/${stamp}`;
    git("switch", "-q", "-c", branch);
    git("branch", "-f", "main", "origin/main");
  } else if (onAuto) {
    mergeMainInto(branch);
  }
  if (DRY) {
    const g0 = gates();
    notes.push(`kapı: ${g0.line}`);
    const pr0 = latestPr(branch);
    notes.push(`son PR: ${pr0 ? `#${pr0.number} ${pr0.state}` : "yok"}; main'in ${tryGit("rev-list", "--count", `origin/main..${branch}`) ?? "?"} commit önünde`);
    ensurePr(branch, "x", "x");
    process.exit(finishDry());
  }

  // auto/ dalında: yeni commit yoksa ve uzakla aynıysa ve açık PR varsa yapılacak bir şey yok
  const aheadOfRemote = Number(tryGit("rev-list", "--count", `origin/${branch}..${branch}`) ?? 1);
  if (onAuto && !subject && aheadOfRemote === 0) {
    const hasOpen = (() => { try { return JSON.parse(tryGh("pr", "list", "--head", branch, "--state", "open", "--json", "number") || "[]").length > 0; } catch { return false; } })();
    const diffVsMain = !!tryGit("diff", "--shortstat", "origin/main", "HEAD");
    if (hasOpen || !diffVsMain) process.exit(0);
  }

  git("push", "-q", "-u", "origin", branch);

  if (!onMain && !onAuto) {
    say(`Commit + push tamam (${branch}): ${subject || "değişiklik yok"}. PR açılmadı; bu dal auto/ veya main değil.`);
    process.exit(0);
  }

  const g = gates();
  const ahead = tryGit("rev-list", "--count", `origin/main..${branch}`) || "?";
  const body = [
    "Otomatik oturum kaydı (Claude Code Stop hook).",
    "",
    list.length ? `Bu turda değişen dosyalar (${list.length}):` : "Bu turda yeni değişiklik yok; dal main'in önünde olduğu için PR açıldı/korundu.",
    ...list.slice(0, 60).map((f) => `- ${f}`),
    list.length > 60 ? `- … (+${list.length - 60})` : "",
    "",
    stat ? `Özet: ${stat}` : "",
    `Dal main'in ${ahead} commit önünde.`,
    `Yerel kapı: ${g.line}`,
    "",
    "CI (Kalite, Güvenlik ve Performans) yeşil olunca auto-merge ile birleşir; sürüm etiketi ve release CI'da üretilir. Çakışma varsa PR açık kalır.",
  ].filter((l) => l !== "").join("\n");

  notes.push(`kapı: ${g.line}`);
  ensurePr(branch, subject || `chore(auto): sync ${branch}`, body);
  say(subject ? `Commit + push: ${subject}` : "Dal senkronlandı");
} catch (err) {
  say(`Auto-commit hatası: ${String(err.message || err).split("\n")[0]}`);
}
