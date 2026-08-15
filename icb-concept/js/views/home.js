/* ============================================================================
   Home view — the executive demo surface.
   Rotating hero, task-first action bar, categories, guided discovery,
   claims feature, nationwide, business feature, ICB in Motion, the
   ICB Across Belize gallery, resources, contact band.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* ==========================================================================
     HERO MEDIA LINEUP

     The order below IS the order shown, and it is fixed. The array is the
     single source of truth: heroSlider() maps it in place, initSlider()
     always opens on index 0, and nothing shuffles or resumes a previous
     position. A fresh load therefore always presents:

       1. ICB headquarters photograph
       2. "By land, sea or air, ICB is there" campaign artwork
       3. Nationwide Cash Express brand lockup
       4. The ICB film

     After that the carousel may cycle, and the visitor may jump around;
     only the opening sequence is guaranteed.

     Slide kinds
       photo   full-bleed photograph behind a dark scrim
       artwork light slide, artwork contained, copy beside it
       brand   light slide, a finished lockup shown whole with no copy
               competing against it (see artCarriesCopy)
       video   poster and a play control; never autoplays (see initFilmSlide)
     ========================================================================== */
  var SLIDES = [
    {
      kind: "photo",
      src: "assets/img/icb-hq.webp",
      alt: "Insurance Corporation of Belize headquarters in Belize City",
      eyebrow: "Insurance Corporation of Belize Ltd.",
      title: "Protecting Belize since 1981.",
      lead: "Insurance for the things you\u2019ve built, the people you care about, and the road ahead.",
      actions: [
        { label: "Explore insurance", href: "#/insurance", primary: true },
        { label: "File a claim", href: "#/claims" }
      ]
    },
    {
      kind: "artwork",
      light: true,
      src: "assets/img/icb-protect-artwork.jpg",
      alt: "ICB Protect Your Investment campaign artwork: liabilities, motor, marine and property",
      eyebrow: "Protect your investment",
      title: "By land, sea or air, ICB is there.",
      lead: "Liabilities, motor, marine and property cover for the life you have built.",
      actions: [
        { label: "Explore insurance", href: "#/insurance", primary: true },
        { label: "Request information", href: "#/contact?topic=new-cover", ghost: true }
      ]
    },
    {
      /* Nationwide Cash Express. Two supplied compositions, each already a
         finished lockup with mascot, wordmark and tagline. Overlaying our
         own headline would fight them, so artCarriesCopy keeps the eyebrow
         and title in the document for screen readers and the slide label
         while painting neither, and the artwork is shown whole at both
         sizes.

         INTERNAL TODO (not client-facing): confirm with ICB and Nationwide
         Cash Express what this slide should say and where it should link.
         It currently makes no claim beyond the artwork's own wording and
         routes to ICB's contact page. */
      kind: "brand",
      light: true,
      artCarriesCopy: true,
      srcWide: "assets/img/brands/nce-wide.webp",
      srcTall: "assets/img/brands/nce-tall.webp",
      alt: "Nationwide Cash Express: the mascot holding a Belize one hundred dollar note, beside the Nationwide Cash Express wordmark and the line Send Money Across Belize",
      eyebrow: "Nationwide Cash Express",
      title: "Send money across Belize.",
      /* No action row. The lockup fills the slide, and an overlaid button
         would either sit on the artwork or collide with the slider
         chrome at some widths. Every action stays one row below in the
         header and the "What can we help you with?" panel. */
      actions: []
    },
    {
      kind: "video",
      eyebrow: "ICB in Motion",
      title: "Life Happens Fast.",
      lead: "ICB\u2019s campaign film, shot in Belize. Press play to watch it with sound.",
      actions: [
        { label: "Explore insurance", href: "#/insurance", primary: true },
        { label: "About ICB", href: "#/about" }
      ]
    }
  ];

  function slideMedia(s) {
    var R = ICB.render;
    var media = ICB.DATA.site.media;

    if (s.kind === "photo") {
      return '<div class="hero-media" aria-hidden="true"><img data-asset="' + R.esc(s.src) + '" alt="">' +
        '<div class="hero-scrim"></div></div>';
    }

    if (s.kind === "artwork") {
      return '<div class="hero-media hero-media--contain" aria-hidden="true"><img data-asset="' + R.esc(s.src) + '" alt="">' +
        '<div class="hero-scrim hero-scrim--light"></div></div>';
    }

    /* Brand lockup. A <picture> picks the composition that suits the
       shape of the viewport: the banner above 768px, the vertical poster
       below it. Both are contained, so neither is ever cropped or
       stretched, and the wordmark stays legible at both sizes. */
    if (s.kind === "brand") {
      return '<div class="hero-media hero-media--brand" aria-hidden="true">' +
        "<picture>" +
          '<source media="(min-width: 769px)" data-asset-srcset="' + R.esc(s.srcWide) + '">' +
          '<img data-asset="' + R.esc(s.srcTall) + '" alt="">' +
        "</picture>" +
      "</div>";
    }

    /* Film slide. No autoplay and nothing muted: the poster stands in
       until the visitor presses play, and playback then starts with sound
       and full controls. Browsers only permit audible playback from a
       real gesture, which is exactly what the play button provides. */
    return '<div class="hero-media hero-media--film">' +
      '<img class="hero-film-poster" data-asset="' + R.esc(media.heroVideoPoster) + '" alt="" aria-hidden="true">' +
      (media.heroVideoAvailable
        ? '<video class="hero-video" playsinline preload="none" data-asset-defer' +
          ' data-asset="' + R.esc(media.heroVideoSrc) + '"' +
          ' data-asset-poster="' + R.esc(media.heroVideoPoster) + '" hidden></video>'
        : "") +
      '<div class="hero-scrim" aria-hidden="true"></div>' +
      '<button type="button" class="play-btn hero-play" data-hero-play' +
        ' aria-label="Play the ICB film Life Happens Fast, with sound">' +
        ICB.art.glyph("play") +
      "</button>" +
      '<p class="video-note" data-hero-note hidden>This film could not be played in this browser.</p>' +
    "</div>";
  }

  function heroSlider() {
    var R = ICB.render;
    var slides = SLIDES.map(function (s, i) {
      var btns = s.actions.map(function (a) {
        var cls = s.light
          ? (a.primary ? "btn-primary" : "btn-outline")
          : (a.primary ? "btn-gold" : "btn-light");
        return '<a class="btn btn-lg ' + cls + '" href="' + R.esc(a.href) + '">' + R.esc(a.label) + "</a>";
      }).join("");
      return '<article class="hero-slide hero-slide--' + s.kind + (i === 0 ? " is-active" : "") + (s.light ? " hero-slide--light" : "") +
        '" role="group" aria-roledescription="slide"' +
        ' aria-label="' + (i + 1) + ' of ' + SLIDES.length + '" data-slide="' + i + '"' +
        (s.light ? ' data-light="1"' : "") + (i === 0 ? "" : ' aria-hidden="true"') + ">" +
        slideMedia(s) +
        (s.alt ? '<span class="visually-hidden">' + R.esc(s.alt) + "</span>" : "") +
        /* artCarriesCopy: the artwork already states the brand and its
           line, so the words stay in the document for assistive tech but
           are not painted over the lockup. */
        '<div class="shell"><div class="hero-slide-copy' + (s.artCarriesCopy ? " hero-slide-copy--quiet" : "") + '">' +
          '<span class="eyebrow hs-rise">' + R.esc(s.eyebrow) + "</span>" +
          '<h2 class="hs-rise">' + R.esc(s.title) + "</h2>" +
          (s.lead ? '<p class="hero-lead hs-rise">' + R.esc(s.lead) + "</p>" : "") +
          '<div class="btn-row hs-rise">' + btns + "</div>" +
        "</div></div>" +
      "</article>";
    }).join("");

    var bars = SLIDES.map(function (s, i) {
      return '<button type="button" data-slide-to="' + i + '"' + (i === 0 ? ' aria-current="true"' : "") +
        ' aria-label="Go to slide ' + (i + 1) + ' of ' + SLIDES.length + ": " + R.esc(s.title) + '">' +
        '<span class="bar" aria-hidden="true"></span></button>';
    }).join("");

    return '' +
      '<section class="hero-slider on-dark" role="region" aria-roledescription="carousel" aria-label="ICB highlights" data-hero-slider>' +
        '<h1 class="visually-hidden">Insurance Corporation of Belize. Protecting Belize since 1981.</h1>' +
        slides +
        '<div class="hero-controls"><div class="shell hero-controls-inner">' +
          '<div class="hero-progress" role="group" aria-label="Slides">' + bars + "</div>" +
          '<span class="hero-count" aria-hidden="true" data-hero-count>01 / 0' + SLIDES.length + "</span>" +
          '<div class="hero-arrows">' +
            '<button type="button" data-hero-prev aria-label="Previous slide">' + ICB.art.glyph("chev-left") + "</button>" +
            '<button type="button" data-hero-next aria-label="Next slide">' + ICB.art.glyph("chev-right") + "</button>" +
          "</div>" +
        "</div></div>" +
      "</section>";
  }

  function initSlider(mount) {
    var root = mount.querySelector("[data-hero-slider]");
    if (!root) return;
    var slides = root.querySelectorAll(".hero-slide");
    var bars = root.querySelectorAll("[data-slide-to]");
    var count = root.querySelector("[data-hero-count]");
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var idx = 0;
    var manual = reduced;
    if (manual) root.classList.add("is-manual");

    /* ----------------------------------------------------------------
       The hero film: user-initiated, with sound.

       No autoplay and no muted attribute anywhere. Browsers only allow
       audible playback in response to a real gesture, so the poster
       stands in until the visitor presses play; that press is the
       gesture, so the film starts unmuted with controls. While it plays
       the carousel is held, otherwise the slide would move on and the
       audio would carry over the next one.
       ---------------------------------------------------------------- */
    function stopFilm(slide) {
      var video = slide.querySelector(".hero-video");
      var play = slide.querySelector("[data-hero-play]");
      if (!video) return;
      video.pause();
      video.currentTime = 0;
      video.hidden = true;
      video.removeAttribute("controls");
      slide.classList.remove("is-film-playing");
      if (play) play.hidden = false;
      root.classList.remove("is-film-holding");
    }

    function initFilmSlide(slide) {
      var video = slide.querySelector(".hero-video");
      var play = slide.querySelector("[data-hero-play]");
      var note = slide.querySelector("[data-hero-note]");
      if (!play) return;

      if (!video) {
        play.addEventListener("click", function () {
          play.hidden = true;
          if (note) note.hidden = false;
        });
        return;
      }

      play.addEventListener("click", function () {
        // The source is only fetched now, on demand.
        if (video.hasAttribute("data-asset")) ICB.hydrateAssets(slide, true);
        video.muted = false;
        video.volume = 1;
        video.controls = true;
        video.hidden = false;
        if (note) note.hidden = true;
        play.hidden = true;
        slide.classList.add("is-film-playing");
        // Hold the carousel for as long as the film is on screen.
        root.classList.add("is-film-holding");
        manual = true;
        root.classList.add("is-manual");

        video.addEventListener("error", function () {
          stopFilm(slide);
          if (note) note.hidden = false;
        }, { once: true });

        video.play().catch(function () {
          /* Only a genuine media failure counts. A rejected promise with
             no error object means the browser declined this attempt, and
             the visible controls let the visitor try again directly. */
          if (video.error) {
            stopFilm(slide);
            if (note) note.hidden = false;
          }
        });
      });

      video.addEventListener("ended", function () { stopFilm(slide); });
    }

    function setSlide(n, byUser) {
      idx = (n + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, i) {
        var active = i === idx;
        s.classList.toggle("is-active", active);
        if (active) s.removeAttribute("aria-hidden");
        else s.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(s.querySelectorAll("a"), function (a) {
          if (active) a.removeAttribute("tabindex");
          else a.setAttribute("tabindex", "-1");
        });
        /* The film never plays by itself. Sliding away from it stops
           playback and puts the poster back, so audio can never continue
           under another slide. */
        var video = s.querySelector(".hero-video");
        if (video && !active && !video.paused) stopFilm(s);
      });
      root.classList.toggle("is-light-active", slides[idx].hasAttribute("data-light"));
      Array.prototype.forEach.call(bars, function (b, i) {
        if (i === idx) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
        b.classList.toggle("is-done", !manual && i < idx);
      });
      if (count) count.textContent = "0" + (idx + 1) + " / 0" + slides.length;
      if (byUser && !manual) {
        manual = true;
        root.classList.add("is-manual");
      }
    }

    // Autoplay is driven by the active progress bar's CSS fill animation:
    // when it completes, advance. Pausing the animation pauses the clock.
    root.addEventListener("animationend", function (e) {
      if (manual || reduced) return;
      if (e.animationName === "hp-fill") setSlide(idx + 1);
    });

    root.addEventListener("mouseenter", function () { root.classList.add("is-paused"); });
    root.addEventListener("mouseleave", function () { root.classList.remove("is-paused"); });
    /* A finger on the hero has to pause it too. Without this the slide
       could advance between touchstart and touchend, so the tap landed on
       a button that had just moved and the visitor had to tap again. */
    root.addEventListener("pointerdown", function () { root.classList.add("is-paused"); }, { passive: true });
    var release = function () {
      // Give the tap time to resolve before the clock restarts.
      setTimeout(function () { root.classList.remove("is-paused"); }, 400);
    };
    root.addEventListener("pointerup", release, { passive: true });
    root.addEventListener("pointercancel", release, { passive: true });
    root.addEventListener("focusin", function () { root.classList.add("is-paused"); });
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) root.classList.remove("is-paused");
    });
    document.addEventListener("visibilitychange", function () {
      root.classList.toggle("is-paused", document.hidden);
    });

    root.querySelector("[data-hero-prev]").addEventListener("click", function () { setSlide(idx - 1, true); });
    root.querySelector("[data-hero-next]").addEventListener("click", function () { setSlide(idx + 1, true); });
    Array.prototype.forEach.call(bars, function (b) {
      b.addEventListener("click", function () {
        setSlide(parseInt(b.getAttribute("data-slide-to"), 10), true);
      });
    });

    /* Touch swipe. Only a deliberate horizontal drag counts: a tap that
       drifts a few pixels still reaches the button underneath. */
    var startX = null, startY = null;
    root.addEventListener("pointerdown", function (e) {
      startX = e.clientX;
      startY = e.clientY;
    }, { passive: true });
    root.addEventListener("pointerup", function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      setSlide(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    Array.prototype.forEach.call(slides, function (slide) {
      if (slide.querySelector("[data-hero-play]")) initFilmSlide(slide);
    });

    // Always opens on slide 1 of the declared lineup, every fresh load.
    setSlide(0);
  }

  function actionBar() {
    var tiles = ICB.DATA.site.taskRoutes.map(ICB.render.actionTile).join("");
    return '' +
      '<section class="action-bar" aria-labelledby="action-title">' +
        '<div class="shell"><div class="action-panel rv">' +
          '<h2 id="action-title">What can we help you with?</h2>' +
          '<div class="action-grid">' + tiles + "</div>" +
        "</div></div>" +
      "</section>";
  }

  function categories() {
    var cards = ICB.DATA.products.map(ICB.render.productCard).join("");
    return '' +
      '<section class="section" aria-labelledby="cat-title">' +
        '<div class="shell">' +
          ICB.render.sectionHead({
            eyebrow: "Insurance",
            title: "Cover for the life you have built.",
            sub: "Seven lines of insurance for homes, vehicles, vessels, cargo, business and travel. Start where you are.",
            id: "cat-title"
          }) +
          '<div class="card-grid">' + cards + "</div>" +
        "</div>" +
      "</section>";
  }

  function guidedDiscovery() {
    return '' +
      '<section class="section section--flush-top" aria-labelledby="quiz-title">' +
        '<div class="shell">' + ICB.render.quiz("quiz-title") + "</div>" +
      "</section>";
  }

  function claimsFeature() {
    var R = ICB.render;
    var data = ICB.DATA.claims;
    var rail = data.steps.slice(0, 4).map(function (s, i) {
      return '<li class="rv"><span class="cnum" aria-hidden="true">0' + (i + 1) + "</span>" +
        "<h3>" + R.esc(s.title) + "</h3><p>" + R.esc(s.body) + "</p></li>";
    }).join("");
    var values = data.valuesList.map(function (v) {
      return "<li>" + ICB.art.glyph("check") + "<span>" + R.esc(v) + "</span></li>";
    }).join("");
    return '' +
      '<section class="claims-feature on-dark" aria-labelledby="claims-feature-title">' +
        '<div class="shell">' +
          '<div class="claims-feature-grid">' +
            '<div class="rv">' +
              '<hr class="claims-rule" aria-hidden="true">' +
              '<h2 id="claims-feature-title">When something happens, know what to do next.</h2>' +
              '<p class="lead">Clear pathways, official ICB forms and a claims team that keeps you informed. The moment you need us is the moment we are built for.</p>' +
              '<div class="btn-row" style="margin-top: var(--sp-5);">' +
                '<a class="btn btn-gold" href="#/claims">How claims work</a>' +
                '<a class="btn btn-light" href="#/claims">Find your claim form</a>' +
              "</div>" +
              '<div class="values-panel rv" style="margin-top: var(--sp-6);">' +
                "<h3>The ICB claims service is built on</h3>" +
                '<ul class="values-list">' + values + "</ul>" +
              "</div>" +
            "</div>" +
            '<ol class="crail" aria-label="Four steps to reach the ICB claims team">' + rail + "</ol>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function nationwide() {
    var markers = ICB.DATA.locations.map(function (l) {
      return { id: l.id, x: l.map.x, y: l.map.y };
    });
    return '' +
      '<section class="section" aria-labelledby="nation-title">' +
        '<div class="shell home-nation">' +
          '<div>' +
            ICB.render.sectionHead({
              eyebrow: "Nationwide",
              title: "From Corozal to Punta Gorda.",
              sub: ICB.DATA.site.org.serviceQuote,
              id: "nation-title"
            }) +
            '<div class="btn-row rv">' +
              '<a class="btn btn-primary" href="#/locations">Find ICB near you</a>' +
              '<a class="btn btn-ghost" href="#/contact?topic=branch-info">Branch information</a>' +
            "</div>" +
          "</div>" +
          '<div class="home-nation-map rv">' +
            ICB.art.belizeMap({ markers: markers, labels: false, mini: true, ariaLabel: "Map of Belize with ICB branch and agency locations marked" }) +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function bizFeature() {
    var R = ICB.render;
    return '' +
      '<section class="section section--tint" aria-labelledby="biz-title">' +
        '<div class="shell biz-feature">' +
          '<div class="biz-art-wrap rv">' +
            '<div class="biz-art art-panel" data-img-slot="business-band" aria-hidden="true">' + ICB.art.panel("business") + "</div>" +
          "</div>" +
          '<div class="rv">' +
            '<span class="eyebrow">Business insurance</span>' +
            '<h2 id="biz-title">Protection for the business you have built.</h2>' +
            "<p>ICB offers insurance options for Belizean businesses across property, vehicles, cargo, marine and liability needs.</p>" +
            '<div class="stat-chips">' +
              '<span class="stat-chip"><span class="num">7</span><span class="lbl">Lines of cover</span></span>' +
              '<span class="stat-chip"><span class="num">6</span><span class="lbl">Districts served</span></span>' +
              '<span class="stat-chip"><span class="num">1981</span><span class="lbl">Serving Belize since</span></span>' +
            "</div>" +
            '<div class="btn-row">' +
              '<a class="btn btn-primary" href="#/business">Explore business insurance</a>' +
              '<a class="btn btn-ghost" href="#/contact?topic=business">Talk to ICB about business cover</a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  /* ICB in Motion: the campaign film, in its own media area. */
  function motion() {
    return ICB.render.motionSection({
      title: "The ICB films.",
      sub: "ICB's campaign film, in English and Spanish."
    });
  }

  /* ICB Across Belize: branches first. The gallery data and the lightbox
     list live in js/data/gallery.js, shared with the Gallery page. */
  function gallery() {
    var R = ICB.render;
    return '' +
      '<section class="section section--tint" aria-labelledby="gallery-title">' +
        '<div class="shell">' +
          R.sectionHead({
            eyebrow: "ICB Across Belize",
            title: "A branch in your part of the country.",
            sub: "From Corozal to Punta Gorda, ICB serves communities across Belize through a nationwide network of branches and agencies.",
            center: true,
            id: "gallery-title"
          }) +
          '<div class="gallery gallery--branches">' + R.branchGallery(6) + "</div>" +
          '<div class="btn-row" style="margin-top: var(--sp-6); justify-content: center;">' +
            '<a class="btn btn-outline" href="#/gallery">See the full gallery</a>' +
          "</div>" +
        "</div>" +
      "</section>";
  }

  /* Shared film players: used by the homepage and the Gallery page.
     Click to play with sound. Only one film plays at a time, so the two
     never talk over each other. If a source fails, a neutral note
     appears and nothing breaks. */
  ICB.initFilms = function (mount) {
    var figures = mount.querySelectorAll("[data-film]");
    if (!figures.length) return;
    var videos = [];

    Array.prototype.forEach.call(figures, function (fig) {
      var play = fig.querySelector("[data-film-play]");
      var note = fig.querySelector("[data-film-note]");
      var video = fig.querySelector(".film-video");
      if (!play || !note || !video) return;
      videos.push(video);

      video.addEventListener("play", function () {
        videos.forEach(function (other) { if (other !== video) other.pause(); });
      });

      play.addEventListener("click", function () {
        // Resolve the film source on demand, not on every navigation.
        if (video.hasAttribute("data-asset")) ICB.hydrateAssets(fig, true);
        var fail = function () {
          fig.classList.remove("is-playing");
          video.hidden = true;
          play.hidden = false;
          note.hidden = false;
        };
        fig.classList.add("is-playing");
        play.hidden = true;
        video.hidden = false;
        note.hidden = true;
        video.addEventListener("error", fail, { once: true });
        video.play().catch(function () {
          /* A blocked autoplay gesture is fine: the controls are already
             there. Only a genuine decode or network error is a failure. */
          if (video.error) fail();
        });
      });
    });
  };

  /* Shared lightbox: used by the homepage gallery and the Gallery page. */
  var lbOverlay = null, lbCloser = null;
  ICB.closeLightbox = function () { if (lbCloser) lbCloser(); };
  ICB.initLightbox = function (mount) {
    var R = ICB.render;
    // The router reuses one <main>, so bind the delegated handler once.
    if (mount.__icbLightboxBound) return;
    mount.__icbLightboxBound = true;
    mount.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lightbox]");
      if (!btn) return;
      var g = ICB.GALLERY_ITEMS[parseInt(btn.getAttribute("data-lightbox"), 10)];
      if (!g) return;
      var overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.innerHTML =
        '<figure class="lightbox" role="dialog" aria-modal="true" aria-label="' + R.esc(g.caption) + '">' +
          '<img data-asset="' + R.esc(g.src) + '" alt="' + R.esc(g.alt) + '">' +
          '<figcaption>' + R.esc(g.caption) + "</figcaption>" +
          '<button type="button" class="lightbox-close" data-lb-close aria-label="Close image">' + ICB.art.glyph("close") + "</button>" +
        "</figure>";
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      lbOverlay = overlay;
      function close(keepFocus) {
        overlay.remove();
        lbOverlay = null;
        lbCloser = null;
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
        if (keepFocus !== false && btn.isConnected) btn.focus();
      }
      lbCloser = function () { close(false); };
      function onKey(ev) { if (ev.key === "Escape") close(); }
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay || ev.target.closest("[data-lb-close]")) close();
      });
      document.addEventListener("keydown", onKey);
      overlay.querySelector("[data-lb-close]").focus();
    });
  };

  function resourcesTeaser() {
    return '' +
      '<section class="section section--flush-top" aria-labelledby="res-teaser-title">' +
        '<div class="shell home-resources rv">' +
          '<div>' +
            ICB.render.sectionHead({
              eyebrow: "Resource Centre",
              title: "Know your cover.",
              sub: "Plain answers to common questions about insurance in Belize, plus the official forms and documents.",
              rule: false,
              id: "res-teaser-title"
            }) +
          "</div>" +
          '<div class="btn-row">' +
            '<a class="btn btn-outline" href="#/resources">Visit the Resource Centre</a>' +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function contactBand() {
    var R = ICB.render;
    var site = ICB.DATA.site;
    return '' +
      '<section class="contact-band on-dark" aria-labelledby="contact-band-title">' +
        '<div class="contact-band-art" aria-hidden="true">' + ICB.art.panel("contact") + "</div>" +
        '<div class="shell"><div class="contact-band-grid">' +
          '<div class="rv">' +
            '<span class="eyebrow">Contact ICB</span>' +
            '<h2 id="contact-band-title">Talk to a person, not a process.</h2>' +
            "<p>" + R.esc(site.org.serviceQuote) + "</p>" +
            '<div class="method-rows">' +
              '<a class="method-row" href="tel:' + R.esc(site.corporate.phoneTel) + '">' +
                '<span class="method-icon">' + ICB.art.glyph("phone") + "</span>" +
                '<span><span class="m-label">Call ' + R.esc(site.corporate.phoneDisplay) + "</span>" +
                '<span class="m-sub">Corporate Office, Belize City</span></span></a>' +
              '<button type="button" class="method-row" data-wa-directory>' +
                '<span class="method-icon method-icon--wa">' + ICB.art.waIcon("roundel") + "</span>" +
                '<span><span class="m-label">WhatsApp ICB</span>' +
                '<span class="m-sub">Every branch, grouped by district</span></span></button>' +
              '<a class="method-row" href="mailto:' + R.esc(site.corporate.email) + '">' +
                '<span class="method-icon">' + ICB.art.glyph("mail") + "</span>" +
                '<span><span class="m-label">' + R.esc(site.corporate.email) + "</span>" +
                '<span class="m-sub">General enquiries</span></span></a>' +
              '<a class="method-row" href="#/locations">' +
                '<span class="method-icon">' + ICB.art.glyph("marker") + "</span>" +
                '<span><span class="m-label">Walk into a branch</span>' +
                '<span class="m-sub">Branches and agency partners nationwide</span></span></a>' +
            "</div>" +
            R.assistBadge() +
          "</div>" +
          '<div class="contact-band-card rv">' +
            "<h3>Send ICB a message</h3>" +
            "<address>" + R.esc(site.corporate.label) + "<br>" +
              R.esc(site.corporate.address) + ", " + R.esc(site.corporate.poBox) + "<br>" +
              R.esc(site.corporate.city) + ", Belize</address>" +
            '<div class="btn-row">' +
              '<a class="btn btn-gold" href="#/contact">Send a message</a>' +
              '<a class="btn btn-light" href="#/locations">Find a branch</a>' +
            "</div>" +
          "</div>" +
        "</div></div>" +
      "</section>";
  }

  ICB.views.home = {
    title: "ICB | Protecting Belize since 1981",
    render: function () {
      return heroSlider() + actionBar() + categories() + guidedDiscovery() +
        claimsFeature() + nationwide() + bizFeature() + motion() + gallery() +
        resourcesTeaser() + contactBand();
    },
    mounted: function (mount) {
      initSlider(mount);
      ICB.initLightbox(mount);
      ICB.render.initQuiz(mount);
      ICB.initFilms(mount);
    }
  };
})();
