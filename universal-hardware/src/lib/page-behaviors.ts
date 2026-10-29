/**
 * Small, dependency-free behaviours shared by every page:
 * header state, mobile menu dialog, scroll reveals, card tilt, motion toggle,
 * and the declarative hooks (data-*) that connect static HTML to the
 * session-only enquiry store and the Product Guide.
 */
import {
  getDraft,
  subscribe,
  toggleCategory,
  hasCategory,
  openEnquiry,
  openGuide,
  toast,
  getBranch,
  setBranch,
  subscribeBranch,
} from './enquiry-store';
import { CATEGORY_BY_SLUG } from '../data/categories';
import type { BranchId } from '../data/branches';
import { PRODUCT_BY_ID, productTitle } from '../data/shop';
import { addToCart, cartCount, getCart, subscribeCart } from './cart-store';

const root = document.documentElement;
const MOTION_KEY = 'uhc.motion.v1';

export function motionReduced(): boolean {
  return root.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------------- Header ---------------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------------- Mobile nav (native <dialog>) ---------------- */
const nav = document.querySelector<HTMLDialogElement>('[data-mobile-nav]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
if (nav && openBtn) {
  const close = () => {
    if (!nav.open) return;
    nav.classList.add('is-closing');
    const done = () => {
      nav.classList.remove('is-closing');
      nav.close();
    };
    if (motionReduced()) done();
    else window.setTimeout(done, 220);
  };
  openBtn.addEventListener('click', () => {
    nav.showModal();
    openBtn.setAttribute('aria-expanded', 'true');
    root.classList.add('is-locked');
  });
  nav.addEventListener('close', () => {
    openBtn.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-locked');
    openBtn.focus();
  });
  nav.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  nav.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === nav) close(); // backdrop
    if (t.closest('[data-menu-close]')) close();
    if (t.closest('[data-menu-close-after]')) close();
    if (t.closest('a')) {
      // Allow navigation; close for in-page anchors.
      const a = t.closest('a') as HTMLAnchorElement;
      if (a.hash && a.pathname === location.pathname) close();
    }
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', (m) => {
    if (m.matches) close();
  });
}

/* ---------------- Enquiry hooks ---------------- */
function renderCounts() {
  const n = getDraft().items.length;
  document.querySelectorAll<HTMLElement>('[data-enquiry-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLButtonElement>('.enquiry-trigger').forEach((b) => {
    b.setAttribute('aria-label', `Open enquiry summary (${n} ${n === 1 ? 'category' : 'categories'})`);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-enquiry-toggle]').forEach((b) => {
    const slug = b.dataset.enquiryToggle!;
    const on = hasCategory(slug);
    b.setAttribute('aria-pressed', String(on));
    const label = b.querySelector<HTMLElement>('[data-label]');
    if (label) label.textContent = on ? 'Added to Enquiry Summary' : b.dataset.labelOff || 'Add to Enquiry Summary';
  });
}
renderCounts();
subscribe(renderCounts);

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const opener = t.closest<HTMLElement>('[data-open-enquiry]');
  if (opener) {
    e.preventDefault();
    openEnquiry();
    return;
  }
  const toggler = t.closest<HTMLButtonElement>('[data-enquiry-toggle]');
  if (toggler) {
    e.preventDefault();
    const slug = toggler.dataset.enquiryToggle!;
    const added = toggleCategory(slug, toggler.dataset.enquiryContext);
    const name = CATEGORY_BY_SLUG[slug]?.name ?? 'Category';
    toast(added ? `${name} added to your Enquiry Summary` : `${name} removed from your Enquiry Summary`, added ? 'open-enquiry' : undefined);
    return;
  }
  const guide = t.closest<HTMLElement>('[data-open-guide]');
  if (guide) {
    e.preventDefault();
    openGuide(guide.dataset.guidePrompt || undefined);
  }
});

/* ---------------- Cart hooks ---------------- */
function renderCart() {
  const n = cartCount(getCart());
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLElement>('.cart-trigger').forEach((a) => {
    a.setAttribute('aria-label', `Cart (${n} ${n === 1 ? 'item' : 'items'})`);
  });
  document.querySelectorAll<HTMLElement>('[data-cart-label]').forEach((el) => {
    el.textContent = n ? `Cart (${n})` : 'Cart';
  });
}
renderCart();
subscribeCart(renderCart);

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add-to-cart]');
  if (!b) return;
  e.preventDefault();
  const p = PRODUCT_BY_ID[b.dataset.addToCart!];
  if (!p) return;
  const scope = b.closest('[data-product]') ?? document;
  const colour = scope.querySelector<HTMLSelectElement>('[data-colour]')?.value || undefined;
  const qty = Number(scope.querySelector<HTMLInputElement>('[data-qty]')?.value) || 1;
  if (addToCart(p.id, qty, colour)) {
    toast(`${productTitle(p)}${colour ? ` (${colour})` : ''} added to your cart`, 'open-cart');
  }
});

/* ---------------- Branch selection (session only) ---------------- */
function renderBranch() {
  const id = getBranch();
  document.querySelectorAll<HTMLButtonElement>('[data-branch-select]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.branchSelect === id));
  });
  document.querySelectorAll<HTMLElement>('[data-branch-card]').forEach((c) => {
    c.classList.toggle('is-selected', c.dataset.branchCard === id);
  });
  document.querySelectorAll<HTMLElement>('[data-branch-status]').forEach((s) => {
    const name = id === 'spanish-lookout' ? 'Spanish Lookout' : id === 'belize-city' ? 'Belize City' : '';
    s.textContent = name
      ? `${name} selected as your preferred branch for this browser session.`
      : 'No preferred branch selected.';
  });
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-branch-select]');
  if (!b) return;
  const id = b.dataset.branchSelect as BranchId;
  setBranch(getBranch() === id ? '' : id);
});
renderBranch();
subscribeBranch(renderBranch);

/* ---------------- Reveal on scroll ---------------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (revealEls.length) {
  if (!('IntersectionObserver' in window) || motionReduced()) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealEls.forEach((el) => io.observe(el));
  }
}

/* ---------------- Subtle card tilt (fine pointers only) ---------------- */
const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
if (fine.matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      if (motionReduced()) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--rx', `${(-y * 2.4).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(x * 2.8).toFixed(2)}deg`);
        card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ---------------- Motion toggle ---------------- */
function renderMotion() {
  const reduced = root.dataset.motion === 'reduced';
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(reduced));
    const l = b.querySelector('[data-motion-label]');
    if (l) l.textContent = reduced ? 'Motion reduced (tap to restore)' : 'Reduce motion';
  });
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('[data-motion-toggle]');
  if (!b) return;
  const reduced = root.dataset.motion !== 'reduced';
  if (reduced) root.dataset.motion = 'reduced';
  else delete root.dataset.motion;
  try {
    sessionStorage.setItem(MOTION_KEY, reduced ? 'reduced' : 'full');
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('uhc:motion-change', { detail: { reduced } }));
  renderMotion();
});
renderMotion();
