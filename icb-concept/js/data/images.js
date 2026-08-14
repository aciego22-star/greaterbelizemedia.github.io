/* ============================================================================
   ICB.DATA.images — photography manifest.
   -----------------------------------------------------------------------------
   The concept ships with crafted brand artwork in every visual slot, so the
   experience is complete with zero external requests and nothing can ever
   render as a broken image.

   To introduce approved ICB photography later: set `src` for a slot to the
   image path or URL. The slot upgrades automatically; the artwork remains
   underneath and the photo fades in only after it loads successfully.
   See IMAGES.md for slot-by-slot art direction.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.images = {
  slots: {
    "home-hero":        { src: null, alt: "Belizean coastline at dusk" },
    "story-poster":     { src: null, alt: "The ICB story film" },
    "gallery-corozal":  { src: null, alt: "Corozal District" },
    "gallery-orange-walk": { src: null, alt: "Orange Walk District" },
    "gallery-belize":   { src: null, alt: "Belize District" },
    "gallery-cayo":     { src: null, alt: "Cayo District" },
    "gallery-stann-creek": { src: null, alt: "Stann Creek District" },
    "gallery-toledo":   { src: null, alt: "Toledo District" },
    "product-property": { src: null, alt: "A Belizean home" },
    "product-motor":    { src: null, alt: "A vehicle on a Belizean road" },
    "product-marine":   { src: null, alt: "A vessel on Belizean waters" },
    "product-cargo":    { src: null, alt: "Goods in transit" },
    "product-liability":{ src: null, alt: "A Belizean business" },
    "product-travel":   { src: null, alt: "Travel abroad" },
    "product-mexican":  { src: null, alt: "The road north" },
    "business-band":    { src: null, alt: "Belizean business owners at work" },
    "about-band":       { src: null, alt: "ICB through the years" }
  }
};
