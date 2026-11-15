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
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        e.stopPropagation();
        setOpen(false);
        button.focus();
      }
    });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) setOpen(false); });
    const hoverCapable = window.matchMedia('(hover: hover) and (min-width: 1100px)');
    item.addEventListener('mouseenter', () => { if (hoverCapable.matches) setOpen(true); });
    item.addEventListener('mouseleave', () => { if (hoverCapable.matches) setOpen(false); });
  }
}

/* ------------------------------------------------------------ Hero video */

function initHeroVideo() {
  const wrap = document.querySelector('[data-hero-video]');
  if (!wrap) return;
  const video = wrap.querySelector('video');
  const button = wrap.querySelector('.video-toggle');
  const showPoster = () => { video.hidden = true; button.hidden = true; };
  const sync = () => button.setAttribute('data-paused', String(video.paused));

  video.addEventListener('error', showPoster, true);
  video.querySelectorAll('source').forEach((s) => s.addEventListener('error', () => {
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) showPoster();
  }));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  button.addEventListener('click', () => (video.paused ? video.play().catch(showPoster) : video.pause()));

  // Reduced motion: keep the poster and let people start playback themselves.
  if (reducedMotion.matches) {
    video.hidden = true;
    button.hidden = false;
    button.setAttribute('data-paused', 'true');
    button.addEventListener('click', () => { video.hidden = false; }, { once: true });
    return;
  }
  video.preload = 'auto';
  button.hidden = false;
  video.play().then(sync).catch(() => {
    // Autoplay blocked: keep the poster visible, offer a play button.
    video.hidden = true;
    button.setAttribute('data-paused', 'true');
    button.addEventListener('click', () => { video.hidden = false; }, { once: true });
  });
  reducedMotion.addEventListener('change', (e) => { if (e.matches) video.pause(); });
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
initHeroVideo();
initGallery();
initBookingPage();
initAssistant();
