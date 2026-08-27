import { useEffect } from 'react';

/**
 * Fires a meteorite from an add-to-cart button to the basket icon, then hands
 * off to the badge, which pops with the new count. Reads as the meteorite
 * becoming the number.
 *
 * It listens once on the document for clicks on [data-add-to-cart] rather than
 * taking props, so any add button anywhere gets the effect without threading
 * callbacks through the tree. Colour comes from CSS custom properties, so it
 * follows the time-of-day sky for free.
 */
const FLIGHT_MS = 837; // Slowed twice at the client's request: 560 -> 728 -> 837ms.

export function CartMeteor() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest('[data-add-to-cart]');
      if (!btn) return;
      const target = document.querySelector('.basket-btn');
      if (!target || reduce.matches) return;

      const from = btn.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const x0 = from.left + from.width / 2;
      const y0 = from.top + from.height / 2;
      const x1 = to.left + to.width / 2;
      const y1 = to.top + to.height / 2;

      // Hold the badge back for the flight so the meteorite is what delivers the
      // number, rather than the count appearing the instant the button is hit.
      // The button's aria-label still carries the real count throughout.
      target.classList.add('awaiting');

      const meteor = document.createElement('span');
      meteor.className = 'cart-meteor';
      meteor.setAttribute('aria-hidden', 'true');
      document.body.appendChild(meteor);

      // Arc upward on the way across: a straight line reads like a UI tween,
      // a lifted curve reads like something thrown across the sky.
      const lift = Math.min(160, Math.max(70, Math.abs(x1 - x0) * 0.3));
      const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;

      const anim = meteor.animate(
        [
          { transform: `translate(${x0}px, ${y0}px) rotate(${angle}deg) scale(0.4)`, opacity: 0 },
          { transform: `translate(${x0 + (x1 - x0) * 0.15}px, ${y0 + (y1 - y0) * 0.15 - lift * 0.55}px) rotate(${angle}deg) scale(1)`, opacity: 1, offset: 0.18 },
          { transform: `translate(${x0 + (x1 - x0) * 0.55}px, ${y0 + (y1 - y0) * 0.55 - lift}px) rotate(${angle}deg) scale(1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${x1}px, ${y1}px) rotate(${angle}deg) scale(0.55)`, opacity: 1, offset: 0.92 },
          { transform: `translate(${x1}px, ${y1}px) rotate(${angle}deg) scale(1.9)`, opacity: 0 }
        ],
        { duration: FLIGHT_MS, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }
      );

      const land = () => {
        meteor.remove();
        target.classList.remove('awaiting');
        const badge = document.querySelector('.basket-count');
        if (badge) {
          badge.classList.remove('landed');
          // Reflow so the animation restarts when items are added back to back.
          void (badge as HTMLElement).offsetWidth;
          badge.classList.add('landed');
        }
        target.classList.add('struck');
        window.setTimeout(() => target.classList.remove('struck'), 420);
      };

      anim.addEventListener('finish', land);
      anim.addEventListener('cancel', () => {
        meteor.remove();
        target.classList.remove('awaiting');
      });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
