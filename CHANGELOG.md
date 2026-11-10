# Changelog

## Unreleased

### tr

### en

## 1.1.2 - 10.11.2026
### Türkçe
- CI: sürüm işindeki push yarışı (non-fast-forward) giderildi; rebase + yeniden deneme eklendi, işlere zaman aşımı konuldu.
- CI: çalışma zamanı bağımlılıkları için moderate, geliştirme araçları için high düzeyinde audit uygulanıyor.
- Açık klasördeki dosya değişiklikleri artık gerçek zamanlı: dosya ağacı ve kaydedilmemiş değişikliği olmayan açık sekmeler diskten anında yenileniyor.

### English
- CI: fixed the non-fast-forward push race in the version job (rebase + retry) and added job timeouts.
- CI: audit now fails on moderate for runtime dependencies and on high for dev tooling.
- Open-folder changes are now real-time: the file tree and unmodified open tabs refresh from disk instantly.

## 1.1.1 - 08.11.2026
### Türkçe
- Otomatik güncelleme. Ayrıntılar için İngilizce notlara bakın.

### English
- add security policy, issue/PR templates and CODEOWNERS (#6)
- open PR and enable auto-merge for auto-commits (#5)

## 1.1.0 - 08.11.2026
### Türkçe
- Otomatik güncelleme. Ayrıntılar için İngilizce notlara bakın.

### English
- Automatic update.

## 1.1.0 - 08.11.2026
### Türkçe
- Uygulama açılışta hiçbir proje veya dosyayı otomatik açmaz; boş editör gösterilir.
- Boş editörde Klasör Aç, Dosya Aç ve Yeni Dosya düğmeleri eklendi; sekme çubuğuna + düğmesi eklendi.
- Klavye kısayolları eklendi: Ctrl+O, Ctrl+Shift+O, Ctrl+N, Ctrl+W, Ctrl+Tab, Ctrl+` ve Ctrl+Q.
- Başlıkta çıkış düğmesi eklendi.
- Sürüm otomasyonu: her güncelleme patch sürümü alır ve Türkçe/İngilizce notlarıyla GitHub Release oluşturulur.

### English
- The app no longer opens any project or file automatically on startup; an empty editor is shown.
- Added Open folder, Open files and New file buttons to the empty editor, and a + button in the tab bar.
- Added keyboard shortcuts: Ctrl+O, Ctrl+Shift+O, Ctrl+N, Ctrl+W, Ctrl+Tab, Ctrl+` and Ctrl+Q.
- Added an exit button in the title bar.
- Version automation: every update gets a patch version and a GitHub Release with Turkish and English notes.
