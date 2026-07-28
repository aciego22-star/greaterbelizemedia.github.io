/**
 * Duke Marine, client interactions & motion.
 * Vanilla, dependency-free, and fully respects prefers-reduced-motion.
 * ---------------------------------------------------------------------------
 *  • Scroll-reveal via IntersectionObserver
 *  • Sticky header state on scroll
 *  • Parallax on [data-parallax]
 *  • Animated counters on [data-count]
 *  • Mobile nav + mega-menu accessibility
 *  • Catalog category filtering
 */

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

/* ---- Scroll reveal ----------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

/* ---- Sticky header ----------------------------------------------------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    // hide on scroll-down, show on scroll-up (past the fold)
    if (y > 400) {
      header.classList.toggle('is-hidden', y > last && y - last > 4);
    } else {
      header.classList.remove('is-hidden');
    }
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Parallax ---------------------------------------------------------- */
function initParallax() {
  if (reduceMotion) return;
  const layers = document.querySelectorAll<HTMLElement>('[data-parallax]');
  if (!layers.length) return;
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    layers.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax || '0.15');
      const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  update();
}

/* ---- Counters ---------------------------------------------------------- */
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length) return;
  const run = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}

/* ---- Navigation (mobile + mega-menu) ----------------------------------- */
function initNav() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const body = document.body;
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('nav-open', open);
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('nav-open');
      }),
    );
  }

  // Mega-menu: click on mobile, hover on desktop (CSS handles hover).
  document
    .querySelectorAll<HTMLButtonElement>('[data-mega-toggle]')
    .forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (window.matchMedia('(min-width: 981px)').matches) return;
        e.preventDefault();
        const parent = btn.closest('[data-mega]');
        const open = parent?.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(!!open));
      });
    });

  // Close menus on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav?.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
      document
        .querySelectorAll('[data-mega].is-open')
        .forEach((m) => m.classList.remove('is-open'));
    }
  });
}

/* ---- Catalog filtering ------------------------------------------------- */
function initFilters() {
  const groups = document.querySelectorAll<HTMLElement>('[data-filter-group]');
  groups.forEach((group) => {
    const buttons = group.querySelectorAll<HTMLButtonElement>('[data-filter]');
    const targetSel = group.dataset.filterTarget;
    const items = targetSel
      ? document.querySelectorAll<HTMLElement>(`${targetSel} [data-cat]`)
      : [];
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.filter;
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
        items.forEach((item) => {
          const match = val === 'all' || item.dataset.cat === val;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  });
}

/* ---- Year stamp -------------------------------------------------------- */
function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function boot() {
  initReveal();
  initHeader();
  initParallax();
  initCounters();
  initNav();
  initFilters();
  initYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
