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
      if (window.innerWidth > 1140 &&
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
  /* Rotating hero. The headline is fixed and only the backdrop changes, so
     nothing reflows as slides advance. */

  var ROTATE_MS = 7000;

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-carousel]"),
    function (root) {
      var slides = root.querySelectorAll(".hero__slide");
      var dots = root.querySelectorAll("[data-carousel-to]");
      var toggle = root.querySelector("[data-carousel-toggle]");
      var status = root.querySelector("[data-carousel-status]");
      if (slides.length < 2) return;

      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      var index = 0;
      var timer = null;
      /* Once the visitor takes control the carousel does not resume on its
         own. Auto-rotation restarting under someone's hands is hostile. */
      var surrendered = reduced.matches;

      var render = function (announce) {
        Array.prototype.forEach.call(slides, function (el, i) {
          el.classList.toggle("is-active", i === index);
        });
        Array.prototype.forEach.call(dots, function (el, i) {
          el.classList.toggle("is-active", i === index);
          el.setAttribute("aria-current", i === index ? "true" : "false");
        });
        /* Announced only for deliberate changes; narrating an automatic
           rotation every seven seconds would be noise. */
        if (announce && status) {
          status.textContent =
            "Slide " + (index + 1) + " of " + slides.length + ".";
        }
      };

      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        if (toggle) {
          toggle.setAttribute("aria-pressed", "true");
          toggle.setAttribute("aria-label", "Play slideshow");
        }
      };

      var start = function () {
        if (surrendered || timer) return;
        timer = window.setInterval(function () {
          index = (index + 1) % slides.length;
          render(false);
        }, ROTATE_MS);
        if (toggle) {
          toggle.setAttribute("aria-pressed", "false");
          toggle.setAttribute("aria-label", "Pause slideshow");
        }
      };

      var goTo = function (next) {
        index = (next + slides.length) % slides.length;
        surrendered = true;
        stop();
        render(true);
      };

      var prev = root.querySelector("[data-carousel-prev]");
      var next = root.querySelector("[data-carousel-next]");
      if (prev) prev.addEventListener("click", function () { goTo(index - 1); });
      if (next) next.addEventListener("click", function () { goTo(index + 1); });

      Array.prototype.forEach.call(dots, function (dot, i) {
        dot.addEventListener("click", function () { goTo(i); });
      });

      if (toggle) {
        toggle.addEventListener("click", function () {
          if (timer) {
            surrendered = true;
            stop();
          } else {
            surrendered = false;
            start();
          }
        });
      }

      root.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(index - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(index + 1);
        }
      });

      /* Swipe. Horizontal intent only, so vertical scrolling is untouched. */
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
          goTo(dx < 0 ? index + 1 : index - 1);
        }
        startX = null;
        startY = null;
      }, { passive: true });

      /* Nothing rotates behind a hidden tab. */
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          if (timer) window.clearInterval(timer);
          timer = null;
        } else if (!surrendered) {
          start();
        }
      });

      render(false);
      if (reduced.matches) {
        stop();
      } else {
        start();
      }
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
