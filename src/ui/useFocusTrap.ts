import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Standard modal "focus trap": https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
// - Tab/Shift+Tab cycle only among elements inside the container while
// `active`, and deactivating restores focus to whatever held it before.
// Shared by DialogPanel and CvContent, the app's only two full-screen
// overlays - both previously only set initial focus with nothing keeping
// it inside, so a keyboard user could Tab straight through to a control
// hidden behind the overlay and activate it without seeing it (#19).
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean): void {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Tab') return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const atStart = document.activeElement === first || document.activeElement === container;
      if (e.shiftKey && atStart) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [active, containerRef]);
}
