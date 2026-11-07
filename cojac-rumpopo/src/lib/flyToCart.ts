/**
 * "Fly to basket": when a flavour is added, a small copy of its photo lifts off
 * the card and glides in a gentle arc into the basket button in the header,
 * which then bounces and pops its count. Purely decorative: the item is added
 * to the order immediately, the flyer is aria-hidden and ignores the pointer.
 *
 * Visitors who prefer reduced motion get no flying image, only a brief colour
 * highlight on the basket.
 */

export const FLY_DURATION_MS = 1600;
const FLYER_WIDTH = 116;
const STEPS = 28;

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

function cartButton(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>('.site-header .cart-btn');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
}

function centre(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function inViewport(p: { x: number; y: number }) {
  return p.x >= 0 && p.y >= 0 && p.x <= window.innerWidth && p.y <= window.innerHeight;
}

/** Restart a one-shot CSS class on an element. */
function pulse(el: HTMLElement, cls: string, ms: number) {
  el.classList.remove(cls);
  void el.offsetWidth; // restart the animation if it is already running
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), ms);
}

export function bumpCart() {
  const cart = cartButton();
  if (!cart) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  pulse(cart, reduce ? 'is-highlight' : 'is-bumping', reduce ? 900 : 700);
}

/**
 * @param image  the product photo on the card (preferred start point)
 * @param origin fallback start point, e.g. the Add button, used when the photo
 *               has been scrolled out of view
 * @param qty    bottles added; shows a small "×3" badge when more than one
 */
export function flyToCart(image: HTMLImageElement | null, origin: HTMLElement | null, qty = 1) {
  if (typeof window === 'undefined') return;
  const cart = cartButton();
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const src = image?.currentSrc || image?.src;
  if (!cart || reduce || !src || typeof document.body.animate !== 'function') {
    bumpCart();
    return;
  }

  const imgRect = image!.getBoundingClientRect();
  let from = centre(imgRect);
  if (!inViewport(from) && origin) from = centre(origin.getBoundingClientRect());
  if (!inViewport(from)) {
    bumpCart();
    return;
  }
  const to = centre(cart.getBoundingClientRect());

  const ratio = imgRect.width > 0 ? imgRect.height / imgRect.width : 1.25;
  const w = FLYER_WIDTH;
  const h = Math.round(w * Math.min(Math.max(ratio, 0.6), 1.4));

  const flyer = document.createElement('div');
  flyer.className = 'fly-to-cart';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.style.width = `${w}px`;
  flyer.style.height = `${h}px`;
  const pic = document.createElement('img');
  pic.src = src;
  pic.alt = '';
  pic.decoding = 'async';
  flyer.appendChild(pic);
  if (qty > 1) {
    const badge = document.createElement('span');
    badge.className = 'fly-to-cart__qty';
    badge.textContent = `×${qty}`;
    flyer.appendChild(badge);
  }
  document.body.appendChild(flyer);

  // Quadratic curve: rise first, then glide across into the basket.
  const ctrl = {
    x: from.x + (to.x - from.x) * 0.3,
    y: Math.max(16, Math.min(from.y, to.y) - 110),
  };
  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = easeInOutSine(i / STEPS);
    const u = 1 - t;
    const x = u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y;
    const p = i / STEPS;
    // Lift slightly at the start, then shrink to basket size.
    const scale = p < 0.12 ? 1 + (p / 0.12) * 0.08 : 1.08 - ((p - 0.12) / 0.88) * 0.86;
    const rotate = Math.sin(p * Math.PI) * -10;
    frames.push({
      offset: p,
      transform: `translate(${x - w / 2}px, ${y - h / 2}px) scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg)`,
      opacity: p < 0.06 ? p / 0.06 : p > 0.92 ? 1 - ((p - 0.92) / 0.08) * 0.6 : 1,
    });
  }

  const anim = flyer.animate(frames, { duration: FLY_DURATION_MS, easing: 'linear', fill: 'forwards' });
  const done = () => {
    flyer.remove();
    bumpCart();
  };
  anim.onfinish = done;
  anim.oncancel = () => flyer.remove();
}
