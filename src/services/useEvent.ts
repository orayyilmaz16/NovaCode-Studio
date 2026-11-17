import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Kimliği değişmeyen, ama her zaman en güncel işleyiciyi çağıran geri çağrı (React.memo bileşenlerine
 * satır içi işleyici geçirirken gereksiz yeniden çizimi önler).
 */
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}
