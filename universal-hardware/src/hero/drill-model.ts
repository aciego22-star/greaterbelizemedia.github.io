/**
 * Procedural model of the Makita HP333D 12V max CXT cordless drill pictured in
 * Universal Hardware's 2026 Friends & Family promotion (black tool, 1.5Ah
 * battery fitted). Geometry is original and built from that photo by eye, so
 * it is an approximation, not a manufacturer CAD model.
 *
 * Construction:
 *  - Motor & gear housing: LatheGeometry profile, oval cross-section.
 *  - Clutch ring and chuck sleeve: extruded toothed profiles (ribbing), with
 *    the clutch numbers printed on a band in front of the housing.
 *  - Handle, rubber grip, trigger, foot: bevelled ExtrudeGeometry from
 *    hand-drawn side profiles.
 *  - Wordmark and battery label: canvas textures on curved / flat decals. The
 *    wordmark is drawn from a traced vector path (see makita-wordmark.ts).
 * Units: 1 ≈ 7.5 cm. Chuck axis along +X; battery base at y = 0 after build.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  type Material,
  type Texture,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { WORDMARK_H, WORDMARK_PATH, WORDMARK_W } from './makita-wordmark';

export interface DrillParts {
  group: Group;
  materials: Material[];
  textures: Texture[];
  height: number;
}

const TEAL = '#00a0aa';
const MODEL_SCALE = 1.14;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function colorTexture(c: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function gripTexture(): CanvasTexture {
  // Fine ribs running along the grip, used as a bump map on the rubber.
  const s = 128;
  const [c, g] = canvas(s, s);
  g.fillStyle = '#808080';
  g.fillRect(0, 0, s, s);
  g.fillStyle = '#2a2a2a';
  for (let x = 0; x < s; x += 16) g.fillRect(x, 0, 7, s);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(9, 1);
  return t;
}

function contactShadowTexture(): CanvasTexture {
  const s = 256;
  const [c, g] = canvas(s, s);
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)');
  grd.addColorStop(0.35, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return colorTexture(c);
}

/** White wordmark on a transparent canvas. */
function wordmarkTexture(width = 1024): CanvasTexture {
  const pad = Math.round(width * 0.02);
  const h = Math.round((width - pad * 2) * (WORDMARK_H / WORDMARK_W)) + pad * 2;
  const [c, g] = canvas(width, h);
  const k = (width - pad * 2) / WORDMARK_W;
  g.setTransform(k, 0, 0, k, pad, pad);
  g.fillStyle = '#f2f4f6';
  g.fill(new Path2D(WORDMARK_PATH), 'evenodd');
  return colorTexture(c);
}

/** Glossy raised plate behind the housing wordmark. */
function logoPanelTexture(): CanvasTexture {
  const [c, g] = canvas(512, 128);
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, '#2c2f34');
  grd.addColorStop(1, '#1b1d21');
  g.fillStyle = grd;
  roundedRect(g, 3, 3, 506, 122, 40);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 3;
  roundedRect(g, 4, 4, 504, 120, 40);
  g.stroke();
  return colorTexture(c);
}

/** Clutch settings printed around the ring (baseline follows the circumference). */
function clutchTexture(): CanvasTexture {
  const [c, g] = canvas(2048, 96);
  g.fillStyle = '#e6e9ec';
  g.font = '700 58px Arial, Helvetica, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // 20 settings over three quarters of the ring, labels every third step.
  const labels: Record<number, string> = { 1: '1', 5: '5', 8: '8', 11: '11', 14: '14', 17: '17', 20: '20' };
  for (let i = 1; i <= 20; i++) {
    const x = ((i - 1) / 19) * 1460 + 80;
    if (labels[i]) g.fillText(labels[i], x, 50);
    else g.fillRect(x - 4, 46, 8, 8);
  }
  // Drill and hammer mode marks on the remaining quarter.
  g.fillRect(1640, 42, 60, 14);
  g.beginPath();
  g.moveTo(1700, 34);
  g.lineTo(1734, 49);
  g.lineTo(1700, 64);
  g.fill();
  g.fillRect(1840, 36, 26, 26);
  g.fillRect(1866, 44, 52, 10);
  return colorTexture(c);
}

function roundedRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** BL1016 side label: teal panel with capacity. */
function batteryLabelTexture(): CanvasTexture {
  const [c, g] = canvas(512, 160);
  g.fillStyle = TEAL;
  roundedRect(g, 4, 4, 504, 152, 18);
  g.fill();
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.fillRect(4, 118, 504, 38);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(70, 72, 34, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = TEAL;
  g.font = '800 30px Arial, Helvetica, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('CXT', 70, 73);
  g.fillStyle = '#ffffff';
  g.textAlign = 'left';
  g.font = '800 64px Arial, Helvetica, sans-serif';
  g.fillText('1.5Ah', 128, 70);
  g.font = '700 26px Arial, Helvetica, sans-serif';
  g.fillText('Li-ion  12V max', 30, 138);
  return colorTexture(c);
}

/** Toothed (ribbed) disc profile for extrusion. */
function toothedShape(rOuter: number, rInner: number, teeth: number, toothFrac = 0.5): Shape {
  const sh = new Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * toothFrac * 0.5;
    const a2 = a0 + step * toothFrac;
    const a3 = a0 + step;
    const pts = [
      [rInner, a0],
      [rOuter, a1 - step * 0.08],
      [rOuter, a1 + step * 0.08],
      [rInner, a2],
      [rInner, a3],
    ] as const;
    pts.forEach(([r, a], k) => {
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0 && k === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    });
  }
  sh.closePath();
  return sh;
}

