/**
 * Original technical line illustrations for each category (Austere concept
 * artwork, no third-party imagery). Generic forms only: they do not depict
 * any specific product, model or manufacturer. Shared by Astro components
 * (set:html) and Preact islands.
 */
import type { IllustrationId } from '../data/categories';

// Programmatic helpers for repeated detail.
const teeth = (cx: number, cy: number, r: number, n: number, depth: number) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 0.62) / n) * Math.PI * 2;
    const a2 = ((i + 1) / n) * Math.PI * 2;
    const p = (a: number, rr: number) => `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    d += `${i === 0 ? 'M' : 'L'}${p(a0, r)} L${p(a1, r + depth)} L${p(a2, r)} `;
  }
  return d + 'Z';
};
const spokes = (cx: number, cy: number, r0: number, r1: number, n: number, rot = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return `M${(cx + Math.cos(a) * r0).toFixed(1)} ${(cy + Math.sin(a) * r0).toFixed(1)}L${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}`;
  }).join('');
const barbs = (x0: number, x1: number, y: (x: number) => number, step: number) => {
  let d = '';
  for (let x = x0 + step / 2; x < x1; x += step) {
    const yy = y(x);
    d += `M${x - 4} ${yy - 4}L${x + 4} ${yy + 4}M${x + 4} ${yy - 4}L${x - 4} ${yy + 4}`;
  }
  return d;
};
const sag = (x0: number, x1: number, y0: number, s: number) => (x: number) => {
  const t = (x - x0) / (x1 - x0);
  return y0 + s * 4 * t * (1 - t);
};
const wireA = sag(52, 188, 70, 6);
const wireB = sag(52, 188, 98, 6);
const wireC = sag(52, 188, 126, 6);

const ART: Record<IllustrationId, string> = {
  drill: `<g>
  <path class="fill" d="M58 44h84a12 12 0 0 1 12 12v14a12 12 0 0 1-12 12H58a16 16 0 0 1-16-16v-6a16 16 0 0 1 16-16z" />
  <path class="accent-fill" d="M60 44h82a12 12 0 0 1 11 7H45a16 16 0 0 1 15-7z" stroke="none" />
  <path d="M58 44h84a12 12 0 0 1 12 12v14a12 12 0 0 1-12 12H58a16 16 0 0 1-16-16v-6a16 16 0 0 1 16-16z" />
  <path d="M154 48h10v30h-10" />
  <path d="M157 48v30M161 48v30" stroke-width="1.2" />
  <path d="M164 51l22 4v16l-22 4z" />
  <path d="M186 57h8v8h-8" />
  <path class="accent" d="M194 61h30" stroke-width="2.4" />
  <path class="accent" d="M200 58l3 6M206 58l3 6M212 58l3 6M218 58l3 6" stroke-width="1.3" />
  <path d="M60 56l-5 12M66 56l-5 12M72 56l-5 12" stroke-width="1.4" />
  <path class="fill" d="M78 82c-2 18-8 32-14 46h44c-2-14 0-28 8-46z" />
  <path d="M78 82c-2 18-8 32-14 46h44c-2-14 0-28 8-46" />
  <path d="M84 92c-2 12-6 24-10 34" stroke-width="1.2" />
  <path class="accent-fill" d="M116 86h10a3 3 0 0 1 3 3c0 6-3 11-8 14h-7z" />
  <path d="M116 86h10a3 3 0 0 1 3 3c0 6-3 11-8 14h-7" />
  <rect class="fill" x="54" y="128" width="96" height="9" rx="3" />
  <rect class="fill" x="58" y="137" width="88" height="25" rx="5" />
  <path class="accent" d="M58 143h88" stroke-width="2.4" />
  <path d="M66 149v8M71 149v8M76 149v8" stroke-width="1.3" />
  <circle class="accent-fill" cx="148" cy="132.5" r="2" stroke="none" />
</g>`,
  welding: `<g>
  <path class="fill" d="M34 132l92-12 80 12-92 14z" />
  <path d="M34 132l92-12 80 12-92 14zM34 132v8l80 14 92-14v-8M114 146v8" />
  <path class="accent" d="M58 129c3-2 6-2 8 0s5 2 8 0 6-2 8 0 5 2 8 0 6-2 8 0 5 2 8 0" stroke-width="2.4" />
  <path d="M206 18c-18 4-30 14-38 28" />
  <path class="fill" d="M178 34l14 10-26 34-14-10z" />
  <path d="M178 34l14 10-26 34-14-10z" />
  <path d="M170 50l10 7M166 56l10 7" stroke-width="1.2" />
  <path d="M152 68c-8 10-14 22-18 36" stroke-width="7" stroke-linecap="round" />
  <path class="fill" d="M128 100l14 6-6 14-12-6z" />
  <path d="M128 100l14 6-6 14-12-6z" />
  <g class="accent" stroke-width="1.8">
    <path d="M126 126l-10 6M128 124l-4-12M132 125l12-4M130 127l8 10M124 127l-12-2M128 128l-2 12" />
  </g>
  <circle class="accent-fill" cx="128" cy="125" r="4" stroke="none" />
  <circle class="accent-fill" cx="106" cy="112" r="1.8" stroke="none" />
  <circle class="accent-fill" cx="150" cy="114" r="1.6" stroke="none" />
  <circle class="accent-fill" cx="112" cy="140" r="1.4" stroke="none" />
