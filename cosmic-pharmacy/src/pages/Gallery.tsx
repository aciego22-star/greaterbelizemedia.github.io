import { GalleryGrid } from '../components/GalleryGrid';
import { usePageMeta } from '../lib/usePageMeta';

export function Gallery() {
  usePageMeta(
    'Gallery: Cosmic in Motion | Cosmic Pharmacy',
    'Photographs and short videos from inside Cosmic Pharmacy, Belize City: products, people and community.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">Cosmic in Motion</span>
          <h1 className="section-title">Gallery</h1>
          <p className="section-intro">
            Real moments from the pharmacy: the counter, the products, and the community Cosmic serves. Media shown here is Cosmic's own,
            approved for the website. Placeholder frames mark where the client's photographs and videos will drop in.
          </p>
          <GalleryGrid />
        </section>
      </div>
    </div>
  );
}
