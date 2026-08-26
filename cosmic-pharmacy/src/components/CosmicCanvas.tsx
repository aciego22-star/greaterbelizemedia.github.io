import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface Nebula {
  x: number;
  y: number;
  r: number;
  hue: 'blue' | 'magenta';
  dx: number;
  dy: number;
}

/**
 * The site's outer visual canvas: layered midnight gradients, slow nebula
 * drift, sparse stars and occasional orbital lines. Original composition —
 * deliberately not the coming-soon page's treatment.
 * Fixed, pointer-events: none, and a single static frame under
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
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    let raf = 0;
    let t = 0;

    const rand = Math.random;

    function resize() {
      // clientWidth/Height track the layout viewport reliably on mobile
      // (innerWidth can report a transient pre-viewport-meta width).
      width = document.documentElement.clientWidth;
      height = document.documentElement.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = width < 720 ? 70 : 140;
      stars = Array.from({ length: starCount }, () => ({
        x: rand() * width,
        y: rand() * height,
        r: 0.4 + rand() * 1.3,
        phase: rand() * Math.PI * 2,
        speed: 0.3 + rand() * 0.7
      }));
      nebulae = [
        { x: width * 0.82, y: height * 0.12, r: Math.max(width, height) * 0.45, hue: 'blue', dx: 0.012, dy: 0.008 },
        { x: width * 0.08, y: height * 0.75, r: Math.max(width, height) * 0.4, hue: 'magenta', dx: -0.01, dy: -0.006 },
        { x: width * 0.45, y: height * 1.05, r: Math.max(width, height) * 0.35, hue: 'blue', dx: 0.007, dy: -0.01 }
      ];
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // Base midnight gradient
      const base = ctx!.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, '#070b22');
      base.addColorStop(0.5, '#0a0f2e');
      base.addColorStop(1, '#070b22');
      ctx!.fillStyle = base;
      ctx!.fillRect(0, 0, width, height);

      // Nebulae — slow drift
      for (const n of nebulae) {
        const nx = n.x + Math.sin(time * n.dx * 0.05) * 60;
        const ny = n.y + Math.cos(time * n.dy * 0.05) * 40;
        const g = ctx!.createRadialGradient(nx, ny, 0, nx, ny, n.r);
        if (n.hue === 'blue') {
          g.addColorStop(0, 'rgba(61, 109, 242, 0.16)');
          g.addColorStop(0.55, 'rgba(43, 81, 196, 0.06)');
        } else {
          g.addColorStop(0, 'rgba(214, 64, 159, 0.12)');
          g.addColorStop(0.55, 'rgba(176, 47, 131, 0.05)');
        }
        g.addColorStop(1, 'rgba(7, 11, 34, 0)');
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      // Orbital lines — faint, sparse
      ctx!.save();
      ctx!.strokeStyle = 'rgba(170, 177, 214, 0.08)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.ellipse(width * 0.85, height * 0.15, width * 0.32, width * 0.11, -0.35, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.ellipse(width * 0.1, height * 0.85, width * 0.26, width * 0.09, 0.4, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // Stars — gentle twinkle
      for (const s of stars) {
        const alpha = reduceMotion ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(s.phase + time * 0.0006 * s.speed));
        ctx!.fillStyle = `rgba(242, 244, 255, ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(time: number) {
      t = time;
      draw(t);
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    if (reduceMotion) {
      draw(0); // single static frame
    } else {
      raf = window.requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (reduceMotion) draw(t);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="cosmic-canvas" aria-hidden="true" />;
}
