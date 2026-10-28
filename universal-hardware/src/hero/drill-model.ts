/**
 * Procedural, unbranded cordless drill — original geometry built for this
 * concept (no third-party model, no manufacturer marks).
 *
 * Construction:
 *  - Motor & gear housing: LatheGeometry profile, oval cross-section.
 *  - Handle, rubber overmold, trigger, foot: bevelled ExtrudeGeometry from
 *    hand-drawn side profiles.
 *  - Clutch collar and chuck sleeve: extruded toothed profiles (knurling).
 *  - Twist bit: custom BufferGeometry with a two-flute cross-section swept
 *    along a helix.
 * Units: 1 ≈ 10 cm. Chuck axis along +X; battery base at y = 0 after build.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
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

export interface DrillParts {
  group: Group;
  materials: Material[];
  textures: Texture[];
  height: number;
}

const BLUE = new Color('#1768b4');
const BLUE_LIGHT = new Color('#5592cb');

function gripTexture(): CanvasTexture {
  // Fine diamond knurl pattern used as a bump map on the rubber overmold.
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, s, s);
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 7;
  const step = 32;
  for (let i = -s; i <= s * 2; i += step) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + s, s);
    g.stroke();
    g.beginPath();
    g.moveTo(i, s);
    g.lineTo(i + s, 0);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(5, 5);
  return t;
}

function contactShadowTexture(): CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)');
  grd.addColorStop(0.35, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Toothed (knurled) disc profile for extrusion. */
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

