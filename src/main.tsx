import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import App from './App';
import './style.css';

// Monaco editörünü yerel (offline) dosyalardan yükle (Internet veya CDN gerekmez)
loader.config({
  paths: {
    vs: './vs'
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
