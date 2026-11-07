/**
 * HOLIDAY BLOG POSTS (owner editable)
 *
 * To publish a new story, copy a post object below, give it a new `slug`
 * (lower case words joined by hyphens; keep it unchanged once published),
 * set the real `publishedAt` date (YYYY-MM-DD) and write the `body`.
 * The blog index, homepage card, sitemap, search data and social previews all
 * update automatically. No navigation code needs to change.
 *
 * Body format (simple Markdown):
 *   ## Heading               a section heading
 *   > text                   a highlighted pull quote
 *   - item                   a bulleted list (consecutive lines)
 *   **bold**  *italic*  [link text](/flavours)
 *   [[contest]]              the Facebook competition panel (uses contest.ts)
 *   [[order]]                the "Explore Our Flavours / Order Through WhatsApp" buttons
 *   [[signoff]]              the "Sip Something Sumptuous!" sign off
 *   Blank lines separate paragraphs.
 *
 * Please keep text free of long dashes (house style).
 */

import { dateLocale, t } from '../../i18n/lang';

export type BlogCategoryId =
  | 'seasonal-news'
  | 'new-flavours'
  | 'behind-the-bottle'
  | 'holiday-traditions'
  | 'offers-pop-ups'
  | 'videos-features';

export interface BlogCategory {
  id: BlogCategoryId;
  name: string;
  description: string;
}

/** Planning taxonomy. A category with no posts shows a friendly "coming soon" state. */
export const blogCategories: BlogCategory[] = [
  {
    id: 'seasonal-news',
    name: t('Seasonal News', 'Noticias de temporada'),
    description: t('Season openings, announcements and what is happening in the Cojac’s kitchen.', 'Inicios de temporada, anuncios y lo que pasa en la cocina de Cojac’s.'),
  },
  {
    id: 'new-flavours',
    name: t('New Flavours', 'Nuevos sabores'),
    description: t('New creations, flavour reveals and the stories behind them.', 'Nuevas creaciones, sabores revelados y las historias detrás de ellos.'),
  },
  {
    id: 'behind-the-bottle',
    name: t('Behind the Bottle', 'Detrás de la botella'),
    description: t('The family, the recipe and the care that goes into every bottle.', 'La familia, la receta y el cuidado que se pone en cada botella.'),
  },
  {
    id: 'holiday-traditions',
    name: t('Holiday Traditions', 'Tradiciones navideñas'),
    description: t('Rumpopo and the Belizean Christmas moments it belongs to.', 'El rumpopo y los momentos navideños beliceños de los que forma parte.'),
  },
  {
    id: 'offers-pop-ups',
    name: t('Offers & Pop-ups', 'Ofertas y ventas especiales'),
    description: t('Seasonal promotions and where to find Cojac’s around Belize City.', 'Promociones de temporada y dónde encontrar a Cojac’s en la Ciudad de Belice.'),
  },
  {
    id: 'videos-features',
    name: t('Videos & Features', 'Videos y reportajes'),
    description: t('Television features, interviews and moments from the journey.', 'Reportajes de televisión, entrevistas y momentos del camino.'),
  },
];

export interface BlogImage {
  /** Desktop / social image (JPG) and its WebP versions. */
  desktopJpg: string;
  desktopWebp: string;
  desktopWebpSmall: string;
  desktopWidth: number;
  desktopHeight: number;
  /** Separate portrait artwork for phones. */
  mobileJpg: string;
  mobileWebp: string;
  mobileWebpSmall: string;
  mobileWidth: number;
  mobileHeight: number;
  alt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  /** Short italic introduction under the title. */
  dek: string;
  publishedAt: string;
  updatedAt: string;
  categories: BlogCategoryId[];
  tags: string[];
  author: string;
  image: BlogImage;
  body: string;
  /** Set false to keep a draft off the site. */
  published: boolean;
}

