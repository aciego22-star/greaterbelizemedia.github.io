/* ==========================================================================
   NATFISH V1 interactions
   Vanilla JS, no dependencies, no external API calls.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------- config -- */

  /* Enquiry destination. Confirm both with the client before production.
     See INTERNAL-NOTES.md. */
  var ENQUIRY_EMAIL = "natfish@btl.net";

  /* WhatsApp destination, digits only, country code first.
     NOT CONFIRMED: this is the verified office line (+501 227-3165), which may
     not be registered on WhatsApp. Replace with the number Miss Denise
     confirms, or set to "" to hide the WhatsApp option entirely. */
  var WHATSAPP_NUMBER = "5012273165";

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

  /* ------------------------------------------------------------ forms -- */

  var validators = {
    email: function (value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }
  };

  var validateField = function (field) {
    var input = field.querySelector("input, select, textarea");
    if (!input) return true;

    var value = (input.value || "").trim();
    var valid = true;

    if (input.required && !value) {
      valid = false;
    } else if (value && input.type === "email" && !validators.email(value)) {
      valid = false;
    }

    field.classList.toggle("is-invalid", !valid);
    input.setAttribute("aria-invalid", valid ? "false" : "true");
    return valid;
  };

  /* Builds the readable enquiry body sent by email or WhatsApp. */
  var buildMessage = function (form) {
    var lines = [];
    Array.prototype.forEach.call(
      form.querySelectorAll(".field"),
      function (field) {
        var input = field.querySelector("input, select, textarea");
        var label = field.querySelector("label");
        if (!input || !label) return;

        var value = (input.value || "").trim();
        if (!value) return;

        var name = label.textContent.replace(/\s*\(optional\)\s*/i, "").trim();
        lines.push(name + ": " + value);
      }
    );
    return lines.join("\n");
  };

  Array.prototype.forEach.call(
    document.querySelectorAll("form[data-enquiry]"),
    function (form) {
      var panel = document.querySelector(
        '[data-success-for="' + form.id + '"]'
      );
      var subject = form.getAttribute("data-subject") || "Website enquiry";

      /* Clear the error state as soon as the visitor fixes the field. */
      form.addEventListener("input", function (event) {
        var field = event.target.closest(".field");
        if (field && field.classList.contains("is-invalid")) {
          validateField(field);
        }
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var fields = form.querySelectorAll(".field");
        var firstInvalid = null;

        Array.prototype.forEach.call(fields, function (field) {
          if (!validateField(field) && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid) {
          var input = firstInvalid.querySelector("input, select, textarea");
          if (input) input.focus();
          return;
        }

        if (!panel) return;

        var body = buildMessage(form);

        var mailLink = panel.querySelector("[data-route='email']");
        if (mailLink) {
          mailLink.href =
            "mailto:" +
            ENQUIRY_EMAIL +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(body);
        }

        var waLink = panel.querySelector("[data-route='whatsapp']");
        if (waLink) {
          if (WHATSAPP_NUMBER) {
            waLink.href =
              "https://wa.me/" +
              WHATSAPP_NUMBER +
              "?text=" +
              encodeURIComponent(subject + "\n\n" + body);
          } else {
            waLink.hidden = true;
          }
        }

        form.hidden = true;
        panel.classList.add("is-visible");
        panel.setAttribute("tabindex", "-1");
        panel.focus();
      });

      /* Allow the visitor to return to the form and edit it. */
      if (panel) {
        var restart = panel.querySelector("[data-restart]");
        if (restart) {
          restart.addEventListener("click", function () {
            panel.classList.remove("is-visible");
            form.hidden = false;
            var first = form.querySelector("input, select, textarea");
            if (first) first.focus();
          });
        }
      }
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
