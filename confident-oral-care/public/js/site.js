import { initAssistant } from './assistant.js';
import { mountBooking } from './booking.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------ Navigation */

function initNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  for (const item of document.querySelectorAll('.has-sub')) {
    const button = item.querySelector('.sub-toggle');
    const menu = item.querySelector('.sub-menu');
    const setOpen = (open) => {
      button.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };
    let openedByHover = false;
    button.addEventListener('click', () => {
      // A mouse user who hovered the menu open and then clicks the arrow expects it to stay open.
      if (openedByHover) { openedByHover = false; setOpen(true); return; }
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        e.stopPropagation();
        setOpen(false);
        button.focus();
      }
    });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) setOpen(false); });
    const hoverCapable = window.matchMedia('(hover: hover) and (min-width: 1100px)');
    item.addEventListener('mouseenter', () => {
      if (hoverCapable.matches && button.getAttribute('aria-expanded') !== 'true') { openedByHover = true; setOpen(true); }
    });
    item.addEventListener('mouseleave', () => { if (hoverCapable.matches) { openedByHover = false; setOpen(false); } });
  }
}

/* ------------------------------------------------------------- Hero slides */

// Photos change every few seconds; the video plays to the end, then the show returns to the first
// photo. The video tries to play with sound. Browsers only allow sound after the visitor has
// interacted with the page, so until then it plays muted with a small "Tap for sound" button,
// and the first tap or key press anywhere turns the sound on.
function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const dots = [...hero.querySelectorAll('[data-hero-dot]')];
  const video = hero.querySelector('.hero-video');
  const soundBtn = hero.querySelector('[data-hero-sound]');
  const pauseBtn = hero.querySelector('[data-hero-pause]');
  const interval = Number(hero.dataset.interval || 6) * 1000;
  let index = 0;
  let timer = null;
  let paused = reducedMotion.matches;
  let held = false; // keyboard focus inside the hero
  let wantSound = true;
  let interacted = false;

  const isVideoSlide = (i = index) => Boolean(video) && slides[i].contains(video);

  function updateSound() {
    if (!soundBtn) return;
    soundBtn.hidden = !isVideoSlide();
    soundBtn.classList.toggle('is-on', Boolean(video) && !video.muted);
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || held || document.hidden) return;
    if (isVideoSlide() && !video.paused) return; // advances on "ended"
    timer = setTimeout(() => show(index + 1), interval);
  }

  async function playVideo() {
    if (!video) return;
    video.preload = 'auto';
    video.currentTime = 0;
    video.muted = !(wantSound && interacted);
    try {
      await video.play();
    } catch {
      if (!video.muted) {
        video.muted = true; // sound blocked until the visitor interacts
        try { await video.play(); } catch { /* playback blocked entirely: the poster stays */ }
      }
    }
    // Some browsers allow sound without a tap: try once.
    if (video.muted && wantSound && !interacted && !video.paused) {
      video.muted = false;
      setTimeout(() => { if (video.paused) { video.muted = true; video.play().catch(() => {}); } updateSound(); }, 150);
    }
    updateSound();
    schedule();
  }

  function show(next) {
    const prev = index;
    index = (next + slides.length) % slides.length;
    if (prev !== index) {
      slides[prev].classList.remove('is-active');
      slides[prev].setAttribute('aria-hidden', 'true');
      dots[prev]?.removeAttribute('aria-current');
    }
    slides[index].classList.add('is-active');
    slides[index].removeAttribute('aria-hidden');
    dots[index]?.setAttribute('aria-current', 'true');
    if (video) {
      if (isVideoSlide()) {
        if (!paused) playVideo();
      } else {
        video.pause();
        if (isVideoSlide(index + 1)) video.preload = 'auto'; // warm up before its turn
      }
    }
    updateSound();
    schedule();
  }

  function setPaused(value) {
    paused = value;
    hero.classList.toggle('is-paused', paused);
    if (video && isVideoSlide()) {
      if (paused) video.pause();
      else playVideo();
    }
    schedule();
  }

  hero.querySelector('[data-hero-prev]')?.addEventListener('click', () => show(index - 1));
  hero.querySelector('[data-hero-next]')?.addEventListener('click', () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  pauseBtn?.addEventListener('click', () => setPaused(!paused));
  soundBtn?.addEventListener('click', () => {
    interacted = true;
    wantSound = video.muted;
    video.muted = !wantSound;
    if (video.paused && !paused) video.play().catch(() => {});
    updateSound();
  });

  if (video) {
    video.addEventListener('ended', () => show(index + 1));
    video.addEventListener('error', () => {
      // Missing or unplayable video: drop its slide from the rotation.
      const i = slides.findIndex((sl) => sl.contains(video));
      if (i < 0) return;
      slides[i].remove();
      dots[i]?.remove();
      slides.splice(i, 1);
      dots.splice(i, 1);
      soundBtn?.remove();
      if (index >= slides.length) show(0);
    }, true);
    // The first tap or key press anywhere unlocks sound for the video.
    const unlock = (e) => {
      if (e.target.closest?.('[data-hero-sound]')) return;
      interacted = true;
      if (isVideoSlide() && wantSound && video.muted && !video.paused) video.muted = false;
      updateSound();
      ['pointerdown', 'keydown'].forEach((t) => document.removeEventListener(t, unlock, true));
    };
    ['pointerdown', 'keydown'].forEach((t) => document.addEventListener(t, unlock, true));
  }

  // Hold the slideshow while keyboard focus is on the hero controls or buttons (the hero fills the
  // screen, so hovering doesn't pause it; the pause button does).
  hero.addEventListener('focusin', () => { held = hero.matches(':focus-within:has(:focus-visible)'); schedule(); });
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) { held = false; schedule(); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(timer); if (video && !video.paused) video.pause(); }
    else if (!paused && isVideoSlide()) video.play().catch(() => {});
    else schedule();
  });

  // Swipe on touch screens.
  let startX = null;
  hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  reducedMotion.addEventListener('change', (e) => { if (e.matches) setPaused(true); });
  hero.classList.toggle('is-paused', paused);
  show(0);
}

/* --------------------------------------------------------------- Gallery */

function initGallery() {
  const grid = document.querySelector('[data-gallery]');
  const dialog = document.querySelector('[data-lightbox]');
  if (!grid || !dialog) return;
  const items = [...grid.querySelectorAll('.gallery-item')];
  const imageWrap = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const picture = items[index].querySelector('picture').cloneNode(true);
    picture.querySelector('img').removeAttribute('loading');
    picture.querySelectorAll('[sizes]').forEach((el) => el.setAttribute('sizes', '100vw'));
    imageWrap.replaceChildren(picture);
    caption.textContent = `${items[index].querySelector('figcaption').textContent} (${index + 1} of ${items.length})`;
  };

  grid.addEventListener('click', (e) => {
    const button = e.target.closest('.gallery-open');
    if (!button) return;
    opener = button;
    show(Number(button.dataset.index));
    dialog.showModal();
    dialog.querySelector('[data-lightbox-close]').focus();
  });
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.classList.contains('lightbox-inner')) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());
}

/* -------------------------------------------------------------- Booking */

function initBookingPage() {
  const container = document.querySelector('[data-booking]');
  if (!container) return;
  const params = new URLSearchParams(location.search);
  mountBooking(container, {
    initialVisit: params.get('visit'),
    initialService: params.get('service'),
    source: 'form',
    headingLevel: 3,
  });
}

initNav();
initHero();
initGallery();
initBookingPage();
initAssistant();
