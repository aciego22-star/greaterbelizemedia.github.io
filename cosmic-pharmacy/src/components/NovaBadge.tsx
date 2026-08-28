/**
 * A supernova that collapses into the word "New".
 *
 * Pure CSS on one element tree so it costs nothing at runtime: a core that
 * flares, two shockwave rings, a spinning accretion ring and a scatter of
 * ejecta, all in the brand's blue/cyan/pink. The cycle runs 7s, and the word
 * holds for most of it so it reads as a label rather than a loop.
 *
 * Colours come from the theme tokens, so it belongs to whichever sky is up.
 * Under prefers-reduced-motion the burst is dropped and only the word remains.
 */
export function NovaBadge() {
  return (
    <span className="nova" aria-hidden="true">
      <span className="nova-ring" />
      <span className="nova-wave" />
      <span className="nova-wave nova-wave-2" />
      <span className="nova-core" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span key={i} className="nova-ejecta" style={{ ['--i' as string]: i }} />
      ))}
      <span className="nova-word">New</span>
    </span>
  );
}
