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
}

interface Nebula {
  baseX: number;
  baseY: number;
  r: number;
  hue: 'blue' | 'magenta';
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
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAt: number;
  lifeMs: number;
}

/**
 * The site's outer visual canvas: a living cosmos — drifting starfield,
 * wandering nebulae, precessing orbital lines with satellites, and the
 * occasional shooting star. Original composition (not the coming-soon
 * page's), pointer-events: none, and a single static frame under
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

      const starCount = width < 720 ? 80 : 160;
      stars = Array.from({ length: starCount }, () => {
        const r = 0.4 + rand() * 1.5;
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
          vy: -Math.sin(angle) * speed
        };
      });

      const d = Math.max(width, height);
      nebulae = [
        { baseX: width * 0.8, baseY: height * 0.15, r: d * 0.48, hue: 'blue', orbitX: width * 0.14, orbitY: height * 0.1, periodS: 34, phase: 0 },
        { baseX: width * 0.1, baseY: height * 0.72, r: d * 0.42, hue: 'magenta', orbitX: width * 0.12, orbitY: height * 0.12, periodS: 46, phase: 2.1 },
        { baseX: width * 0.5, baseY: height * 1.0, r: d * 0.38, hue: 'blue', orbitX: width * 0.16, orbitY: height * 0.08, periodS: 40, phase: 4.2 }
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
          satColor: 'rgba(214, 64, 159, 0.85)'
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
          satColor: 'rgba(122, 158, 255, 0.85)'
        }
      ];
    }

    function draw(tMs: number, dtS: number) {
      const tS = tMs / 1000;
      ctx!.clearRect(0, 0, width, height);

      // Base midnight gradient
      const base = ctx!.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, '#070b22');
      base.addColorStop(0.5, '#0a0f2e');
      base.addColorStop(1, '#070b22');
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
        if (n.hue === 'blue') {
          g.addColorStop(0, `rgba(61, 109, 242, ${(0.2 * breathe).toFixed(3)})`);
          g.addColorStop(0.55, `rgba(43, 81, 196, ${(0.08 * breathe).toFixed(3)})`);
        } else {
          g.addColorStop(0, `rgba(214, 64, 159, ${(0.16 * breathe).toFixed(3)})`);
          g.addColorStop(0.55, `rgba(176, 47, 131, ${(0.06 * breathe).toFixed(3)})`);
        }
        g.addColorStop(1, 'rgba(7, 11, 34, 0)');
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      // Orbital lines — slow precession, with a satellite riding each orbit
      for (const o of orbits) {
        const tilt = o.tilt + tS * o.precession;
        ctx!.save();
        ctx!.strokeStyle = 'rgba(170, 177, 214, 0.1)';
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
        const glow = ctx!.createRadialGradient(sx, sy, 0, sx, sy, 9);
        glow.addColorStop(0, o.satColor);
        glow.addColorStop(1, 'rgba(7, 11, 34, 0)');
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 9, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = '#f2f4ff';
        ctx!.beginPath();
        ctx!.arc(sx, sy, 1.8, 0, Math.PI * 2);
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
        const alpha = reduceMotion ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(s.phase + tS * s.twinkleSpeed));
        ctx!.fillStyle = `rgba(242, 244, 255, ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
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
            trail.addColorStop(0, `rgba(242, 244, 255, ${(0.9 * fade).toFixed(3)})`);
            trail.addColorStop(1, 'rgba(242, 244, 255, 0)');
            ctx!.strokeStyle = trail;
            ctx!.lineWidth = 1.6;
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
    };
  }, []);

  return <canvas ref={ref} className="cosmic-canvas" aria-hidden="true" />;
}
