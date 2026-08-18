/* ==========================================================================
   NATFISH V1 interactions
   Vanilla JS, no dependencies, no external API calls.
   ========================================================================== */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.remove("no-js");

  /* ------------------------------------------------------- sticky nav -- */

  var header = document.querySelector(".site-header");
  if (header) {
    var setStuck = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* ------------------------------------------------------ mobile menu -- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    var focusables = function () {
      return Array.prototype.filter.call(
        nav.querySelectorAll("a[href], button:not([disabled])"),
        function (el) {
          return el.offsetParent !== null;
        }
      );
    };

    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      if (open) {
        var first = focusables()[0];
        if (first) first.focus();
      }
    };

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    /* Close when a destination is chosen. */
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;

      if (event.key === "Escape") {
        setMenu(false);
        toggle.focus();
        return;
      }

      if (event.key !== "Tab") return;

      /* Keep focus inside the open drawer. */
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        toggle.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        toggle.focus();
      } else if (document.activeElement === toggle && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }
    });

    /* Reset the drawer if the viewport grows past the breakpoint. */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1279 &&
          toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
      }
    });
  }

  /* ----------------------------------------------------------- reveal -- */

  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(revealables, function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
      Array.prototype.forEach.call(revealables, function (el) {
        observer.observe(el);
      });
    }
  }

  /* -------------------------------------------------------- carousel -- */
  /* Rotating hero backdrop. There is no visible control interface: the
     headline, copy and CTAs stay fixed and only the image cross-fades. */

  var ROTATE_MS = 7000;

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-carousel]"),
    function (root) {
      var slides = root.querySelectorAll(".hero__slide");
      if (slides.length < 2) return;

      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      var index = 0;
      var timer = null;

      var render = function () {
        Array.prototype.forEach.call(slides, function (el, i) {
          el.classList.toggle("is-active", i === index);
        });
      };

      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

      var start = function () {
        if (timer || reduced.matches) return;
        timer = window.setInterval(function () {
          index = (index + 1) % slides.length;
          render();
        }, ROTATE_MS);
      };

      var goTo = function (next) {
        index = (next + slides.length) % slides.length;
        render();
      };

      /* Swipe stays available, but only for clearly horizontal intent so
         vertical scrolling is never intercepted. Listeners are passive. */
      var startX = null;
      var startY = null;
      var viewport = root.querySelector("[data-carousel-viewport]") || root;

      viewport.addEventListener("touchstart", function (event) {
        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;
      }, { passive: true });

      viewport.addEventListener("touchend", function (event) {
        if (startX === null) return;
        var dx = event.changedTouches[0].clientX - startX;
        var dy = event.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          stop();
          goTo(dx < 0 ? index + 1 : index - 1);
          start();
        }
        startX = null;
        startY = null;
      }, { passive: true });

      /* Nothing rotates behind a hidden tab. */
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          stop();
        } else {
          start();
        }
      });

      /* Reduced motion holds on the first slide. */
      render();
      start();
    }
  );

  /* ---------------------------------------------------- video facade -- */
  /* Nothing third-party loads until the visitor asks for it. */

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-video]"),
    function (wrap) {
      var button = wrap.querySelector(".video__poster");
      if (!button) return;

      button.addEventListener("click", function () {
        var id = wrap.getAttribute("data-video");
        var title = wrap.getAttribute("data-video-title") || "Featured video";
        var frame = document.createElement("iframe");

        frame.src =
          "https://www.youtube-nocookie.com/embed/" +
          encodeURIComponent(id) +
          "?autoplay=1&rel=0";
        frame.title = title;
        frame.allow =
          "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        frame.setAttribute("allowfullscreen", "");

        wrap.innerHTML = "";
        wrap.appendChild(frame);
        frame.focus();
      });
    }
  );

  /* --------------------------------------------------------- lightbox -- */

  var lightbox = document.getElementById("lightbox");
  var triggers = document.querySelectorAll(".gallery__item");

  if (lightbox && triggers.length) {
    var lbImage = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox__caption");
    var lastFocus = null;
    var index = 0;

    var show = function (i) {
      index = (i + triggers.length) % triggers.length;
      var source = triggers[index].querySelector("img");
      if (!source) return;

      lbImage.src = source.getAttribute("data-full") || source.currentSrc ||
        source.src;
      lbImage.alt = source.alt;
      lbCaption.textContent = source.alt;
    };

    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.classList.add("is-open");
      document.body.classList.add("nav-open");
      lightbox.querySelector(".lightbox__close").focus();
    };

    var close = function () {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      lbImage.removeAttribute("src");
      if (lastFocus) lastFocus.focus();
    };

    Array.prototype.forEach.call(triggers, function (trigger, i) {
      trigger.addEventListener("click", function () {
        open(i);
      });
    });

    lightbox.addEventListener("click", function (event) {
      var action = event.target.closest("[data-lightbox]");
      if (action) {
        var kind = action.getAttribute("data-lightbox");
        if (kind === "close") close();
        if (kind === "prev") show(index - 1);
        if (kind === "next") show(index + 1);
        return;
      }
      /* Clicking the backdrop closes. */
      if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);

      /* Keep focus on the controls while the overlay is up. */
      if (event.key === "Tab") {
        var items = lightbox.querySelectorAll(".lightbox__btn");
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------ year -- */

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-year]"),
    function (el) {
      el.textContent = String(new Date().getFullYear());
    }
  );
})();
