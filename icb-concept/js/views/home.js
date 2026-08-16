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
        { label: "Request a quote", href: "#/contact?topic=new-cover", ghost: true }
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

    /* Brand lockup. A <picture> picks the composition that suits the shape
       of the viewport, which is about proportion rather than device: the
       banner from 561px up, where the hero box is wide enough to carry a
       landscape lockup, and the vertical poster on phones. Both are
       contained, so neither is ever cropped or stretched, and the
       wordmark stays legible at both sizes. */
    if (s.kind === "brand") {
      return '<div class="hero-media hero-media--brand" aria-hidden="true">' +
        "<picture>" +
          '<source media="(min-width: 561px)" data-asset-srcset="' + R.esc(s.srcWide) + '">' +
          '<img data-asset="' + R.esc(s.srcTall) + '" alt="">' +
        "</picture>" +
      "</div>";
    }

    /* Film slide.

       The film runs as ambient motion the moment its slide comes up, the
       way it did before. No browser will start a video with sound
       unprompted, so it begins muted, and a sound control sits in the
       corner: one tap is the gesture the browser needs, and audio is
       permitted from that point on. Once a visitor has asked for sound,
       later visits to the slide start with it already on.

       If even muted playback is refused, the poster stays and a play
       button appears as a fallback. */
    return '<div class="hero-media hero-media--film">' +
      '<img class="hero-film-poster" data-asset="' + R.esc(media.heroVideoPoster) + '" alt="" aria-hidden="true">' +
      (media.heroVideoAvailable
        ? '<video class="hero-video" muted loop playsinline preload="metadata" data-asset-defer' +
          ' data-asset="' + R.esc(media.heroVideoSrc) + '"' +
          ' data-asset-poster="' + R.esc(media.heroVideoPoster) + '" tabindex="-1"></video>'
        : "") +
      '<div class="hero-scrim" aria-hidden="true"></div>' +
      (media.heroVideoAvailable
        ? '<button type="button" class="hero-sound" data-hero-sound aria-pressed="false"' +
            ' aria-label="Turn on sound for the ICB film">' +
            '<span class="s-off">' + ICB.art.glyph("sound-off") + "</span>" +
            '<span class="s-on">' + ICB.art.glyph("sound-on") + "</span>" +
          "</button>" +
          '<span class="hero-sound-hint" data-hero-hint aria-hidden="true">Tap for sound</span>'
        : "") +
      '<button type="button" class="play-btn hero-play" data-hero-play hidden' +
        ' aria-label="Play the ICB film Life Happens Fast">' +
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
       The hero film.

       It plays by itself as ambient motion when its slide is up, exactly
       as it did before. Browsers refuse to start a video with audio
       unprompted, so it opens muted and a sound control sits in the
       corner; tapping it is the gesture that unlocks audio. That choice
       is remembered for the session, so once sound is on, coming back to
       the slide starts it with sound already playing.

       Looping suits ambient motion but not a film someone is listening
       to, so loop is dropped while the sound is on, and the carousel is
       held so the slide cannot move on mid-sentence.
       ---------------------------------------------------------------- */
    var soundWanted = false;

    function setSoundUi(slide, on) {
      var btn = slide.querySelector("[data-hero-sound]");
      var hint = slide.querySelector("[data-hero-hint]");
      if (!btn) return;
      /* Only the state changes. Rewriting innerHTML here would detach the
         very element a click is being dispatched on, and the surface
         handler below would then fail to recognise it as a control and
         toggle the sound straight back. */
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on
        ? "Turn off sound for the ICB film"
        : "Turn on sound for the ICB film");
      // The prompt is only useful until the visitor has answered it.
      if (hint) hint.hidden = on || soundWanted;
    }

    function applySound(slide, video, on) {
      soundWanted = on;
      video.muted = !on;
      video.volume = 1;
      video.loop = !on;
      root.classList.toggle("is-film-holding", on);
      if (on) {
        manual = true;
        root.classList.add("is-manual");
      }
      setSoundUi(slide, on);
    }

    function startFilm(slide) {
      var video = slide.querySelector(".hero-video");
      var play = slide.querySelector("[data-hero-play]");
      var note = slide.querySelector("[data-hero-note]");
      if (!video) return;

      if (video.hasAttribute("data-asset")) ICB.hydrateAssets(slide, true);
      video.muted = !soundWanted;
      video.volume = 1;
      video.loop = !soundWanted;
      setSoundUi(slide, soundWanted);

      video.play().then(function () {
        video.classList.add("is-playing");
        if (play) play.hidden = true;
        if (note) note.hidden = true;
        root.classList.toggle("is-film-holding", soundWanted);
      }).catch(function () {
        /* Audio was refused. Fall back to silent ambient playback, which
           every browser allows, and leave the sound control offering the
           upgrade. */
        if (!video.muted) {
          applySound(slide, video, false);
          video.play().then(function () {
            video.classList.add("is-playing");
            if (play) play.hidden = true;
          }).catch(function () { offerPlayButton(slide, video); });
          return;
        }
        offerPlayButton(slide, video);
      });
    }

    function offerPlayButton(slide, video) {
      // Even muted playback was refused, so ask for it explicitly.
      var play = slide.querySelector("[data-hero-play]");
      var note = slide.querySelector("[data-hero-note]");
      video.classList.remove("is-playing");
      if (video.error && note) note.hidden = false;
      if (play) play.hidden = false;
    }

    function stopFilm(slide) {
      var video = slide.querySelector(".hero-video");
      if (!video) return;
      video.pause();
      video.classList.remove("is-playing");
      root.classList.remove("is-film-holding");
    }

    function initFilmSlide(slide) {
      var video = slide.querySelector(".hero-video");
      var play = slide.querySelector("[data-hero-play]");
      var sound = slide.querySelector("[data-hero-sound]");
      var note = slide.querySelector("[data-hero-note]");

      if (!video) {
        if (play) {
          play.hidden = false;
          play.addEventListener("click", function () {
            play.hidden = true;
            if (note) note.hidden = false;
          });
        }
        return;
      }

      if (play) {
        play.addEventListener("click", function () {
          // A real gesture, so this attempt may carry sound.
          applySound(slide, video, true);
          startFilm(slide);
        });
      }

      function toggleSound() {
        var turningOn = !sound || sound.getAttribute("aria-pressed") !== "true";
        applySound(slide, video, turningOn);
        var hint = slide.querySelector("[data-hero-hint]");
        if (hint) hint.hidden = true;
        if (turningOn && video.paused) startFilm(slide);
      }

      if (sound) {
        sound.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleSound();
        });
      }

      /* The speaker button is a small target on a phone. The whole film
         surface toggles sound as well, so a tap anywhere on the picture
         works. Anything genuinely interactive on top of it keeps its own
         behaviour. */
      var surface = slide.querySelector(".hero-media--film");
      if (surface) {
        surface.addEventListener("click", function (e) {
          if (e.target.closest("a, button")) return;
          toggleSound();
        });
      }

      video.addEventListener("ended", function () {
        // Only reachable with sound on, where looping is switched off.
        applySound(slide, video, false);
        video.currentTime = 0;
        video.play().catch(function () {});
      });
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
        /* Ambient again: arriving on the slide starts the film, leaving
           it stops it so audio never carries under another slide. */
        var video = s.querySelector(".hero-video");
        if (video) {
          if (active && !reduced) startFilm(s);
          else if (!active) stopFilm(s);
        }
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

    /* Hovering the hero does NOT pause it.

       It used to, and on a desktop that quietly switched autoplay off:
       the hero fills the top of the window, so the cursor is resting on
       it more often than not, and once the pointer stopped moving the
       carousel stayed paused for good. It looked broken on desktop while
       working on a phone, which has no hover at all.

       Hovering the CONTROLS still pauses, which is the part worth
       keeping: it holds the slide still for someone reaching for an
       arrow or a bar, and that is a small deliberate target rather than
       the whole picture. */
    var controls = root.querySelector(".hero-controls");
    if (controls) {
      controls.addEventListener("mouseenter", function () { root.classList.add("is-paused"); });
      controls.addEventListener("mouseleave", function () { root.classList.remove("is-paused"); });
    }
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
      if (slide.querySelector(".hero-media--film")) initFilmSlide(slide);
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
            sub: "Insurance options for individuals and businesses. Start where you are.",
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
    var markers = ICB.DATA.activeLocations().map(function (l) {
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
            /* Two figures, both of them checkable: the districts ICB has
               locations in, counted from the location dataset, and the
               founding year. The old "7 lines of cover" chip was a count
               of ICB's published categories, and a number like that is
               wrong the day the list changes. */
            '<div class="stat-chips">' +
              '<span class="stat-chip"><span class="num">' + ICB.DATA.districts.length + '</span><span class="lbl">Districts served</span></span>' +
              '<span class="stat-chip"><span class="num">' + ICB.DATA.site.org.founded + '</span><span class="lbl">Serving Belize since</span></span>' +
            "</div>" +
            '<div class="btn-row">' +
              '<a class="btn btn-primary" href="#/business">Explore business insurance</a>' +
              '<a class="btn btn-ghost" href="#/contact?topic=business">Request a quote</a>' +
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
      /* The overlay is a child of body, not of the view mount, so neither
         the boot pass nor the router's per-view pass ever reaches it. It
         has to resolve its own data-asset or the frame opens empty, which
         is exactly what it was doing. */
      ICB.hydrateAssets(overlay, true);
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
              sub: "Official forms, safety information and useful ICB resources in one place.",
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
