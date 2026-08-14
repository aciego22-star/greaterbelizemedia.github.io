/* ============================================================================
   Home view — the executive demo surface.
   Rotating hero, task-first action bar, categories, guided discovery,
   claims feature, nationwide, business feature, The ICB Story, the
   ICB Across Belize gallery, resources, contact band.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Three real ICB media slides: headquarters photograph, the
     "Protect Your Investment" campaign artwork, and the ICB film. */
  var SLIDES = [
    {
      kind: "photo",
      src: "assets/img/icb-hq.webp",
      alt: "Insurance Corporation of Belize headquarters in Belize City",
      eyebrow: "Insurance Corporation of Belize Ltd.",
      title: "Protecting Belize since 1981.",
      lead: "Insurance for the things you’ve built, the people you care about, and the road ahead.",
      actions: [
        { label: "Get covered", href: "#/insurance", primary: true },
        { label: "Make a claim", href: "#/claims" }
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
        { label: "Start an enquiry", href: "#/contact?topic=new-cover", ghost: true }
      ]
    },
    {
      kind: "video",
      eyebrow: "The ICB Story",
      title: "Four decades of standing with Belize.",
      lead: "More than four decades of protecting Belizean homes, businesses, vehicles and livelihoods.",
      actions: [
        { label: "Get covered", href: "#/insurance", primary: true },
        { label: "About ICB", href: "#/about" }
      ]
    }
  ];

  function slideMedia(s) {
    var R = ICB.render;
    if (s.kind === "photo") {
      return '<div class="hero-media" aria-hidden="true"><img src="' + R.esc(s.src) + '" alt="">' +
        '<div class="hero-scrim"></div></div>';
    }
    if (s.kind === "artwork") {
      return '<div class="hero-media hero-media--contain" aria-hidden="true"><img src="' + R.esc(s.src) + '" alt="">' +
        '<div class="hero-scrim hero-scrim--light"></div></div>';
    }
    /* Video slide: generated poster art beneath; the film fades over it
       once it plays. The video element renders only when the compressed
       film is in place (site.js media.storyVideoAvailable), so a missing
       file never produces a failed request. */
    var media = ICB.DATA.site.media;
    return '<div class="hero-media" aria-hidden="true">' +
      '<div class="hero-video-poster art-panel">' + ICB.art.panel("poster") + "</div>" +
      (media.storyVideoAvailable
        ? '<video class="hero-video" muted loop playsinline preload="metadata" src="' + R.esc(media.storyVideoSrc) + '"' +
          (media.storyVideoPoster ? ' poster="' + R.esc(media.storyVideoPoster) + '"' : "") + ' tabindex="-1"></video>'
        : "") +
      '<div class="hero-scrim"></div></div>';
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
      return '<article class="hero-slide' + (i === 0 ? " is-active" : "") + (s.light ? " hero-slide--light" : "") +
        '" role="group" aria-roledescription="slide"' +
        ' aria-label="' + (i + 1) + ' of ' + SLIDES.length + '" data-slide="' + i + '"' +
        (s.light ? ' data-light="1"' : "") + (i === 0 ? "" : ' aria-hidden="true"') + ">" +
        slideMedia(s) +
        (s.alt ? '<span class="visually-hidden">' + R.esc(s.alt) + "</span>" : "") +
        '<div class="shell"><div class="hero-slide-copy">' +
          '<span class="eyebrow hs-rise">' + R.esc(s.eyebrow) + "</span>" +
          '<h2 class="hs-rise">' + R.esc(s.title) + "</h2>" +
          '<p class="hero-lead hs-rise">' + R.esc(s.lead) + "</p>" +
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
        var video = s.querySelector(".hero-video");
        if (video) {
          if (active && !reduced) {
            video.play().then(function () {
              video.classList.add("is-playing");
            }).catch(function () { /* poster art remains */ });
          } else {
            video.pause();
          }
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

    root.addEventListener("mouseenter", function () { root.classList.add("is-paused"); });
    root.addEventListener("mouseleave", function () { root.classList.remove("is-paused"); });
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

    // Touch swipe.
    var startX = null;
    root.addEventListener("pointerdown", function (e) { startX = e.clientX; }, { passive: true });
    root.addEventListener("pointerup", function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 44) setSlide(idx + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

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
              '<p class="lead">Clear pathways, official forms and a team that keeps you informed. The moment you need us is the moment we are built for.</p>' +
              '<div class="btn-row" style="margin-top: var(--sp-5);">' +
                '<a class="btn btn-gold" href="#/claims">How claims work</a>' +
                '<a class="btn btn-light" href="#/claims">Find your claim form</a>' +
              "</div>" +
              '<div class="values-panel rv" style="margin-top: var(--sp-6);">' +
                "<h3>The ICB claims service is built on</h3>" +
                '<ul class="values-list">' + values + "</ul>" +
              "</div>" +
            "</div>" +
            '<ol class="crail" aria-label="The four first steps of a claim">' + rail + "</ol>" +
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
            "<p>From the corner shop to the commercial fleet, ICB has insured Belizean enterprise since 1981. Premises, vehicles, cargo and liability, arranged around the way your business actually runs.</p>" +
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

  function story() {
    return '' +
      '<section class="section" aria-labelledby="story-title">' +
        '<div class="shell">' +
          ICB.render.sectionHead({
            eyebrow: "The ICB Story",
            title: "Four decades of standing with Belize.",
            sub: "More than four decades of protecting Belizean homes, businesses, vehicles and livelihoods.",
            id: "story-title"
          }) +
          '<figure class="video-frame art-panel rv" data-img-slot="story-poster">' +
            ICB.art.panel("poster") +
            (ICB.DATA.site.media.storyVideoAvailable
              ? '<video class="story-video" src="' + ICB.render.esc(ICB.DATA.site.media.storyVideoSrc) + '"' +
                (ICB.DATA.site.media.storyVideoPoster ? ' poster="' + ICB.render.esc(ICB.DATA.site.media.storyVideoPoster) + '"' : "") +
                ' preload="none" playsinline hidden></video>'
              : "") +
            '<button type="button" class="play-btn" data-story-play aria-label="Play the ICB story film">' +
              ICB.art.glyph("play") +
            "</button>" +
            '<p class="video-note" data-story-note hidden>Film placement. Final footage to be supplied by ICB.</p>' +
            '<figcaption class="video-caption">' +
              '<span class="eyebrow">Founded in 1981</span>' +
              '<span class="video-line">' + ICB.render.esc(ICB.DATA.site.org.story) + "</span>" +
            "</figcaption>" +
          "</figure>" +
        "</div>" +
      "</section>";
  }

  /* Real ICB imagery: the supplied headquarters photograph and frames from
     ICB's own Life Happens Fast campaign film. */
  var GALLERY = [
    { src: "assets/img/icb-hq.webp", caption: "ICB Headquarters, Belize City", alt: "Aerial view of the Insurance Corporation of Belize headquarters" },
    { src: "assets/img/gallery/hq-street.jpg", caption: "The ICB building, Belize City", alt: "Street view of the ICB headquarters building" },
    { src: "assets/img/gallery/service.jpg", caption: "Service you can sit down with", alt: "A customer completing paperwork at an ICB desk" },
    { src: "assets/img/gallery/home.jpg", caption: "At home in Belize", alt: "A couple relaxing in their Belizean living room" },
    { src: "assets/img/gallery/road.jpg", caption: "On the road", alt: "A couple in their vehicle" },
    { src: "assets/img/gallery/community.jpg", caption: "In the community", alt: "A couple walking through a Belizean garden path" },
    { src: "assets/img/gallery/campaign.jpg", caption: "The Life Happens Fast campaign", alt: "ICB Life Happens Fast campaign title card with the ICB mascot", light: true },
    { src: "assets/img/products/mexican.jpg", caption: "Belize City from above", alt: "Aerial view of the Belize City coastal road" }
  ];

  function gallery() {
    var R = ICB.render;
    var items = GALLERY.map(function (g, i) {
      return '<figure class="gallery-item rv' + (g.light ? " gallery-item--light" : "") + '">' +
        '<button type="button" class="g-open" data-lightbox="' + i + '" aria-label="View larger: ' + R.esc(g.caption) + '">' +
          '<img src="' + R.esc(g.src) + '" alt="' + R.esc(g.alt) + '" loading="lazy">' +
        "</button>" +
        "<figcaption>" +
          '<span class="g-index" aria-hidden="true">0' + (i + 1) + "</span>" +
          '<span class="g-name">' + R.esc(g.caption) + "</span>" +
        "</figcaption>" +
        "</figure>";
    }).join("");
    return '' +
      '<section class="section" aria-labelledby="gallery-title">' +
        '<div class="shell">' +
          R.sectionHead({
            eyebrow: "ICB Across Belize",
            title: "Protecting what matters, across the country.",
            sub: "From Corozal to Punta Gorda, ICB serves communities across Belize through a nationwide network of branches and agencies. Imagery from ICB's headquarters and the Life Happens Fast campaign film.",
            center: true,
            id: "gallery-title"
          }) +
          '<div class="gallery">' + items + "</div>" +
        "</div>" +
      "</section>";
  }

  function initLightbox(mount) {
    var R = ICB.render;
    mount.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lightbox]");
      if (!btn) return;
      var g = GALLERY[parseInt(btn.getAttribute("data-lightbox"), 10)];
      if (!g) return;
      var overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.innerHTML =
        '<figure class="lightbox" role="dialog" aria-modal="true" aria-label="' + R.esc(g.caption) + '">' +
          '<img src="' + R.esc(g.src) + '" alt="' + R.esc(g.alt) + '">' +
          '<figcaption>' + R.esc(g.caption) + "</figcaption>" +
          '<button type="button" class="lightbox-close" data-lb-close aria-label="Close image">' + ICB.art.glyph("close") + "</button>" +
        "</figure>";
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      function close() {
        overlay.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
        btn.focus();
      }
      function onKey(ev) { if (ev.key === "Escape") close(); }
      overlay.addEventListener("click", function (ev) {
        if (ev.target === overlay || ev.target.closest("[data-lb-close]")) close();
      });
      document.addEventListener("keydown", onKey);
      overlay.querySelector("[data-lb-close]").focus();
    });
  }

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
            "<h3>Start an enquiry</h3>" +
            "<address>" + R.esc(site.corporate.label) + "<br>" +
              R.esc(site.corporate.address) + ", " + R.esc(site.corporate.poBox) + "<br>" +
              R.esc(site.corporate.city) + ", Belize</address>" +
            '<div class="btn-row">' +
              '<a class="btn btn-gold" href="#/contact">Start an enquiry</a>' +
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
        claimsFeature() + nationwide() + bizFeature() + story() + gallery() +
        resourcesTeaser() + contactBand();
    },
    mounted: function (mount) {
      initSlider(mount);
      initLightbox(mount);
      ICB.render.initQuiz(mount);
      var play = mount.querySelector("[data-story-play]");
      var note = mount.querySelector("[data-story-note]");
      var storyVideo = mount.querySelector(".story-video");
      if (play && note && !storyVideo) {
        play.addEventListener("click", function () {
          note.hidden = false;
          play.hidden = true;
          note.setAttribute("tabindex", "-1");
          note.focus();
        });
      }
      if (play && note && storyVideo) {
        // Plays the real ICB film; if the source ever fails to load the
        // placement note appears and nothing breaks.
        play.addEventListener("click", function () {
          play.hidden = true;
          storyVideo.hidden = false;
          storyVideo.controls = true;
          var fail = function () {
            storyVideo.hidden = true;
            note.hidden = false;
            note.setAttribute("tabindex", "-1");
            note.focus();
          };
          storyVideo.addEventListener("error", fail, { once: true });
          storyVideo.play().catch(function () {
            if (!storyVideo.error) return;
            fail();
          });
        });
      }
    }
  };
})();
