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
  }
];
