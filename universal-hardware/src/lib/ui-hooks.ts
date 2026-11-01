/** Shared dialog helpers for the Preact islands (Universal AI panel, site search). */
import { useEffect, useState } from 'preact/hooks';
import type { RefObject } from 'preact';

export function setBackgroundInert(on: boolean) {
  document.querySelectorAll<HTMLElement>('body > .utility, body > .site-header, body > main, body > .site-footer, body > .skip-link').forEach((el) => {
    if (on) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
  document.documentElement.classList.toggle('is-locked', on);
}

export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onEscape: () => void, trap = true) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (x) => x.offsetParent !== null || x === document.activeElement,
      );
    const t = window.setTimeout(() => {
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0];
      target?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!trap && !el.contains(document.activeElement)) return;
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key === 'Tab' && trap) {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [active, trap]);
}

export function useMedia(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    setM(mq.matches);
    const h = () => setM(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [q]);
  return m;
}
