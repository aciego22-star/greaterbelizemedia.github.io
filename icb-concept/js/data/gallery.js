/* ============================================================================
   ICB.DATA.gallery — ICB Across Belize.

   The gallery exists to show ICB's REAL PHYSICAL PRESENCE across the
   country, so branches come first and campaign stills are a separate
   section further down.

   branches[]: one entry per ICB location that ICB publishes a photograph
   of, keyed to locationId in ICB.DATA.locations so the caption, district
   and type always match the branch dataset. Nothing here invents a branch
   identity: a caption is only ever the verified location name.

   src: null means the official photograph has not been supplied yet. Those
   entries render as a designed location plate built from the verified
   branch record, and upgrade to a photograph the moment a file is dropped
   in and src is set. No layout change is needed.

   INTERNAL TODO (not client-facing):
   - Collect the branch photographs published in ICB's own contact gallery
     (Southside Belize City, Santa Elena, San Pedro, San Narciso, San
     Ignacio, Corozal Border, Independence, Ladyville) and set src on the
     matching entries below. Files go in assets/img/branches/.
   - Ask ICB for staff, event and community photography for a second row.
   - Confirm the campaign film's public title before it is credited on a
     live site. The supplied file is named "Life Happens Fast".
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.gallery = {

  branches: [
    {
      locationId: "corporate",
      src: "assets/img/icb-hq.webp",
      caption: "ICB Headquarters, Belize City",
      alt: "The Insurance Corporation of Belize headquarters in Belize City"
    },
    {
      locationId: "corporate",
      src: "assets/img/gallery/hq-street.jpg",
      caption: "ICB Corporate Office, Daly Street",
      alt: "Street view of the ICB Corporate Office building on Daly Street, Belize City"
    },
    { locationId: "belize-city-southside", src: null },
    { locationId: "ladyville",             src: null },
    { locationId: "san-pedro",             src: null },
    { locationId: "corozal-border",        src: null },
    { locationId: "san-narciso",           src: null },
    { locationId: "santa-elena",           src: null },
    { locationId: "san-ignacio",           src: null },
    { locationId: "independence",          src: null }
  ],

  /* Stills from ICB's own campaign film and campaign artwork. These are
     ICB material, but they are not branch photography, so they live in
     their own section. */
  campaign: [
    { src: "assets/img/gallery/service.jpg",  caption: "At the ICB desk",        alt: "A customer completing paperwork at an ICB desk" },
    { src: "assets/img/gallery/home.jpg",     caption: "At home in Belize",       alt: "A couple relaxing in their Belizean living room" },
    { src: "assets/img/gallery/road.jpg",     caption: "On the road",             alt: "A couple in their vehicle" },
    { src: "assets/img/gallery/community.jpg",caption: "In the community",        alt: "A couple walking a garden path in Belize" },
    { src: "assets/img/gallery/together.jpg", caption: "Side by side",            alt: "An ICB representative with customers" },
    { src: "assets/img/gallery/campaign.jpg", caption: "Life Happens Fast",       alt: "ICB Life Happens Fast campaign title card", light: true }
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
        kicker: "ICB campaign film",
        lang: "en",
        langLabel: "English",
        blurb: "Protect yourself with ICB. Filmed in Belize.",
        src: "assets/video/icb-life-happens-fast.mp4",
        poster: "assets/img/video/life-happens-fast.jpg"
      },
      {
        id: "lhf-es",
        title: "La Vida Pasa Rápido",
        kicker: "Anuncio de ICB",
        lang: "es",
        langLabel: "Español",
        blurb: "Protégete con ICB. Filmado en Belice.",
        altTitle: "La Vida Pasa Rapido, the Spanish ICB campaign film",
        src: "assets/video/icb-life-happens-fast-es.mp4",
        poster: "assets/img/video/life-happens-fast-es.jpg"
      }
    ]
  }
};

/* Resolve a branch entry against the verified location record. */
ICB.DATA.galleryBranches = function () {
  return ICB.DATA.gallery.branches.map(function (b) {
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

/* Flat list of every real photograph, in display order. This is what the
   lightbox indexes into. */
ICB.GALLERY_ITEMS = [];
(function () {
  var out = [];
  ICB.DATA.gallery.branches.forEach(function (b) {
    if (!b.src) return;
    var loc = ICB.DATA.locationById(b.locationId) || {};
    out.push({ src: b.src, caption: b.caption || loc.name || "", alt: b.alt || "", light: !!b.light });
  });
  ICB.DATA.gallery.campaign.forEach(function (c) { out.push(c); });
  ICB.GALLERY_ITEMS = out;
})();