</g>`,
  handtools: `<g>
  <g transform="rotate(-45 120 96)">
    <rect class="fill" x="112" y="40" width="16" height="104" rx="6" />
    <rect x="112" y="40" width="16" height="104" rx="6" />
    <path d="M112 118h16M112 124h16M112 130h16" stroke-width="1.2" />
    <path class="fill" d="M92 22h46a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H92l-12-3V25z" />
    <path d="M92 22h46a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H92l-12-3V25z" />
    <path class="accent" d="M80 25c-10-4-16 0-20 8M80 39c-10 4-16 0-20-8" stroke-width="2.2" />
  </g>
  <g transform="rotate(45 120 96)">
    <path class="fill" d="M114 52h12v84h-12z" />
    <path d="M114 52h12v84h-12z" />
    <path class="fill" d="M108 22a20 20 0 0 1 24 0l2 18-8 12h-12l-8-12z" />
    <path d="M108 22a20 20 0 0 1 24 0l2 18-8 12h-12l-8-12zM114 22v12h12V22" />
    <circle class="fill" cx="120" cy="150" r="16" />
    <circle cx="120" cy="150" r="16" />
    <path class="accent" d="M120 140l8.7 5v10L120 160l-8.7-5v-10z" stroke-width="2.2" />
  </g>
</g>`,
  mower: `<g>
  <path d="M150 106L196 28" />
  <path d="M188 22l18 10" stroke-width="5" />
  <path d="M172 64l10 4" stroke-width="1.4" />
  <path class="fill" d="M44 108c6-16 22-24 44-24h52c14 0 22 8 24 24l2 14H40z" />
  <path d="M44 108c6-16 22-24 44-24h52c14 0 22 8 24 24l2 14H40z" />
  <path class="accent-fill" d="M42 116h124v6H40z" stroke="none" />
  <rect class="fill" x="76" y="58" width="44" height="28" rx="6" />
  <rect x="76" y="58" width="44" height="28" rx="6" />
  <path d="M82 66h32M82 72h32M82 78h32" stroke-width="1.2" />
  <path class="fill" d="M86 46h24v12H86z" />
  <path d="M86 46h24v12H86zM98 46v-8h10" />
  <circle class="fill" cx="58" cy="138" r="16" />
  <circle cx="58" cy="138" r="16" />
  <circle cx="58" cy="138" r="5" />
  <circle class="fill" cx="150" cy="138" r="16" />
  <circle cx="150" cy="138" r="16" />
  <circle cx="150" cy="138" r="5" />
  <path class="accent" d="M32 164l4-12 4 12M88 164l3-10 3 10M100 164l4-14 4 14M180 164l3-10 3 10M196 164l4-12 4 12" stroke-width="1.6" />
</g>`,
  fan: `<g>
  <path class="fill" d="M108 16h24l-4 10h-16z" />
  <path d="M108 16h24l-4 10h-16zM120 26v26" />
  <path class="fill" d="M24 74c30-10 56-12 80-6l-2 8c-26 2-52 2-78-2z" />
  <path d="M24 74c30-10 56-12 80-6l-2 8c-26 2-52 2-78-2z" />
  <path class="fill" d="M216 74c-30-10-56-12-80-6l2 8c26 2 52 2 78-2z" />
  <path d="M216 74c-30-10-56-12-80-6l2 8c26 2 52 2 78-2z" />
  <path class="accent" d="M34 72c22-6 44-8 64-6M206 72c-22-6-44-8-64-6" stroke-width="1.3" />
  <rect class="fill" x="98" y="52" width="44" height="28" rx="12" />
  <rect x="98" y="52" width="44" height="28" rx="12" />
  <path d="M98 66h44" stroke-width="1.2" />
  <path d="M112 80v6h16v-6" />
  <path class="accent-fill" d="M106 86h28c0 14-6 22-14 22s-14-8-14-22z" />
  <path d="M106 86h28c0 14-6 22-14 22s-14-8-14-22z" />
  <path d="M120 108v24" stroke-width="1.2" stroke-dasharray="2 3" />
  <circle cx="120" cy="136" r="3" />
