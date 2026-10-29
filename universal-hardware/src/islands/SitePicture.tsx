/** Island counterpart of SitePhoto.astro: resolves paths against the page root so the private preview works too. */
import { photoCap, type SiteImage } from '../data/site-images';
import { assetUrl } from '../lib/asset-url';

export function SitePicture({ image, class: cls, decorative = false }: { image: SiteImage; class?: string; decorative?: boolean }) {
  return (
    <picture class={cls} style={{ '--cap': `${photoCap(image)}px` } as Record<string, string>}>
      {image.webp && <source type="image/webp" srcset={assetUrl(image.webp)} />}
      <img
        src={assetUrl(image.src)}
        width={image.width}
        height={image.height}
        alt={decorative ? '' : image.alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
