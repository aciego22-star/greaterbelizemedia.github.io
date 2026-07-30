/**
 * Gallery media, shared by the full /gallery page and the home-page teaser.
 * Real photos + the client's YouTube Shorts.
 */
export type GalleryPhoto = { src: string; alt: string };
export type GalleryVideo = { id: string; label: string };

export const galleryPhotos: GalleryPhoto[] = [
  { src: '/media/gallery-2.jpg', alt: 'Fishing, diving and marine gear at Duke Marine' },
  { src: '/media/gallery-6.jpg', alt: 'Marine paints and coatings, AwlGrip and Pettit, at Duke Marine' },
  { src: '/media/gallery-1.jpg', alt: 'Cast nets and gear on the shelves at Duke Marine' },
  { src: '/media/gallery-7.jpg', alt: 'Stainless boat hardware, locks and fittings at Duke Marine' },
  { src: '/media/gallery-10.jpg', alt: 'Paint prep, brushes, tape and sandpaper at Duke Marine' },
  { src: '/media/gallery-3.jpg', alt: 'Rope and rode on the reel inside the Duke Marine shop' },
  { src: '/media/gallery-9.jpg', alt: 'Bilge pumps and livewell pumps at Duke Marine' },
  { src: '/media/gallery-5.jpg', alt: 'For all your marine needs, Duke Marine, Belize City' },
  { src: '/media/gallery-8.jpg', alt: 'Navigation lights and marine electrical at Duke Marine' },
  { src: '/media/gallery-4.jpg', alt: 'Marine and fishing supplies stocked at Duke Marine' },
];

// Client YouTube Shorts, shown as click-to-play thumbnails (vertical 9:16).
export const galleryVideos: GalleryVideo[] = [
  { id: 'BP_keqKlThg', label: 'Duke Marine' },
  { id: 'bIZUxUjjW00', label: 'Duke Marine' },
  { id: '6NAgBH6EkHc', label: 'Duke Marine' },
];
