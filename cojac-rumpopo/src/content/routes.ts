/**
 * Page names, titles and descriptions in the current language.
 * English lives in routes.json; Spanish is below. Paths are the same in both
 * languages (Spanish pages add the /es prefix through the router).
 */
import en from './routes.json';
import { isEs } from '../i18n/lang';

type RouteKey = keyof typeof en;
type RouteInfo = { path: string; nav: string; short?: string; title: string; description: string };

const es: Record<RouteKey, Omit<RouteInfo, 'path'>> = {
  home: {
    nav: 'Inicio',
    title: 'Cojac’s Sumptuous Rumpopo | Rumpopo navideño beliceño, Ciudad de Belice',
    description:
      'Rumpopo (rum popo) beliceño, rico y cremoso, en Classic Vanilla, Peanut Delight y Pumpkin Spice. Una tradición navideña familiar. Pide por WhatsApp en la Ciudad de Belice.',
  },
  story: {
    nav: 'Nuestra historia: detrás de la botella',
    short: 'Nuestra historia',
    title: 'Nuestra historia: detrás de la botella | Rumpopo beliceño Cojac’s',
    description:
      'Una receta familiar beliceña, el amor por un buen rumpopo y el deseo de que cada botella valga la pena compartirla. Algunas tradiciones merecen conservarse y otras, reinventarse.',
  },
  flavours: {
    nav: 'Encuentra tu sabor',
    short: 'Sabores',
    title: 'Sabores de rumpopo: encuentra tu sabor | Cojac’s Sumptuous Rumpopo',
    description:
      'Classic Vanilla, Peanut Delight, Pumpkin Spice y creaciones de temporada. Elige tus sabores de rumpopo Cojac’s y envía tu pedido por WhatsApp.',
  },
  guarantee: {
    nav: 'La garantía Cojac’s',
    short: 'Nuestra garantía',
    title: 'La garantía Cojac’s | Rumpopo rico, cremoso y lleno hasta el tope',
    description:
      'Rico y cremoso. Sin sabor a huevo. Lleno hasta el tope. Mucho más que vainilla clásica. Lo que puedes esperar en cada botella de rumpopo Cojac’s.',
  },
  gallery: {
    nav: 'La galería suntuosa',
    short: 'Galería',
    title: 'La galería suntuosa | Botellas de rumpopo Cojac’s y momentos navideños',
    description: 'Botellas, regalos navideños y momentos de Navidad de la temporada de rumpopo Cojac’s en Belice.',
  },
  videos: {
    nav: 'Videos y reportajes',
    short: 'Videos y reportajes',
    title: 'Videos y reportajes | Cojac’s Sumptuous Rumpopo en TV y redes sociales',
    description:
      'Entrevistas de televisión, reportajes navideños, eventos comunitarios y momentos en redes sociales del camino de Cojac’s, incluidos reportajes de Greater Belize Media.',
  },
  holidayBlog: {
    nav: 'Blog navideño',
    title: 'Blog navideño | Cojac’s Sumptuous Rumpopo Belice',
    description:
      'Celebra la temporada de rumpopo en Belice con historias navideñas de Cojac’s, noticias de sabores, anuncios festivos y novedades desde detrás de la botella.',
  },
  order: {
    nav: 'Pedir',
    title: 'Pide rumpopo por WhatsApp | Cojac’s Sumptuous Rumpopo',
    description:
      'Arma tu pedido de rumpopo y envíaselo a Cojac’s por WhatsApp. Entrega por BZD $7 en cualquier parte de la Ciudad de Belice, opción de recoger y envíos a otros distritos.',
  },
  faqs: {
    nav: 'Preguntas frecuentes',
    short: 'Preguntas',
    title: 'Preguntas frecuentes sobre rumpopo: pedidos, entregas y sabores | Cojac’s',
    description:
      '¿Qué es el rumpopo? ¿Cómo hago un pedido? ¿Hacen entregas en la Ciudad de Belice? Respuestas sobre el rumpopo Cojac’s, los pedidos por WhatsApp, los sabores, el alcohol y las alergias.',
  },
  contact: {
    nav: 'Conecta con nosotros',
    short: 'Contacto',
    title: 'Conecta con nosotros | Cojac’s Sumptuous Rumpopo, Diego St, Ciudad de Belice',
    description:
      'Haz tu pedido y tus preguntas por WhatsApp. Cojac’s Sumptuous Rumpopo es un negocio familiar beliceño en Diego St, Ciudad de Belice.',
  },
  privacy: {
    nav: 'Privacidad y consumo responsable',
    title: 'Privacidad, accesibilidad y consumo responsable | Cojac’s Sumptuous Rumpopo',
    description:
      'Cómo el sitio web de Cojac’s maneja tu pedido, WhatsApp, la accesibilidad y el consumo responsable de alcohol.',
  },
};

const localized = Object.fromEntries(
  (Object.keys(en) as RouteKey[]).map((k) => [k, isEs ? { ...en[k], ...es[k] } : en[k]]),
) as Record<RouteKey, RouteInfo>;

export default localized;
export { en as routesEn, es as routesEs };
export type { RouteKey, RouteInfo };
