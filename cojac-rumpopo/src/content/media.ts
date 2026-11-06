/**
 * VIDEOS & FEATURES — links supplied by the family.
 * Reorder, add or remove entries here; the page layout updates automatically.
 *
 * YouTube titles/publisher were read from YouTube's public oEmbed data (Nov 2026).
 * Facebook items show a safe "Watch on Facebook" card (no embed), because Facebook
 * share links do not reliably embed and titles have not been verified.
 */
import type { MediaItem } from '../types';

export const media: MediaItem[] = [
  {
    id: 'yt-new-flavour',
    platform: 'youtube',
    kind: 'video',
    url: 'https://youtu.be/eV4alFs8zrY',
    youtubeId: 'eV4alFs8zrY',
    title: 'New flavour now available for all your festivities',
    sourceTitle: "Cojac's Sumptuous Rum Popo - New flavor now available for all your festivities",
    publisher: 'Greater Belize Media | GBM',
    thumbnail: '/media/yt-eV4alFs8zrY.jpg',
    featured: true,
  },
  {
    id: 'yt-christmas-feature',
    platform: 'youtube',
    kind: 'video',
    url: 'https://www.youtube.com/watch?v=K_SPFrGazyw',
    youtubeId: 'K_SPFrGazyw',
    title: 'Christmas Feature',
    sourceTitle: "Colac's Sumptuous Rum Popo (Christmas Feature )",
    publisher: 'Greater Belize Media | GBM',
    thumbnail: '/media/yt-K_SPFrGazyw.jpg',
    featured: true,
  },
  {
    id: 'fb-video',
    platform: 'facebook',
    kind: 'video',
    url: 'https://www.facebook.com/share/v/1Dp29hCbz7/',
    title: 'Video on Facebook',
    featured: true,
  },
  {
    id: 'fb-reel',
    platform: 'facebook',
    kind: 'reel',
    url: 'https://www.facebook.com/reel/780308661736625',
    title: 'Reel on Facebook',
    featured: false,
  },
];
