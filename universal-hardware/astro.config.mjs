// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// Static-first build for manual Netlify ZIP deployment.
// Each route renders to /route/index.html so nested URLs work on refresh.
export default defineConfig({
  site: 'https://universal-hardware-concept.netlify.app',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  integrations: [preact({ compat: false })],
  devToolbar: { enabled: false },
  vite: {
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
    },
  },
});
