import { useCallback, useEffect, useRef, useState } from 'react';
import { gallery, galleryCategories } from '../content/gallery';
import { usePageMeta } from '../lib/usePageMeta';
import { asset } from '../lib/whatsapp';
import { ArrowIcon, CloseIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { GalleryTile } from '../components/sections';
import { Sparkle } from '../components/Art';

function Lightbox({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (d: number) => void }) {
  const item = gallery[index];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose, onMove]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${item.caption} — image ${index + 1} of ${gallery.length}`} ref={ref} tabIndex={-1}>
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <figure className="lightbox__figure">
        {item.src ? (
          <img src={asset(item.src)} alt={item.alt} />
        ) : (
          <div className="lightbox__placeholder">
            <Sparkle size={28} />
            <p>Photo coming soon</p>
            <small>{galleryCategories[item.category]}</small>
          </div>
        )}
        <figcaption>
          {item.caption} <span>· {index + 1} / {gallery.length}</span>
          {item.credit && <small className="lightbox__credit">{item.credit}</small>}
        </figcaption>
      </figure>
      <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => onMove(-1)} aria-label="Previous image">
        <ArrowIcon size={22} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => onMove(1)} aria-label="Next image">
        <ArrowIcon size={22} />
      </button>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close gallery">
        <CloseIcon size={24} />
      </button>
    </div>
  );
}

export default function Gallery() {
  usePageMeta('gallery');
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)), []);
  const hasPhotos = gallery.every((g) => g.src);
  return (
    <>
      <PageHero
        eyebrow="The Sumptuous Gallery"
        title={
          <>
            Moments from the <em className="italic-gold">Season</em>
          </>
        }
        lead="Bottles, holiday gifting, community events and memories from the Cojac’s rumpopo season."
      />
      <section className="section section--paper">
        <div className="container">
          {!hasPhotos && (
            <Reveal className="notice notice--soft gallery-note" role="note">
              <Sparkle size={18} />
              <p>More photographs from this season are on the way — check back soon.</p>
            </Reveal>
          )}
          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <Reveal key={g.id} delay={(i % 4) * 70} className={`gallery-grid__cell gallery-grid__cell--${g.shape}`}>
                <GalleryTile item={g} index={i} onOpen={() => setOpen(i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {open !== null && <Lightbox index={open} onClose={close} onMove={move} />}
    </>
  );
}
