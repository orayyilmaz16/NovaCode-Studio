# 🚀 NovaCode Studio - Modern Masaüstü & Web Tabanlı IDE

NovaCode Studio, modern geliştirme ihtiyaçları için tasarlanmış; hem **web tarayıcısı** üzerinden çalışan hem de **Electron ile masaüstü uygulaması** olarak kullanılabilen tam özellikli, profesyonel bir kod editörüdür.

---

## ✨ Öne Çıkan Özellikler

1. **💻 Monaco Editor Entegrasyonu (VS Code Motoru):**
   - JavaScript, TypeScript, HTML, CSS, JSON, Markdown ve onlarca dilde akıllı sözdizimi renklendirme (syntax highlighting).
   - Akıllı kod tamamlama (IntelliSense), otomatik girintileme ve parantez eşleme.
   - Kod kopyalama ve dosyayı yerel diske indirme butonları.

2. **🌐 Entegre Canlı Web Önizleme (Live Preview):**
   - HTML, CSS ve JavaScript kodlarınızı tarayıcıyı terk etmeden anında sağ panelde çalıştırın ve önizleyin.
   - İster IDE içinden tam ekran görüntüleyin, isterseniz tek tıkla harici sekmede test edin.

3. **⚡ Etkileşimli Terminal & JS Console:**
   - Önizleme iframe'i ve editörden gelen `console.log`, `error`, `warn`, `info` loglarını anlık yakalar ve listeler.
   - REPL mantığında doğrudan JavaScript ifadeleri ve komutları çalıştırabileceğiniz alt konsol.

4. **🤖 Yapay Zeka (AI) Asistanı & Copilot:**
   - Seçili kodları otomatik analiz etme ("Kodu Açıkla", "Hata Bul", "Optimize Et").
   - Canlı sohbet ile kod fikirleri ve algoritmik çözümler üretme.

5. **📁 Dosya & Klasör Gezgini:**
   - Proje ağacı üzerinde yeni dosya ve klasör oluşturma.
   - Dosya silme, sekmeler halinde açma ve kapatma yönetimi.

6. **🎨 Özelleştirilebilir Tasarım & Temalar:**
   - VS Dark ve Light tema desteği.
   - Dinamik yazı boyutu (Font size) kaydırıcısı ve modern cam (glassmorphism) karanlık tema tasarımı.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Web Tabanlı Olarak Çalıştırma (Tarayıcı Üzerinden):
Projeyi Vite yerel geliştirme sunucusu ile ayağa kaldırıp herhangi bir tarayıcıdan kullanmak için:
```bash
npm run dev
```
Ardından tarayıcınızda açın: `http://localhost:5173`

---

### 2. Masaüstü Uygulaması (Electron) Olarak Çalıştırma:
Masaüstü penceresinde çalıştırmak için:
```bash
npm run electron:dev
```

---

### 3. Üretim (Production) Derlemesi:
- **Web için:**
  ```bash
  npm run build
  ```
- **Masaüstü Kurulum Paketi (.exe) Oluşturmak için:**
  ```bash
  npm run electron:build
  ```
