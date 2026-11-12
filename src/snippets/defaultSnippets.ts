import type { Snippet } from '../types';

export const builtInSnippets: Snippet[] = [
  {
    id: 'html5',
    label: 'HTML5 Şablonu',
    prefix: 'html5',
    description: 'Modern ve responsive HTML5 başlangıç iskeleti',
    language: 'html',
    body: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Sayfa</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; display: grid; place-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <h1>Merhaba Dünya!</h1>
</body>
</html>`
  },
  {
    id: 'fetch-async',
    label: 'Async Fetch Fonksiyonu',
    prefix: 'asyncfetch',
    description: 'Hata yakalamalı modern veri çekme fonksiyonu',
    language: 'javascript',
    body: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`HTTP Hatası: \${response.status}\`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Veri çekme hatası:', err);
    throw err;
  }
}`
  },
  {
    id: 'react-component',
    label: 'React Fonksiyonel Bileşeni',
    prefix: 'rfc',
    description: 'Modern React TypeScript bileşen kalıbı',
    language: 'typescript',
    body: `import React, { useState } from 'react';

interface Props {
  title?: string;
}

export const MyComponent: React.FC<Props> = ({ title = 'Başlık' }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-lg bg-zinc-900 text-white">
      <h2 className="text-lg font-bold">{title}</h2>
      <p>Sayaç: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-2 px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-500"
      >
        Arttır
      </button>
    </div>
  );
};`
  },
  {
    id: 'css-glass',
    label: 'Glassmorphism Kart Stili',
    prefix: 'glasscard',
    description: 'Modern buzlu cam efekti ve gölgelendirme',
    language: 'css',
    body: `.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  padding: 24px;
}`
  },
  {
    id: 'express-server',
    label: 'Node Express API Başlangıcı',
    prefix: 'express',
    description: 'Basit Express.js JSON REST sunucusu',
    language: 'javascript',
    body: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(\`Sunucu http://localhost:\${PORT} üzerinde çalışıyor\`);
});`
  },
  ...quick('clg', 'console.log', 'Konsola yazdır', ['javascript', 'typescript'], 'console.log(value);'),
  ...quick('afn', 'Ok fonksiyonu', 'Arrow function', ['javascript', 'typescript'], 'const name = (params) => {\n  \n};'),
  ...quick('tryc', 'try / catch', 'Hata yakalama bloğu', ['javascript', 'typescript'], 'try {\n  \n} catch (err) {\n  console.error(err);\n}'),
  ...quick('forof', 'for...of', 'Dizi döngüsü', ['javascript', 'typescript'], 'for (const item of items) {\n  \n}'),
  ...quick('rfc', 'React bileşeni', 'Fonksiyonel React bileşeni', ['typescript'], 'export function Component() {\n  return (\n    <div>\n      \n    </div>\n  );\n}'),
  ...quick('ust', 'useState', 'React useState kancası', ['typescript'], 'const [state, setState] = useState();'),
  ...quick('uef', 'useEffect', 'React useEffect kancası', ['typescript'], 'useEffect(() => {\n  \n  return () => {};\n}, []);'),
  ...quick('def', 'Python fonksiyonu', 'Fonksiyon tanımı', ['python'], 'def name(args):\n    pass'),
  ...quick('ifmain', 'Python main', 'if __name__ == "__main__"', ['python'], 'if __name__ == "__main__":\n    main()'),
  ...quick('flexc', 'Flex ortala', 'Flex ile ortalama', ['css'], 'display: flex;\nalign-items: center;\njustify-content: center;'),
  ...quick('gridc', 'Responsive grid', 'Otomatik sütunlu grid', ['css'], 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\ngap: 1rem;'),
  ...quick('sect', 'HTML bölüm', 'Section + başlık', ['html'], '<section class="">\n  <h2></h2>\n  <p></p>\n</section>'),
  ...quick('sel', 'SQL SELECT', 'Temel sorgu', ['sql'], 'SELECT column\nFROM table\nWHERE condition\nLIMIT 100;'),
  ...quick('todo', 'TODO notu', 'Yapılacak notu', ['*'], 'TODO: ')
];

// Hızlı yol: kısa tetikleyici (yazıp Tab/Enter); her dil için ayrı kayıt üretir.
function quick(prefix: string, label: string, description: string, languages: string[], body: string): Snippet[] {
  return languages.map((language) => ({ id: `q-${prefix}-${language}`, label, prefix, description, language, body }));
}
