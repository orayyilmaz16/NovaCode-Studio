import { useCallback, useEffect, useState } from 'react';
import type { GithubAuthStatus } from '../types';

const EMPTY: GithubAuthStatus = { connected: false, profile: null, hasClientId: false, canStoreToken: true };

// GitHub oturumunu ana süreçten okur ve gerçek zamanlı olarak dinler. Token renderer'a hiç gelmez.
export function useGithubAuth() {
  const api = typeof window !== 'undefined' ? window.electronAPI?.github : undefined;
  const [auth, setAuth] = useState<GithubAuthStatus>(EMPTY);
  const [ready, setReady] = useState(!api);

  const refresh = useCallback(async () => {
    if (!api) return;
    try {
      setAuth(await api.status());
    } catch {
      setAuth(EMPTY);
    } finally {
      setReady(true);
    }
  }, [api]);

  useEffect(() => {
    if (!api) return;
    void refresh();
    return api.onAuth(() => {
      void refresh();
    });
  }, [api, refresh]);

  return { auth, ready, refresh, available: !!api };
}
