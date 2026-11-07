import { useCallback, useEffect, useRef, useState } from 'react';
import { gallery } from '../content/gallery';
import { usePageMeta } from '../lib/usePageMeta';
import { ArrowIcon, CloseIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { GalleryPicture, GalleryTile } from '../components/sections';

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
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${item.caption}, image ${index + 1} of ${gallery.length}`} ref={ref} tabIndex={-1}>
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <figure className="lightbox__figure">
        <GalleryPicture item={item} large eager />
        <figcaption>
          {item.caption} <span>· {index + 1} / {gallery.length}</span>
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
  return (
    <>
      <PageHero
        title={
          <>
            Moments from the <em className="italic-gold">Season</em>
          </>
        }
        lead="Bottles, holiday gifting, community events and memories from the Cojac’s rumpopo season."
      />
      <section className="section section--paper">
        <div className="container">
          <div className="gallery-photos">
            {gallery.map((g, i) => (
              <Reveal key={g.id} delay={(i % 3) * 70} className="gallery-photos__cell">
                <GalleryTile item={g} onOpen={() => setOpen(i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {open !== null && <Lightbox index={open} onClose={close} onMove={move} />}
    </>
  );
}
