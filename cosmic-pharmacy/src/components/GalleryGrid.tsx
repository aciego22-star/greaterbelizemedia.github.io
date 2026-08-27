import { useEffect, useRef, useState } from 'react';
import rawGallery from '../data/gallery.json';
import type { GalleryFilter, GalleryItem } from '../data/types';
import { PlaceholderMedia } from './PlaceholderMedia';
import { mediaUrl } from '../lib/media';

const galleryItems = rawGallery as GalleryItem[];

const filterLabels: Record<'all' | GalleryFilter, string> = {
  all: 'All',
  'inside-cosmic': 'Inside Cosmic',
  'products-wellness': 'Products & Wellness',
  community: 'Community',
  'social-highlights': 'Social Highlights',
  videos: 'Videos'
};

interface GalleryGridProps {
  /** Cap for the Home-page preview; omit for the full gallery. */
  limit?: number;
  showFilters?: boolean;
}

export function GalleryGrid({ limit, showFilters = true }: GalleryGridProps) {
  const [filter, setFilter] = useState<'all' | GalleryFilter>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const items = galleryItems.filter((g) => filter === 'all' || g.filters.includes(filter)).slice(0, limit ?? galleryItems.length);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxItem(null);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxItem]);

  return (
    <div className="gallery">
      {showFilters && (
        <div className="gallery-filters" role="group" aria-label="Filter gallery">
          {(Object.keys(filterLabels) as Array<'all' | GalleryFilter>).map((key) => (
            <button
              key={key}
              type="button"
              className={`chip ${filter === key ? 'active' : ''}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-grid">
        {items.map((item) => (
          <figure key={item.id} className={`gallery-item ${item.aspect}`}>
            {mediaUrl(item.src) ? (
              item.kind === 'video' ? (
                <video src={mediaUrl(item.src)} poster={mediaUrl(item.poster) || undefined} controls playsInline preload="metadata" aria-label={item.title} />
              ) : (
                <button type="button" className="gallery-photo-btn" onClick={() => setLightboxItem(item)} aria-label={`View ${item.title}`}>
                  <img src={mediaUrl(item.src)} alt={item.alt} loading="lazy" decoding="async" />
                </button>
              )
            ) : (
              <PlaceholderMedia note={`${item.title} · ${item.sourceNote ?? 'asset pending'}`} />
            )}
            <figcaption>
              {item.kind === 'video' && <span className="gallery-kind" aria-hidden="true">▶ </span>}
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>

      {items.length === 0 && <p className="text-muted">No gallery items in this view yet.</p>}

      {lightboxItem && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightboxItem.title} onClick={() => setLightboxItem(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" ref={closeRef} className="icon-btn lightbox-close" onClick={() => setLightboxItem(null)} aria-label="Close viewer">
              ✕
            </button>
            <img src={mediaUrl(lightboxItem.src)} alt={lightboxItem.alt} />
            <p>{lightboxItem.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