</g>`,
  saw: `<g>
  <path class="fill" d="M22 124l40-26h160l-40 26z" />
  <path d="M22 124l40-26h160l-40 26zM22 124v10h160v-10M182 134l40-26v-10" />
  <path d="M92 116l28-18" stroke-width="1.2" />
  <path class="fill" d="${teeth(120, 80, 40, 28, 6)}" />
  <path d="${teeth(120, 80, 40, 28, 6)}" />
  <circle cx="120" cy="80" r="24" stroke-width="1.2" />
  <circle class="accent-fill" cx="120" cy="80" r="8" />
  <circle cx="120" cy="80" r="8" />
  <path class="accent" d="${spokes(120, 80, 12, 22, 6, 0.3)}" stroke-width="1.4" />
  <path d="M60 120h18M150 120h18" stroke-width="1.2" opacity=".5" />
</g>`,
  generator: `<g>
  <path d="M36 150V58a14 14 0 0 1 14-14h140a14 14 0 0 1 14 14v92" stroke-width="3.2" />
  <path d="M30 150h180" stroke-width="3.2" />
  <path class="fill" d="M66 30h96a8 8 0 0 1 8 8v20H58V38a8 8 0 0 1 8-8z" />
  <path d="M66 30h96a8 8 0 0 1 8 8v20H58V38a8 8 0 0 1 8-8z" />
  <path class="accent-fill" d="M58 50h112v8H58z" stroke="none" />
  <rect x="140" y="22" width="16" height="8" rx="2" />
  <rect class="fill" x="52" y="72" width="62" height="64" rx="6" />
  <rect x="52" y="72" width="62" height="64" rx="6" />
  <path d="M60 84h46M60 92h46M60 100h46M60 108h46M60 116h46" stroke-width="1.2" />
  <circle class="fill" cx="150" cy="104" r="30" />
  <circle cx="150" cy="104" r="30" />
  <circle cx="150" cy="104" r="18" stroke-width="1.2" />
  <circle class="accent-fill" cx="150" cy="104" r="6" />
  <circle cx="150" cy="104" r="6" />
  <path class="accent" d="M188 76v52" stroke-width="2.2" />
  <circle cx="196" cy="88" r="3" stroke-width="1.4" />
  <circle cx="196" cy="102" r="3" stroke-width="1.4" />
  <path d="M44 150v12M196 150v12" stroke-width="3" />
</g>`,
  pump: `<g>
  <rect class="fill" x="30" y="78" width="88" height="52" rx="8" />
  <rect x="30" y="78" width="88" height="52" rx="8" />
  <path d="M42 78v52M54 78v52M66 78v52M78 78v52M90 78v52" stroke-width="1.2" />
  <path class="accent-fill" d="M104 80h14v48h-14z" stroke="none" />
  <path d="M104 78v52" />
  <path d="M118 96h12v16h-12" />
  <circle class="fill" cx="156" cy="104" r="30" />
  <circle cx="156" cy="104" r="30" />
  <path d="M156 104m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0" />
  <path class="accent" d="${spokes(156, 104, 12, 24, 5, 0.6)}" stroke-width="1.4" />
  <path class="fill" d="M186 96h22v16h-22z" />
  <path d="M186 96h22v16h-22zM208 90v28" />
  <path class="fill" d="M148 74V44h16v30z" />
  <path d="M148 74V44h16v30M142 44h28" />
  <path class="accent-fill" d="M156 14c0 0 9 10 9 16a9 9 0 0 1-18 0c0-6 9-16 9-16z" />
  <path class="accent" d="M156 14c0 0 9 10 9 16a9 9 0 0 1-18 0c0-6 9-16 9-16z" />
  <path d="M24 140h192v10H24z" />
  <path d="M44 130v10M188 134v6" />
</g>`,
  fridge: `<g>
  <path class="fill" d="M146 22l24-10v138l-24 10z" />
  <path d="M146 22l24-10v138l-24 10z" />
  <path d="M76 22l24-10h70" />
  <rect class="fill" x="76" y="22" width="70" height="138" rx="5" />
  <rect x="76" y="22" width="70" height="138" rx="5" />
  <path d="M76 70h70" />
  <path class="accent" d="M134 36v22M134 84v40" stroke-width="3" />
  <path d="M84 160v6M138 160v6" stroke-width="3" />
  <path class="accent-fill" d="M82 28h22v6H82z" stroke="none" />
  <rect class="fill" x="182" y="104" width="34" height="56" rx="4" />
  <rect x="182" y="104" width="34" height="56" rx="4" />
  <path d="M188 114h22M188 120h22M188 126h22" stroke-width="1.2" />
  <circle class="accent-fill" cx="199" cy="144" r="8" />
  <circle cx="199" cy="144" r="8" />
