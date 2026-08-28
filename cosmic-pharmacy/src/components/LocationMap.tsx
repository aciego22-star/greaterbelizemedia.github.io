import { useEffect, useState } from 'react';
import { business } from '../data/business';

type MapState = 'probing' | 'available' | 'blocked';

/**
 * Live Google Maps embed of the pharmacy.
 *
 * Some sandboxed contexts (the private preview build, strict corporate CSPs)
 * refuse third-party frames outright, which would leave an empty white box.
 * We probe for outbound access first and fall back to a branded card that
 * still opens the real map, so the address is never a dead end.
 */
export function LocationMap({ className = '' }: { className?: string }) {
  const [state, setState] = useState<MapState>('probing');

  useEffect(() => {
    let settled = false;
    const done = (next: MapState) => {
      if (!settled) {
        settled = true;
        setState(next);
      }
    };
    const probe = new Image();
    probe.onload = () => done('available');
    probe.onerror = () => done('blocked');
    probe.src = `https://maps.google.com/favicon.ico?cb=${Date.now()}`;
    const timer = window.setTimeout(() => done('blocked'), 2500);
    return () => {
      window.clearTimeout(timer);
      probe.onload = null;
      probe.onerror = null;
    };
  }, []);

  if (state === 'available') {
    return (
      <div className={`location-map ${className}`}>
        <iframe
          src={business.mapEmbedUrl}
          title={`Map showing ${business.name} at ${business.address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      className={`location-map location-map-fallback ${className}`}
      href={business.googleBusinessUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="location-map-grid" aria-hidden="true" />
      <span className="location-map-pin" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
      </span>
      <span className="location-map-body">
        <strong>{business.name}</strong>
        <span>{business.address}</span>
        <span className="location-map-cta">Open in Google Maps →</span>
      </span>
    </a>
  );
}
