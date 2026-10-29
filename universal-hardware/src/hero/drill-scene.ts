/**
 * Signature hero scene: the procedural Makita drill on a studio plinth.
 * Loaded lazily (dynamic import) only after the page's primary content has
 * rendered. Exposes a small controller so the host can pause, resume,
 * render a still frame and dispose everything on navigation.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BackSide,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three';
import { buildDrill } from './drill-model';

export interface SceneOptions {
  reducedMotion: boolean;
  lowPower: boolean;
  /** Poster/capture mode: fixed pose, preserve drawing buffer, no idle motion. */
  capture?: boolean;
  /** Optional fixed yaw (radians) for capture/QA renders. */
  yaw?: number;
  onFirstFrame?: () => void;
}

export interface SceneController {
  setPaused(p: boolean): void;
  isPaused(): boolean;
  setReducedMotion(r: boolean): void;
  resize(): void;
  dispose(): void;
}

function buildEnvironment(renderer: WebGLRenderer): Texture {
  // A dark studio with long softboxes and two blue strip lights. Rendered
  // once into a PMREM cube for crisp, product-photography reflections.
  const pmrem = new PMREMGenerator(renderer);
  const env = new Scene();
  const disposables: { dispose(): void }[] = [];
  const roomGeo = new SphereGeometry(12, 32, 16);
  const roomMat = new MeshBasicMaterial({ color: new Color('#0b121b'), side: BackSide });
  env.add(new Mesh(roomGeo, roomMat));
  disposables.push(roomGeo, roomMat);
  const panel = (w: number, h: number, color: string, intensity: number, pos: [number, number, number]) => {
    const g = new PlaneGeometry(w, h);
    const m = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide });
    const mesh = new Mesh(g, m);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
    disposables.push(g, m);
  };
  panel(9, 1.6, '#ffffff', 5.5, [0, 7, 1.5]); // overhead strip
  panel(1.6, 7, '#ffffff', 3.2, [-7, 1.5, 2.5]); // left key strip
  panel(5, 3, '#eaf2fa', 1.6, [1.5, 1.5, 8]); // front fill
  panel(1.2, 7, '#5fa8f0', 4.5, [7, 1, -2]); // right blue strip
  panel(4, 1.2, '#2f7fd0', 3.5, [-4, -0.5, -7]); // rear blue kicker
  panel(10, 10, '#0e1824', 1, [0, -8, 0]); // floor bounce
  const rt = pmrem.fromScene(env, 0.03);
  disposables.forEach((d) => d.dispose());
  pmrem.dispose();
  return rt.texture;
}

function floorMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color('#6aa6dd') },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vPos;
      float line(vec2 p, float scale) {
        vec2 q = p / scale;
        vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        vec2 p = vPos.xz;
        float r = length(p);
        float fade = smoothstep(8.0, 1.2, r);
        float minor = line(p, 0.5) * 0.18;
        float major = line(p, 2.5) * 0.34;
        float rq = (r - uTime * 0.06) / 0.6;
        float ringD = abs(fract(rq - 0.5) - 0.5) / fwidth(rq);
        float ring = (1.0 - min(ringD, 1.0)) * smoothstep(2.0, 2.6, r) * smoothstep(6.5, 3.0, r) * 0.32;
        float glow = smoothstep(3.2, 0.0, r) * 0.10;
        float a = (minor + major + ring) * fade + glow;
        gl_FragColor = vec4(uColor, a * uOpacity);
      }
    `,
  });
}

/** Give the main thread back between heavy setup steps (keeps input responsive). */
const yieldToMain = () =>
  new Promise<void>((resolve) => {
    const sch = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (sch?.yield) sch.yield().then(resolve);
    else setTimeout(resolve, 0);
  });

export async function createDrillScene(canvas: HTMLCanvasElement, host: HTMLElement, opts: SceneOptions): Promise<SceneController> {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: opts.lowPower ? 'low-power' : 'high-performance',
    preserveDrawingBuffer: !!opts.capture,
  });
  const maxDpr = opts.capture ? 3 : opts.lowPower ? 1.5 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  // Low-power devices rely on the baked contact shadow only.
  renderer.shadowMap.enabled = !opts.lowPower;
  renderer.shadowMap.type = PCFSoftShadowMap;

  await yieldToMain();
  const scene = new Scene();
  const envTex = buildEnvironment(renderer);
  await yieldToMain();
  scene.environment = envTex;
  scene.environmentIntensity = 1.1;

  const camera = new PerspectiveCamera(26, 1, 0.1, 60);

  /* Lights */
  const key = new DirectionalLight('#fff6ec', 2.8);
  key.position.set(-3.2, 6.5, 4.5);
  key.castShadow = !opts.lowPower;
  key.shadow.mapSize.set(opts.lowPower ? 512 : 1024, opts.lowPower ? 512 : 1024);
  key.shadow.camera.left = -2.4;
  key.shadow.camera.right = 2.4;
  key.shadow.camera.top = 2.4;
  key.shadow.camera.bottom = -2.4;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new DirectionalLight('#5aa3ea', 3.2);
  rim.position.set(4.5, 2.5, -4);
  scene.add(rim);
  const rim2 = new DirectionalLight('#8fc2f0', 1.4);
  rim2.position.set(-4.5, 1.2, -3.5);
  scene.add(rim2);
  const rim3 = new DirectionalLight('#e6f0fa', 2.2);
  rim3.position.set(-2.5, 4.5, -5.5);
  scene.add(rim3);
  scene.add(new HemisphereLight('#cfe3f7', '#0b1520', 0.35));
  scene.add(new AmbientLight('#1a2a3a', 0.25));

  /* Plinth */
  const owned: { dispose(): void }[] = [];
  const plinthMat = new MeshPhysicalMaterial({
    color: '#111a24',
    roughness: 0.28,
    metalness: 0.55,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
  });
  const plinthProfile = [
    [0, 0],
    [1.66, 0],
    [1.7, -0.012],
    [1.72, -0.04],
    [1.72, -0.2],
    [1.7, -0.23],
    [0, -0.23],
  ].map(([r, y]) => new Vector2(r, y));
  const plinthGeo = new LatheGeometry(plinthProfile, opts.lowPower ? 64 : 128);
  const plinth = new Mesh(plinthGeo, plinthMat);
  plinth.receiveShadow = true;
  scene.add(plinth);
  const baseMat = new MeshPhysicalMaterial({ color: '#0c131b', roughness: 0.55, metalness: 0.35 });
  const baseGeo = new LatheGeometry(
    [
      [0, -0.23],
      [2.05, -0.23],
      [2.08, -0.25],
      [2.08, -0.3],
      [0, -0.3],
    ].map(([r, y]) => new Vector2(r, y)),
    opts.lowPower ? 64 : 128,
  );
  const base = new Mesh(baseGeo, baseMat);
  base.receiveShadow = true;
  scene.add(base);
  const glowMat = new MeshBasicMaterial({ color: new Color('#5592cb').multiplyScalar(1.15), toneMapped: false });
  const glowGeo = new TorusGeometry(1.7, 0.0055, 8, opts.lowPower ? 96 : 192);
  glowGeo.rotateX(Math.PI / 2);
  const glow = new Mesh(glowGeo, glowMat);
  glow.position.y = -0.03;
  scene.add(glow);
  const glow2Geo = new TorusGeometry(2.08, 0.005, 6, opts.lowPower ? 96 : 192);
  glow2Geo.rotateX(Math.PI / 2);
  const glow2Mat = new MeshBasicMaterial({ color: new Color('#3d7fc0').multiplyScalar(0.55), toneMapped: false });
  const glow2 = new Mesh(glow2Geo, glow2Mat);
  glow2.position.y = -0.25;
  scene.add(glow2);
  owned.push(plinthMat, plinthGeo, baseMat, baseGeo, glowMat, glowGeo, glow2Geo, glow2Mat);

  /* Floor grid */
  const floorMat = floorMaterial();
  const floorGeo = new CircleGeometry(9, 96);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new Mesh(floorGeo, floorMat);
  floor.position.y = -0.3;
  floor.renderOrder = -2;
  scene.add(floor);
  owned.push(floorMat, floorGeo);

  /* Drill */
  await yieldToMain();
  const drill = await buildDrill({ lowDetail: opts.lowPower });
  await yieldToMain();
  const pivot = new Group();
  pivot.add(drill.group);
  scene.add(pivot);
  const target = { x: 0, y: 1.1, z: 0 };

  /* Framing */
  function frame() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // Fit the object (approx. radius) in view for both portrait and landscape.
    // Small stages get a little more headroom so the HUD never crowds the model.
    const small = w < 640;
    const radius = small ? 2.45 : 2.28;
    const ty = small ? target.y + 0.12 : target.y;
    const vFov = MathUtils.degToRad(camera.fov);
    const distV = radius / Math.sin(vFov / 2);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distH = radius / Math.sin(hFov / 2);
    const dist = Math.max(distV, distH) * (aspect < 1 ? 0.98 : 0.94);
    const elev = MathUtils.degToRad(15);
    camera.position.set(0, ty + Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(target.x, ty, target.z);
    camera.updateProjectionMatrix();
  }
  frame();

  /* Motion state */
  let reduced = opts.reducedMotion || !!opts.capture;
  let paused = false;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let t = 0;
  // The product photo's own view faces the camera.
  const baseYaw = opts.yaw ?? 0;
  let yaw = baseYaw;
  let pitch = 0;
  let userYaw = 0;
  let userVel = 0;
  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;
  // The static poster shows the resting pose, so the live scene starts there
  // and eases into idle motion — no jump when it cross-fades in.
  let intro = 1;
  let dragging = false;
  let lastDragX = 0;
  let firstFrame = true;
  let slowFrames = 0;

  function applyPose() {
    // `t` only advances while motion is allowed, so pausing freezes the pose
    // exactly where it is instead of snapping back.
    // Gentle sway: the drill stays close to the product photo's own view.
    const sway = Math.sin(t * 0.32) * 0.28;
    const e = 1 - Math.pow(1 - intro, 3);
    yaw = baseYaw + sway + userYaw + px * 0.32 + (1 - e) * -0.9;
    pitch = py * 0.1 + Math.sin(t * 0.5) * 0.025;
    pivot.rotation.set(pitch, yaw, 0);
    drill.group.position.y = (1 - e) * -0.35 + Math.sin(t * 0.8) * 0.025;
    key.intensity = 2.8 * (0.35 + 0.65 * e);
    rim.intensity = 3.2 * e;
  }

  function render() {
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      opts.onFirstFrame?.();
    }
  }

  function tick(now: number) {
    raf = 0;
    // Cap low-power devices at ~30 fps to save battery.
    if (opts.lowPower && now - last < 30 && !dragging) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const animating = !(reduced || paused);
    if (animating) t += dt;
    if (intro < 1) intro = Math.min(1, intro + dt / (reduced ? 0.001 : 1.6));
    // Damped pointer influence and drag inertia.
    const k = 1 - Math.pow(0.001, dt);
    px += (pointerX - px) * k * 0.9;
    py += (pointerY - py) * k * 0.9;
    if (!dragging) {
      userVel *= Math.pow(0.04, dt);
      userYaw += userVel * dt;
      // Ease the user rotation back toward the presentation pose (only while motion is on).
      if (animating && Math.abs(userVel) < 0.05) userYaw *= 1 - Math.min(1, dt * 0.35);
    }
    (floorMat.uniforms.uTime.value as number) = animating ? t : (floorMat.uniforms.uTime.value as number);
    applyPose();
    render();
    // Adaptive resolution: drop pixel ratio if frames are consistently slow.
    if (dt > 0.034) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 45 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.5);
      renderer.setPixelRatio(dpr);
      frame();
      slowFrames = 0;
    }
    const settling =
      intro < 1 || dragging || Math.abs(userVel) > 0.01 || Math.abs(pointerX - px) > 0.002 || Math.abs(pointerY - py) > 0.002;
    if (visible && (animating || settling)) raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (!raf && visible) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  /* Interaction */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onPointerMove = (e: PointerEvent) => {
    if (dragging) {
      const dx = e.clientX - lastDragX;
      lastDragX = e.clientX;
      userYaw += dx * 0.009;
      userVel = dx * 0.009 * 60;
      kick();
      return;
    }
    if (!fine || reduced || paused) return;
    const r = host.getBoundingClientRect();
    pointerX = MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    pointerY = MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    kick();
  };
  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    lastDragX = e.clientX;
    userVel = 0;
    host.classList.add('is-dragging');
    canvas.setPointerCapture?.(e.pointerId);
    kick();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    host.classList.remove('is-dragging');
    canvas.releasePointerCapture?.(e.pointerId);
    kick();
  };
  const onLeave = () => {
    pointerX = 0;
    pointerY = 0;
    kick();
  };
  if (!opts.capture) {
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('pointerleave', onLeave);
  }

  /* Visibility: pause when off-screen or tab hidden */
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) kick();
    },
    { threshold: 0.01 },
  );
  io.observe(host);
  const onVis = () => {
    visible = document.visibilityState === 'visible';
    if (visible) kick();
  };
  document.addEventListener('visibilitychange', onVis);

  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      frame();
      render();
    });
  });
  ro.observe(host);

  // Compile shaders without blocking the main thread where supported.
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    /* fall back to compiling on first render */
  }

  if (opts.capture) {
    intro = 1;
    applyPose();
    render();
  } else {
    kick();
  }

  return {
    setPaused(p) {
      paused = p;
      if (p) {
        // Freeze pointer influence where it is; only an explicit drag moves the model.
        pointerX = px;
        pointerY = py;
      }
      kick();
    },
    isPaused: () => paused,
    setReducedMotion(r) {
      reduced = r;
      if (r) {
        pointerX = pointerY = 0;
      }
      kick();
    },
    resize() {
      frame();
      render();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('pointerleave', onLeave);
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mat = m.material as Material | Material[];
          (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
        }
      });
      drill.textures.forEach((x) => x.dispose());
      owned.forEach((x) => x.dispose());
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
