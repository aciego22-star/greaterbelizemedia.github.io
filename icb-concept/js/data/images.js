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

    /* Product imagery: real ICB campaign material */
    "product-property": { src: "assets/img/products/property.jpg", pos: "center 42%",
                          alt: "A couple at the front steps of their Belizean home, from ICB's Life Happens Fast film" },
    "product-motor":    { src: "assets/img/products/motor.jpg", pos: "center 55%",
                          alt: "A couple with their vehicle, from ICB's Life Happens Fast film" },
    /* The supplied red-and-black motorboat photograph. WebP at three
       widths with a JPEG of the same frame as the fallback; no crop is
       baked in, so the hero decides how much of the frame to show and
       the whole boat is always available to it. The hero is shaped to
       suit this photograph rather than the other way round: see
       .page-hero--whole-media in css/site.css and heroPhoto on the
       marine product.

       No pos: the framing is responsive and lives in the stylesheet.

       The previous crop from ICB's Protect Your Investment artwork is
       still in the repository, at products/marine.jpg. Its path is
       deliberately not written in full here: build/build-single.js
       bundles every asset path it finds anywhere in the built file, and
       naming this one would carry an unused image into the preview. */
    "product-marine":   { src: "assets/img/products/marine-boat.jpg",
                          sizes: "100vw",
                          webp: [
                            { src: "assets/img/products/marine-boat-640.webp",  w: 640 },
                            { src: "assets/img/products/marine-boat-1000.webp", w: 1000 },
                            { src: "assets/img/products/marine-boat-1600.webp", w: 1600 }
                          ],
                          alt: "Red and black motorboat underway in Caribbean waters." },
    "product-cargo":    { src: "assets/img/products/cargo.jpg", pos: "center center",
                          alt: "A container ship, port cranes and freight trucks at a shipping terminal" },
    "product-liability":{ src: "assets/img/products/liability.jpg", pos: "center 38%",
                          alt: "A handshake across the desk with an ICB representative, from the Life Happens Fast film" },
    "product-travel":   { src: "assets/img/products/travel.jpg", pos: "center center",
                          alt: "A traveller waiting at the airport departure gate with her boarding pass" },
    "product-mexican":  { src: "assets/img/products/mexican.jpg", pos: "center 55%",
                          alt: "The Aduana Mexico crossing at Subteniente Lopez on the Belize and Mexico border" },

    /* Interior page heroes */
    "insurance-hero":   { src: "assets/img/heroes/insurance.jpg", pos: "center center",
                          alt: "An Insurance Corporation of Belize office building" },
    "resources-hero":   { src: "assets/img/heroes/resources.jpg", pos: "center 60%",
                          alt: "The curved red facade of an Insurance Corporation of Belize building against the sky" },

    /* The Gallery hero cycles through three ICB buildings on a five
       second timer, with no controls: it is a backdrop behind a heading,
       not something to operate. See rotateSlot in js/art.js.

       Two of the three files are the same ones used by the Insurance
       hero and the Southside gallery tile. That is deliberate: the
       single-file build keys its asset map by path, so reusing a path
       costs nothing beyond the one copy already being carried. */
    "gallery-hero":     { pos: "center center",
                          rotate: 5000,
                          srcs: [
                            "assets/img/heroes/insurance.jpg",
                            "assets/img/branches/southside.jpg",
                            "assets/img/gallery/icb-branch-coastal.jpg"
                          ],
                          alt: "Insurance Corporation of Belize offices around the country" },
    "contact-hero":     { src: "assets/img/heroes/contact.jpg", pos: "72% center",
                          alt: "An ICB representative meeting with customers, from the Life Happens Fast film" },
    "locations-hero":   { src: "assets/img/gallery/hq-street.jpg", pos: "72% center",
                          alt: "The ICB headquarters building in Belize City" },

    "business-band":    { src: "assets/img/business-team.jpg", pos: "center 35%",
                          alt: "An ICB team member at work, from the Life Happens Fast film" },
    "claims-hero":      { src: "assets/img/gallery/service.jpg", pos: "center 30%",
                          alt: "A customer completing paperwork at an ICB desk, from the Life Happens Fast film" },
    "about-band":       { src: "assets/img/icb-hq.webp", alt: "Insurance Corporation of Belize headquarters in Belize City" }
  }
};
