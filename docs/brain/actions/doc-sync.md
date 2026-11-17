---
action: doc-sync
purpose: Her istem ve değişiklikte proje beyninin otomatik güncel tutulması (hatırlatma, denetim, değişiklik günlüğü)
reads: [CLAUDE, AGENT, BRAIN, brain-maintenance]
writes: [DECISIONS, AGENT, LOG]
triggers: ["belgele", "dökümante", "beyne kaydet", "md güncelle", "otomasyon", "kural"]
---
# Aksiyon: Belge otomasyonu

**Kural:** kod, ayar veya davranış değişen her turda, tur bitmeden beyin güncellenir. Elle hatırlamaya bırakılmaz; üç hook yapar.

## Nasıl çalışır (`scripts/doc-sync.mjs`, hook'lar `.claude/settings.json`)
| Ne zaman | Komut | Ne yapar |
|---|---|---|
| Her kullanıcı istemi (`UserPromptSubmit`) | `doc-sync.mjs prompt` | Claude'un bağlamına belgeleme kuralını ekler. İstem metni **okunmaz/saklanmaz**. |
| Her tur sonu (`Stop`) | `doc-sync.mjs stop` | 1) Commit edilmemiş değişiklikleri sınıflar. 2) Kod var, belge eksikse turu **bir kez** engeller (`decision: block`), eksikleri söyler. 3) Değilse [[LOG]]'a kayıt yazar. 4) Belge tamamsa `scripts/release.mjs prepare` ile **sürümü hazırlar** ([[versioning]]). 5) `scripts/auto-commit.mjs`'i çalıştırır (brain + commit + PR). |
| Elle | `node scripts/doc-sync.mjs check` | Yalnız denetim: eksik varsa çıkış kodu 1. |

## Ne "eksik" sayılır
- **Kod** = `src/`, `server/`, `electron-*.cjs`, `scripts/`, `.github/`.
- Kod değiştiyse en az biri güncellenmeli: `docs/brain/actions/*`, `DECISIONS.md`, `PROJECT.md`, `BRAIN.md`, `AGENT.md`, `CLAUDE.md`. Öneri, değişen dosyanın alanından türetilir (ör. `style.css` → [[motion]]).
- Kullanıcıya görünen kod (`src/`, `electron-*`, `server/`; test dosyaları hariç) için ayrıca `CHANGELOG.md` → `Unreleased` → `### tr` + `### en`.
- Yeni arayüz metni → 8 dil ([[i18n]]); yeni ayar → [[settings]] adımları.
- `STATE.md` ve `LOG.md` otomatiktir, sayılmaz ve elle yazılmaz.

## Güvenlik ve döngü koruması
- Engelleme **tek sefer**: Claude ikinci kez bitirirse (`stop_hook_active`) engellenmez, eksik [[LOG]]'a `⚠ eksik belge` olarak yazılır. Döngü olmaz ([[AGENT]] §8).
- Engellenen turda auto-commit çalışmaz; yarım belgeli commit çıkmaz, belgeler bitince sonraki Stop'ta gider.
- Günlükte istem metni yok (gizli bilgi/KVKK); yalnız dosya yolu, alan ve belge durumu. Gizli dosya adları (`.env`, anahtar) listelenmez.
- Geçici kapatma: `NOVA_DOCSYNC=off` (yalnız auto-commit çalışır).

## Elle yapılacaklar (otomasyon yapmaz)
Neden/karar yazısı ([[DECISIONS]]), kullanıcı notunun metni ([[CHANGELOG]]), 8 dil çevirisi, [[AGENT]] **Durum**. Otomasyon yalnız unutulmayı yakalar, içeriği üretmez.

## Doğrulama
`node scripts/doc-sync.mjs check`, `npm run brain:check`. Kurallar değişirse bu dosya ve [[brain-maintenance]] birlikte güncellenir.
