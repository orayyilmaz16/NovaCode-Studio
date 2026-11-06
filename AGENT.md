# AGENT.md — NovaCode Studio ajan sözleşmesi

Bu dosya, repoda çalışan her ajanın (Claude Code, alt ajanlar, CI botları) izleyeceği iş akışıdır. Kısa tut, uygula.

## 1. Çalışma döngüsü (hızlı)
1. **Anla** — İstek tek cümleye indirilebiliyorsa direkt işe başla. Belirsizse tek soru sor.
2. **Bul** — `Grep`/`Glob` → ilgili dosya → gerekli satır aralığı. Tüm repoyu okuma.
3. **Değiştir** — En küçük diff. Bağımlı dosyaları (tip, import, çeviri) aynı turda güncelle.
4. **Doğrula** — `npx tsc --noEmit` ve `npm run build`. Hata varsa kök nedeni düzelt, bastırma.
5. **Raporla** — 3-5 satır: ne değişti, nasıl doğrulandı, açık risk.

## 2. Alt ajan kullanımı
- Tek dosyalık/kısa iş → ajan açma, kendin yap.
- Geniş arama (çok dosya) → `Explore`, "medium".
- Bağımsız paralel işler → tek mesajda birden çok ajan.
- Alt ajana: hedef + ilgili dosya yolları + dışlananlar ver. Sonuç özetini al, dosya dökümü isteme.

## 3. Commit ve sürüm otomasyonu

### Sürüm kuralı (SemVer, kaynak: `package.json`)
| Commit türü | Artış |
|---|---|
| `fix:`, `perf:`, `refactor:`, `docs:`, `chore:` | patch (1.0.0 → 1.0.1) |
| `feat:` | minor (1.0.1 → 1.1.0) |
| `feat!:` / `BREAKING CHANGE:` | major (1.1.0 → 2.0.0) |
| yalnız `docs:`/`chore:`/`test:`/`ci:` | sürüm artmaz |

Birden çok commit varsa en yüksek seviye uygulanır.

### Akış
1. `git status --short` + `git diff --stat` ile değişikliği gör.
2. Türü belirle, sürüm artışını hesapla.
3. **Taslağı göster:** commit mesajı, yeni sürüm, etkilenen dosyalar.
   - Not: Her Claude turu sonunda `scripts/auto-commit.mjs` otomatik commit + push yapar (`chore(auto)` mesajı). Bu akış o commit'leri kapsamaz; sürüm artışı ve anlamlı mesaj için yine bu akış kullanılır.
4. **Kullanıcı onayı gelince:**
   - `npm version <patch|minor|major> --no-git-tag-version`
   - `git add <belirli dosyalar>` (asla `git add -A` körlemesine; `.env`, `release/`, `dist/` hariç)
   - `git commit -m "<tür>: <kısa özet>"`
   - `git push origin <aktif-dal>`
5. Push sonrası CI'yı izle: `gh run watch`. Yeşil değilse "yayında" deme, hatayı raporla.

### Yasaklar (onay olmadan)
`git push`, `git push --force`, `git tag`, `git reset --hard`, dal silme, release oluşturma, `main`'e doğrudan geri dönülmez değişiklik.
Geri dönüş planı: `git revert <sha>` ve `npm version` değişikliğinin geri alınması.

## 4. CI/CD notları
- Pipeline: `.github/workflows/ci-cd.yml` (audit → web build → Windows installer → release).
- Bilinen eksikler (öner, onayla, sonra uygula):
  - Release tag'i `v1.0.0-${run_number}` sabit; `package.json` sürümünden üretilmeli.
  - `npm audit ... || true` hataları yutuyor.
  - Tip kontrolü (`tsc --noEmit`) yok.
  - Aynı sürüm tekrar yayınlanmasın diye tag var mı kontrolü yok.

## 5. Bağlam yönetimi
- Kalıcı bilgi: `CLAUDE.md` (kurallar), bu dosya (akış + durum). Sohbet geçicidir.
- Görev bitince "Durum" bölümünü güncelle (en fazla 10 satır, eskileri sil).
- Bağlam ~%60'a gelirse `/compact`; konu değişirse `/clear`.
- `.claudeignore` kapsamındaki dizinleri (`node_modules`, `dist`, `release`, `.venv`) hiç okuma.

## 6. Token tasarrufu
- Uzun çıktıyı kırp (`tail`, `head`, `--silent`).
- Aynı dosyayı tekrar okuma; düzenlemeden sonra doğrulama için yeniden okumak gerekmez.
- Düşünmeyi karmaşıklığa göre ayarla: tek satırlık düzeltme, yeniden adlandırma, metin değişikliği → plan yok. Mimari/güvenlik değişikliği → kısa plan.
- Seçenek listesi yerine tek öneri sun.

## 7. Güvenlik ve KVKK kapısı
Aşağıdakilere dokunan her değişiklikte raporda ayrıca belirt:
- IPC kanalları, dosya sistemi erişimi, `electron-main.cjs` sandbox ayarları
- `realtime.ts` ile dışarı giden veri, AIAssistant'a gönderilen kod/içerik
- Yeni 3. parti paket veya servis, analitik, çerez
Belirt: veri, amaç, hukuki sebep, saklama süresi, yurt dışı aktarım. Gizli bilgi commit'e girmez.

## Durum
- 04.11.2026: CLAUDE.md, AGENT.md, release skill ve .claudeignore oluşturuldu. Açık: CI tag/sürüm düzeltmesi (bölüm 4), 8 dil i18n altyapısı kontrolü.
