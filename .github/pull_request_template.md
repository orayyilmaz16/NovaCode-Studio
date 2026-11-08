## Ne değişti? / What changed?
<!-- Kısa özet. / Short summary. -->

## Neden? / Why?

## Doğrulama / Verification
- [ ] `npx tsc --noEmit` geçti
- [ ] `npm run build` geçti
- [ ] Kullanıcı arayüzü metinleri 8 dilde (tr, en, de, ru, ar, es, fr, az)
- [ ] `CHANGELOG.md` → `## Unreleased` içinde `### tr` ve `### en` maddeleri var (kullanıcıya görünen değişiklik ise)

## Güvenlik ve veri / Security & data
- [ ] IPC, dosya sistemi, `electron-main.cjs` veya sandbox ayarlarına dokunmuyor, ya da değişiklik açıklandı
- [ ] Yeni kişisel veri akışı, 3. parti servis, analitik veya çerez yok, ya da açıklandı (veri, amaç, hukuki sebep, saklama, yurt dışı aktarım)
- [ ] Gizli bilgi (anahtar, token, `.env`, sunucu IP'si) yok

## Sürüm / Release
- Bu PR birleşince CI otomatik patch sürüm ve release üretir (`feat!:`/BREAKING ise major). Ek bir işlem gerekmez.
