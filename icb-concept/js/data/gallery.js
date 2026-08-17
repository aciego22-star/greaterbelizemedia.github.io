/* ============================================================================
   ICB.DATA.gallery — ICB Across Belize.

   The gallery exists to show ICB's REAL PHYSICAL PRESENCE across the
   country, so it carries branches and nothing else. The campaign films
   have their own media area (video, below).

   branches[]: one entry per ICB location that ICB publishes a photograph
   of, keyed to locationId in ICB.DATA.locations so the caption, district
   and type always match the branch dataset. Nothing here invents a branch
   identity: a caption is only ever the verified location name.

   src: null means the official photograph has not been supplied yet. Those
   entries render as a designed location plate built from the verified
   branch record, and upgrade to a photograph the moment a file is dropped
   in and src is set. No layout change is needed.

   A location held at active: false in ICB.DATA.locations only appears here
   if a real photograph exists for it. A designed plate would be an
   assertion that the place is an operating branch, and that is exactly
   what the flag is withholding; a photograph is just a photograph, and it
   is captioned as a place, not as a branch.

   INTERNAL TODO (not client-facing):
   - Collect the branch photographs published in ICB's own contact gallery
     (Southside Belize City, Santa Elena, San Pedro, San Ignacio, Corozal
     Border, Independence, Ladyville) and set src on the matching entries
     below. Files go in assets/img/branches/.
   - San Narciso: a supplied photograph will render, captioned as a place
     in Corozal District. Its branch status stays unstated until ICB
     confirms it.
   - Ask ICB for staff, event and community photography for a second row.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.gallery = {

  branches: [
    {
      locationId: "corporate",
      src: "assets/img/icb-hq.webp",
      caption: { en: "ICB Headquarters, Belize City", es: "Sede de ICB, Ciudad de Belice" },
      alt: "The Insurance Corporation of Belize headquarters in Belize City"
    },
    {
      locationId: "corporate",
      src: "assets/img/gallery/hq-street.jpg",
      caption: { en: "ICB Corporate Office, Daly Street", es: "Oficina Corporativa de ICB, Daly Street" },
      alt: "Street view of the ICB Corporate Office building on Daly Street, Belize City"
    },
    /* INTERNAL TODO (not client-facing): the sign in this photograph
       reads "26A-C Central America Blvd", while the branch record in
       js/data/locations.js carries "#38 Central American Boulevard".
       One of the two is out of date. Confirm the current address with
       ICB; the card caption is unaffected either way, since it comes
       from the branch record rather than from the image. */
    {
      locationId: "belize-city-southside",
      src: "assets/img/branches/southside.jpg",
      alt: "The Insurance Corporation of Belize branch office on Central America Boulevard, Belize City"
    },
    { locationId: "ladyville",             src: null },
    { locationId: "san-pedro",             src: null },
    { locationId: "corozal-border",        src: null },
    {
      locationId: "san-narciso",
      src: null,
      caption: { en: "San Narciso, Corozal District", es: "San Narciso, distrito de Corozal" },
      alt: "San Narciso Village, Corozal District"
    },
    { locationId: "santa-elena",           src: null },
    { locationId: "san-ignacio",           src: null },
    { locationId: "independence",          src: null },
    /* Two more verified branches, each with a published address and
       landline. They keep the grid's last row full now that San Narciso
       is held back, and they take a photograph the same way the others
       do. */
    { locationId: "belmopan",              src: null },
    { locationId: "dangriga",              src: null }
  ],

  /* ICB in Motion. Both films are the supplied ICB campaign material,
     compressed for the web at 1280x720 with stereo sound, full length,
     and the moov atom at the front so playback starts immediately.

     Both titles are ICB's own: the English film closes on "Life Happens
     Fast / Protect Yourself With ICB" and the Spanish film closes on
     "La Vida Pasa Rápido / Protégete Con ICB". Neither is a translation
     written for this concept. */
  video: {
    films: [
      {
        id: "lhf-en",
        title: "Life Happens Fast",
        kicker: { en: "ICB campaign film", es: "Video de campaña de ICB" },
        lang: "en",
        langLabel: "English",
        blurb: { en: "Protect yourself with ICB. Filmed in Belize.", es: "Protéjase con ICB. Filmado en Belice." },
        src: "assets/video/icb-life-happens-fast.mp4",
        poster: "assets/img/video/life-happens-fast.jpg"
      },
      {
        id: "lhf-es",
        title: "La Vida Pasa Rápido",
        kicker: "Anuncio de ICB",
        lang: "es",
        langLabel: "Español",
        blurb: { en: "Protégete con ICB. Filmed in Belize.", es: "Protégete con ICB. Filmado en Belice." },
        altTitle: "La Vida Pasa Rapido, the Spanish ICB campaign film",
        src: "assets/video/icb-life-happens-fast-es.mp4",
        poster: "assets/img/video/life-happens-fast-es.jpg"
      }
    ]
  }
};

/* Resolve a branch entry against the verified location record. A record
   held back for confirmation contributes a tile only when there is a
   photograph to show. */
ICB.DATA.galleryBranches = function () {
  return ICB.DATA.gallery.branches.filter(function (b) {
    var loc = ICB.DATA.locationById(b.locationId);
    return b.src || !loc || loc.active !== false;
  }).map(function (b) {
    var loc = ICB.DATA.locationById(b.locationId) || {};
    return {
      locationId: b.locationId,
      src: b.src || null,
      caption: b.caption || loc.name || "",
      sub: loc.district ? loc.district + " District" : "",
      type: loc.type || "",
      alt: b.alt || (loc.name ? loc.name + ", Insurance Corporation of Belize" : ""),
      light: !!b.light
    };
  });
};

/* Flat list of every branch photograph, in display order. This is what
   the lightbox indexes into. */
ICB.GALLERY_ITEMS = [];
(function () {
  var out = [];
  ICB.DATA.gallery.branches.forEach(function (b) {
    if (!b.src) return;
    var loc = ICB.DATA.locationById(b.locationId) || {};
    out.push({ src: b.src, caption: b.caption || loc.name || "", alt: b.alt || "", light: !!b.light });
  });
  ICB.GALLERY_ITEMS = out;
})();
