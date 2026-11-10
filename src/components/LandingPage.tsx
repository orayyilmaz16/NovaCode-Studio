import React from 'react';
import { 
  FileCode2, 
  Sparkles, 
  Play, 
  Layers, 
  Terminal, 
  ArrowRight, 
  Zap, 
  Cpu, 
  FolderGit2 
} from 'lucide-react';
import type { FileItem } from '../types';
import { Logo } from './Logo';
import { t } from '../i18n/uiText';

interface LandingPageProps {
  onOpenProject: () => void;
  onOpenFile: (file: FileItem) => void;
  recentFiles: FileItem[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenProject,
  onOpenFile,
  recentFiles,
}) => {
  return (
    <div className="flex-1 h-full w-full bg-nv-editor text-zinc-200 overflow-y-auto select-none flex flex-col justify-between animate-fade-in">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-8 py-10 z-10">
        {/* Başlık */}
        <div className="flex items-center gap-4 mb-8">
          <Logo size={56} animated />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">NovaCode Studio</h1>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">v{__APP_VERSION__}</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-1">
              Hızlı Monaco editörü, canlı web önizleme ve yapay zekâ destekli kodlama.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button
            onClick={onOpenProject}
            className="flex flex-col items-start p-4 rounded-md bg-nv-side border border-nv-border hover:border-indigo-500/60 hover:bg-nv-hover transition-colors group text-left cursor-pointer"
          >
            <div className="p-2.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-3">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors">
              Hemen Kodlamaya Başla
            </h3>
            <p className="text-[12px] text-zinc-400 mt-1">
              {t('startDesc')}
            </p>
            <div className="mt-3 flex items-center text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Editöre Geç</span>
              <ArrowRight size={14} className="ml-1" />
            </div>
          </button>

          <div className="flex flex-col items-start p-4 rounded-md bg-nv-side border border-nv-border hover:border-sky-500/60 transition-all text-left">
            <div className="p-2.5 rounded bg-sky-500/10 text-sky-400 mb-3">
              <Play size={20} />
            </div>
            <h3 className="font-semibold text-sm text-zinc-100">
              Canlı Web Simülatörü
            </h3>
            <p className="text-[12px] text-zinc-400 mt-1">
              HTML, CSS ve JS değişiklikleriniz anında sağ paneldeki iframe üzerinde derlenir.
            </p>
            <span className="mt-3 text-[11px] text-sky-400/80 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
              Gerçek Zamanlı Çıktı
            </span>
          </div>

          <div className="flex flex-col items-start p-4 rounded-md bg-nv-side border border-nv-border hover:border-purple-500/60 transition-all text-left">
            <div className="p-2.5 rounded bg-purple-500/10 text-purple-400 mb-3">
              <Sparkles size={20} />
            </div>
            <h3 className="font-semibold text-sm text-zinc-100">
              Yapay Zeka (AI) Asistanı
            </h3>
            <p className="text-[12px] text-zinc-400 mt-1">
              Kod optimizasyonu, hata tespiti ve algoritma üretimi için sağ paneldeki asistan hazır.
            </p>
            <span className="mt-3 text-[11px] text-purple-400/80 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              Akıllı Kod Analizi
            </span>
          </div>
        </div>

        {/* Workspace Quick Files & Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent / Starter Files */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="flex items-center space-x-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Layers size={14} className="text-indigo-400" />
              <span>Başlangıç Dosyaları</span>
            </div>
            <div className="space-y-1.5">
              {recentFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => onOpenFile(file)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileCode2 size={16} className="text-zinc-400 group-hover:text-indigo-400" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200 group-hover:text-white">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase">
                        {file.language || 'text'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 group-hover:text-indigo-300">
                    Aç →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Capabilities */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <Cpu size={14} className="text-sky-400" />
                <span>Teknik Altyapı & Özellikler</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Monaco Editor:</strong> VS Code ile aynı profesyonel editör deneyimi.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span><strong>Çevrimdışı (Offline) Hazır:</strong> Harici internete ihtiyaç duymadan çalışır.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span><strong>Entegre Terminal:</strong> JS ifadelerini çalıştıran interaktif konsol.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>Yüksek Performans:</strong> Donanım hızlandırmalı pürüzsüz arayüz.</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center space-x-1.5">
                <FolderGit2 size={13} className="text-zinc-400" />
                <span>Çalışma Alanı: <strong>NovaCode-Studio</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Terminal size={12} />
                <span>Masaüstü & Web Modu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-zinc-800/40 py-3 px-8 text-center text-[11px] text-zinc-500">
        NovaCode Studio IDE • Yerel Masaüstü Sürümü v{__APP_VERSION__}
      </div>
    </div>
  );
};
