# Sprint günlüğü

Sprint kuralları [[qa-agile]] Bölüm 6'da. Her sprint bir satır olarak buraya girer; ayrıntı issue'larda ve GitHub Project'te kalır.

## Özet

| Sprint | Tarih | Hedef | Plan (issue) | Tamamlanan | QA sonucu | Durum |
|---|---|---|---|---|---|---|
| S1 | 30.11.2026 – 11.12.2026 | QA altyapısı ve otomasyonun uçtan uca doğrulanması; ilk duman turu ([[SMOKE]]) | Başlangıç: #163, #168, #169. Sonradan: #168, #169 Sprint 2'ye; #163 karar milestone'una | #170 (kapandı), #164 (kabul kararı, kapandı), #178 (otomatik tespit, otomatik kapandı), #165 (PR #187: varsayılan dil İngilizce) | E2E zinciri doğrulandı (kırık bağlantı → issue → düzeltme PR'ı → CI tetikleme). Duman turu henüz yapılmadı. #176 kapandı (kök neden: kesme noktası URL eşleşmesi, PR #192). #169 ve #168 kısmen tamamlandı (PR #190, #191), issue'lar açık | 28.11.2026 itibarıyla devam ediyor (sprint 30.11'de resmen başlar) |
| S2 | 14.12.2026 – 25.12.2026 | #168 kalan modüller (secrets, update, github, llm, preload testleri), #169 App.tsx ve kalan useSettings kullanıcıları + tarayıcı ölçümü | #168, #169 (milestone: Sprint 2) | — | — | planlandı |

**Karar / dış bağımlılık milestone'u ("Ürün kararı bekliyor"):** #163 (sertifika, dış), #166 (çoklu kök, büyük kapsam), #167 (test paneli kapsamı). #165 PR birleşince kapanır.

**Retro taslağı (S1, 28.11.2026 itibarıyla):**
- Devam: otomasyon her kapıda issue açıp kapatıyor; düzeltme dalı ve PR zinciri çalışıyor.
- Dur: tarama Windows'ta tam testleri koşuyor ama CI yanıtı (Node sürümü) netleşmeden kırmızı kalıyor.
- Dene: Node sürümünü tek yerden (CI ve tarama) hizalamak; duman turunu sprint başında yapmak.

## Retro şablonu (her sprint sonunda)

```
### S<n> retro (GG.AA.YYYY)
- Devam: 
- Dur: 
- Dene: 
- Açık engeller (issue): 
```
