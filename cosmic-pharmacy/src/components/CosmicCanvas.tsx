import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  twinkleSpeed: number;
  /** Drift velocity, px/s. */
  vx: number;
  vy: number;
  /** Brand blue or brand pink. */
  hue: 'blue' | 'pink';
  /** Four-point sparkles echo the diamonds in the logo. */
  sparkle: boolean;
}

interface Nebula {
  baseX: number;
  baseY: number;
  r: number;
  hue: 'blue' | 'cyan' | 'magenta';
  /** Orbit the blob wanders around its base point. */
  orbitX: number;
  orbitY: number;
  periodS: number;
  phase: number;
}

interface Orbit {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tilt: number;
  /** Precession speed, radians/s. */
  precession: number;
  /** Satellite angular speed along the ellipse, radians/s. */
  satSpeed: number;
  satPhase: number;
  satColor: string;
  satCore: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAt: number;
  lifeMs: number;
}

type SkyName = 'sunrise' | 'day' | 'dusk' | 'night';

interface SkyPalette {
  /** Three vertical stops for the ground, top to bottom. */
  base: [string, string, string];
  /** Nebula core colours as "r, g, b", keyed by the hue names above. */
  neb: Record<Nebula['hue'], string>;
  /** Peak nebula opacity. Dark skies carry more colour before it reads as haze. */
  nebAlpha: number;
  /** Star bodies as "r, g, b". */
  star: Record<Star['hue'], string>;
  /** Star opacity range, min to max across the twinkle. */
  starAlpha: [number, number];
  orbit: string;
  trail: string;
}

/**
 * One sky per time of day, drawn from the client's own palette rather than
 * literal sunrise colours: pale rose, bright white, magenta into violet, then
 * violet black. Nothing warm is introduced, so the brand holds all day.
 *
 * Stars carry more opacity on the dark skies because there is more contrast
 * available; by day they stay faint so the white ground still reads as white.
 */
const SKIES: Record<SkyName, SkyPalette> = {
  sunrise: {
    base: ['#f6f4ff', '#fdf2f8', '#fff0f5'],
    neb: { blue: '99, 140, 226', cyan: '120, 196, 235', magenta: '240, 130, 175' },
    nebAlpha: 0.18,
    star: { blue: '110, 150, 220', pink: '226, 120, 165' },
    starAlpha: [0.22, 0.5],
    orbit: 'rgba(200, 130, 175, 0.16)',
    trail: 'rgba(230, 140, 180, 0.75)'
  },
  day: {
    base: ['#ffffff', '#f4f9ff', '#fdfbff'],
    neb: { blue: '22, 121, 209', cyan: '19, 181, 230', magenta: '234, 79, 141' },
    nebAlpha: 0.15,
    star: { blue: '22, 121, 209', pink: '234, 79, 141' },
    starAlpha: [0.3, 0.75],
    orbit: 'rgba(22, 121, 209, 0.14)',
    trail: 'rgba(19, 181, 230, 0.85)'
  },
  dusk: {
    base: ['#1b0d2e', '#331449', '#4b1a42'],
    neb: { blue: '86, 62, 190', cyan: '150, 90, 220', magenta: '226, 70, 140' },
    nebAlpha: 0.42,
    star: { blue: '176, 206, 255', pink: '255, 176, 214' },
    starAlpha: [0.35, 0.95],
    orbit: 'rgba(236, 196, 255, 0.16)',
    trail: 'rgba(255, 190, 225, 0.9)'
  },
  night: {
    base: ['#0a0514', '#110a1f', '#1b0c26'],
    neb: { blue: '58, 46, 150', cyan: '110, 62, 180', magenta: '190, 48, 120' },
    nebAlpha: 0.4,
    star: { blue: '186, 214, 255', pink: '255, 178, 214' },
    starAlpha: [0.32, 1],
    orbit: 'rgba(226, 196, 255, 0.13)',
    trail: 'rgba(214, 190, 255, 0.9)'
  }
};

function currentSky(): SkyPalette {
  const name = document.documentElement.dataset.theme as SkyName | undefined;
  return SKIES[name ?? 'day'] ?? SKIES.day;
}

/**
 * The site's outer visual canvas: a bright cosmic sky in the brand's own
 * colours. Blue and pink starlight drifts across a near-white ground, soft
 * cyan/blue/pink nebulae wander through it, orbital lines precess with
 * satellites riding them, and a shooting star crosses now and then.
 * pointer-events: none, and a single static frame under
 * prefers-reduced-motion.
 */
