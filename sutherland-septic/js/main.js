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
    if (e.key === "Escape") closeMenu();
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

  /* ---- Roland launcher ----
     When the real Roland chat embed is added, this opens it.
     Wiring guide (single place to change):
       1. Paste the provider's widget <script> before </body> on each page.
       2. Replace the body of openRoland() below with the provider's open call,
          e.g. window.RolandChat.open();  or  window.__roland.toggle();
  ------------------------------------------------------------- */
  window.openRoland = function () {
    // Try common embedded-widget global hooks first.
    try {
      if (window.RolandChat && typeof window.RolandChat.open === "function") { window.RolandChat.open(); return; }
      if (window.$crisp) { window.$crisp.push(["do", "chat:open"]); return; }
      if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") { window.Tawk_API.maximize(); return; }
    } catch (e) { /* fall through to fallback */ }

    // Fallback until the embed is wired in: reassure the visitor and route to WhatsApp.
    var wa = "https://wa.me/5016146462?text=" +
      encodeURIComponent("Hi Roland, I'd like help with a septic service request.");
    var ok = window.confirm(
      "Roland, your 24-hour service assistant, is being connected.\n\n" +
      "Press OK to continue the conversation on WhatsApp, or Cancel to call us at 614-6462."
    );
    if (ok) window.open(wa, "_blank", "noopener");
    else window.location.href = "tel:+5016146462";
  };

  doc.querySelectorAll("[data-roland]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.openRoland();
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
