/** Regenerates public/og-image.png and apple-touch-icon.png from the live hero (run against a preview server). */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.QA_BASE || 'http://localhost:4173';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
await ctx.addInitScript(() => localStorage.setItem('cojac-age-confirmed-v1', 'yes'));
const p = await ctx.newPage();
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.addStyleTag({ content: '.season-banner,.site-header,.hero__scroll,.hero__caption,.season-card-wrap{display:none!important}.hero{min-height:630px!important;padding:0!important}.hero__ctas{display:none!important}' });
await p.waitForTimeout(600);
await p.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 86 });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0"><div style="width:180px;height:180px;background:linear-gradient(160deg,#6b1525,#3a0a13);display:grid;place-items:center;font:italic 120px Georgia,serif;color:#ecd6a6">C</div></body>`);
await p.screenshot({ path: 'public/apple-touch-icon.png' });
await b.close();
