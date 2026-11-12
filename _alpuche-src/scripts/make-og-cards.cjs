// Renders the two 1200×630 social cards with the site fonts (run after make-images.sh).
//   node scripts/make-og-cards.cjs
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const S = path.resolve(__dirname, '..', 'static');
const url = (p) => 'file://' + path.join(S, p);
const css = `
@font-face{font-family:C;src:url(${url('fonts/cormorant-garamond-latin.woff2')});font-weight:300 700}
@font-face{font-family:I;src:url(${url('fonts/inter-latin.woff2')});font-weight:100 900}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#11171b;color:#f6f2eb;font-family:I;display:flex;overflow:hidden}
.copy{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 72px}
.mark{width:118px;height:93px;margin-bottom:44px}.mark img{width:100%;height:100%}
h1{font:600 76px/0.95 C;letter-spacing:-2px}p{margin-top:18px;color:#e4cba7;font-size:22px;font-weight:600;letter-spacing:4px;text-transform:uppercase}
.rule{width:72px;height:2px;background:#e4cba7;margin-top:40px}
.photo{width:420px;height:630px;background:#21282d}.photo img{width:100%;height:100%;object-fit:cover;object-position:50% 0}`;
const card = (photo) => `<!doctype html><style>${css}</style><body><div class="copy"><div class="mark"><img src="${url('img/jma-mark.jpg')}"></div>
<h1>José M. Alpuche</h1><p>Attorney-at-Law · Belize City</p><div class="rule"></div></div>${photo ? `<div class="photo"><img src="${url('img/jose-710.jpg')}"></div>` : ''}</body>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [name, photo] of [['og-brand', false], ['og-portrait', true]]) {
    const tmp = path.join(os.tmpdir(), 'og-card-' + name + '.html');
    fs.writeFileSync(tmp, card(photo));
    await p.goto('file://' + tmp, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(S, 'img', name + '.jpg'), type: 'jpeg', quality: 85 });
  }
  await b.close();
})();
