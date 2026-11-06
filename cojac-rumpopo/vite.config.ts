import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same source be previewed from a sub-folder (e.g. /cojac/).
// Netlify deploys at the domain root, so the default is '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: { target: 'es2020', cssCodeSplit: true, sourcemap: false },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
