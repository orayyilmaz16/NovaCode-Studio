import React, { useRef } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';

interface PreviewProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  onRefresh: () => void;
}

export const Preview: React.FC<PreviewProps> = ({
  htmlContent,
  cssContent,
  jsContent,
  onRefresh,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const combinedCode = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>
          // Parent pencereye log aktarımı
          const _log = console.log;
          const _err = console.error;
          const _warn = console.warn;
          console.log = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            _log.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            _err.apply(console, args);
          };
          console.warn = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            _warn.apply(console, args);
          };
          try {
            ${jsContent}
          } catch(e) {
            console.error('Çalışma Zamanı Hatası:', e.message);
          }
        </script>
      </body>
    </html>
  `;

  const openInNewTab = () => {
    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#11131c] border-l border-zinc-800">
      <div className="flex items-center justify-between px-3 py-2 bg-[#171a26] border-b border-zinc-800 text-xs">
        <div className="flex items-center space-x-2">
          <Globe size={14} className="text-emerald-400" />
          <span className="font-semibold text-zinc-300">Canlı Önizleme (Live Web)</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onRefresh}
            title="Yeniden Yükle"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={openInNewTab}
            title="Yeni Sekmede Aç"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full bg-white relative">
        <iframe
          ref={iframeRef}
          srcDoc={combinedCode}
          title="Live Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};
