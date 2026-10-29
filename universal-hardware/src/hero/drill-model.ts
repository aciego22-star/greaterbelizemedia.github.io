/**
 * The Makita HP333D 12V max CXT drill, built from Universal Hardware's own
 * product photo (Friends & Family Sale 2026 promotion).
 *
 * scripts/build-hp333d.py cuts the drill out of the photo and "inflates" its
 * outline into a solid (union of balls, so the chuck, housing and grip come
 * out round; flat slab for the foot; thin plate for the belt clip). It ships:
 *  - hp333d.webp / hp333d-lo.webp: the photo cut-out, colour + alpha matte;
 *  - hp333d-depth.png: front and back surface depth on a 3 px grid;
 *  - hp333d-snap.png: offsets that move the grid's edge points onto the outline.
 * Here the grid becomes a mesh, the photo is mapped onto the front, and a
 * mirrored copy onto the back, with the wordmark and clutch numbers flipped
 * back so they still read correctly from that side. Facing the camera it is
 * the photo; the geometry gives it real depth, lighting and rotation.
 * Units: 1 ≈ 7 cm. Lowest point (belt clip) at y = 0 after build.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  type Material,
} from 'three';
import { assetUrl } from '../lib/asset-url';
import meta from './hp333d.json';

export interface DrillParts {
  group: Group;
  materials: Material[];
  textures: Texture[];
  height: number;
}

/** Model units per photo pixel (the drill is ~500 px tall in the photo). */
const K = 0.0056;
/** Gap between the plinth and the drill's lowest point: the drill floats, as in the photo. */
const HOVER = 0.16;
/** Lean the photo plane back so it faces the camera, which looks down at 15°. */
const TILT = -0.25;

/**
 * Text regions (1x photo pixels, x/y/w/h) flipped in place on the back
 * texture, so the mirrored back still reads correctly: the wordmark and the
 * clutch numbers.
 */
const FLIP_RECTS: [number, number, number, number][] = [
  [256, 76, 90, 38],
  [148, 42, 18, 15],
  [186, 44, 15, 13],
  [166, 54, 18, 23],
  [180, 86, 17, 25],
  [181, 117, 16, 22],
];

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

function contactShadowTexture(): CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.7)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.38)');
  grd.addColorStop(0.75, 'rgba(0,0,0,0.1)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Back-side texture: the photo with its text regions mirrored in place. */
function backTexture(img: HTMLImageElement, scale: number): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  for (const [x, y, w, h] of FLIP_RECTS) {
    const [sx, sy, sw, sh] = [x * scale, y * scale, w * scale, h * scale];
    g.save();
    g.translate(sx + sw, sy);
    g.scale(-1, 1);
    g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    g.restore();
  }
  return new CanvasTexture(c);
}

function pixels(img: HTMLImageElement): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  return g.getImageData(0, 0, c.width, c.height).data;
}

interface Depth {
  front: Float32Array;
  back: Float32Array;
  /** Offset (grid units) onto the outline for points just outside it. */
  sx: Float32Array;
  sy: Float32Array;
  w: number;
  h: number;
}

/** Front and back depth (photo pixels) per grid point; NaN where there is no vertex. */
function decodeDepth(img: HTMLImageElement, snapImg: HTMLImageElement): Depth {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const px = pixels(img);
  const sp = pixels(snapImg);
  const sx = new Float32Array(w * h);
  const sy = new Float32Array(w * h);
  const front = new Float32Array(w * h);
  const back = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = px[i * 4];
    const gg = px[i * 4 + 1];
    const b = px[i * 4 + 2];
    const fe = (r << 4) | (gg >> 4);
    const be = ((gg & 15) << 8) | b;
    front[i] = fe ? fe / 16 - 128 : NaN;
    back[i] = fe ? be / 16 - 128 : NaN;
    sx[i] = (sp[i * 4] - 128) / 16;
    sy[i] = (sp[i * 4 + 1] - 128) / 16;
  }
  return { front, back, sx, sy, w, h };
}

