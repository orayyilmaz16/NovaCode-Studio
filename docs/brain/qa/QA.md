# QA altyapısı

Bu klasör QA'nın md tarafıdır. Süreç kuralları [[qa-agile]] içinde; burada kayıtlar ve listeler tutulur. Kopya yok: bir bilgi bir dosyada yaşar, diğerleri bağlantı verir.

## Dosya haritası

| Dosya | Ne tutar | Kim yazar | Ne zaman |
|---|---|---|---|
| [[qa-agile]] | Süreç: akış, DoR/DoD, test seviyeleri, sprint, roller | Elle | Süreç kararı değişince |
| [[SMOKE]] | Duman ve regresyon kontrol listesi, koşu kayıtları | QA | Her sürüm adayı |
| [[CHARTERS]] | Keşif oturumu şablonu, planlı ve yapılmış charter'lar | QA | Her oturumdan sonra |
| [[SPRINTS]] | Sprint kayıtları, hedef, sonuç, retro | Geliştirici + QA | Sprint başı ve sonu |

Issue şablonları (`.github/ISSUE_TEMPLATE/`): `bug_report.yml` (hata), `user_story.yml` (hikâye), `test_session.yml` (keşif oturumu).

## Kimlik şeması

- Hata ve iş: GitHub issue numarası (`#123`). Denetim kaynaklı bulgu, [[BACKLOG]] kimliğiyle birlikte yazılır: `[S-04] ...`.
- Charter: `CH-001`, `CH-002` ... ([[CHARTERS]]).
- Duman maddesi: `SM-01` ... ([[SMOKE]]).
- Sprint: `S1`, `S2` ... ([[SPRINTS]]).

## Etiket özeti

- Tür: `story`, `bug`, `test-session`, `enhancement`, `triage` (tanımsız).
- Önem: `sev:critical`, `sev:major`, `sev:minor`, `sev:trivial`.
- QA durumu: `qa:needs-test`, `qa:verified`, `qa:reopened`, `regression` (eskiden çalışan bir şey bozuldu).
- Alan: `area:*` (bkz. [[qa-agile]] Bölüm 3).

## Kayıt kuralları

1. Bulgu önce issue olur; md kayıtları issue numarasına bağlanır, kopyalanmaz.
2. Yeni hata geri gelirse `regression` etiketi eklenir ve ilgili [[SMOKE]] maddesi güçlendirilir.
3. Kapanan bulgu issue'da kapanır; [[BACKLOG]] durumu elle güncellenir.
4. Gerçek kullanıcı verisi, token veya kişisel bilgi bu klasöre yazılmaz ([[security-kvkk]]).

E2E: [[qa-agil]] ve [[e2e-yok-xyz-kirik]].
