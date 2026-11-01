/**
 * PostCSS plugin: hover styles apply only on devices that can really hover.
 *
 * On phones and tablets a :hover rule can make the first tap only "hover" the
 * control (iOS Safari waits for a second tap when hover changes the page), and
 * hover states stick after a tap. Every rule whose selector uses :hover is
 * moved into `@media (hover: hover) and (pointer: fine)`, so on touch screens
 * each control responds to the first tap. Selectors in the same rule without
 * :hover (for example :focus-visible) stay where they are. Rules already inside
 * a hover media query are left alone.
 */
const QUERY = '(hover: hover) and (pointer: fine)';

const insideHoverMedia = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === 'atrule' && p.name === 'media' && /hover\s*:\s*hover/.test(p.params)) return true;
  }
  return false;
};

export default function hoverMedia() {
  return {
    postcssPlugin: 'hover-media',
    Once(root, { AtRule }) {
      const rules = [];
      root.walkRules((rule) => {
        if (!rule.selector.includes(':hover') || insideHoverMedia(rule)) return;
        if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
        rules.push(rule);
      });
      for (const rule of rules) {
        const hover = rule.selectors.filter((s) => s.includes(':hover'));
        const rest = rule.selectors.filter((s) => !s.includes(':hover'));
        const media = new AtRule({ name: 'media', params: QUERY });
        const moved = rule.clone({ selectors: hover });
        media.append(moved);
        rule.after(media);
        if (rest.length) rule.selectors = rest;
        else rule.remove();
      }
    },
  };
}
hoverMedia.postcss = true;