export function CosmicCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The palette is held in a mutable local rather than a prop so that a theme
    // change swaps colours on the next frame without regenerating the stars,
    // which would make them jump.
    let sky = currentSky();
    const themeWatcher = new MutationObserver(() => {
      sky = currentSky();
      if (reduceMotion) draw(0, 0); // static mode paints once, so repaint on change
    });
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rand = Math.random;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    let orbits: Orbit[] = [];
    let shooting: ShootingStar | null = null;
    let nextShootAt = 6000 + rand() * 6000;
    let raf = 0;
    let lastT = 0;

    function resize() {
      // clientWidth/Height track the layout viewport reliably on mobile
      // (innerWidth can report a transient pre-viewport-meta width).
      width = document.documentElement.clientWidth;
      height = document.documentElement.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = width < 720 ? 90 : 170;
      stars = Array.from({ length: starCount }, () => {
        const r = 0.7 + rand() * 1.9;
        // Bigger (nearer) stars drift faster — a gentle parallax current
        // flowing toward the lower-left.
        const speed = (3 + rand() * 5) * (r / 1.2);
        const angle = Math.PI * (0.9 + rand() * 0.25);
        return {
          x: rand() * width,
          y: rand() * height,
          r,
          phase: rand() * Math.PI * 2,
          twinkleSpeed: 0.5 + rand() * 1.2,
          vx: Math.cos(angle) * speed,
          vy: -Math.sin(angle) * speed,
          hue: rand() > 0.42 ? 'blue' : 'pink',
          sparkle: rand() > 0.86
        };
      });

      const d = Math.max(width, height);
      nebulae = [
        { baseX: width * 0.8, baseY: height * 0.14, r: d * 0.5, hue: 'blue', orbitX: width * 0.14, orbitY: height * 0.1, periodS: 34, phase: 0 },
        { baseX: width * 0.09, baseY: height * 0.7, r: d * 0.44, hue: 'magenta', orbitX: width * 0.12, orbitY: height * 0.12, periodS: 46, phase: 2.1 },
        { baseX: width * 0.52, baseY: height * 1.02, r: d * 0.4, hue: 'cyan', orbitX: width * 0.16, orbitY: height * 0.08, periodS: 40, phase: 4.2 }
      ];

      orbits = [
        {
          cx: width * 0.85,
          cy: height * 0.16,
          rx: width * 0.3,
          ry: width * 0.105,
          tilt: -0.35,
          precession: 0.02,
          satSpeed: 0.22,
          satPhase: rand() * Math.PI * 2,
          satColor: 'rgba(234, 79, 141, 0.5)',
          satCore: '#ea4f8d'
        },
        {
          cx: width * 0.12,
          cy: height * 0.84,
          rx: width * 0.25,
          ry: width * 0.09,
          tilt: 0.4,
          precession: -0.016,
          satSpeed: 0.17,
          satPhase: rand() * Math.PI * 2,
          satColor: 'rgba(22, 121, 209, 0.5)',
          satCore: '#1679d1'
        }
      ];
    }

    function draw(tMs: number, dtS: number) {
      const tS = tMs / 1000;
      ctx!.clearRect(0, 0, width, height);

      // Base sky for the current time of day
      const base = ctx!.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, sky.base[0]);
      base.addColorStop(0.45, sky.base[1]);
      base.addColorStop(1, sky.base[2]);
      ctx!.fillStyle = base;
      ctx!.fillRect(0, 0, width, height);

      // Nebulae — clearly wandering fields of colour
      for (const n of nebulae) {
        const a = n.phase + (tS * Math.PI * 2) / n.periodS;
        const nx = n.baseX + Math.cos(a) * n.orbitX;
        const ny = n.baseY + Math.sin(a * 0.8) * n.orbitY;
        // Slow breathing of intensity, offset per nebula
        const breathe = 0.85 + 0.15 * Math.sin(a * 0.5);
        const g = ctx!.createRadialGradient(nx, ny, 0, nx, ny, n.r);
        const rgb = sky.neb[n.hue];
        const peak = sky.nebAlpha * breathe;
        g.addColorStop(0, `rgba(${rgb}, ${peak.toFixed(3)})`);
        g.addColorStop(0.55, `rgba(${rgb}, ${(peak * 0.33).toFixed(3)})`);
        // Fading to the nebula's own hue at zero alpha, not to transparent
        // white: on the dark skies a white stop drags the midpoint through grey
        // and leaves a haze around every blob.
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      // Orbital lines — slow precession, with a satellite riding each orbit
      for (const o of orbits) {
        const tilt = o.tilt + tS * o.precession;
        ctx!.save();
        ctx!.strokeStyle = sky.orbit;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.ellipse(o.cx, o.cy, o.rx, o.ry, tilt, 0, Math.PI * 2);
        ctx!.stroke();

        // Satellite position on the (rotated) ellipse
        const sa = o.satPhase + tS * o.satSpeed;
        const ex = Math.cos(sa) * o.rx;
        const ey = Math.sin(sa) * o.ry;
        const sx = o.cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
        const sy = o.cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
        const glow = ctx!.createRadialGradient(sx, sy, 0, sx, sy, 10);
        glow.addColorStop(0, o.satColor);
        glow.addColorStop(1, o.satColor.replace(/[\d.]+\)$/, '0)'));
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = o.satCore;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // Stars — drifting current + twinkle
      for (const s of stars) {
        if (dtS > 0) {
          s.x += s.vx * dtS;
          s.y += s.vy * dtS;
          if (s.x < -4) s.x += width + 8;
          if (s.x > width + 4) s.x -= width + 8;
          if (s.y < -4) s.y += height + 8;
          if (s.y > height + 4) s.y -= height + 8;
        }
        const [lo, hi] = sky.starAlpha;
        const alpha = reduceMotion ? (lo + hi) / 2 : lo + (hi - lo) * (0.5 + 0.5 * Math.sin(s.phase + tS * s.twinkleSpeed));
        const rgb = sky.star[s.hue];
        ctx!.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
        if (s.sparkle) {
          // Four-point diamond, the same motif as the logo's sparkles.
          const a = s.r * 2.6;
          ctx!.beginPath();
          ctx!.moveTo(s.x, s.y - a);
          ctx!.quadraticCurveTo(s.x, s.y, s.x + a, s.y);
          ctx!.quadraticCurveTo(s.x, s.y, s.x, s.y + a);
          ctx!.quadraticCurveTo(s.x, s.y, s.x - a, s.y);
          ctx!.quadraticCurveTo(s.x, s.y, s.x, s.y - a);
          ctx!.fill();
        } else {
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // Shooting star — a brief bright streak every so often
      if (!reduceMotion) {
        if (!shooting && tMs >= nextShootAt) {
          const fromLeft = rand() > 0.5;
          shooting = {
            x: fromLeft ? -30 : width * (0.4 + rand() * 0.55),
            y: height * rand() * 0.35,
            vx: (fromLeft ? 1 : -1) * (520 + rand() * 260),
            vy: 160 + rand() * 140,
            bornAt: tMs,
            lifeMs: 900 + rand() * 400
          };
        }
        if (shooting) {
          const age = tMs - shooting.bornAt;
          if (age > shooting.lifeMs || shooting.x < -80 || shooting.x > width + 80 || shooting.y > height + 80) {
            shooting = null;
            nextShootAt = tMs + 9000 + rand() * 9000;
          } else {
            shooting.x += shooting.vx * dtS;
            shooting.y += shooting.vy * dtS;
            const fade = 1 - age / shooting.lifeMs;
            const tailX = shooting.x - shooting.vx * 0.14;
            const tailY = shooting.y - shooting.vy * 0.14;
            const trail = ctx!.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
            trail.addColorStop(0, sky.trail.replace(/[\d.]+\)$/, `${fade.toFixed(3)})`));
            trail.addColorStop(1, sky.trail.replace(/[\d.]+\)$/, '0)'));
            ctx!.strokeStyle = trail;
            ctx!.lineWidth = 2;
            ctx!.lineCap = 'round';
            ctx!.beginPath();
            ctx!.moveTo(shooting.x, shooting.y);
            ctx!.lineTo(tailX, tailY);
            ctx!.stroke();
          }
        }
      }
    }

    function loop(tMs: number) {
      const dtS = lastT ? Math.min((tMs - lastT) / 1000, 0.1) : 0;
      lastT = tMs;
      draw(tMs, dtS);
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    if (reduceMotion) {
      draw(0, 0); // single static frame
    } else {
      raf = window.requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (reduceMotion) draw(0, 0);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      themeWatcher.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="cosmic-canvas" aria-hidden="true" />;
}
