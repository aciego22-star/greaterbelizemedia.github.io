/**
 * THE SUMPTUOUS GALLERY (owner editable)
 *
 * Nine photo scenes supplied by the family (Nov 2026). Each entry is ONE gallery
 * photo with two files in /public/gallery that share a name ("base"):
 *   <base>_Desktop_1600x1200.jpg   shown above 767px wide (4:3)
 *   <base>_Mobile_1080x1350.jpg    shown on phones (4:5)
 * plus web-optimised WebP copies (_Desktop_800x600.webp, _Desktop_1600x1200.webp,
 * _Mobile_540x675.webp, _Mobile_1080x1350.webp).
 *
 * To add a photo: put the two JPGs (and WebP copies) in /public/gallery, then add
 * an entry below. Reorder entries to change the order on the page. The first
 * entry is also the first photo in the homepage gallery preview.
 * Describe what is visible in `alt`; do not name flavours, sizes or prices.
 */
import type { GalleryItem } from '../types';
import { t } from '../i18n/lang';

export const gallery: GalleryItem[] = [
  {
    id: 'poinsettia-bottle-display',
    base: 'Cojacs_Gallery_01_Poinsettia_Bottle_Display',
    caption: t('Poinsettia bottle display', 'Botellas entre flores de Pascua'),
    alt: t(
      'Rows of Cojac’s rumpopo bottles on a glass table beneath red poinsettias',
      'Filas de botellas de rumpopo Cojac’s sobre una mesa de vidrio bajo flores de Pascua rojas',
    ),
    category: 'product',
  },
  {
    id: 'crystal-stopper-bottles',
    base: 'Cojacs_Gallery_02_Crystal_Stopper_Bottles',
    caption: t('Crystal stopper bottles', 'Botellas con tapón de cristal'),
    alt: t(
      'Decorative glass bottles with crystal stoppers, filled with rumpopo in several colours, in front of Christmas decorations',
      'Botellas decorativas de vidrio con tapones de cristal, llenas de rumpopo de varios colores, frente a adornos navideños',
    ),
    category: 'packaging',
  },
  {
    id: 'assorted-glass-bottle-display',
    base: 'Cojacs_Gallery_03_Assorted_Glass_Bottle_Display',
    caption: t('Glass bottle display', 'Exhibición de botellas de vidrio'),
    alt: t(
      'A large display of Cojac’s rumpopo in tall glass bottles with red, gold and black caps on a granite counter',
      'Una gran exhibición de rumpopo Cojac’s en botellas altas de vidrio con tapas rojas, doradas y negras sobre un mostrador de granito',
    ),
    category: 'product',
  },
  {
    id: 'chilled-rumpopo-ice-tub',
    base: 'Cojacs_Gallery_04_Chilled_Rumpopo_Ice_Tub',
    caption: t('Chilled on ice', 'Bien frío en hielo'),
    alt: t(
      'Bottles of Cojac’s rumpopo chilling in a metal tub of ice',
      'Botellas de rumpopo Cojac’s enfriándose en una tina metálica con hielo',
    ),
    category: 'product',
  },
  {
    id: 'festive-bottle-collection',
    base: 'Cojacs_Gallery_05_Festive_Bottle_Collection',
    caption: t('Festive bottle collection', 'Colección festiva de botellas'),
    alt: t(
      'Rows of Cojac’s rumpopo bottles with red ribbon labels',
      'Filas de botellas de rumpopo Cojac’s con etiquetas de listón rojo',
    ),
    category: 'product',
  },
  {
    id: 'gift-baskets',
    base: 'Cojacs_Gallery_01_Gift_Baskets',
    caption: t('Holiday gift baskets', 'Canastas de regalo navideñas'),
    alt: t(
      'Gift-ready Cojac’s rumpopo baskets wrapped for the holidays',
      'Canastas de rumpopo Cojac’s listas para regalar, envueltas para las fiestas',
    ),
    category: 'packaging',
  },
  {
    id: 'assorted-bottles',
    base: 'Cojacs_Gallery_02_Assorted_Bottles',
    caption: t('Assorted bottles', 'Botellas surtidas'),
    alt: t(
      'Assorted rumpopo bottles including red and decorative glass bottles',
      'Botellas de rumpopo surtidas, entre ellas botellas rojas y botellas decorativas de vidrio',
    ),
    category: 'packaging',
  },
  {
    id: 'bottle-selection',
    base: 'Cojacs_Gallery_03_Bottle_Selection',
    caption: t('Bottle selection', 'Selección de botellas'),
    alt: t(
      'Small and large bottles of rumpopo arranged on a marble counter',
      'Botellas pequeñas y grandes de rumpopo sobre un mostrador de mármol',
    ),
    category: 'product',
  },
  {
    id: 'gift-bottles-and-jars',
    base: 'Cojacs_Gallery_04_Gift_Bottles_And_Jars',
    caption: t('Gift bottles and jars', 'Botellas y frascos de regalo'),
    alt: t(
      'Gift-ready rum popo jars, tall bottles and heart-shaped containers',
      'Frascos de rum popo listos para regalar, botellas altas y envases en forma de corazón',
    ),
    category: 'packaging',
  },
];

/** File paths for one gallery entry, following the naming convention above. */
export function galleryFiles(item: GalleryItem) {
  const b = `/gallery/${item.base}`;
  return {
    desktopJpg: `${b}_Desktop_1600x1200.jpg`,
    desktopWebp: `${b}_Desktop_1600x1200.webp`,
    desktopWebpSmall: `${b}_Desktop_800x600.webp`,
    mobileJpg: `${b}_Mobile_1080x1350.jpg`,
    mobileWebp: `${b}_Mobile_1080x1350.webp`,
    mobileWebpSmall: `${b}_Mobile_540x675.webp`,
  };
}

export const galleryCategories: Record<GalleryItem['category'], string> = {
  product: t('Bottles & flavours', 'Botellas y sabores'),
  packaging: t('Holiday packaging & gifting', 'Empaques y regalos navideños'),
  process: t('Behind the bottle', 'Detrás de la botella'),
  memories: t('Memories', 'Recuerdos'),
  events: t('Events & features', 'Eventos y reportajes'),
};
