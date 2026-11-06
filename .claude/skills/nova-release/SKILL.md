---
name: nova-release
description: NovaCode Studio için değişiklikleri analiz edip SemVer sürümünü hesaplar, commit mesajını hazırlar; onaydan sonra sürümü yükseltir, commit ve push eder, CI'yı izler. "sürüm yükselt", "commitle", "push et", "release hazırla" denince kullan.
---

# nova-release

Amaç: en az token ile güvenli, tutarlı commit + sürüm + push.

## Adımlar
1. **Durum**
   ```
   git status --short
   git diff --stat
   git log --oneline -5
   ```
   Diff içeriğini yalnız türü belirlemek için gerekiyorsa oku; tamamını sohbete basma.
2. **Ön kontrol** (hata varsa dur, düzelt)
   ```
   npx tsc --noEmit
   npm run build --silent
   ```
3. **Sürüm kararı** (`AGENT.md` §3 tablosu): fix/perf/refactor → patch, feat → minor, breaking → major, yalnız docs/chore/test/ci → artış yok.
4. **Taslak göster** (kısa):
   ```
   Sürüm: 1.0.0 → 1.1.0 (minor)
   Commit: feat: add snippet search to SnippetsPanel
   Dosyalar: src/components/SnippetsPanel.tsx, ...
   ```
5. **Onay bekle.** Onay yoksa hiçbir git yazma komutu çalıştırma.
6. **Uygula** (onay sonrası)
   ```
   npm version <patch|minor|major> --no-git-tag-version
   git add <açık dosya listesi> package.json package-lock.json
   git commit -m "<tür>: <özet>"
   git push origin <aktif-dal>
   ```
   Secret/`.env`/`release/`/`dist/` stage'e girmesin; girdiyse çıkar.
7. **CI izle:** `gh run watch --exit-status`. Başarısızsa kısa hata özeti ver; "yayında" deme.

## Geri dönüş
Push sonrası sorun: `git revert <sha>` (yeni commit), sürümü `npm version` ile düzelt. `--force` kullanma.

## Kurallar
- Commit mesajı: Conventional Commits, ≤72 karakter, emir kipi, İngilizce.
- Tek mantıksal değişiklik = tek commit. Karışık değişiklikleri böl.
- Tag ve GitHub Release yalnız ayrıca istenirse; CI'ın otomatik release'i sürüm sabitliği sorunu için `AGENT.md` §4'e bak.
