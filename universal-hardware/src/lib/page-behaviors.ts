/**
 * Small, dependency-free behaviours shared by every page:
 * header state, mobile menu dialog, scroll reveals, card tilt, motion toggle,
 * and the declarative hooks (data-*) that connect static HTML to the
 * cart, the preferred branch and Universal AI.
 */
import { openGuide, openSearch, toast, getBranch, setBranch, subscribeBranch } from './site-state';
import type { BranchId } from '../data/branches';
import { PRODUCT_BY_ID, productTitle } from '../data/shop';
import { addToCart, cartCount, getCart, subscribeCart } from './cart-store';
import { initLang } from './i18n';

initLang();

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

/* ---------------- Every page opens at its top ---------------- */
// Links such as /brands/#makita or /locations/#belize-city name an item on the next page. The page still
// opens at its top (the item carries data-anchor, not an id, so the browser doesn't jump part-way down);
// the item is highlighted, and on Brands it moves to the front of its list so it shows without scrolling.
function markLinked() {
  let name = '';
  try {
    name = decodeURIComponent(location.hash.slice(1));
  } catch {
    /* malformed hash */
  }
  const linked = name ? [...document.querySelectorAll<HTMLElement>('[data-anchor]')].find((el) => el.dataset.anchor === name) : undefined;
  if (!linked) return false;
  document.querySelectorAll('.is-linked').forEach((el) => el.classList.remove('is-linked'));
  if (linked.hasAttribute('data-anchor-first')) linked.parentElement?.prepend(linked);
  linked.classList.add('is-linked');
  return true;
}
markLinked();
// The same kind of link followed on the page it names (e.g. a Universal AI brand card on Brands) does the same, from the top.
addEventListener('hashchange', () => {
  if (markLinked()) window.scrollTo({ top: 0, behavior: 'auto' });
});

// Inside a preview frame that the host stretches to the page's full height (phones do this), the host
// page does the scrolling and keeps its old position when the frame loads a new page, so visitors would
// land part-way down. Only when the top of this page is out of sight while the frame itself isn't
// scrolled (the stretched case), bring it into view: when the page opens, once it has finished loading,
// and on the tap that leaves for another page. Never after the visitor has started scrolling. A deployed
// site is not framed, so none of this runs there.
if (window.self !== window.top && 'IntersectionObserver' in window) {
  const toTop = () => {
    try {
      document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    } catch {
      document.documentElement.scrollIntoView(true);
    }
  };
  const marker = document.createElement('div');
  marker.setAttribute('aria-hidden', 'true');
  marker.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.prepend(marker);
  let topInView = true;
  let moved = false;
  const stretchedAndOff = () => !topInView && window.scrollY === 0;
  ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, () => (moved = true), { passive: true, once: true }));
  let first = true;
  new IntersectionObserver((entries) => {
    topInView = entries[entries.length - 1].isIntersecting;
    if (first) {
      first = false;
      if (stretchedAndOff()) toTop();
    }
  }).observe(marker);
  addEventListener('load', () => setTimeout(() => !moved && stretchedAndOff() && toTop(), 60), { once: true });
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    if (stretchedAndOff()) toTop();
  });
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

/* ---------------- Universal AI hooks ---------------- */
document.addEventListener('click', (e) => {
  const searchBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-open-search]');
  if (searchBtn) {
    e.preventDefault();
    const q = searchBtn.dataset.searchQuery || undefined;
    const menu = document.querySelector<HTMLDialogElement>('[data-mobile-nav]');
    // From the phone menu: close it first, then open search once its focus and scroll lock are released.
    if (menu?.open) {
      menu.addEventListener('close', () => openSearch(q), { once: true });
      menu.close();
    } else openSearch(q);
    return;
  }
  const guide = (e.target as HTMLElement).closest<HTMLElement>('[data-open-guide]');
  if (guide) {
    e.preventDefault();
    openGuide(guide.dataset.guidePrompt || undefined);
  }
});

/* ---------------- "Ask AI about this" (Shop) ---------------- */
// One tap shows the product's short description; it does not open the assistant.
function setAbout(btn: HTMLElement, open: boolean) {
  const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
  if (!panel) return;
  if (open) {
    document.querySelectorAll<HTMLElement>('[data-ask][aria-expanded="true"]').forEach((b) => b !== btn && setAbout(b, false));
  }
  btn.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  if (open) panel.focus({ preventScroll: true });
}
const askFor = (panel: Element | null) => (panel ? document.querySelector<HTMLElement>(`[data-ask][aria-controls="${panel.id}"]`) : null);
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const ask = t.closest<HTMLElement>('[data-ask]');
  if (ask) return setAbout(ask, ask.getAttribute('aria-expanded') !== 'true');
  if (t.closest('[data-ask-close]')) {
    const btn = askFor(t.closest('.p-about'));
    if (btn) {
      setAbout(btn, false);
      btn.focus({ preventScroll: true });
    }
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const btn = askFor((e.target as HTMLElement).closest?.('.p-about') ?? null);
  if (btn) {
    setAbout(btn, false);
    btn.focus({ preventScroll: true });
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
      ? `${name} selected as your preferred branch.`
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
