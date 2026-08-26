import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two build outputs from one codebase:
//   npm run build         -> dist/         (multi-file static site, zipped for Netlify drag-and-drop)
//   npm run build:single  -> dist-single/  (one self-contained HTML file, used for the private preview artifact)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  build: {
    target: 'es2019',
    assetsInlineLimit: mode === 'singlefile' ? 100000000 : 4096
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts']
  }
}));
