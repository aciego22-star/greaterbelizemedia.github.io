/* ============================================================
   Sutherland Septic Services — Interactions
   ============================================================ */
(function () {
  "use strict";

  var doc = document;

  /* ---- Sticky header shrink on scroll ---- */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = doc.querySelector(".nav-toggle");
  var menu = doc.querySelector(".mobile-menu");
  var scrim = doc.querySelector(".scrim");
  var closeBtn = doc.querySelector(".mobile-menu-close");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    if (scrim) scrim.classList.add("show");
    doc.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (scrim) scrim.classList.remove("show");
    doc.body.style.overflow = "";
  }
  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (scrim) scrim.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeRoland(); }
  });

  /* ---- Scroll reveal ---- */
  var revealEls = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Gallery filtering ---- */
  var filterBtns = doc.querySelectorAll(".filter-btn");
  var galleryItems = doc.querySelectorAll(".gallery-item");
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        galleryItems.forEach(function (item) {
          var cats = item.getAttribute("data-category") || "";
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---- Roland launcher (Chatbase embed) ----
     Every [data-roland] trigger + the floating FAB open the real Roland chat
     in a modal. The Chatbase widget renders its own UI (green header, avatar,
     greeting, prompt chips, mic/send bar), so the modal adds only a container
     and a close control. To swap chatbots, change ROLAND_EMBED below.
  ------------------------------------------------------------- */
  var ROLAND_EMBED = "https://www.chatbase.co/chatbot-iframe/3oMacSm0TBYNQ0AsnucmU";
  var rolandModal = null;
  var rolandLastFocus = null;

  function buildRolandModal() {
    var overlay = doc.createElement("div");
    overlay.className = "roland-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Chat with Roland AI");

    var inner = doc.createElement("div");
    inner.className = "roland-modal-inner";

    var closeBtn = doc.createElement("button");
    closeBtn.className = "roland-modal-close";
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Close Roland AI chat");
    closeBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="images/icons.svg#close"></use></svg>';
    closeBtn.addEventListener("click", closeRoland);

    var card = doc.createElement("div");
    card.className = "roland-modal-card";

    // iframe built lazily on first open (below), appended into card
    inner.appendChild(closeBtn);
    inner.appendChild(card);
    overlay.appendChild(inner);

    // click on the backdrop (outside the chat) closes
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === inner) closeRoland();
    });

    doc.body.appendChild(overlay);
    rolandModal = { overlay: overlay, card: card, close: closeBtn, loaded: false };
    return rolandModal;
  }

  function openRoland() {
    var m = rolandModal || buildRolandModal();
    if (!m.loaded) {
      var iframe = doc.createElement("iframe");
      iframe.className = "roland-frame";
      iframe.setAttribute("src", ROLAND_EMBED);
      iframe.setAttribute("title", "Roland AI — Sutherland Septic Services");
      iframe.setAttribute("allow", "microphone");
      iframe.setAttribute("loading", "lazy");
      m.card.appendChild(iframe);
      m.loaded = true;
    }
    rolandLastFocus = doc.activeElement;
    m.overlay.classList.add("open");
    doc.body.style.overflow = "hidden";
    m.close.focus();
  }

  function closeRoland() {
    if (!rolandModal || !rolandModal.overlay.classList.contains("open")) return;
    rolandModal.overlay.classList.remove("open");
    doc.body.style.overflow = "";
    if (rolandLastFocus && typeof rolandLastFocus.focus === "function") rolandLastFocus.focus();
  }

  window.openRoland = openRoland;

  doc.querySelectorAll("[data-roland]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
      openRoland();
    });
  });

  /* ---- Contact form: photo upload label + friendly submit ---- */
  var fileInput = doc.querySelector("#photos");
  var fileLabel = doc.querySelector("#file-label");
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", function () {
      var n = fileInput.files.length;
      fileLabel.textContent = n ? (n + (n === 1 ? " photo" : " photos") + " selected") : "Tap to add photos of the issue";
    });
  }

  /* ---- Current year in footer ---- */
  doc.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Lightweight lazy video embed (click-to-load YouTube) ---- */
  doc.querySelectorAll("[data-yt]").forEach(function (wrap) {
    var trigger = wrap.querySelector(".video-placeholder");
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      var id = wrap.getAttribute("data-yt");
      if (!id || id === "REPLACE_ID") return;
      var iframe = doc.createElement("iframe");
      iframe.setAttribute("src", "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0");
      iframe.setAttribute("title", "Sutherland Septic Services video");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      wrap.innerHTML = "";
      wrap.appendChild(iframe);
    });
  });

  /* ---- Back-to-top button (bottom-left) ----
     Appears once the visitor has scrolled down; smooth-scrolls to the top.
     The footer reserves a bottom strip (CSS) so this and the Roland pill
     never cover the copyright / "Developed by Austere Automations" credit. */
  var toTop = doc.querySelector(".to-top");
  if (toTop) {
    var toggleToTop = function () {
      if (window.scrollY > 480) toTop.classList.add("show");
      else toTop.classList.remove("show");
    };
    window.addEventListener("scroll", toggleToTop, { passive: true });
    toggleToTop();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Hero photo rotation (crossfade every 8s) ---- */
  var heroRotate = doc.querySelector("[data-hero-rotate]");
  if (heroRotate) {
    var slides = heroRotate.querySelectorAll(".hero-slide");
    if (slides.length > 1) {
      var current = 0;
      setInterval(function () {
        slides[current].classList.remove("is-active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("is-active");
      }, 8000);
    }
  }
})();
