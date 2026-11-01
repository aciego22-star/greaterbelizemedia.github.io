// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import hoverMedia from './scripts/postcss-hover-media.mjs';

// Static-first build for manual Netlify ZIP deployment.
// Each route renders to /route/index.html so nested URLs work on refresh.
export default defineConfig({
  site: 'https://universal-hardware-concept.netlify.app',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
    assets: '_assets',
  },
  integrations: [preact({ compat: false })],
  devToolbar: { enabled: false },
  vite: {
    // Hover styles only on devices that can hover, so every control responds to the first tap on touch screens.
    css: { postcss: { plugins: [hoverMedia()] } },
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
    },
  },
});