</g>`,
  fence: `<g>
  <path class="fill" d="M44 50h12v116H44zM184 50h12v116h-12z" />
  <path d="M44 50h12v116H44zM184 50h12v116h-12zM42 50l8-6 8 6M182 50l8-6 8 6" />
  <path d="M56 70Q120 82 184 70M56 98Q120 110 184 98M56 126Q120 138 184 126" stroke-width="1.6" />
  <path class="accent" d="${barbs(56, 184, wireA, 22) + barbs(56, 184, wireB, 22) + barbs(56, 184, wireC, 22)}" stroke-width="1.6" />
  <path d="M196 70h20M196 98h20M196 126h20M24 70h20M24 98h20M24 126h20" stroke-width="1.6" stroke-dasharray="3 4" />
</g>`,
  compressor: `<g>
  <rect class="fill" x="28" y="96" width="164" height="44" rx="22" />
  <rect x="28" y="96" width="164" height="44" rx="22" />
  <path class="accent-fill" d="M50 96h8v44h-8z" stroke="none" />
  <path d="M60 96v44M160 96v44" stroke-width="1.2" />
  <rect class="fill" x="66" y="56" width="50" height="40" rx="5" />
  <rect x="66" y="56" width="50" height="40" rx="5" />
  <path d="M74 64h34M74 72h34M74 80h34" stroke-width="1.2" />
  <circle class="fill" cx="144" cy="72" r="18" />
  <circle cx="144" cy="72" r="18" />
  <circle cx="144" cy="72" r="5" />
  <path d="M144 54L116 64M144 90L116 88" stroke-width="1.2" />
  <circle class="fill" cx="186" cy="74" r="12" />
  <circle cx="186" cy="74" r="12" />
  <path class="accent" d="M186 74l6-6" stroke-width="2" />
  <path d="M186 86v10" />
  <path d="M28 92c-8-20 2-34 22-36" />
  <circle class="fill" cx="52" cy="150" r="12" />
  <circle cx="52" cy="150" r="12" />
  <path d="M172 140v22M164 162h16" stroke-width="2.4" />
</g>`,
  motorcycle: `<g>
  <circle class="fill" cx="56" cy="130" r="29" />
  <circle cx="56" cy="130" r="29" />
  <circle cx="56" cy="130" r="20" stroke-width="1.2" />
  <circle cx="56" cy="130" r="4.5" />
  <circle class="fill" cx="186" cy="130" r="29" />
  <circle cx="186" cy="130" r="29" />
  <circle cx="186" cy="130" r="20" stroke-width="1.2" />
  <circle cx="186" cy="130" r="4.5" />
  <path d="M56 130l50-18" stroke-width="3" />
  <path d="M38 100c6-12 14-18 26-20" stroke-width="2" />
  <path class="fill" d="M58 74h56l-4 10H62z" />
  <path d="M58 74h56l-4 10H62z" />
  <path class="fill" d="M110 84c2-14 22-24 48-20l-4 20z" />
  <path class="accent-fill" d="M118 76c8-7 22-11 38-10l-1.6 7c-12-1-24 1-36 6z" stroke="none" />
  <path d="M110 84c2-14 22-24 48-20l-4 20z" />
  <path d="M70 84l36 28" stroke-width="2" />
  <path d="M158 62l-14 40" stroke-width="2" />
  <rect class="fill" x="98" y="94" width="44" height="30" rx="6" />
  <rect x="98" y="94" width="44" height="30" rx="6" />
  <path d="M106 102h28M106 109h28M106 116h20" stroke-width="1.2" />
  <path d="M160 56l26 74" stroke-width="3" />
  <path d="M148 46l12 8 14-4" stroke-width="2.4" />
  <circle class="accent-fill" cx="174" cy="68" r="6" />
  <circle cx="174" cy="68" r="6" />
  <path d="M168 104c10-8 26-6 34 4" stroke-width="2" />
  <path class="accent" d="M120 126c-20 8-46 6-74-6" stroke-width="2.6" />
</g>`,
};

export function artSvg(id: IllustrationId, opts: { cls?: string; title?: string } = {}): string {
  const label = opts.title ? `role="img" aria-label="${opts.title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  return `<svg class="cat-art${opts.cls ? ' ' + opts.cls : ''}" viewBox="0 0 240 180" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${label}><g class="cat-art__grid" stroke-width="1"><path d="M24 166H216"/><path d="M24 162v8M216 162v8"/></g>${ART[id]}</svg>`;
}
