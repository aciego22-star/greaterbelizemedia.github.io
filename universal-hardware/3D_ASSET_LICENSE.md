# 3D asset licence and construction

## Summary

| | |
|---|---|
| Asset | Generic, unbranded cordless drill on a studio plinth |
| Source | **Original procedural model**, written in code for this concept (`src/hero/drill-model.ts`, `src/hero/drill-scene.ts`) |
| Author | Austere Automations (built for the Universal Hardware concept) |
| Third-party models, scans or textures | **None.** No GLB/GLTF, no downloaded textures, no HDRI files |
| Manufacturer marks | **None.** No logos, model numbers or trade dress of any manufacturer; colours follow Universal Hardware's blue/graphite palette |
| Represents | A generic drill as a visual signature for "Power Tools". **Not** a specific product, model or stock item; the page says so on the stage ("Illustrative concept model — not a specific product.") |
| Renderer | Three.js r180 (MIT) with WebGL 2 |
| Modified | N/A (original) |

## How it is built

- **Motor and gear housing**: a `LatheGeometry` revolved from a hand-tuned radius profile, scaled to an oval cross-section. Partial-lathe shells form the blue top panel. Recessed vent slots sit on both sides and radial slots on the domed end cap.
- **Clutch collar and keyless chuck sleeve**: extruded toothed profiles (knurling), with a lathed chrome front sleeve and fine grooves.
- **Twist bit**: a custom `BufferGeometry` that sweeps a two-flute cross-section along a helix and tapers to a point.
- **Handle, rubber overmold, trigger and battery foot**: bevelled `ExtrudeGeometry` built from hand-drawn Bézier side profiles. The overmold's back edge follows the handle curve and carries a procedural diamond-knurl bump map.
- **Battery pack**: `RoundedBoxGeometry` with a blue band, rubber sole, grip ribs, release button and an emissive charge gauge. There is a small emissive work light in the foot.
- **Materials**: `MeshPhysicalMaterial` (satin clearcoated plastics, chrome, brushed steel) and `MeshStandardMaterial` (rubber), with ACES filmic tone mapping in sRGB.
- **Lighting**: a code-generated studio environment (dark room with long softboxes and blue strip lights, baked once through `PMREMGenerator`), plus a key light, blue and cool rim lights, and a hemisphere fill.
- **Stage**: lathed plinth and base with thin emissive rings, a baked radial contact shadow, real soft shadows (desktop), and a shader floor with fading technical grid lines and slowly drifting contour rings.

## Performance and safety measures

- Not loaded until the page has rendered. A static render of the same scene is the first paint and the no-WebGL fallback. The bundle loads on first interaction or after an idle delay (1.6 s desktop, 3.2 s touch).
- The WebGL context is only created when the scene starts. Shaders compile with `compileAsync`, and set-up yields to the main thread between steps.
- Low-power devices (touch, ≤4 cores or ≤4 GB memory) get lower geometry detail, no shadow map, a ≤1.5 device-pixel-ratio cap and a ~30 fps cap. Adaptive resolution drops further if frames are slow.
- The scene pauses when off-screen or when the tab is hidden, and is fully disposed (geometries, materials, textures, render targets, context) on page hide.
- `prefers-reduced-motion`, the footer "Reduce motion" toggle and the stage's "Pause 3D motion" button all stop automatic motion; pausing freezes the current pose. Drag-to-rotate stays available, and `touch-action: pan-y` keeps vertical page scrolling free on phones.
- Measured footprint: ≈136 KB gzip of JavaScript (lazy chunk) and ≈11–12 MB JS heap once running. The drill is 69 meshes and ≈63.6k triangles (≈50.6k in low-detail mode); the plinth and floor add a few thousand more.

## Rights

The model, code and renders are original works created for this concept and may be reused or modified by Austere Automations. Three.js is MIT-licensed (© three.js authors).
