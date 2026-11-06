import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Sürüm tek kaynak: package.json. Arayüz bunu __APP_VERSION__ olarak okur.
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  base: './',
  server: {
    port: 5173
  }
});