const SECRET_FLAVOUR_ES = `
**¡Cojac’s Sumptuous Rumpopo está oficialmente de vuelta para la temporada navideña 2026!** Extrañamos las conversaciones navideñas, la emoción de conseguir tu botella favorita y esa sensación inconfundible de que por fin llegó la temporada festiva. A todos los que nos han apoyado a lo largo de los años, y a quienes descubren Cojac’s por primera vez: bienvenidos. Nos encanta compartir otra temporada con ustedes.

Pero este regreso trae una pequeña sorpresa. Junto al rumpopo rico y cremoso que ya conoces y quieres, **estamos preparando un sabor completamente nuevo** para la línea Sumptuous. Por ahora mantenemos el sabor en secreto, y tenemos un pequeño reto navideño para nuestros seguidores mientras esperamos la gran revelación.

## Una tradición navideña beliceña que vale la pena celebrar

Pregúntale a un beliceño qué hace especial la Navidad y tendrás muchas respuestas: las reuniones familiares, la música de siempre, la buena comida, las visitas de los seres queridos y esas pequeñas tradiciones que esperamos todo el año. En algún momento de esas conversaciones, el rumpopo casi seguro va a aparecer.

Para muchas familias, el rumpopo es más que una bebida de temporada. Es la botella que se saca para recibir a las visitas, el gusto que se comparte en una reunión navideña y el regalo que pasa entre amigos, vecinos y compañeros. La temporada simplemente no se sentiría igual sin él.

En Cojac’s Sumptuous Rumpopo, llevamos más de quince años siendo parte de esas celebraciones. Lo que empezó con una receta familiar y el amor por un rumpopo delicioso se ha convertido en una tradición anual propia. Siempre hemos respetado el sabor clásico con el que comenzó [nuestro camino](/our-story), y disfrutamos de la creatividad de presentar algo nuevo.

La [promesa detrás de cada botella](/our-guarantee) sigue siendo la misma: **rumpopo rico, suave y cremoso, lleno de sabor y lleno hasta el tope.** Queremos que cada botella se sienta especial, ya sea que la compartas con tu familia o la guardes para un momento tranquilo en las fiestas.

## Algo nuevo llega a la familia Sumptuous en 2026

Este año añadimos una nueva creación a la línea, y decidimos no revelar su nombre todavía. Después de todo, ¿qué gracia tiene en las fiestas revelar todas las sorpresas a la vez?

Esto sí te lo podemos contar: el nuevo sabor trae una inspiración claramente beliceña a una bebida que la gente ya ama. Es una celebración de los sabores, los ingredientes y las tradiciones culinarias de nuestra tierra.

**Esta es tu única pista oficial:**

> Uno de los ingredientes principales de nuestro nuevo sabor de rumpopo es muy popular en la cocina beliceña.

¡Eso es todo lo que revelamos por ahora! Sabemos que la comunidad de Cojac’s está llena de personas a las que les encanta un buen misterio culinario, y estamos ansiosos por ver qué se les ocurre.

## Adivina el sabor secreto y gana una botella gratis

Para celebrar el inicio de la temporada de rumpopo, **tres seguidores tendrán la oportunidad de probar nuestro nuevo sabor por cuenta de la casa.** Las primeras tres personas que adivinen correctamente el nuevo sabor en los comentarios de nuestra publicación oficial del concurso en Facebook recibirán cada una **una botella de medio litro** de la nueva creación de esta temporada.

[[contest]]

Revelaremos el nuevo sabor en nuestros canales oficiales cuando llegue el momento. Hasta entonces, sigan enviando sus respuestas y estén pendientes del anuncio.

## Tu gusto navideño favorito también está de vuelta

Puede que el concurso se lleve todo el misterio, pero el corazón de la temporada sigue siendo lo que siempre nos ha encantado de Cojac’s: hacer un rumpopo delicioso para los momentos que vale la pena compartir.

Nuestros clientes de siempre ya conocen la sensación: el primer sorbo, la textura cremosa, los aromas navideños inconfundibles y la alegría de disfrutar algo que esperaste todo el año. Si eres nuevo por aquí, nos encantaría que este sea el año en que descubras por qué tanta gente espera la temporada de Cojac’s Sumptuous Rumpopo.

También compartiremos más noticias a medida que avancen las fiestas, como la revelación del nuevo sabor, promociones de temporada, ventas especiales y vistazos de lo que pasa [detrás de cámaras](/videos-features). El **Blog navideño** será el lugar para seguir esas historias en un solo sitio.

## Cómo pedir Cojac’s Sumptuous Rumpopo esta temporada

**El rumpopo ya está disponible para la temporada navideña 2026.** Cojac’s está en la Ciudad de Belice y ha anunciado entregas en la Ciudad de Belice y envíos a todo el país. La disponibilidad, los arreglos de entrega y cualquier costo asociado los confirma directamente el negocio cuando se hace un pedido.

En nuestro sitio web puedes [explorar los sabores disponibles](/flavours), revisar tu selección y enviar tu pedido por **WhatsApp**. El sitio no tiene pago con tarjeta ni caja en línea: nuestro equipo confirmará tu pedido y los siguientes pasos en la conversación.

[[order]]

## Por una Navidad verdaderamente suntuosa

Hay algo maravilloso en una tradición que regresa cada año. Aunque el calendario esté lleno y todo lo demás se sienta diferente, algunas cosas nos devuelven a las personas y las celebraciones que amamos.

Agradecemos a todos los que hacen de Cojac’s Sumptuous Rumpopo parte de su temporada navideña. Gracias por recibirnos en sus hogares, compartir nuestras botellas con sus seres queridos y darnos una razón para seguir creando.

**Llegó la temporada de rumpopo. El nuevo sabor ya viene. Y esta Navidad tenemos muchas más sorpresas suntuosas preparadas.**

Estén pendientes de nuestro Blog navideño y de nuestra página oficial de Facebook para la revelación del sabor y los próximos anuncios de temporada.

[[signoff]]
`;