/** Twist drill bit: two-flute cross-section swept along the X axis with a helix. */
function twistBitGeometry(radius: number, length: number, tipLength: number): BufferGeometry {
  const seg = 40;
  const rings = 150;
  const twist = (Math.PI * 2) / 0.36; // radians per unit length
  const positions: number[] = [];
  const indices: number[] = [];
  const profile = (theta: number) => {
    const c = Math.abs(Math.cos(theta));
    // Lands at 0/π, flutes at ±π/2; smooth transition.
    const t = Math.min(1, Math.max(0, (c - 0.18) / 0.5));
    const sm = t * t * (3 - 2 * t);
    return 0.42 + 0.58 * sm;
  };
  for (let j = 0; j <= rings; j++) {
    const u = j / rings;
    const x = u * (length + tipLength);
    let rScale = 1;
    if (x > length) {
      const k = (x - length) / tipLength;
      rScale = Math.max(0.0, 1 - k);
    }
    const rot = x * twist;
    for (let i = 0; i < seg; i++) {
      const th = (i / seg) * Math.PI * 2;
      const r = radius * profile(th) * rScale;
      const a = th + rot;
      positions.push(x, Math.cos(a) * r, Math.sin(a) * r);
    }
  }
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * seg + i;
      const b = j * seg + ((i + 1) % seg);
      const c = (j + 1) * seg + i;
      const d = (j + 1) * seg + ((i + 1) % seg);
      indices.push(a, c, b, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
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

export function buildDrill(opts: { lowDetail?: boolean } = {}): DrillParts {
  const low = !!opts.lowDetail;
  const group = new Group();
  group.name = 'drill';
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const track = <T extends Material>(m: T) => (materials.push(m), m);

  /* ---------------- Materials ---------------- */
  const shell = track(
    new MeshPhysicalMaterial({
      color: '#1c232c',
      roughness: 0.4,
      metalness: 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.32,
    }),
  );
  const shellLight = track(
    new MeshPhysicalMaterial({ color: '#2a3542', roughness: 0.45, metalness: 0.08, clearcoat: 0.4, clearcoatRoughness: 0.4 }),
  );
  const blue = track(
    new MeshPhysicalMaterial({
      color: BLUE,
      roughness: 0.3,
      metalness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.14,
      sheen: 0.2,
      sheenColor: BLUE_LIGHT,
    }),
  );
  const grip = gripTexture();
  textures.push(grip);
  const rubber = track(
    new MeshStandardMaterial({ color: '#0c0f13', roughness: 0.88, metalness: 0, bumpMap: grip, bumpScale: 0.6 }),
  );
  const rubberPlain = track(new MeshStandardMaterial({ color: '#101419', roughness: 0.8, metalness: 0 }));
  const chrome = track(new MeshPhysicalMaterial({ color: '#e3e7ec', roughness: 0.14, metalness: 1 }));
  const steel = track(new MeshPhysicalMaterial({ color: '#aeb6bf', roughness: 0.3, metalness: 1 }));
  const bitSteel = track(new MeshPhysicalMaterial({ color: '#9aa3ad', roughness: 0.22, metalness: 1 }));
  const vent = track(new MeshStandardMaterial({ color: '#030507', roughness: 1, metalness: 0 }));
  const led = track(new MeshBasicMaterial({ color: new Color('#d8f0ff').multiplyScalar(2.2) }));
  const ledBlue = track(new MeshBasicMaterial({ color: new Color('#6fb3f2').multiplyScalar(1.8) }));
  const ledDim = track(new MeshStandardMaterial({ color: '#16303f', roughness: 0.5 }));

  const add = (geo: BufferGeometry, mat: Material, cast = true) => {
    const m = new Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  /* ---------------- Motor & gear housing (lathe) ---------------- */
  const lathePts: Vector2[] = [];
  const housingProfile: [number, number][] = [
    [0.0, -1.06],
    [0.16, -1.05],
    [0.27, -1.02],
    [0.35, -0.97],
    [0.41, -0.9],
    [0.445, -0.8],
    [0.462, -0.68],
    [0.468, -0.5],
    [0.466, -0.3],
    [0.458, -0.12],
    [0.445, 0.0],
    [0.425, 0.08],
    [0.4, 0.13],
    [0.395, 0.16],
    [0.395, 0.31],
    [0.36, 0.33],
    [0.0, 0.33],
  ];
  housingProfile.forEach(([r, y]) => lathePts.push(new Vector2(r, y)));
  const housingGeo = new LatheGeometry(lathePts, low ? 48 : 96);
  housingGeo.rotateZ(-Math.PI / 2); // axis +Y → +X
  housingGeo.scale(1, 1.0, 0.9);
  housingGeo.computeVertexNormals();
  add(housingGeo, shell);

  // Blue side inserts on the motor housing (partial lathe shells).
  const insertPts = [
    [0.466, -0.72],
    [0.474, -0.66],
    [0.476, -0.5],
    [0.474, -0.3],
    [0.466, -0.14],
    [0.452, -0.04],
  ].map(([r, y]) => new Vector2(r, y));
  for (const side of [0, 1]) {
    const phi0 = side === 0 ? Math.PI * 0.18 : Math.PI * 1.18;
    const ins = new LatheGeometry(insertPts, 40, phi0, Math.PI * 0.64);
    ins.rotateZ(-Math.PI / 2);
    ins.scale(1, 1.0, 0.9);
    ins.computeVertexNormals();
    const m = add(ins, blue);
    (m.material as MeshPhysicalMaterial).side = 2; // DoubleSide
  }

  // Rear accent ring
  const ringGeo = new TorusGeometry(0.452, 0.012, 10, low ? 64 : 128);
  ringGeo.rotateY(Math.PI / 2);
  ringGeo.scale(1, 1, 0.9);
  ringGeo.translate(-0.82, 0, 0);
  add(ringGeo, blue, false);

  // Rear cap vents (radial slots on the domed end cap)
  const slotCount = 12;
  for (let i = 0; i < slotCount; i++) {
    const a = (i / slotCount) * Math.PI * 2 + Math.PI / slotCount;
    const slot = new RoundedBoxGeometry(0.06, 0.12, 0.028, 2, 0.012);
    const m = new Mesh(slot, vent);
    const r = 0.21;
    m.position.set(-1.015, Math.cos(a) * r, Math.sin(a) * r * 0.9);
    m.rotation.x = a;
    group.add(m);
  }

  // Side vents: slanted slots recessed into the cylindrical part of the housing.
  for (const z of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const slot = new RoundedBoxGeometry(0.028, 0.2, 0.05, 2, 0.012);
      const m = new Mesh(slot, vent);
      m.position.set(-0.66 + i * 0.048, 0.0, z * 0.398);
      m.rotation.z = 0.28;
      group.add(m);
    }
  }

  // Gear selector on top
  const selBase = new RoundedBoxGeometry(0.3, 0.06, 0.2, 3, 0.025);
  const selBaseM = add(selBase, rubberPlain);
  selBaseM.position.set(0.15, 0.4, 0);
  const selKnob = new RoundedBoxGeometry(0.11, 0.07, 0.15, 3, 0.03);
  const selKnobM = add(selKnob, blue);
  selKnobM.position.set(0.09, 0.44, 0);

  /* ---------------- Clutch collar ---------------- */
  const clutch = centeredExtrude(toothedShape(0.405, 0.385, 24, 0.55), 0.12, 0.012, 0.008, 2);
  clutch.rotateY(Math.PI / 2);
  clutch.translate(0.395, 0, 0);
  add(clutch, shellLight);
  const clutchRingGeo = new CylinderGeometry(0.39, 0.39, 0.025, low ? 48 : 96);
  clutchRingGeo.rotateZ(Math.PI / 2);
  clutchRingGeo.translate(0.33, 0, 0);
  add(clutchRingGeo, blue);

  /* ---------------- Chuck ---------------- */
  const collar = new CylinderGeometry(0.33, 0.34, 0.06, low ? 48 : 96);
  collar.rotateZ(Math.PI / 2);
  collar.translate(0.49, 0, 0);
  add(collar, rubberPlain);

  const sleeve = centeredExtrude(toothedShape(0.315, 0.298, low ? 30 : 44, 0.6), 0.2, 0.01, 0.006, 2);
  sleeve.rotateY(Math.PI / 2);
  sleeve.translate(0.63, 0, 0);
  add(sleeve, rubberPlain);

  const frontPts = [
    [0.0, 0.0],
    [0.29, 0.0],
    [0.295, 0.02],
    [0.292, 0.06],
    [0.282, 0.1],
    [0.272, 0.12],
    [0.262, 0.13],
    [0.255, 0.15],
    [0.24, 0.19],
    [0.222, 0.23],
    [0.2, 0.26],
    [0.16, 0.28],
    [0.13, 0.285],
    [0.12, 0.3],
    [0.1, 0.33],
    [0.0, 0.33],
  ].map(([r, y]) => new Vector2(r, y));
  const front = new LatheGeometry(frontPts, low ? 48 : 96);
  front.rotateZ(-Math.PI / 2);
  front.translate(0.745, 0, 0);
  add(front, chrome);
  // fine grooves on front sleeve
  for (let i = 0; i < 3; i++) {
    const gr = new TorusGeometry(0.29 - i * 0.004, 0.005, 6, low ? 48 : 96);
    gr.rotateY(Math.PI / 2);
    gr.translate(0.775 + i * 0.03, 0, 0);
    add(gr, steel, false);
  }

  /* ---------------- Twist bit ---------------- */
  const shank = new CylinderGeometry(0.045, 0.045, 0.16, 32);
  shank.rotateZ(Math.PI / 2);
  shank.translate(1.13, 0, 0);
  add(shank, bitSteel);
  const bit = twistBitGeometry(0.048, 0.62, 0.07);
  bit.translate(1.2, 0, 0);
  add(bit, bitSteel);

  /* ---------------- Handle (extruded side profile) ---------------- */
  const handle = new Shape();
  handle.moveTo(-0.04, -0.2);
  handle.bezierCurveTo(-0.04, -0.42, -0.1, -0.5, -0.12, -0.66);
  handle.bezierCurveTo(-0.15, -0.9, -0.2, -1.12, -0.21, -1.32);
  handle.bezierCurveTo(-0.22, -1.44, -0.16, -1.52, -0.12, -1.6);
  handle.lineTo(-0.86, -1.6);
  handle.bezierCurveTo(-0.84, -1.42, -0.8, -1.3, -0.77, -1.12);
  handle.bezierCurveTo(-0.72, -0.84, -0.6, -0.72, -0.62, -0.5);
  handle.bezierCurveTo(-0.63, -0.38, -0.66, -0.3, -0.66, -0.2);
  handle.closePath();
  const handleGeo = centeredExtrude(handle, 0.34, 0.1, 0.09, low ? 5 : 8);
  add(handleGeo, shell);

  // Rubber overmold on the rear of the grip; its back edge follows the handle.
  const over = new Shape();
  over.moveTo(-0.627, -0.42);
  over.lineTo(-0.62, -0.5);
  over.bezierCurveTo(-0.6, -0.72, -0.72, -0.84, -0.77, -1.12);
  over.quadraticCurveTo(-0.81, -1.33, -0.845, -1.5);
  over.lineTo(-0.6, -1.5);
  over.bezierCurveTo(-0.55, -1.28, -0.47, -1.04, -0.45, -0.84);
  over.bezierCurveTo(-0.43, -0.64, -0.5, -0.48, -0.627, -0.42);
  over.closePath();
  const overGeo = centeredExtrude(over, 0.38, 0.1, 0.1, low ? 5 : 8);
  add(overGeo, rubber);

  // Trigger
  const trig = new Shape();
  trig.moveTo(-0.06, -0.36);
  trig.bezierCurveTo(0.04, -0.36, 0.1, -0.4, 0.1, -0.47);
  trig.bezierCurveTo(0.1, -0.56, 0.06, -0.64, 0.0, -0.7);
  trig.lineTo(-0.1, -0.7);
  trig.closePath();
  const trigGeo = centeredExtrude(trig, 0.12, 0.04, 0.035, 5);
  add(trigGeo, blue);

  // Forward / reverse button
  const fr = new CylinderGeometry(0.052, 0.052, 0.62, 28);
  fr.rotateX(Math.PI / 2);
  fr.translate(-0.17, -0.3, 0);
  add(fr, shellLight);
  for (const z of [0.31, -0.31]) {
    const cap = new CylinderGeometry(0.056, 0.056, 0.02, 28);
    cap.rotateX(Math.PI / 2);
    cap.translate(-0.17, -0.3, z);
    add(cap, shellLight, false);
  }

  /* ---------------- Foot / battery mount ---------------- */
  const foot = new Shape();
  foot.moveTo(-1.0, -1.58);
  foot.lineTo(0.12, -1.58);
  foot.bezierCurveTo(0.24, -1.58, 0.3, -1.62, 0.32, -1.7);
  foot.lineTo(0.33, -1.8);
  foot.lineTo(-1.02, -1.8);
  foot.bezierCurveTo(-1.04, -1.72, -1.04, -1.62, -1.0, -1.58);
  foot.closePath();
  const footGeo = centeredExtrude(foot, 0.56, 0.06, 0.05, low ? 4 : 6);
  add(footGeo, shell);

  // Accent strip along the foot sides
  for (const z of [1, -1]) {
    const strip = new RoundedBoxGeometry(1.08, 0.028, 0.02, 2, 0.008);
    const m = add(strip, blue, false);
    m.position.set(-0.36, -1.69, z * 0.345);
  }
  // Work light (LED) in the foot front
  const ledGeo = new SphereGeometry(0.04, 20, 12);
  const ledM = new Mesh(ledGeo, led);
  ledM.position.set(0.31, -1.665, 0);
  ledM.scale.set(0.5, 1, 1.4);
  group.add(ledM);

  /* ---------------- Battery pack ---------------- */
  const batt = new RoundedBoxGeometry(1.34, 0.6, 0.86, low ? 4 : 6, 0.085);
  const battM = add(batt, shell);
  battM.position.set(-0.36, -2.13, 0);
  const band = new RoundedBoxGeometry(1.355, 0.07, 0.875, 3, 0.03);
  const bandM = add(band, blue);
  bandM.position.set(-0.36, -1.9, 0);
  const sole = new RoundedBoxGeometry(1.3, 0.07, 0.82, 3, 0.03);
  const soleM = add(sole, rubberPlain);
  soleM.position.set(-0.36, -2.42, 0);
  // Side grip ribs
  for (const z of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const rib = new RoundedBoxGeometry(0.03, 0.26, 0.02, 2, 0.008);
      const m = add(rib, rubberPlain, false);
      m.position.set(-0.86 + i * 0.07, -2.17, z * 0.432);
    }
  }
  // Release button (front)
  const rel = new RoundedBoxGeometry(0.05, 0.14, 0.34, 3, 0.02);
  const relM = add(rel, blue);
  relM.position.set(0.32, -2.06, 0);
  // Fuel gauge LEDs (rear face)
  for (let i = 0; i < 4; i++) {
    const g = new RoundedBoxGeometry(0.02, 0.035, 0.07, 2, 0.008);
    const m = new Mesh(g, i < 3 ? ledBlue : ledDim);
    m.position.set(-1.04, -2.05, -0.17 + i * 0.11);
    group.add(m);
  }

  /* ---------------- Contact shadow ---------------- */
  const shadowTex = contactShadowTexture();
  textures.push(shadowTex);
  const shadowMat = track(
    new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false }),
  );
  const shadow = new Mesh(new PlaneGeometry(2.2, 1.5), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(-0.36, -2.455, 0);
  shadow.renderOrder = -1;
  group.add(shadow);

  // Place battery sole on y = 0 and centre the drill's visual mass over the origin.
  group.position.set(0, 0, 0);
  const inner = new Group();
  while (group.children.length) inner.add(group.children[0]);
  inner.position.set(0.18, 2.46, 0);
  group.add(inner);

  return { group, materials, textures, height: 2.46 + 0.46 };
}
