import React, { Suspense } from 'react';
import { RefreshCcw } from 'lucide-react';
import { t } from '../i18n/uiText';
import '../i18n/uiTextComp';

interface Props {
  children: React.ReactNode;
  /** root: tüm uygulama (tam ekran), panel: tek bölüm (yerinde küçük uyarı). */
  kind?: 'root' | 'panel';
}
interface State {
  error: Error | null;
}

const isChunkError = (e: Error | null) =>
  !!e && (e.name === 'ChunkLoadError' || /dynamically imported module|Importing a module script failed|Failed to fetch|Loading chunk|error loading/i.test(e.message));

/**
 * Hata sınırı: bileşen hatası beyaz ekran yerine "Yeniden yükle" gösterir (B-07).
 * Hata ayrıntısı yalnız yerel konsola yazılır; hiçbir yere gönderilmez.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reload = () => {
    // Parça indirme hatasında React.lazy reddedilmiş sözü saklar: yalnız sayfa yenilemesi düzeltir.
    if (this.props.kind === 'root' || isChunkError(this.state.error)) window.location.reload();
    else this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.kind === 'root') {
      return (
        <div role="alert" className="flex h-dvh w-screen flex-col items-center justify-center gap-4 bg-nv-side px-6 text-center text-zinc-300">
          <p className="text-lg font-medium text-zinc-100">{t('appErrTitle')}</p>
          <p className="max-w-md text-sm text-zinc-400">{t('appErrRoot')}</p>
          <button onClick={this.reload} className="btn-primary px-4">
            <RefreshCcw size={14} />
            {t('appReload')}
          </button>
        </div>
      );
    }
    return (
      <div role="alert" className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-zinc-400">
        <p>{t('appErrPanel')}</p>
        <button onClick={this.reload} className="btn-ghost px-3">
          <RefreshCcw size={13} />
          {t('appReload')}
        </button>
      </div>
    );
  }
}

/** Tembel (lazy) yüklenen panel sarmalayıcısı: yükleme sırasında boş, hata olursa yerinde "Yeniden yükle". */
export const LazyPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary kind="panel">
    <Suspense fallback={null}>{children}</Suspense>
  </ErrorBoundary>
);
