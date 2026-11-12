// Güncelleme durumu (ana süreçteki electron-update.cjs ile eşlenir) ve arayüz deposu.
import { useSyncExternalStore } from 'react';
import type { UpdateState } from '../types';

const initial: UpdateState = { status: 'idle', current: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '', latest: '', notes: '', percent: 0, transferred: 0, total: 0, speed: 0, error: '', checkedAt: 0, supported: false };
let state: UpdateState = initial;
const listeners = new Set<() => void>();
let started = false;

function start() {
  if (started) return;
  started = true;
  const api = window.electronAPI?.update;
  if (!api) { state = { ...state, status: 'unsupported' }; return; }
  void api.state().then((s) => { state = s; listeners.forEach((l) => l()); }).catch(() => undefined);
  api.onState((s) => { state = s; listeners.forEach((l) => l()); });
}

export function useUpdate(): UpdateState {
  start();
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state);
}

export const checkForUpdates = (autoDownload = false) => window.electronAPI?.update.check({ autoDownload });
export const downloadUpdate = () => window.electronAPI?.update.download();
export const installUpdate = () => window.electronAPI?.update.install();

export const formatBytes = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
