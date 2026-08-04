/**
 * Gallery media, shared by the full /gallery page and the home-page teaser.
 * Authentic Duke Marine photography + video, grouped by theme, plus the
 * client's YouTube Shorts.
 */
export type GalleryPhoto = { src: string; alt: string };
export type GalleryGroup = { title: string; blurb: string; photos: GalleryPhoto[] };
export type GalleryVideo = {
  src?: string;
  embed?: string;
  poster?: string;
  ratio?: string;
  label: string;
};

// Themed photo groups shown on the /gallery page.
export const galleryGroups: GalleryGroup[] = [
  {
    title: 'On the Water',
    blurb: 'Trolling spreads and open water off Belize City.',
    photos: [
      { src: '/media/life/rods-ready.jpg', alt: 'A full spread of trolling rods and reels rigged and ready on the boat' },
      { src: '/media/life/trolling-spread.jpg', alt: 'Trolling rods set in the holders as the boat runs across open water' },
      { src: '/media/life/trolling-rods.jpg', alt: 'Trolling spread out the back of the boat under a bright Belize sky' },
      { src: '/media/life/boat-wake.jpg', alt: 'The wake trailing behind the boat across turquoise Caribbean water' },
    ],
  },
  {
    title: 'Big Catches',
    blurb: 'Customer catches and memorable days on Belize’s waters, shared by members of the Duke Marine community.',
    photos: [
      { src: '/media/life/wahoo-catch.jpg', alt: 'Angler on the boat holding up a big wahoo caught off Belize' },
      { src: '/media/life/kingfish-lift.jpg', alt: 'Angler lifting a large kingfish aboard after the fight' },
      { src: '/media/life/bonito-catch.jpg', alt: 'Angler in a sun buff holding a fresh catch on the deck' },
    ],
  },
  {
    title: 'The Belize Coastline',
    blurb: 'The cayes, the flats and the sunsets that make fishing here what it is.',
    photos: [
      { src: '/media/life/caye-approach.jpg', alt: 'Turquoise water and a palm-lined caye seen from the boat' },
      { src: '/media/life/caye-shoreline.jpg', alt: 'A Belize caye shoreline with clear shallow water and blue sky' },
      { src: '/media/life/reef-flats.jpg', alt: 'Clear turquoise flats over coral heads along the Belize coast' },
      { src: '/media/life/sandbar-sail.jpg', alt: 'A sailboat anchored off a bright sandbar in shallow water' },
      { src: '/media/life/sunset-catamaran.jpg', alt: 'A catamaran silhouetted against a Belize sunset on calm water' },
    ],
  },
  {
    title: 'In the Shop',
    blurb: 'Real gear on the shelves, marine, fishing and diving supplies at Mile 4½.',
    photos: [
      { src: '/media/gallery-2.jpg', alt: 'Fishing, diving and marine gear at Duke Marine' },
      { src: '/media/gallery-6.jpg', alt: 'Marine paints and coatings, AwlGrip and Pettit, at Duke Marine' },
      { src: '/media/gallery-1.jpg', alt: 'Cast nets and gear on the shelves at Duke Marine' },
      { src: '/media/gallery-7.jpg', alt: 'Stainless boat hardware, locks and fittings at Duke Marine' },
      { src: '/media/gallery-10.jpg', alt: 'Paint prep, brushes, tape and sandpaper at Duke Marine' },
      { src: '/media/gallery-3.jpg', alt: 'Rope on the reel inside the Duke Marine shop' },
      { src: '/media/gallery-9.jpg', alt: 'Bilge pumps and livewell pumps at Duke Marine' },
      { src: '/media/gallery-5.jpg', alt: 'For all your marine needs, Duke Marine, Belize City' },
      { src: '/media/gallery-8.jpg', alt: 'Navigation lights and marine electrical at Duke Marine' },
      { src: '/media/gallery-4.jpg', alt: 'Marine and fishing supplies stocked at Duke Marine' },
    ],
  },
];

// Flat, authentic-first list used by the home-page gallery teaser rotation.
export const galleryPhotos: GalleryPhoto[] = [
  { src: '/media/life/wahoo-catch.jpg', alt: 'Angler holding up a big wahoo caught off Belize' },
  { src: '/media/life/boat-wake.jpg', alt: 'The wake behind the boat across turquoise water' },
  { src: '/media/life/reef-flats.jpg', alt: 'Clear turquoise flats over coral along the Belize coast' },
  { src: '/media/life/trolling-spread.jpg', alt: 'Trolling rods set as the boat runs across open water' },
  { src: '/media/life/caye-approach.jpg', alt: 'Turquoise water and a palm-lined caye from the boat' },
  { src: '/media/life/kingfish-lift.jpg', alt: 'Angler lifting a large kingfish aboard' },
  { src: '/media/life/sunset-catamaran.jpg', alt: 'A catamaran against a Belize sunset' },
  { src: '/media/gallery-2.jpg', alt: 'Fishing, diving and marine gear at Duke Marine' },
];

// "A Day on the Water" — the client's real footage, hosted on YouTube for fast
// playback (click-to-play, portrait 9:16). Posters are our own lifestyle photos.
export const dayOnTheWaterVideos: GalleryVideo[] = [
  { embed: 'https://www.youtube.com/embed/Vllw40_7H3g', poster: '/media/life/trolling-spread.jpg', ratio: '9 / 16', label: 'On the troll' },
  { embed: 'https://www.youtube.com/embed/wcL6BxQ24to', poster: '/media/life/boat-wake.jpg', ratio: '9 / 16', label: 'Heading out' },
  { embed: 'https://www.youtube.com/embed/dZq65TuTg04', poster: '/media/life/wahoo-catch.jpg', ratio: '9 / 16', label: 'Fish on' },
  { embed: 'https://www.youtube.com/embed/o09Yo6Evgt8', poster: '/media/life/reef-flats.jpg', ratio: '9 / 16', label: 'Belize water' },
];

// Client YouTube Shorts, shown as click-to-play thumbnails (vertical 9:16).
export const galleryVideos: GalleryVideo[] = [
  { embed: 'https://www.youtube.com/embed/u1-oGMSuL7k', poster: 'https://i.ytimg.com/vi/u1-oGMSuL7k/hqdefault.jpg', ratio: '9 / 16', label: 'Duke Marine' },
  { embed: 'https://www.youtube.com/embed/r07EHoUJTeM', poster: 'https://i.ytimg.com/vi/r07EHoUJTeM/hqdefault.jpg', ratio: '9 / 16', label: 'Duke Marine' },
  { embed: 'https://www.youtube.com/embed/xZG5a3C8uHU', poster: 'https://i.ytimg.com/vi/xZG5a3C8uHU/hqdefault.jpg', ratio: '9 / 16', label: 'Duke Marine' },
];
