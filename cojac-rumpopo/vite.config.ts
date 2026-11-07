import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { AtRule, Plugin as PostcssPlugin, Rule } from 'postcss';

/**
 * One tap on phones: hover effects only apply on devices that can really hover
 * (a mouse or trackpad). On touch screens a hover style can otherwise "stick"
 * after a tap, or make iOS wait for a second tap. This wraps every :hover rule in
 * @media (hover: hover) at build time, so the stylesheets stay simple to edit.
 */
function hoverOnlyWhereSupported(): PostcssPlugin {
  return {
    postcssPlugin: 'hover-only-where-supported',
    Once(root, { AtRule: MakeAtRule }) {
      const rules: Rule[] = [];
      root.walkRules((rule) => {
        if (!rule.selector.includes(':hover')) return;
        const parent = rule.parent as AtRule | undefined;
        if (parent?.type === 'atrule' && (/keyframes$/.test(parent.name) || /hover/.test(parent.params))) return;
        rules.push(rule);
      });
      for (const rule of rules) {
        const hover = rule.selectors.filter((s) => s.includes(':hover'));
        const rest = rule.selectors.filter((s) => !s.includes(':hover'));
        const media = new MakeAtRule({ name: 'media', params: '(hover: hover)' });
        media.append(rule.clone({ selectors: hover }));
        rule.after(media);
        if (rest.length) rule.selectors = rest;
        else rule.remove();
      }
    },
  };
}

// BASE_PATH lets the same source be previewed from a sub-folder (e.g. /cojac/).
// Netlify deploys at the domain root, so the default is '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  css: { postcss: { plugins: [hoverOnlyWhereSupported()] } },
  build: { target: 'es2020', cssCodeSplit: true, sourcemap: false },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
