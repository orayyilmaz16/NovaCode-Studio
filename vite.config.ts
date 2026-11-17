import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sürüm tek kaynak: package.json. Arayüz bunu __APP_VERSION__ olarak okur.
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// y-monaco, npm'deki monaco-editor'ü ikinci kez paketlemesin: uygulamanın global Monaco'sunu kullansın.
const monacoShim = fileURLToPath(new URL('./src/services/monacoShim.ts', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Yalnız dev sunucusunda: react-refresh ön yüklemesi (satır içi betik) ve HMR WebSocket için CSP gevşetilir; build çıktısı sıkı kalır (S-01).
      name: 'nova-dev-csp',
      transformIndexHtml(html, ctx) {
        if (!ctx.server) return html;
        return html
          .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
          .replace("connect-src 'self'", "connect-src 'self' http://localhost:* ws://localhost:*");
      }
    }
  ],
  resolve: {
    alias: [
      { find: /^monaco-editor\/esm\/vs\/editor\/editor\.api\.js$/, replacement: monacoShim }
    ]
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  base: './',
  server: {
    port: 5173
  }
});
