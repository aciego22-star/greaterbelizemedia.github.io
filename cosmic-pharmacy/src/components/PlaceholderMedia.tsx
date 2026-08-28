interface PlaceholderMediaProps {
  /** What the final asset should show — displayed on the frame. */
  note: string;
  /** Compact variant for product-card thumbnails. */
  compact?: boolean;
  className?: string;
}

/**
 * Clearly-labeled stand-in for media that hasn't been supplied yet.
 * Used for hero stills, video posters, gallery items and product images.
 * Never used to imitate real packaging or photography.
 */
export function PlaceholderMedia({ note, compact = false, className = '' }: PlaceholderMediaProps) {
  return (
    <div className={`placeholder-media ${compact ? 'compact' : ''} ${className}`} role="img" aria-label={note}>
      <svg viewBox="0 0 48 48" aria-hidden="true" className="placeholder-orbit">
        <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="24" cy="24" rx="20" ry="7.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-18 24 24)" />
        <circle cx="40" cy="17" r="2.2" fill="currentColor" />
      </svg>
      {!compact && <span className="placeholder-tag">Placeholder</span>}
      <span className="placeholder-note">{compact ? 'Image pending' : note}</span>
    </div>
  );
}
