# 3D asset licence and construction

## Summary

| | |
|---|---|
| Asset | Makita HP333D 12V max CXT cordless drill (black edition), floating above a studio plinth |
| Built from | Universal Hardware's own product photo in its Friends & Family Sale 2026 promotion: https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg |
| Method | **Photo-based 3D.** The drill is cut out of the photo, and its outline is "inflated" into a solid. The photo is then mapped onto that solid. Facing the camera, the hero shows the photo itself, with real depth, lighting and rotation |
| Code | `scripts/build-hp333d.py` (offline build), `src/hero/drill-model.ts` (mesh at runtime), `src/hero/drill-scene.ts` (stage, lights, motion) |
| Data | `public/hero/hp333d.webp` (photo cut-out, 780 × 1042, 68 KB), `hp333d-lo.webp` (1x for low-power devices, 29 KB), `hp333d-depth.png` (17 KB) and `hp333d-snap.png` (2 KB), plus `src/hero/hp333d.json` |
| Third-party models, scans or textures | **None** besides the company's own photo. No GLB/GLTF, no manufacturer CAD, no HDRI files |
| Marks | The Makita wordmark and markings appear exactly as photographed. Makita is a trademark of Makita Corporation, shown only to identify the product Universal Hardware promotes |
| Represents | The specific drill Universal Hardware promoted in February 2026. It **does not confirm current stock, price or model**. The stage says so: "3D model of the Makita drill in Universal Hardware's 2026 promotion. Not confirmed stock." |
| Renderer | Three.js r180 (MIT) with WebGL 2 |

## How it is built

1. **Cut-out.** The white background is flood-filled from the photo's edges. The drill is the largest remaining shape, already separate from the charger and battery in the photo. Enclosed white areas are kept (the logo letters, clutch numbers and highlights), except the see-through openings in the belt clip. Edge pixels blended with the white background are replaced by the nearest interior colour, so no white fringe shows on the dark stage. The cut-out is upscaled 2x (Lanczos plus a light unsharp mask).
2. **Inflation.** Every point inside the outline gets a thickness from the largest balls that fit inside the outline (a "union of balls" over the medial axis), so the chuck, housing and grip come out round. A superellipse profile makes the housing and grip slightly squarer than the chuck. The real proportions are a little slimmer than round, so the depth is scaled to 0.84–1.0. The foot is a flat slab with rounded edges, as deep as the housing, and the belt clip a thin plate on the near side.
3. **Mesh.** Front and back depths are sampled on a 3 px grid (12 bits each, packed into a PNG). At runtime this becomes a mesh of ≈36.8k triangles and ≈18.5k vertices. Grid points just outside the outline are snapped onto it, so the mesh edge follows the photo exactly and the two halves join without gaps.
4. **Texturing.** The photo is mapped onto the front. The back gets a mirrored copy, which reads as the drill's other side, with the wordmark and clutch numbers flipped back in place so they still read correctly. Where the surface turns away from the photo plane (the sides), the photo fades to plain black plastic, because the photo holds no information there.
5. **Material.** The photo is already lit, so facing the camera it is shown exactly as photographed: fully emissive and excluded from the scene's filmic tone mapping, which would otherwise darken and flatten its blacks and highlights. A faint diffuse term and a low, rough specular let the key and blue rim lights add depth and edge highlights as it turns, with no clearcoat to lay a grey haze over the black plastic. Only truly grazing surfaces (the outline's sides) fade to plain black, so the photo's own edge detail stays.
6. **Stage and pose.** The photo plane faces the camera (tilted back 14° to match the camera's 15° elevation). The drill floats above the plinth, as in the photo, with a soft shadow below. It sways gently (±16°) and follows the pointer, and drag-to-rotate turns it fully around.

Limits: the model is reconstructed from a single photo, so the far side is a mirror image of the near side, and depth is estimated from the outline rather than measured. Small details seen edge-on (the trigger's depth, the clip's bend) are approximations.

## Performance and safety measures

- Not loaded until the page has rendered. A static render of the same scene is the first paint and the no-WebGL fallback. The bundle and the drill data load on first interaction or after an idle delay (1.6 s desktop, 3.2 s touch).
- The WebGL context is only created when the scene starts. Shaders compile with `compileAsync`, and set-up yields to the main thread between steps.
- Low-power devices (touch, ≤4 cores or ≤4 GB memory) get the 1x texture, no shadow map, a ≤1.5 device-pixel-ratio cap and a ~30 fps cap. Adaptive resolution drops further if frames are slow.
- The scene pauses when off-screen or when the tab is hidden, and is fully disposed (geometries, materials, textures, render targets, context) on page hide.
- `prefers-reduced-motion`, the footer "Reduce motion" toggle and the stage's "Pause 3D motion" button all stop automatic motion; pausing freezes the current pose. Drag-to-rotate stays available, and `touch-action: pan-y` keeps vertical page scrolling free on phones.
- Footprint: ≈122 KB gzip of JavaScript (lazy chunk) plus ≈88 KB of drill data (≈50 KB on low-power devices).

## Rights

The code, inflation method and renders are original work by Austere Automations for this concept. The product photo belongs to Universal Hardware Company Ltd. and/or Makita; it is used here as the company published it, for this private concept. The Makita name and wordmark belong to Makita Corporation. **Use of the photo and the Makita mark needs approval before any public use.** Three.js is MIT-licensed (© three.js authors).
