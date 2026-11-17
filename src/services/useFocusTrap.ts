import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Pencere (modal) için odak tuzağı: açılınca ilk öğeye odaklanır, Tab/Shift+Tab pencere içinde döner,
 * kapanınca odak önceki öğeye iade edilir. `onEscape` verilirse Esc ile çağrılır.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  const esc = useRef(onEscape);
  esc.current = onEscape;
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!root.contains(document.activeElement)) {
      const first = root.querySelector<HTMLElement>('[data-autofocus]') ?? items()[0];
      if (first) first.focus();
      else {
        root.tabIndex = -1;
        root.focus();
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && esc.current) {
        e.stopPropagation();
        esc.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = items();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const cur = document.activeElement as HTMLElement | null;
      if (!cur || !root.contains(cur)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && cur === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && cur === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}
