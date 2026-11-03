import type { FileItem } from './types';

export const initialFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '2',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Canlı Önizleme</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      text-align: center;
      max-width: 480px;
      width: 100%;
    }
    h1 {
      margin-top: 0;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 28px;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }
    .counter {
      font-size: 36px;
      font-weight: bold;
      color: #38bdf8;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 NovaCode Studio</h1>
    <p>Kod editöründen anlık canlı önizleme ve tam etkileşimli geliştirme deneyimi!</p>
    <div class="counter" id="countDisplay">0</div>
    <button id="counterBtn">Sayaç Artır</button>
  </div>
  <script>
    let count = 0;
    const btn = document.getElementById('counterBtn');
    const display = document.getElementById('countDisplay');
    btn.addEventListener('click', () => {
      count++;
      display.innerText = count;
      console.log('Sayaç güncellendi: ' + count);
    });
    console.log('NovaCode Web App başarıyla başlatıldı!');
  </script>
</body>
</html>`
      },
      {
        id: '3',
        name: 'app.js',
        type: 'file',
        language: 'javascript',
        content: `// Hızlı JavaScript Algoritma Testi
function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

const terms = 10;
const results = fibonacci(terms);
console.log(\`İlk \${terms} Fibonacci sayısı:\`, results);

// Nesne işleme
const dev = {
  name: "Geliştirici",
  ide: "NovaCode Studio",
  features: ["Monaco Editor", "Live Preview", "Terminal", "AI Assistant"]
};

console.info("IDE Profil:", dev);
`
      },
      {
        id: '4',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `/* Modern Cam Efekti ve Animasyonlar */
:root {
  --primary-color: #6366f1;
  --bg-dark: #0f172a;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--bg-dark);
}

.glow-effect {
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
}
`
      }
    ]
  },
  {
    id: '5',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# 🚀 NovaCode Studio IDE

Profesyonel, yüksek performanslı ve çift platformlu (Masaüstü & Web) yeni nesil kod editörü.

### 🌟 Başlıca Özellikler:
- **Monaco Code Editor**: VS Code çekirdeği ile kod tamamlama, renklendirme ve hata denetimi.
- **Canlı Web Önizlemesi (Live Preview)**: HTML/CSS/JS projelerinizi anlık olarak sağ panelde test edin.
- **Entegre İnteraktif Konsol / Terminal**: Çıktıları anında yakalayın, JavaScript kodlarını test edin.
- **Yapay Zeka Destekli Asistan**: Kod açıklaması, refactor ve hata ayıklama desteği.
- **Dosya Gezgini**: Yeni dosya oluşturma, silme, düzenleme ve indirme.
- **Masaüstü ve Web Uyumluluğu**: Hem web tarayıcısından hem de Electron masaüstü uygulamasından çalışır.
`
  },
  {
    id: '6',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "my-novacode-project",
  "version": "1.0.0",
  "description": "NovaCode Studio ile oluşturulmuş proje",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "keywords": ["ide", "editor", "web", "desktop"]
}`
  }
];