export const posts: BlogPost[] = [
  {
    slug: 'rumpopo-season-2026-secret-flavour',
    title: t(
      'Rumpopo Season Is Back in Belize: Can You Guess Cojac’s New Flavour?',
      'Volvió la temporada de rumpopo a Belice: ¿adivinas el nuevo sabor de Cojac’s?',
    ),
    seoTitle: t('Rumpopo Season 2026 Is Back | Cojac’s New Flavour Mystery', 'Volvió la temporada de rumpopo 2026 | El sabor misterioso de Cojac’s'),
    metaDescription: t(
      'Rumpopo season is back in Belize! Celebrate Christmas with Cojac’s Sumptuous Rumpopo and guess the secret new 2026 flavour on Facebook.',
      '¡Volvió la temporada de rumpopo a Belice! Celebra la Navidad con Cojac’s Sumptuous Rumpopo y adivina el nuevo sabor secreto de 2026 en Facebook.',
    ),
    excerpt: t(
      'The nutmeg is grated, the bottles are chilling, and Cojac’s Sumptuous Rumpopo is back for the 2026 holiday season, with a delicious secret still waiting to be revealed.',
      'La nuez moscada ya está rallada, las botellas se están enfriando y Cojac’s Sumptuous Rumpopo está de vuelta para la temporada navideña 2026, con un delicioso secreto que aún falta por revelar.',
    ),
    dek: t(
      'The nutmeg is grated, the bottles are chilling, and the kitchen has been busy. You know what that means: the sweetest time of the year is back.',
      'La nuez moscada ya está rallada, las botellas se están enfriando y la cocina no ha parado. Ya sabes lo que eso significa: volvió la época más dulce del año.',
    ),
    publishedAt: '2026-11-07',
    updatedAt: '2026-11-07',
    categories: ['seasonal-news', 'new-flavours'],
    tags: t(
      'rumpopo Belize|Belizean rum popo|rum popo season 2026|Belize Christmas drink|new rumpopo flavour',
      'rumpopo Belice|rum popo beliceño|temporada de rum popo 2026|bebida navideña de Belice|nuevo sabor de rumpopo',
    ).split('|'),
    author: 'Cojac’s Sumptuous Rumpopo',
    published: true,
    image: {
      desktopJpg: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_DESKTOP_1920x1080.jpg',
      desktopWebp: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_DESKTOP_1920x1080.webp',
      desktopWebpSmall: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_DESKTOP_960x540.webp',
      desktopWidth: 1920,
      desktopHeight: 1080,
      mobileJpg: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_MOBILE_1080x1350.jpg',
      mobileWebp: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_MOBILE_1080x1350.webp',
      mobileWebpSmall: '/blog/Cojacs_Secret_Flavour_Holiday_Blog_MOBILE_540x675.webp',
      mobileWidth: 1080,
      mobileHeight: 1350,
      alt: t(
        'Cojac’s 2026 mystery rumpopo flavour giveaway announcement, inviting guesses for three half liter bottle prizes.',
        'Anuncio del concurso del sabor misterioso de rumpopo Cojac’s 2026, que invita a adivinar para ganar uno de tres premios de una botella de medio litro.',
      ),
    },
    body: t(
      `
**Cojac’s Sumptuous Rumpopo is officially back for the 2026 holiday season!** We have missed the Christmas conversations, the excitement of getting your favourite bottle, and that unmistakable feeling that the festive season has finally arrived. To everyone who has supported us over the years, and everyone discovering Cojac’s for the first time: welcome back. We are delighted to share another season with you.

But this year’s return comes with a little twist. Alongside the rich, creamy rumpopo you know and love, **we are preparing to introduce an entirely new flavour** to the Sumptuous lineup. We’re keeping the flavour itself under wraps for now, and we have a little holiday challenge for our followers while we wait for the big reveal.

## A Belizean Christmas tradition worth celebrating

Ask a Belizean what makes Christmas special, and there are plenty of answers: family gatherings, familiar music, good food, visits from loved ones, and the little traditions we look forward to all year. Somewhere in those conversations, rumpopo is almost guaranteed to make an appearance.

For many families, rumpopo is more than a seasonal drink. It is the bottle brought out to welcome visitors, the treat shared during a Christmas get-together, and the gift passed between friends, neighbours and colleagues. The season simply would not feel quite the same without it.

At Cojac’s Sumptuous Rumpopo, we have spent more than fifteen years being part of those celebrations. What began with a family recipe and a love of delicious rumpopo has grown into an annual tradition of its own. We have always respected the classic flavour that started [our journey](/our-story) while enjoying the creativity that comes with introducing something new.

The [promise behind every bottle](/our-guarantee) remains the same: **rich, smooth, creamy rumpopo, full of flavour and filled right to the top.** We want every bottle to feel like something special, whether you are sharing it with family or setting one aside for a quiet holiday moment.

## Something new is joining the Sumptuous family in 2026

This year, we’re adding a new creation to the lineup, and we have decided not to reveal its name just yet. After all, where is the holiday fun in giving away every surprise at once?

We can tell you this much: the new flavour brings a distinctly Belizean point of inspiration to a drink people already love. It is a celebration of the flavours, ingredients and food traditions familiar to our home.

**Here is your one official hint:**

> One of the main ingredients in our newest rumpopo flavour is popular in Belizean cooking.

That’s all we’re giving away for now! We know the Cojac’s community is full of people who love a good food mystery, and we cannot wait to see what you come up with.

## Guess the secret flavour for a chance to win a free bottle

To mark the start of rumpopo season, **three followers will have the chance to taste our new flavour on us.** The first three people to correctly guess the new flavour in the comments on our official Facebook competition post will each receive **one half liter bottle** of this season’s new creation.

[[contest]]

We will reveal the new flavour through our official channels when it is time. Until then, keep those guesses coming, and stay tuned for the announcement.

## Your favourite holiday treat is back, too

The competition might be attracting all the mystery, but the heart of the season is still what we have always loved about Cojac’s: making delicious rumpopo for the moments worth sharing.

Our returning customers already know the feeling: the first sip, the creamy texture, the unmistakable holiday aromas, and the joy of enjoying something you have waited for all year. If you are new here, we would love for this to be the year you discover why so many people look forward to Cojac’s Sumptuous Rumpopo season.

We will also be sharing more news as the holidays unfold, including the new flavour reveal, seasonal promotions, pop-ups, and glimpses of what is happening [behind the scenes](/videos-features). The **Holiday Blog** will be a place to follow those stories in one convenient spot.

## Ordering Cojac’s Sumptuous Rumpopo this season

**Rumpopo is available now for the 2026 holiday season.** Cojac’s is based in Belize City and has announced Belize City delivery and countrywide shipping options. Availability, delivery arrangements and any associated charges are confirmed directly by the business when an order is placed.

On our website you can [explore the available flavours](/flavours), review your selection and send your order request through **WhatsApp**. There is no online card payment or checkout on the site: our team will confirm your order and next steps in the conversation.

[[order]]

## Here’s to a truly sumptuous Christmas

There is something wonderful about a tradition that returns every year. Even when the calendar is busy and everything else feels different, some things bring us right back to the people and celebrations we love.

We are grateful to everyone who makes Cojac’s Sumptuous Rumpopo part of their Christmas season. Thank you for welcoming us into your homes, sharing our bottles with loved ones and giving us a reason to keep creating.

**Rumpopo season is here. The new flavour is coming. And this Christmas, we have plenty more sumptuous surprises in store.**

Keep an eye on our Holiday Blog and official Facebook page for the flavour reveal and upcoming seasonal announcements.

[[signoff]]
`,
      SECRET_FLAVOUR_ES,
    ),
  },
];

/** Published posts, newest first. */
export function publishedPosts(): BlogPost[] {
  return posts.filter((p) => p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function findPost(slug: string): BlogPost | undefined {
  return publishedPosts().find((p) => p.slug === slug);
}

export function categoryName(id: BlogCategoryId): string {
  return blogCategories.find((c) => c.id === id)?.name ?? id;
}

export function postPath(slug: string): string {
  return `/holiday-blog/${slug}`;
}

/** Words in the body (directives and Markdown symbols ignored). */
export function wordCount(post: BlogPost): number {
  return post.body
    .replace(/\[\[[a-z]+\]\]/g, ' ')
    .replace(/[#>*\-[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingMinutes(post: BlogPost): number {
  return Math.max(1, Math.round(wordCount(post) / 200));
}

/** "7 November 2026" */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
