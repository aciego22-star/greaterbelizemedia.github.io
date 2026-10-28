/**
 * Progressive enhancement for the hero stage.
 *  1. HTML ships with a static render of the same 3D model (poster).
 *  2. After `load` + idle time, and only when WebGL2 is available, the Three.js
 *     scene is imported and cross-faded in over the poster.
 *  3. Save-Data users get an explicit "Load interactive 3D" button instead.
 *  4. Everything is disposed on page hide.
 */
import type { SceneController } from './drill-scene';

const stage = document.querySelector<HTMLElement>('[data-hero-stage]');

function webgl2Available(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
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
    setState('loading');
    try {
      const { createDrillScene } = await import('./drill-scene');
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowPower =
        coarse || (navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || params.has('lowpower');
      ctrl = createDrillScene(canvas, stage, {
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

  const schedule = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) ric(() => void start(), { timeout: 1500 });
    else window.setTimeout(() => void start(), 400);
  };

  if (params.has('no3d') || !webgl2Available()) {
    setState('fallback');
  } else {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData && !capture) {
      setState('deferred');
      loadBtn?.addEventListener('click', () => void start(), { once: true });
    } else if (capture) {
      void start();
    } else if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
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