function centeredExtrude(shape: Shape, depth: number, bevel: number, bevelSize = bevel, segments = 6): ExtrudeGeometry {
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize,
    bevelSegments: segments,
    curveSegments: 36,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Lathe around +X from [radius, x] pairs. */
function latheX(profile: [number, number][], segments: number, zScale = 1): LatheGeometry {
  const g = new LatheGeometry(
    profile.map(([r, x]) => new Vector2(r, x)),
    segments,
  );
  g.rotateZ(-Math.PI / 2); // lathe axis +Y → +X
  if (zScale !== 1) g.scale(1, 1, zScale);
  g.computeVertexNormals();
  return g;
}

/** Linear interpolation of a [radius, x] lathe profile at axial position x. */
function radiusAt(profile: [number, number][], x: number): number {
  for (let i = 1; i < profile.length; i++) {
    const [r0, x0] = profile[i - 1];
    const [r1, x1] = profile[i];
    if (x >= x0 && x <= x1) return x1 === x0 ? Math.max(r0, r1) : r0 + ((x - x0) / (x1 - x0)) * (r1 - r0);
  }
  return profile[profile.length - 1][0];
}

/**
 * Curved decal patch on one side of the housing. Text reads left-to-right
 * from either side; `side` is +1 for the +Z face, −1 for the −Z face.
 */
function housingDecal(
  profile: [number, number][],
  zScale: number,
  x0: number,
  x1: number,
  phiCentre: number,
  height: number,
  side: 1 | -1,
  lift = 0.0035,
): BufferGeometry {
  const segX = 48;
  const segY = 6;
  const rMid = radiusAt(profile, (x0 + x1) / 2);
  const span = height / rMid;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= segY; j++) {
    const t = j / segY;
    const phi = phiCentre + (t - 0.5) * span;
    for (let i = 0; i <= segX; i++) {
      const s = i / segX;
      const x = x0 + (x1 - x0) * s;
      const r = radiusAt(profile, x) + lift;
      pos.push(x, r * Math.sin(phi), side * zScale * r * Math.cos(phi));
      uv.push(side === 1 ? s : 1 - s, t);
    }
  }
  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = a + 1;
      const c = a + segX + 1;
      const d = c + 1;
      if (side === 1) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function buildDrill(opts: { lowDetail?: boolean } = {}): DrillParts {
  const low = !!opts.lowDetail;
  const group = new Group();
  group.name = 'drill';
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const track = <T extends Material>(m: T) => (materials.push(m), m);
  const tex = <T extends Texture>(t: T) => (textures.push(t), t);
  const radial = low ? 48 : 96;

  /* ---------------- Materials ---------------- */
  const shell = track(
    new MeshPhysicalMaterial({ color: '#16171a', roughness: 0.42, metalness: 0.02, clearcoat: 0.4, clearcoatRoughness: 0.34 }),
  );
  const shellSatin = track(
    new MeshPhysicalMaterial({ color: '#1d1f23', roughness: 0.55, metalness: 0.02, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
  );
  const grip = tex(gripTexture());
  const rubber = track(new MeshStandardMaterial({ color: '#0c0d0f', roughness: 0.9, metalness: 0, bumpMap: grip, bumpScale: 0.5 }));
  const rubberPlain = track(new MeshStandardMaterial({ color: '#111215', roughness: 0.78, metalness: 0 }));
  const trigger = track(
    new MeshPhysicalMaterial({ color: '#131417', roughness: 0.3, metalness: 0.02, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
  );
  const chrome = track(new MeshPhysicalMaterial({ color: '#e3e7ec', roughness: 0.14, metalness: 1 }));
  const steel = track(new MeshPhysicalMaterial({ color: '#b4bcc5', roughness: 0.26, metalness: 1 }));
  const nose = track(new MeshPhysicalMaterial({ color: '#c3c9d0', roughness: 0.32, metalness: 1 }));
  const vent = track(new MeshStandardMaterial({ color: '#030405', roughness: 1, metalness: 0 }));
  const lens = track(new MeshPhysicalMaterial({ color: '#9aa4ad', roughness: 0.08, metalness: 0, clearcoat: 1 }));
  const decal = (map: Texture) =>
    track(
      new MeshStandardMaterial({
        map,
        transparent: true,
        roughness: 0.5,
        metalness: 0,
        side: DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
  const logoPanel = decal(tex(logoPanelTexture()));
  (logoPanel as MeshStandardMaterial).roughness = 0.25;
  const wordmarkTex = tex(wordmarkTexture());
  const wordmark = decal(wordmarkTex);
  // Height / width of the wordmark canvas, so decals keep the letter proportions.
  const markAspect = (wordmarkTex.image as HTMLCanvasElement).height / (wordmarkTex.image as HTMLCanvasElement).width;
  const clutchPrint = decal(tex(clutchTexture()));
  const battLabel = decal(tex(batteryLabelTexture()));

  const add = (geo: BufferGeometry, mat: Material, cast = true) => {
    const m = new Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  /* ---------------- Motor & gear housing ---------------- */
  // [radius, x]: domed rear cap, motor section, then the taper to the gear case.
  const housing: [number, number][] = [
    [0.0, -1.02],
    [0.13, -1.016],
    [0.21, -1.004],
    [0.28, -0.98],
    [0.33, -0.945],
    [0.365, -0.895],
    [0.388, -0.83],
    [0.4, -0.75],
    [0.405, -0.62],
    [0.403, -0.46],
    [0.396, -0.33],
    [0.382, -0.2],
    [0.36, -0.1],
    [0.34, -0.03],
    [0.325, 0.02],
    [0.318, 0.06],
    [0.316, 0.11],
    [0.3, 0.115],
    [0.0, 0.115],
  ];
  const Z = 0.92;
  add(latheX(housing, radial, Z), shell);

  // Wordmark on both sides of the motor housing.
  for (const side of [1, -1] as const) {
    add(housingDecal(housing, Z, -0.93, -0.21, 0.16, 0.2, side, 0.003), logoPanel, false).renderOrder = 1;
    add(housingDecal(housing, Z, -0.88, -0.26, 0.16, 0.62 * markAspect, side, 0.0055), wordmark, false).renderOrder = 2;
  }

  // Rear cap vents (radial slots).
  const slotCount = 10;
  for (let i = 0; i < slotCount; i++) {
    const a = (i / slotCount) * Math.PI * 2 + Math.PI / slotCount;
    const slot = new RoundedBoxGeometry(0.05, 0.11, 0.026, 2, 0.011);
    const m = new Mesh(slot, vent);
    const r = 0.19;
    m.position.set(-1.008, Math.cos(a) * r, Math.sin(a) * r * Z);
    m.rotation.x = a;
    group.add(m);
  }
  // Short side vents at the back of the motor section, seated on the surface.
  for (const z of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x = -0.95 + i * 0.034;
      const y = -0.13;
      const r = radiusAt(housing, x);
      const slot = new RoundedBoxGeometry(0.02, 0.12, 0.03, 2, 0.008);
      const m = new Mesh(slot, vent);
      m.position.set(x, y, z * (Z * Math.sqrt(r * r - y * y) - 0.008));
      m.rotation.z = 0.25;
      group.add(m);
    }
  }

  // Two-speed slide switch on top, just behind the clutch.
  const selBase = new RoundedBoxGeometry(0.26, 0.05, 0.17, 3, 0.022);
  add(selBase, rubberPlain).position.set(-0.2, 0.367, 0);
  const selKnob = new RoundedBoxGeometry(0.1, 0.06, 0.13, 3, 0.026);
  add(selKnob, shellSatin).position.set(-0.25, 0.395, 0);

  /* ---------------- Clutch ring ---------------- */
  // Smooth printed band carrying the 1–20 settings, then the ribbed grip ring.
  const band = new CylinderGeometry(0.314, 0.314, 0.12, radial, 1, true);
  band.rotateZ(-Math.PI / 2);
  band.translate(0.175, 0, 0);
  add(band, shellSatin);
  const print = new CylinderGeometry(0.3165, 0.3165, 0.11, radial, 1, true);
  print.rotateZ(-Math.PI / 2);
  print.translate(0.175, 0, 0);
  add(print, clutchPrint, false);
  const clutch = centeredExtrude(toothedShape(0.318, 0.302, 30, 0.55), 0.06, 0.01, 0.007, 2);
  clutch.rotateY(Math.PI / 2);
  clutch.translate(0.272, 0, 0);
  add(clutch, shellSatin);

  /* ---------------- Chuck (10 mm keyless) ---------------- */
  add(latheX([[0.0, 0.305], [0.27, 0.305], [0.275, 0.32], [0.27, 0.35], [0.0, 0.35]], radial), rubberPlain);
  const sleeve = centeredExtrude(toothedShape(0.255, 0.242, low ? 28 : 40, 0.6), 0.18, 0.01, 0.006, 2);
  sleeve.rotateY(Math.PI / 2);
  sleeve.translate(0.355 + 0.09, 0, 0);
  add(sleeve, rubberPlain);
  add(
    latheX(
      [
        [0.0, 0.53],
        [0.25, 0.53],
        [0.252, 0.55],
        [0.249, 0.61],
        [0.24, 0.67],
        [0.222, 0.72],
        [0.192, 0.758],
        [0.158, 0.78],
        [0.0, 0.78],
      ],
      radial,
    ),
    rubberPlain,
  );
  // Satin metal nose with the jaw opening, as on the 10 mm keyless chuck.
  add(
    latheX(
      [
        [0.0, 0.776],
        [0.16, 0.776],
        [0.162, 0.785],
        [0.14, 0.812],
        [0.108, 0.835],
        [0.078, 0.848],
        [0.058, 0.853],
        [0.045, 0.85],
      ],
      radial,
    ),
    nose,
  );
  // Three jaws meeting at the tip.
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const jaw = new RoundedBoxGeometry(0.12, 0.036, 0.032, 2, 0.008);
    const m = add(jaw, steel, false);
    m.position.set(0.835, Math.cos(a) * 0.026, Math.sin(a) * 0.026);
    m.rotation.x = a;
  }

  /* ---------------- Handle ---------------- */
  const handle = new Shape();
  handle.moveTo(-0.06, -0.24);
  handle.bezierCurveTo(-0.07, -0.34, -0.09, -0.4, -0.11, -0.46);
  handle.bezierCurveTo(-0.14, -0.65, -0.17, -0.95, -0.19, -1.2);
  handle.bezierCurveTo(-0.2, -1.39, -0.17, -1.52, -0.12, -1.62);
  handle.lineTo(-0.78, -1.62);
  handle.bezierCurveTo(-0.74, -1.48, -0.66, -1.34, -0.63, -1.16);
  handle.bezierCurveTo(-0.6, -0.96, -0.62, -0.78, -0.69, -0.6);
  handle.bezierCurveTo(-0.75, -0.44, -0.81, -0.34, -0.83, -0.24);
  handle.closePath();
  add(centeredExtrude(handle, 0.3, 0.09, 0.08, low ? 5 : 8), shell);

  // Rubber grip on the back and sides; its back edge follows the handle.
  const over = new Shape();
  over.moveTo(-0.695, -0.58);
  over.bezierCurveTo(-0.62, -0.76, -0.6, -0.96, -0.63, -1.16);
  over.bezierCurveTo(-0.65, -1.32, -0.72, -1.45, -0.76, -1.56);
  over.lineTo(-0.47, -1.56);
  over.bezierCurveTo(-0.42, -1.34, -0.37, -1.12, -0.37, -0.94);
  over.bezierCurveTo(-0.37, -0.76, -0.48, -0.62, -0.695, -0.58);
  over.closePath();
  add(centeredExtrude(over, 0.34, 0.09, 0.09, low ? 5 : 8), rubber);
  // Trigger
  const trig = new Shape();
  trig.moveTo(-0.12, -0.41);
  trig.bezierCurveTo(-0.02, -0.4, 0.05, -0.44, 0.06, -0.52);
  trig.bezierCurveTo(0.07, -0.6, 0.04, -0.68, -0.02, -0.75);
  trig.lineTo(-0.15, -0.75);
  trig.closePath();
  add(centeredExtrude(trig, 0.12, 0.035, 0.03, 5), trigger);

  // Forward / reverse button through the top of the grip.
  const fr = new CylinderGeometry(0.048, 0.048, 0.56, 28);
  fr.rotateX(Math.PI / 2);
  fr.translate(-0.2, -0.33, 0);
  add(fr, shellSatin);

  /* ---------------- Foot ---------------- */
  const foot = new Shape();
  foot.moveTo(-0.92, -1.62);
  foot.lineTo(0.08, -1.62);
  foot.bezierCurveTo(0.2, -1.62, 0.27, -1.65, 0.29, -1.72);
  foot.lineTo(0.3, -1.84);
  foot.lineTo(-0.94, -1.84);
  foot.bezierCurveTo(-0.96, -1.76, -0.96, -1.67, -0.92, -1.62);
  foot.closePath();
  add(centeredExtrude(foot, 0.56, 0.05, 0.05, low ? 4 : 6), shell);
  // Work light lens in the front of the foot.
  const ledM = new Mesh(new SphereGeometry(0.035, 20, 12), lens);
  ledM.position.set(0.35, -1.75, 0);
  ledM.scale.set(0.45, 1, 1.5);
  group.add(ledM);

  /* ---------------- BL1016 battery ---------------- */
  // The CXT pack slides up into the foot, so only its lower part shows.
  const battL = 1.08;
  const battX = -0.33;
  const battTop = -1.82;
  const battH = 0.34;
  const battW = 0.64;
  const battM = add(new RoundedBoxGeometry(battL, battH, battW, low ? 4 : 6, 0.05), shell);
  battM.position.set(battX, battTop - battH / 2, 0);
  const sole = new RoundedBoxGeometry(battL - 0.04, 0.04, battW - 0.04, 3, 0.016);
  add(sole, rubberPlain).position.set(battX, battTop - battH + 0.016, 0);
  // Wordmark towards the front and the teal capacity label behind it, on both sides.
  const markW = 0.34;
  for (const z of [1, -1]) {
    const face = z * (battW / 2 + 0.002);
    const mark = new PlaneGeometry(markW, markW * markAspect);
    const lab = new PlaneGeometry(0.4, 0.125);
    if (z < 0) {
      mark.rotateY(Math.PI);
      lab.rotateY(Math.PI);
    }
    add(mark, wordmark, false).position.set(battX + battL / 2 - 0.06 - markW / 2, battTop - 0.215, face);
    add(lab, battLabel, false).position.set(battX - 0.07, battTop - 0.2, face);
  }
  // Release buttons on both sides near the front.
  for (const z of [1, -1]) {
    const btn = new RoundedBoxGeometry(0.12, 0.05, 0.034, 2, 0.012);
    add(btn, rubberPlain, false).position.set(battX + 0.4, battTop - 0.1, z * (battW / 2 + 0.004));
  }

  /* ---------------- Belt hook (−Z side, at the back of the foot) ---------------- */
  const clipX = -0.8;
  const clipZ = -(battW / 2 + 0.03);
  const plate = new RoundedBoxGeometry(0.15, 0.17, 0.03, 2, 0.012);
  add(plate, steel).position.set(clipX, -1.72, -0.34);
  const strap = new RoundedBoxGeometry(0.13, 0.3, 0.024, 2, 0.01);
  const strapM = add(strap, steel);
  strapM.position.set(clipX, -1.93, clipZ);
  strapM.rotation.x = 0.08;
  // Rounded lower end that curls away from the battery.
  const curl = new TorusGeometry(0.035, 0.012, 8, 16, Math.PI);
  const curlM = add(curl, steel, false);
  curlM.scale.set(1.7, 1, 1);
  curlM.position.set(clipX, -2.08, clipZ - 0.03);
  curlM.rotation.set(0, Math.PI / 2, Math.PI);
  const screw = new CylinderGeometry(0.032, 0.032, 0.02, 16);
  screw.rotateX(Math.PI / 2);
  add(screw, chrome, false).position.set(clipX, -1.72, -0.36);

  /* ---------------- Contact shadow ---------------- */
  const shadowTex = tex(contactShadowTexture());
  const shadowMat = track(
    new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false }),
  );
  const shadow = new Mesh(new PlaneGeometry(1.75, 1.15), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(battX, battTop - battH - 0.004, 0);
  shadow.renderOrder = -1;
  group.add(shadow);

  // Put the battery sole on y = 0 and centre the visual mass over the origin.
  const base = -(battTop - battH);
  const inner = new Group();
  while (group.children.length) inner.add(group.children[0]);
  inner.scale.setScalar(MODEL_SCALE);
  inner.position.set(0.22, base * MODEL_SCALE, 0);
  group.add(inner);

  return { group, materials, textures, height: (base + 0.405) * MODEL_SCALE };
}