function buildGeometry(depth: Depth): BufferGeometry {
  const { front, back, sx, sy, w, h } = depth;
  const [texW, texH] = meta.size;
  const gs = meta.grid;
  const cx = (meta.bbox[0] + meta.bbox[2]) / 2;
  const bottom = meta.bbox[3];
  const pos: number[] = [];
  const uv: number[] = [];
  const fIdx = new Int32Array(w * h).fill(-1);
  const bIdx = new Int32Array(w * h).fill(-1);
  const vert = (k: number, z: number) => {
    const x = (k % w) * gs + sx[k];
    const y = Math.floor(k / w) * gs + sy[k];
    pos.push((x - cx) * K, (bottom - y) * K, z * K);
    uv.push((x + 0.5) / texW, 1 - (y + 0.5) / texH);
    return pos.length / 3 - 1;
  };
  const inside = (k: number) => front[k] !== back[k];
  for (let k = 0; k < w * h; k++) {
    if (Number.isNaN(front[k])) continue;
    fIdx[k] = vert(k, front[k]);
    // Points snapped onto the outline carry one shared vertex, which joins the two halves.
    bIdx[k] = inside(k) ? vert(k, back[k]) : fIdx[k];
  }
  const fTri: number[] = [];
  const bTri: number[] = [];
  for (let j = 0; j + 1 < h; j++) {
    for (let i = 0; i + 1 < w; i++) {
      const a = j * w + i;
      const b = a + 1;
      const c = a + w;
      const d = c + 1;
      if (fIdx[a] < 0 || fIdx[b] < 0 || fIdx[c] < 0 || fIdx[d] < 0) continue;
      if (!inside(a) && !inside(b) && !inside(c) && !inside(d)) continue;
      fTri.push(fIdx[a], fIdx[c], fIdx[b], fIdx[b], fIdx[c], fIdx[d]);
      bTri.push(bIdx[a], bIdx[b], bIdx[c], bIdx[b], bIdx[d], bIdx[c]);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  geo.setIndex([...fTri, ...bTri]);
  geo.addGroup(0, fTri.length, 0);
  geo.addGroup(fTri.length, bTri.length, 1);
  geo.computeVertexNormals();
  // How squarely each point faces the photo plane. The photo has no
  // information about the sides, so they fade to plain black plastic.
  const n = geo.getAttribute('normal');
  const facing = new Float32Array(n.count);
  for (let i = 0; i < n.count; i++) {
    const t = Math.min(1, Math.max(0, (Math.abs(n.getZ(i)) - 0.14) / 0.36));
    facing[i] = t * t * (3 - 2 * t);
  }
  geo.setAttribute('facing', new BufferAttribute(facing, 1));
  return geo;
}

/** Blend the photo towards plain black plastic where the surface turns away from it. */
function fadeSides(m: MeshPhysicalMaterial) {
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float facing;\nvarying float vFacing;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFacing = facing;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFacing;')
      .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(vec3(0.006), diffuseColor.rgb, vFacing);')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\ntotalEmissiveRadiance = mix(vec3(0.004), totalEmissiveRadiance, vFacing);',
      );
  };
}

export async function buildDrill(opts: { lowDetail?: boolean } = {}): Promise<DrillParts> {
  const low = !!opts.lowDetail;
  const group = new Group();
  group.name = 'drill';
  const materials: Material[] = [];
  const textures: Texture[] = [];

  const [photo, depthImg, snapImg] = await Promise.all([
    loadImage(assetUrl(low ? 'hero/hp333d-lo.webp' : 'hero/hp333d.webp')),
    loadImage(assetUrl('hero/hp333d-depth.png')),
    loadImage(assetUrl('hero/hp333d-snap.png')),
  ]);
  const scale = photo.naturalWidth / meta.size[0];

  const frontMap = new Texture(photo);
  const backMap = backTexture(photo, scale);
  for (const t of [frontMap, backMap]) {
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    textures.push(t);
  }

  // The mesh edge follows the outline (snap offsets), so the matte is not
  // needed for the silhouette and the surface stays opaque from every side.
  // The photo is already lit, so it is shown mostly as photographed
  // (emissive) with a little diffuse and a satin clearcoat on top: the scene's
  // key and rim lights then add depth without washing out the black plastic.
  const surface = (map: Texture) => {
    const m = new MeshPhysicalMaterial({
      map,
      color: '#3a3a3a',
      roughness: 0.6,
      metalness: 0,
      specularIntensity: 0.55,
      clearcoat: 0.12,
      clearcoatRoughness: 0.45,
      emissive: '#ffffff',
      emissiveMap: map,
      emissiveIntensity: 0.78,
    });
    fadeSides(m);
    materials.push(m);
    return m;
  };

  const geo = buildGeometry(decodeDepth(depthImg, snapImg));
  const body = new Mesh(geo, [surface(frontMap), surface(backMap)]);
  body.castShadow = true;
  body.receiveShadow = true;

  // Lean back about the drill's centre so the photo plane faces the camera.
  const midY = ((meta.bbox[3] - meta.bbox[1]) / 2) * K;
  const tilt = new Group();
  tilt.position.y = midY + HOVER;
  tilt.rotation.x = TILT;
  body.position.y = -midY;
  tilt.add(body);
  group.add(tilt);

  /* Soft shadow on the plinth under the floating drill */
  const shadowTex = contactShadowTexture();
  textures.push(shadowTex);
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.75, toneMapped: false });
  materials.push(shadowMat);
  const shadow = new Mesh(new PlaneGeometry(1.7, 1.1), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.1, 0.004, 0);
  shadow.renderOrder = -1;
  group.add(shadow);

  return { group, materials, textures, height: (meta.bbox[3] - meta.bbox[1]) * K + HOVER };
}
