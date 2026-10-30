/**
 * Progressive enhancement for the hero stage.
 *  1. HTML ships with a static render of the same 3D model (poster).
 *  2. Once the stage is at least a fifth on screen (it sits below the homepage
 *     slideshow), after `load` + idle time or the first interaction, and only
 *     when WebGL2 is available, the Three.js scene is imported and cross-faded
 *     in over the poster.
 *  3. Save-Data users get an explicit "Load interactive 3D" button instead.
 *  4. Everything is disposed on page hide.
 */
import type { SceneController } from './drill-scene';

const stage = document.querySelector<HTMLElement>('[data-hero-stage]');

/** Cheap feature check; the real context is only created when the scene starts. */
function webgl2Supported(): boolean {
  return typeof window.WebGL2RenderingContext === 'function';
}

function webgl2Works(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function prefersReduced(): boolean {
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

if (stage) {
  const canvas = stage.querySelector<HTMLCanvasElement>('canvas')!;
  const pauseBtn = stage.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const loadBtn = stage.querySelector<HTMLButtonElement>('[data-hero-load]');
  const params = new URLSearchParams(location.search);
  const capture = params.has('poster');
  if (capture) document.documentElement.classList.add('poster-mode');
  let ctrl: SceneController | null = null;
  let userPaused = false;

  const setState = (s: string) => (stage.dataset.state = s);

  const updatePause = () => {
    if (!pauseBtn) return;
    const paused = userPaused;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    const label = pauseBtn.querySelector('[data-label]');
    if (label) label.textContent = paused ? 'Resume 3D motion' : 'Pause 3D motion';
    pauseBtn.querySelector('[data-icon-pause]')?.toggleAttribute('hidden', paused);
    pauseBtn.querySelector('[data-icon-play]')?.toggleAttribute('hidden', !paused);
  };

  const start = async () => {
    if (ctrl) return;
    if (!webgl2Works()) {
      setState('fallback');
      return;
    }
    setState('loading');
    try {
      const { createDrillScene } = await import('./drill-scene');
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const nav = navigator as Navigator & { deviceMemory?: number };
      // Poster captures choose the profile explicitly so each poster matches the
      // device class that will cross-fade from it (phones use the low-power path).
      const lowPower = capture
        ? params.has('lowpower')
        : coarse || (navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || params.has('lowpower');
      ctrl = await createDrillScene(canvas, stage, {
        reducedMotion: prefersReduced(),
        lowPower,
        capture,
        yaw: params.has('yaw') ? (Number(params.get('yaw')) * Math.PI) / 180 : undefined,
        onFirstFrame: () => {
          setState('ready');
          if (capture) document.documentElement.classList.add('poster-ready');
        },
      });
      if (userPaused) ctrl.setPaused(true);
    } catch (err) {
      console.warn('[hero] 3D scene unavailable, keeping static render.', err);
      setState('fallback');
    }
  };

  // Start the scene on the visitor's first interaction, or after a short idle
  // delay. The poster is the same render, so the swap is invisible; this keeps
  // the initial load light on phones and saves battery for passive readers.
  const schedule = () => {
    let started = false;
    const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const;
    const go = () => {
      if (started) return;
      started = true;
      events.forEach((ev) => window.removeEventListener(ev, go));
      void start();
    };
    events.forEach((ev) => window.addEventListener(ev, go, { passive: true, once: true }));
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    const delay = window.matchMedia('(pointer: coarse)').matches ? 3200 : 1600;
    window.setTimeout(() => (ric ? ric(go, { timeout: 1500 }) : go()), delay);
  };

  // Hold everything until the visitor has scrolled a fair part of the stage into view.
  const whenInView = (fn: () => void) => {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.2)) {
          io.disconnect();
          fn();
        }
      },
      { threshold: [0, 0.2] },
    );
    io.observe(stage);
  };

  if (params.has('no3d') || !webgl2Supported()) {
    setState('fallback');
  } else {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData && !capture) {
      setState('deferred');
      loadBtn?.addEventListener('click', () => void start(), { once: true });
    } else if (capture) {
      void start();
    } else if (document.readyState === 'complete') {
      whenInView(schedule);
    } else {
      window.addEventListener('load', () => whenInView(schedule), { once: true });
    }
  }

  pauseBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    ctrl?.setPaused(userPaused);
    updatePause();
  });
  updatePause();

  window.addEventListener('uhc:motion-change', () => ctrl?.setReducedMotion(prefersReduced()));
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () =>
    ctrl?.setReducedMotion(prefersReduced()),
  );

  window.addEventListener('pagehide', (e) => {
    if ((e as PageTransitionEvent).persisted) {
      ctrl?.setPaused(true);
      return;
    }
    ctrl?.dispose();
    ctrl = null;
  });
  window.addEventListener('pageshow', (e) => {
    if ((e as PageTransitionEvent).persisted && ctrl) ctrl.setPaused(userPaused);
  });
}
