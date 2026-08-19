/* ============================================================
   CUELLO'S DISTILLERY — Central site configuration
   Edit values here once; every page picks them up.
   ============================================================ */

window.CuellosConfig = {
  /* WhatsApp number, digits only (country code + number, no +, no spaces).
     PROVISIONAL: this is the Orange Walk main-office landline number.
     Cuello's MUST confirm this line accepts WhatsApp before launch
     (see CLIENT-CONFIRMATION-CHECKLIST.md). */
  whatsappNumber: "5013222183",

  email: "mainoffice@cuellosdistilleryltd.bz",
  mainOfficePhone: "+5013222183",

  /* Hero video slide: set to true once assets/video/cuello-hero-video.mp4
     is in place. The carousel also auto-hides the slide if the file is
     missing, so leaving this true with no file is safe. */
  heroVideo: {
    src: "assets/video/cuello-hero-video.mp4",          /* landscape — tablet/desktop */
    srcMobile: "assets/video/cuello-hero-video-mobile.mp4", /* native-resolution portrait crop — phones */
    poster: "assets/img/gallery/cuello-hero-video-poster.webp"
  }
};
