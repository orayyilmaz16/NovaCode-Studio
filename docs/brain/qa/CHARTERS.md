# Keşif test oturumları (charter)

Keşif testi süreli ve amaçlıdır. Her oturumun bir charter'ı (görevi) vardır, 30–90 dakika sürer ve sonucu buraya ve bir `test-session` issue'suna yazılır. Oturum bulgusu varsa ayrı bir `bug` issue açılır ve buraya numarası eklenir.

## Charter şablonu

```
### CH-00X — <kısa başlık>
- Görev: <alan>'ı <kaynak/veri> ile keşfet, <riski> bul.
- Alan: area:...
- Süre: 60 dk
- Sürüm: 
- Tarih: GG.AA.YYYY
- Sonuç: bulgu yok / bulgu var / bloke
- Bulgu issue'ları: #
- Kapsanmayanlar: 
- Notlar: (gerçek veri, token, kişisel bilgi yok)
```

## Kayıt

| ID | Durum | Alan | Görev özeti | Riskli kaynak | Sonuç | Bulgu |
|---|---|---|---|---|---|---|
| CH-001 | planlandı | area:editor | Kaydetme ve harici değişiklik | B-05, B-06 | — | — |
| CH-002 | planlandı | area:git | Git paneli, GitHub bağlı ve bağlı değil | [[git-github]], [[source-control]] | — | — |
| CH-003 | planlandı | area:security | Ajan araçlarının sınırları, `.git/` ve gizli dosyalar | S-05, S-06, S-25 | — | — |
| CH-004 | planlandı | area:ui | Gezgin ve paneller klavye ile | U-01, U-03, B-15 | — | — |
| CH-005 | planlandı | area:i18n | 8 dil, RTL düzen, sabit metinler | I-01, I-02, I-03 | — | — |
