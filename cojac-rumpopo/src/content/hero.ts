/**
 * HOMEPAGE HERO SLIDESHOW
 * Supplied by the family (Nov 2026). Rotates every `intervalMs`, in this order, and loops.
 * Each slide has a desktop (16:9) and a mobile (9:16) image in /public/hero. The build
 * (scripts/make-webp.mjs) makes the smaller sizes phones and laptops load, plus a light
 * JPG fallback; the large PNG originals are kept in /originals/hero (not deployed).
 * To add, remove or reorder slides, edit this list — nothing else needs to change.
 */
import { t } from '../i18n/lang';

export interface HeroSlide {
  id: string;
  /** Path without extension, e.g. '/hero/Cojacs_Hero_01_Cocktail_Desktop_16x9' */
  desktop: string;
  mobile: string;
  alt: string;
  /**
   * 'contain' shows the whole image (for artwork with words or prices near the edges);
   * any spare space is filled with `backdrop`. Photos use the default 'cover'.
   */
  fit?: 'cover' | 'contain';
  /** CSS backgrounds behind a 'contain' slide, matched to the artwork's edges. */
  backdrop?: { desktop: string; mobile: string };
}

export const heroIntervalMs = 6000;

export const heroSlides: HeroSlide[] = [
  {
    // Promotion supplied by the family (Nov 2026): shown first.
    id: 'rumpopo-slush',
    desktop: '/hero/Cojacs_Hero_00_Rumpopo_Slush_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_00_Rumpopo_Slush_Mobile_9x16',
    alt: t(
      'Sumptuous Rumpopo Slush, available now, exclusively at Puma Freetown, $12. Extra boozy! A Cojac’s Sumptuous Rumpopo slush in collaboration with Puma Freetown: a special blend with extra rum.',
      'Sumptuous Rumpopo Slush, ya disponible, exclusivamente en Puma Freetown, $12. ¡Con más alcohol! Un slush de Cojac’s Sumptuous Rumpopo en colaboración con Puma Freetown: una mezcla especial con más ron.',
    ),
    fit: 'contain',
    backdrop: {
      desktop: 'linear-gradient(90deg, #316d10 0 50%, #bf0403 50% 100%)',
      mobile: '#2e6c07',
    },
  },
  {
    id: 'cocktail',
    desktop: '/hero/Cojacs_Hero_01_Cocktail_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_01_Cocktail_Mobile_9x16',
    alt: t(
      'A bottle of Cojac’s rumpopo beside a glass of rumpopo in front of a lit Christmas tree',
      'Una botella de rumpopo Cojac’s junto a un vaso de rumpopo frente a un árbol de Navidad iluminado',
    ),
  },
  {
    id: 'gift-bags',
    desktop: '/hero/Cojacs_Hero_02_Gift_Bags_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_02_Gift_Bags_Mobile_9x16',
    alt: t('Rows of Cojac’s rumpopo bottles wrapped in red Christmas gift bags', 'Filas de botellas de rumpopo Cojac’s envueltas en bolsas de regalo navideñas rojas'),
  },
  {
    id: 'glass-bottles',
    desktop: '/hero/Cojacs_Hero_03_Glass_Bottles_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_03_Glass_Bottles_Mobile_9x16',
    alt: t('Three Cojac’s rumpopo bottles in blue and red among Christmas decorations', 'Tres botellas de rumpopo Cojac’s en azul y rojo entre adornos navideños'),
  },
  {
    id: 'holiday-collection',
    desktop: '/hero/Cojacs_Hero_04_Holiday_Collection_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_04_Holiday_Collection_Mobile_9x16',
    alt: t('A holiday collection of Cojac’s rumpopo bottles surrounded by Christmas ornaments', 'Una colección navideña de botellas de rumpopo Cojac’s rodeada de adornos de Navidad'),
  },
];
