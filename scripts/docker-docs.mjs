#!/usr/bin/env node
// Docker belgesi: docs/brain/DOCKER.md dosyasını Dockerfile ve compose dosyalarından üretir (elle yazılmaz).
//   node scripts/docker-docs.mjs            → DOCKER.md'yi yeniden üretir
//   node scripts/docker-docs.mjs --check    → güncel değilse çıkış kodu 1
// Deterministiktir, ağa çıkmaz, sır okumaz (yalnız Dockerfile ve docker-compose.yml).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs", "brain", "DOCKER.md");
const check = process.argv.includes("--check");
const read = (p) => readFileSync(join(ROOT, p), "utf8").replace(/\r\n/g, "\n");

const SERVICES = [
  { key: "sync", title: "Senkron sunucusu (Yjs)", dir: "server/deploy", service: "sync", secretPrefix: "DEPLOY" },
  { key: "analytics", title: "Anonim analitik toplayıcı", dir: "server/analytics-deploy", service: "analytics", secretPrefix: "ANALYTICS_DEPLOY" },
];

const first = (re, text, fallback = "—") => (re.exec(text)?.[1] ?? fallback).trim();

function describe(s) {
  const df = read(`${s.dir}/Dockerfile`);
  const dc = read(`${s.dir}/docker-compose.yml`);
  // compose içindeki ilgili servis bloğu (bir sonraki üst düzey servise kadar)
  const block = new RegExp(`\\n  ${s.service}:\\n([\\s\\S]*?)(?=\\n  \\w[\\w-]*:\\n|\\nvolumes:|$)`).exec(dc)?.[1] ?? "";
  const image = first(/^\s+image:\s*(\S+)/m, block);
  const env = [...block.matchAll(/^\s{6}([A-Z][A-Z0-9_]+):/gm)].map((m) => m[1]);
  return {
    ...s,
    base: first(/^FROM\s+(\S+)/m, df),
    port: first(/^EXPOSE\s+(\d+)/m, df),
    user: first(/^USER\s+(\S+)/m, df),
    health: first(/CMD node -e "fetch\('([^']+)'/, df),
    image,
    env,
    mem: first(/^\s+mem_limit:\s*(\S+)/m, block),
    pids: first(/^\s+pids_limit:\s*(\S+)/m, block),
    readOnly: /^\s+read_only:\s*true/m.test(block),
    capDrop: /cap_drop:\s*\[ALL\]/.test(block),
  };
}

const items = SERVICES.filter((s) => existsSync(join(ROOT, s.dir, "Dockerfile"))).map(describe);

const lines = [];
lines.push("# Docker (otomatik üretilir)", "");
lines.push("> Bu dosya `scripts/docker-docs.mjs` ile Dockerfile ve compose dosyalarından üretilir; elle düzenleme. `npm run brain` yeniler, `.github/workflows/docker.yml` main'de eskirse düzeltme PR'ı açar.", "");
lines.push("## İmajlar", "");
lines.push("| Servis | İmaj (GHCR) | Taban | Port | Kullanıcı | Sağlık | Bellek | PID |");
lines.push("|---|---|---|---|---|---|---|---|");
for (const i of items) {
  lines.push(`| ${i.title} | \`${i.image.replace(/:.*$/, "")}\` | \`${i.base}\` | ${i.port} | \`${i.user}\` | \`${i.health}\` | ${i.mem} | ${i.pids} |`);
}
lines.push("");
lines.push("## Sertleştirme ve ortam", "");
for (const i of items) {
  lines.push(`- **${i.title}:** salt-okunur kök: ${i.readOnly ? "evet" : "hayır"} · \`cap_drop: ALL\`: ${i.capDrop ? "evet" : "hayır"} · ortam değişkenleri: ${i.env.map((e) => `\`${e}\``).join(", ") || "—"}`);
}
lines.push("");
lines.push("## Boru hattı (`.github/workflows/docker.yml`)", "");
lines.push("1. `server/**` değişince (PR ve main) imajlar derlenir.");
lines.push("2. **Duman testi:** imaj salt-okunur, `cap_drop ALL` ile ayağa kaldırılır, Docker sağlık kontrolü `healthy` olmadan hat ilerlemez.");
lines.push("3. **Yayın (yalnız main):** `latest`, `package.json` sürümü ve kısa SHA etiketleriyle GHCR'a gönderilir.");
lines.push("4. **Dağıtım (yalnız main, isteğe bağlı):** sunucu sırları tanımlıysa SSH ile `docker compose pull && up -d` çalışır, sağlık doğrulanır; sır yoksa atlanır.");
lines.push("5. **Belge:** bu dosya eskiyse otomatik PR açılır.", "");
lines.push("## Dağıtım sırları (Settings → Secrets and variables → Actions)", "");
lines.push("| Servis | Sır öneki | Gerekli sırlar |");
lines.push("|---|---|---|");
for (const i of items) {
  const p = i.secretPrefix;
  lines.push(`| ${i.title} | \`${p}_*\` | \`${p}_HOST\`, \`${p}_USER\`, \`${p}_SSH_KEY\`, \`${p}_KNOWN_HOSTS\`, \`${p}_PATH\` (sunucudaki depo kökü), isteğe bağlı \`${p}_HEALTH_URL\` |`);
}
lines.push("");
lines.push("İkisi de 80/443'ü kullandığı için aynı sunucuya kurulmaz. Sırlar depoya, sohbete veya belgeye yazılmaz; sızarsa yenilenir.", "");
lines.push("## Yerelde çalıştırma", "");
lines.push("```", "docker build -f server/deploy/Dockerfile -t novacode-sync:local .", "docker build -f server/analytics-deploy/Dockerfile -t novacode-analytics:local .", "```", "");
lines.push("Derleme bağlamı depo köküdür; `.dockerignore` allowlist olduğundan yeni dosya gerekirse oraya `!` satırı eklenir.", "");

const next = lines.join("\n");
const current = existsSync(OUT) ? readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";

if (check) {
  if (current !== next) {
    console.error("DOCKER.md güncel değil (npm run brain ile yenile).");
    process.exit(1);
  }
  console.log("DOCKER.md güncel.");
} else if (current !== next) {
  writeFileSync(OUT, next);
  console.log("DOCKER.md güncellendi.");
} else {
  console.log("DOCKER.md zaten güncel.");
}
