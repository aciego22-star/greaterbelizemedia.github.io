# 3D asset licence and construction

## Summary

| | |
|---|---|
| Asset | Makita HP333D 12V max CXT cordless drill (black edition, 1.5Ah battery) on a studio plinth |
| Reference | The product photo in Universal Hardware's Friends & Family Sale 2026 promotion, https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg (cropped copy: `public/site-images/news/makita-drill-kit.jpg`) |
| Source | **Original procedural model**, written in code for this concept (`src/hero/drill-model.ts`, `src/hero/drill-scene.ts`) and shaped by eye from that photo |
| Author | Austere Automations (built for the Universal Hardware concept) |
| Third-party models, scans or textures | **None.** No GLB/GLTF, no downloaded textures, no HDRI files, no manufacturer CAD |
| Manufacturer marks | The **Makita** wordmark on the housing and battery, traced (potrace) from the logo on Universal Hardware's Brands page into `src/hero/makita-wordmark.ts`. Makita is a trademark of Makita Corporation, shown only to identify the product Universal Hardware promotes. The battery label (teal panel, "1.5Ah", "CXT") is redrawn, not copied |
| Represents | The specific drill Universal Hardware promoted in February 2026. It is an approximation, not an exact replica, and **does not confirm current stock, price or model**. The stage says so: "3D model of the Makita drill in Universal Hardware's 2026 promotion. Not confirmed stock." |
| Renderer | Three.js r180 (MIT) with WebGL 2 |

## How it is built

- **Motor and gear housing**: a `LatheGeometry` revolved from a radius profile matched to the photo (short domed motor, tapering gear case), scaled to an oval cross-section. Radial vents sit on the rear cap and short slots on each side.
- **Logo plate and wordmark**: curved decals generated from the lathe profile, so they sit exactly on the housing. A glossy dark plate carries the white wordmark, as on the tool. The wordmark texture is drawn from the traced vector path.
- **Clutch**: a smooth printed band showing the 1–20 settings (labels at 1, 5, 8, 11, 14, 17 and 20) with drill and hammer marks, then a ribbed grip ring.
- **10 mm keyless chuck**: a ribbed rear sleeve, a smooth lathed taper and a satin-metal nose with three jaws.
- **Handle, rubber grip, trigger and foot**: bevelled `ExtrudeGeometry` from Bézier side profiles. The grip has a narrow waist and a ribbed bump map on the rubber, and the trigger is glossy black. A forward/reverse button and a two-speed slide switch sit on top.
- **BL1016 battery**: a slim `RoundedBoxGeometry` pack under the foot, with the wordmark and a teal 1.5Ah label on each side and release buttons.
- **Belt hook**: steel plate, strap and curled end on the left of the foot. There is also a work-light lens in the front of the foot.
- **Materials**: `MeshPhysicalMaterial` (black clearcoated plastics, satin metal, chrome, steel) and `MeshStandardMaterial` (rubber, decals), with ACES filmic tone mapping in sRGB.
- **Lighting**: a code-generated studio environment (dark room with long softboxes and blue strip lights, baked once through `PMREMGenerator`), plus a key light, blue and cool rim lights, and a hemisphere fill.
- **Stage**: lathed plinth and base with thin emissive rings, a baked radial contact shadow, real soft shadows (desktop), and a shader floor with fading technical grid lines and slowly drifting contour rings.
- **Pose**: the default view shows the left side with the chuck forward, as in the product photo. Drag to rotate.

## Performance and safety measures

- Not loaded until the page has rendered. A static render of the same scene is the first paint and the no-WebGL fallback. The bundle loads on first interaction or after an idle delay (1.6 s desktop, 3.2 s touch).
- The WebGL context is only created when the scene starts. Shaders compile with `compileAsync`, and set-up yields to the main thread between steps.
- Low-power devices (touch, ≤4 cores or ≤4 GB memory) get lower geometry detail, no shadow map, a ≤1.5 device-pixel-ratio cap and a ~30 fps cap. Adaptive resolution drops further if frames are slow.
- The scene pauses when off-screen or when the tab is hidden, and is fully disposed (geometries, materials, textures, render targets, context) on page hide.
- `prefers-reduced-motion`, the footer "Reduce motion" toggle and the stage's "Pause 3D motion" button all stop automatic motion; pausing freezes the current pose. Drag-to-rotate stays available, and `touch-action: pan-y` keeps vertical page scrolling free on phones.
- Measured footprint: ≈136 KB gzip of JavaScript (lazy chunk, including the 7 KB wordmark path). The drill is 54 meshes and ≈42.2k triangles (≈31.9k in low-detail mode); the plinth and floor add a few thousand more.

## Rights

The model geometry, code and renders are original works created for this concept and may be reused or modified by Austere Automations. The Makita name and wordmark belong to Makita Corporation; their use here is identification only and **needs approval before any public use**. Three.js is MIT-licensed (© three.js authors).
