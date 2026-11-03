/* ============================================================================
   ICB.DATA.gallery — ICB Across Belize.

   The gallery exists to show ICB's REAL PHYSICAL PRESENCE across the
   country, so it carries branches and nothing else. The campaign films
   have their own media area (video, below).

   branches[]: one entry per ICB location that ICB publishes a photograph
   of, keyed to locationId in ICB.DATA.locations so the caption, district
   and type always match the branch dataset. Nothing here invents a branch
   identity: a caption is only ever the verified location name.

   pos: optional CSS object-position, for a frame whose subject would
   otherwise be cropped out of the tile. Tiles are a fixed height, so
   cover trims the sides of a tall frame in the desktop grid and trims
   the top and bottom of that same frame on a phone.

   src: null means the official photograph has not been supplied yet. Those
   entries render as a designed location plate built from the verified
   branch record, and upgrade to a photograph the moment a file is dropped
   in and src is set. No layout change is needed.

   A location held at active: false in ICB.DATA.locations only appears here
   if a real photograph exists for it. A designed plate would be an
   assertion that the place is an operating branch, and that is exactly
   what the flag is withholding; a photograph is just a photograph, and it
   is captioned as a place, not as a branch. Nothing is held back today.

   Photographs are stored as a single WebP at 1200px wide, which covers
   the lightbox with a little to spare. No JPEG twin: every browser the
   site supports reads WebP, and the single-file preview inlines every
   file under assets/img, so a second copy of each photograph would cost
   it a third again of its own weight for nothing.

   Every one of the 22 locations now has a tile, so the grid is the whole
   network rather than a selection of it, and a new photograph fills a
   plate that is already in place instead of changing the shape of the
   grid.

   Every photograph ICB has supplied is in. One tile is still a plate:
   SAN ESTEVAN AGENCY, which is in ICB's revised directory of 22 with a
   landline and an email but has not been photographed. Its file goes
   in assets/img/branches/ like the rest, named for its locationId.

   (Filenames that do not exist yet are written without their extension
   in these comments on purpose. The single-file build scans the bundle
   for asset paths and stops if it finds one it cannot inline, and a
   comment is part of the bundle.)

   INTERNAL TODO (not client-facing):
   - Ask ICB for the San Estevan photograph. It is the last one.
   - Ask ICB for staff, event and community photography for a second
     row.
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

    /* The north. */
    /* Supplied by the client and identified by them as the Corozal Border
       Branch. It is the same building as the wide frame used in the
       Gallery banner. The caption comes from the branch record, as every
       caption here does, so the name on the tile is the verified one.

       INTERNAL TODO (not client-facing): confirm the identification with
       ICB. Every other branch photograph on the site is traceable to
       something ICB published; this one is attributed by the client. */
    {
      locationId: "corozal-border",
      src: "assets/img/branches/corozal-border.jpg",
      webp: [{ src: "assets/img/branches/corozal-border.webp" }],
      alt: "The Insurance Corporation of Belize branch building at the northern border, Corozal District"
    },
    /* Supplied in the second batch as ICB_Branch_01, with no branch
       name anywhere in the frame, and identified by the client from the
       raw photograph ICB sent. The only ICB sign on the building is the
       small INSURANCE / SEGUROS plaque beside the door, which fits a
       Corozal Town shopfront. Trimmed at the bottom. */
    {
      locationId: "corozal",
      src: "assets/img/branches/corozal.webp",
      alt: "The Insurance Corporation of Belize Corozal Branch, a two-storey building on 1st Street North"
    },
    /* Identified from its own signboard, which carries the Orange Walk
       landline, WhatsApp number and icb_ow@icbinsurance.com, all three
       matching the branch record. Trimmed at the bottom to take the
       empty concrete forecourt out.

       INTERNAL TODO (not client-facing): the sign reads "38 Belize
       Corozal Road", while the directory ICB sent carries "#48 Belize
       Corozal Road". One of the two is out of date. Raised with ICB. */
    {
      locationId: "orange-walk",
      src: "assets/img/branches/orange-walk.webp",
      alt: "The Insurance Corporation of Belize Orange Walk Branch on Belize Corozal Road"
    },
    { locationId: "san-estevan",           src: null },

    /* Belize District and the cayes. */
    /* Identified from the signboard over the entrance, which reads
       "Airport Plaza, Ladyville" with the 670-6970 landline, both
       matching the branch record. The sign sits high in the frame and a
       phone crop would cut it in half, hence pos. */
    {
      locationId: "ladyville",
      src: "assets/img/branches/ladyville.webp",
      pos: "center 12%",
      alt: "The Insurance Corporation of Belize Ladyville Branch at Airport Plaza on the Northern Highway"
    },
    /* The signboard over the entrance, carrying Coconut Drive, the
       226-4099 landline, the 610-2941 WhatsApp number and
       icb_sanpedro@icbinsurance.com. All four match the branch record.
       It sits high in the frame, hence pos. */
    {
      locationId: "san-pedro",
      src: "assets/img/branches/san-pedro.webp",
      pos: "center 20%",
      alt: "The Insurance Corporation of Belize San Pedro Branch signboard above the office on Coconut Drive"
    },
    /* The agency's own sign, on the walkway outside the office. The
       frame as supplied carried a third-party spa advertising board
       above ICB's sign, which is cropped out here: the gallery is ICB's
       own shopfront and nobody else's. The full frame is in the
       client's folder if it is ever wanted back. */
    {
      locationId: "caye-caulker",
      src: "assets/img/branches/caye-caulker.webp",
      alt: "The Insurance Corporation of Belize Caye Caulker Agency sign outside the office on Avenida Hicaco"
    },

    /* Cayo. */
    /* Trimmed at the bottom to take some of the foreground lawn out, so
       the building fills more of the tile. Nothing of the branch is
       cut. */
    {
      locationId: "belmopan",
      src: "assets/img/branches/belmopan.webp",
      alt: "The Insurance Corporation of Belize Belmopan City Branch building on South Ring Road"
    },
    /* The sign on the gable carries the 824-2454 landline, the
       614-0437 WhatsApp number, 74 Western Highway and
       icb_santaelena@icbinsurance.com. Every one matches the branch
       record. */
    {
      locationId: "santa-elena",
      src: "assets/img/branches/santa-elena.webp",
      alt: "The Insurance Corporation of Belize Santa Elena Branch, a white building on the Western Highway"
    },
    /* Trimmed at the bottom to take the road out of the foreground. */
    {
      locationId: "san-ignacio",
      src: "assets/img/branches/san-ignacio.webp",
      alt: "The Insurance Corporation of Belize San Ignacio Branch at Buena Vista and King Streets"
    },
    /* The western border branch. Its sign carries the branch telephone
       and WhatsApp numbers, and both match the branch record.

       INTERNAL TODO (not client-facing): the sign reads
       icb_benqueviejo@icbinsurance.com, while the directory ICB sent
       carries icb_benqueagency@icbinsurance.com for this branch. One of
       the two is out of date. Raised with ICB. */
    {
      locationId: "benque-viejo-border",
      src: "assets/img/branches/benque-viejo-border.webp",
      pos: "center 12%",
      alt: "The Insurance Corporation of Belize branch at the Benque Viejo border crossing, Cayo District"
    },
    /* The only interior frame in the set. Identified from the WhatsApp
       number on the sign, 656-7521, which is this branch's.

       INTERNAL TODO (not client-facing): the sign reads
       icb.benquetown@icbinsurance.com with a dot, while the directory
       carries icb_benquetown@icbinsurance.com with an underscore, and it
       titles the office "Benque Viejo Branch" rather than "Benque Town
       Board Branch". Raised with ICB. The tile caption comes from the
       branch record either way. */
    {
      locationId: "benque-town-board",
      src: "assets/img/branches/benque-town-board.webp",
      pos: "center 18%",
      alt: "The Insurance Corporation of Belize sign inside the Benque Town Board Branch, Benque Viejo Town"
    },

    /* The south. */
    /* Supplied in the third batch under the file name Yellow Village,
       which is not a location in ICB's directory. Identified by the
       client from the raw photograph as Seine Bight. The ICB signboard
       stands at the right-hand edge of the frame, so pos holds that
       edge rather than the centre. */
    {
      locationId: "seine-bight",
      src: "assets/img/branches/seine-bight.webp",
      pos: "right center",
      alt: "The Insurance Corporation of Belize Seine Bight Agency, a yellow village office flying Belize flags"
    },
    /* Identified from the signboard on the gable, which reads "Dangriga
       Branch, Phone: 522-0706", matching the branch record. */
    {
      locationId: "dangriga",
      src: "assets/img/branches/dangriga.webp",
      alt: "The Insurance Corporation of Belize Dangriga Branch building at Market Square"
    },
    /* Supplied in the second batch as ICB_Branch_03, with no branch
       name anywhere in the frame, and identified by the client from the
       raw photograph ICB sent. Trimmed at the bottom to take the
       concrete apron out.

       The door decals in this frame are the ones posting business hours
       that disagree with the hours ICB gave us. Recorded in
       OPEN-QUESTIONS.md. */
    {
      locationId: "independence",
      src: "assets/img/branches/independence.webp",
      alt: "The Insurance Corporation of Belize Independence Branch at Hercules and Toucan Streets"
    },
    /* The agency sign carries the 671-7916 WhatsApp number, which
       matches the branch record.

       INTERNAL TODO (not client-facing): the email on the sign is a
       two-letter prefix followed by .sanjuan@icbinsurance.com, not the
       icb_sanjuan@icbinsurance.com in the directory. The prefix is too
       small in the photograph to read with confidence. Raised with ICB.

       The frame also carries Digi, BEL and Infinite agent signs. Those
       are services this agency itself provides, not somebody else's
       advertising, so they stay. */
    {
      locationId: "san-juan",
      src: "assets/img/branches/san-juan.webp",
      alt: "The Insurance Corporation of Belize San Juan Agency sign on the green office in San Juan Village"
    },
    /* Trimmed on the left so the frame is ICB's agency rather than
       ICB's agency and the shopfront next door.

       INTERNAL TODO (not client-facing): four things on this sign
       disagree with the directory ICB sent. The sign says MORIO
       AGENCY, the directory says Moro Agency. The sign gives the
       address as Belmopan Service S. Santa Cruz Village, the directory
       says #22 Police Station Street. The sign gives WhatsApp
       669-9497, the directory says 609-0497. The sign gives
       william.moreno@icbinsurance.com, the directory says
       William.moro@icbinsurance.com. Raised with ICB; the site still
       publishes the directory's version of all four. */
    {
      locationId: "moro",
      src: "assets/img/branches/moro.webp",
      alt: "The Insurance Corporation of Belize agency office in Santa Cruz Village, Stann Creek District"
    },
    {
      locationId: "bella-vista",
      src: "assets/img/branches/bella-vista.webp",
      alt: "The Insurance Corporation of Belize Bella Vista Agency office on 3rd Street, Bella Vista Village"
    },
    /* The sign carries Main Road, Santa Cruz Village, the 616-7612
       WhatsApp number and wilson.velasquez@icbinsurance.com, all three
       matching the branch record. Trimmed at the bottom. */
    {
      locationId: "velasquez",
      src: "assets/img/branches/velasquez.webp",
      alt: "The Insurance Corporation of Belize Velasquez Agency, a blue office on the main road in Santa Cruz Village"
    },
    /* The sign carries George Price Street, the 615-8046 WhatsApp
       number and the 722-2291 landline, all matching the branch
       record.

       INTERNAL TODO (not client-facing): the sign reads
       icb.pg@icbinsurance.com with a dot, while the directory carries
       icb_pg@icbinsurance.com with an underscore. The same dot against
       underscore difference as Benque Town Board. Raised with ICB. */
    {
      locationId: "punta-gorda",
      src: "assets/img/branches/punta-gorda.webp",
      alt: "The Insurance Corporation of Belize Punta Gorda Branch on George Price Street"
    }
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
    ],

    /* ICB's own YouTube channel.

       Titles are ICB's, exactly as they appear on the channel, and are
       NOT translated: a Spanish video keeps its Spanish title on the
       English page and the other way round, the same rule the product
       names follow. Lengths are the channel's too.

       ORDER IS AN ASSUMPTION, AND THE ONE THING TO SPOT CHECK. The five
       IDs arrived as a list of links and the five titles arrived
       separately as a screenshot of the channel; they are paired here
       in the order each was given. Nothing on this machine can reach
       youtube.com to confirm a title against its ID. The pairing is
       consistent with the set, in that the two kitchen films sit next
       to each other as a Spanish and English pair and the two outdoor
       films do the same, but it is still an assumption. If any card
       names the wrong film, swap the title; nothing else moves.

       Nothing is requested from YouTube until a visitor presses play.
       No thumbnail, no script, no cookie. That keeps the promise the
       rest of the site makes, which is that it reaches nobody until
       someone asks it to, and it is why these cards are drawn in ICB's
       own colours rather than with a YouTube still.

       caption is free for a line of ICB's own description if they ever
       supply one. It is not filled in here, because describing a film
       nobody on this side has watched would be writing copy about ICB's
       work for them.

       The posters are ICB's own thumbnails, cut out of the screenshot of
       the channel at their native size, so the videos look the same here
       as they do on YouTube. They are shipped as site assets rather than
       loaded from YouTube, which keeps the page from reaching a third
       party before anyone asks it to. Each one carries its running time
       in the corner, because that is part of how the channel looks, so
       the card does not print the time underneath as well. */
    youtube: [
      { id: "tb1QdhdZrK8", title: "ICB Takes care of you",
        lang: "en", langLabel: "English", seconds: 57, caption: null,
        poster: "assets/img/video/youtube/tb1QdhdZrK8.jpg" },
      { id: "s5H1ZSakebg", title: "Insurance Corporation of Belize: Seguro de Hogar",
        lang: "es", langLabel: "Español", seconds: 36, caption: null,
        poster: "assets/img/video/youtube/s5H1ZSakebg.jpg" },
      { id: "EfxAQ7qfuCs", title: "Insurance Corporation of Belize: Home Insurance",
        lang: "en", langLabel: "English", seconds: 39, caption: null,
        poster: "assets/img/video/youtube/EfxAQ7qfuCs.jpg" },
      { id: "YyCUW--4EGE", title: "En cada paso del viaje de su vida, ICB está ahí para usted.",
        lang: "es", langLabel: "Español", seconds: 59, caption: null,
        poster: "assets/img/video/youtube/YyCUW--4EGE.jpg" },
      { id: "hAewzIr0sKE", title: "At every step of your life's journey, ICB is there for you.",
        lang: "en", langLabel: "English", seconds: 55, caption: null,
        poster: "assets/img/video/youtube/hAewzIr0sKE.jpg" }
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
      webp: b.webp || null,
      caption: b.caption || loc.name || "",
      pos: b.pos || null,
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
    out.push({ src: b.src, webp: b.webp || null, caption: b.caption || loc.name || "", alt: b.alt || "", light: !!b.light });
  });
  ICB.GALLERY_ITEMS = out;
})();
