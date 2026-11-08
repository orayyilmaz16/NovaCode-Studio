import React from 'react';
import { 
  Code2, 
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
    <div className="flex-1 h-full w-full bg-[#0d1017] text-zinc-200 overflow-y-auto select-none flex flex-col justify-between animate-fade-in">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-8 py-10 z-10">
        {/* Header Hero */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code2 size={32} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d1017] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                NovaCode Studio
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v{__APP_VERSION__} Pro IDE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Hızlı, Akıllı Monaco Editör Motoru & Entegre Canlı Web Simülatörü
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button
            onClick={onOpenProject}
            className="flex flex-col items-start p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/60 hover:bg-zinc-800/40 transition-all group text-left cursor-pointer shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-3">
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

          <div className="flex flex-col items-start p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-sky-500/60 transition-all text-left shadow-sm">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 mb-3">
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

          <div className="flex flex-col items-start p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/60 transition-all text-left shadow-sm">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 mb-3">
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
