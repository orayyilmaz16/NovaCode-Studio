import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import App from './App';
import { SettingsProvider } from './services/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './style.css';

// Monaco editörünü yerel (offline) dosyalardan yükle (Internet veya CDN gerekmez)
loader.config({
  paths: {
    vs: './vs'
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary kind="root">
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Monaco (~25 MB) ilk dosya açılınca değil, açılış sakinleşince boşta indirilir (P-14)
const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
const warmMonaco = () => { void loader.init().catch(() => undefined); };
if (idle) idle(warmMonaco, { timeout: 4000 });
else window.setTimeout(warmMonaco, 2000);
