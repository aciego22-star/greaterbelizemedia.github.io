/* ============================================================================
   ICB.DATA.images — real imagery manifest.
   -----------------------------------------------------------------------------
   Every populated slot below uses REAL ICB material: the supplied
   headquarters photograph, frames from ICB's own "Life Happens Fast"
   campaign film, and photography cropped from ICB's "Protect Your
   Investment" campaign artwork. Generated concept artwork remains only
   where no official ICB visual is available yet (travel, cargo), and those
   slots upgrade automatically when a src is added.

   pos: optional CSS object-position for the photo's focal point.
   The artwork layer beneath each slot remains as the loading state; a
   photo only fades in after it loads successfully, so nothing can ever
   render broken.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.images = {
  slots: {
    "hero-1":           { src: null, alt: "Insurance Corporation of Belize headquarters" },
    "hero-2":           { src: null, alt: "Protect Your Investment campaign artwork" },
    "hero-3":           { src: null, alt: "The ICB story film" },
    "home-hero":        { src: null, alt: "Belizean coastline at dusk" },
    "story-poster":     { src: "assets/img/video-poster.jpg", alt: "A frame from the ICB Life Happens Fast film" },

    /* Product imagery: real ICB campaign material */
    "product-property": { src: "assets/img/products/property.jpg", pos: "center 42%",
                          alt: "A couple at the front steps of their Belizean home, from ICB's Life Happens Fast film" },
    "product-motor":    { src: "assets/img/products/motor.jpg", pos: "center 55%",
                          alt: "A couple with their vehicle, from ICB's Life Happens Fast film" },
    "product-marine":   { src: "assets/img/products/marine.jpg", pos: "center 45%",
                          alt: "A powerboat, from ICB's Protect Your Investment campaign artwork" },
    "product-cargo":    { src: null, alt: "Goods in transit" },
    "product-liability":{ src: "assets/img/products/liability.jpg", pos: "center 38%",
                          alt: "A handshake across the desk with an ICB representative, from the Life Happens Fast film" },
    "product-travel":   { src: null, alt: "Travel abroad" },
    "product-mexican":  { src: "assets/img/products/mexican.jpg", pos: "center 62%",
                          alt: "An aerial view of the Belize City coastal road, from the Life Happens Fast film" },

    "business-band":    { src: "assets/img/business-team.jpg", pos: "center 35%",
                          alt: "An ICB team member at work, from the Life Happens Fast film" },
    "claims-hero":      { src: "assets/img/gallery/service.jpg", pos: "center 30%",
                          alt: "A customer completing paperwork at an ICB desk, from the Life Happens Fast film" },
    "about-band":       { src: "assets/img/icb-hq.webp", alt: "Insurance Corporation of Belize headquarters in Belize City" }
  }
};
