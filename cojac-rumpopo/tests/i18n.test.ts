import { afterEach, describe, expect, it, vi } from 'vitest';

/** Loads the app modules fresh in a given language (as the pre-renderer does). */
async function loadIn(lang: 'en' | 'es') {
  vi.resetModules();
  globalThis.__COJAC_LANG__ = lang;
  const i18n = await import('../src/i18n/lang');
  const order = await import('../src/lib/order');
  const { getCatalogue } = await import('../src/content/catalogue');
  const { site } = await import('../src/content/site');
  const routes = (await import('../src/content/routes')).default;
  const { publishedFaqs } = await import('../src/content/faqs');
  return { i18n, order, catalogue: getCatalogue(), site, routes, faqs: publishedFaqs() };
}

afterEach(() => {
  globalThis.__COJAC_LANG__ = undefined;
});

describe('language paths', () => {
  it('maps every page to its Spanish address and back', async () => {
    const { i18n } = await loadIn('en');
    expect(i18n.pathIn('es', '/')).toBe('/es/');
    expect(i18n.pathIn('es', '/flavours')).toBe('/es/flavours');
    expect(i18n.pathIn('en', '/flavours')).toBe('/flavours');
    expect(i18n.localPath('/order')).toBe('/order');
  });

  it('uses the /es prefix in Spanish', async () => {
    const { i18n } = await loadIn('es');
    expect(i18n.lang).toBe('es');
    expect(i18n.localPath('/order')).toBe('/es/order');
    expect(i18n.routerBasename()).toBe('/es');
  });
});

describe('Spanish content', () => {
  it('translates page names, sizes and fulfilment options but keeps flavour names', async () => {
    const { routes, catalogue, site } = await loadIn('es');
    expect(routes.flavours.nav).toBe('Encuentra tu sabor');
    expect(routes.flavours.path).toBe('/flavours');
    expect(catalogue[0].name).toBe('Classic Vanilla Rumpopo');
    expect(catalogue[0].variants.map((v) => v.bottleSize)).toEqual(['Medio litro (500 mL)', 'Litro (1 L)']);
    expect(site.fulfilment.find((f) => f.id === 'delivery')?.label).toBe('Entrega');
    expect(site.credit.label).toBe('Sitio web desarrollado por Austere Automations');
  });

  it('writes the WhatsApp order message in Spanish, with no long dashes', async () => {
    const { order, catalogue, site } = await loadIn('es');
    const resolved = order.resolveLines([{ key: 'k', productId: catalogue[1].id, variantId: 'liter', quantity: 2, note: '' }], catalogue);
    const msg = order.buildOrderMessage({
      brandName: site.brandName,
      resolved,
      details: { fulfilment: 'delivery', area: '12 Cleghorn St', name: 'Ana', preferredDate: '2026-12-20', notes: '', payment: 'cash', bank: '' },
      fulfilment: site.fulfilment.find((f) => f.id === 'delivery'),
    } as Parameters<typeof order.buildOrderMessage>[0]);
    expect(msg).toContain('¡Hola, Cojac\'s Sumptuous Rumpopo! *Solicitud de pedido:*');
    expect(msg).toContain('2 × Peanut Delight Rumpopo (Litro): BZD $76.00');
    expect(msg).toContain('Entrega (Ciudad de Belice): BZD $7.00');
    expect(msg).toContain('*Total: BZD $83.00*');
    expect(msg).toContain('Pago: Efectivo contra entrega');
    expect(msg).toContain('Nombre: Ana');
    expect(msg).toContain('Dirección: 12 Cleghorn St');
    expect(msg).toContain('Fecha: dom, 20 de diciembre de 2026');
    expect(msg).not.toMatch(/[—–]/);
  });

  it('keeps English unchanged', async () => {
    const { routes, catalogue, faqs } = await loadIn('en');
    expect(routes.flavours.nav).toBe('Find Your Flavour');
    expect(catalogue[0].variants[1].bottleSize).toBe('Liter (1 L)');
    expect(faqs[0].question).toBe('What is rumpopo?');
  });

  it('publishes the same FAQs in both languages', async () => {
    const en = (await loadIn('en')).faqs.map((f) => f.id);
    const es = (await loadIn('es')).faqs;
    expect(es.map((f) => f.id)).toEqual(en);
    for (const f of es) expect(f.answer).not.toMatch(/[—–]/);
  });
});

describe('language redirect script', () => {
  function run(path: string, { saved = null as string | null, browser = 'en-US' } = {}) {
    let target: string | null = null;
    const store: Record<string, string> = saved ? { 'cojac-lang': saved } : {};
    const env = {
      localStorage: { getItem: (k: string) => store[k] ?? null },
      location: { pathname: path, search: '', hash: '', replace: (u: string) => (target = u) },
      navigator: { languages: [browser], language: browser },
    };
    return import('../src/i18n/lang').then(({ LANG_REDIRECT_SCRIPT }) => {
      new Function('localStorage', 'location', 'navigator', LANG_REDIRECT_SCRIPT)(env.localStorage, env.location, env.navigator);
      return target;
    });
  }

  it('sends a first-time Spanish browser to the Spanish page', async () => {
    expect(await run('/flavours', { browser: 'es-MX' })).toBe('/es/flavours');
    expect(await run('/', { browser: 'es' })).toBe('/es/');
  });

  it('leaves English browsers on English pages, and never moves anyone off a Spanish page by browser alone', async () => {
    expect(await run('/flavours')).toBeNull();
    expect(await run('/es/flavours')).toBeNull();
  });

  it('follows a saved choice', async () => {
    expect(await run('/flavours', { saved: 'es' })).toBe('/es/flavours');
    expect(await run('/es/order', { saved: 'en' })).toBe('/order');
    expect(await run('/flavours', { saved: 'en', browser: 'es-ES' })).toBeNull();
  });
});
