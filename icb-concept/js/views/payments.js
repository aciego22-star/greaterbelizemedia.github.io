/* ============================================================================
   Make a payment — how ICB is actually paid.

   The page explains a process that happens somewhere else: the customer's
   own bank, then WhatsApp. Nothing here takes a payment, and the view is
   built so it cannot start to look as though it does. No amount field, no
   card field, no login, no upload, no success state. The only interactive
   thing on the page is a button that copies an account number.

   Platform handling: iOS and Android visitors are offered the verified
   store page for their platform, which opens the app if it is already
   installed. Desktop leads with online banking. No custom URL scheme is
   invented, because a page cannot reliably open a banking app and must
   not pretend to.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  /* Only ever used to choose which verified store link to lead with. */
  function platform() {
    var ua = navigator.userAgent || "";
    var touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    if (/iPad|iPhone|iPod/.test(ua) || touchMac) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }

  function bankCard(bank, R, plat) {
    var store = plat === "ios" ? bank.ios : plat === "android" ? bank.android : null;
    var ext = R.extAttrs();

    var actions;
    if (store) {
      /* On a phone the app is the likely route, so it leads. The store
         opens the app when it is already installed. */
      actions =
        '<a class="btn btn-primary btn-sm" href="' + R.esc(store) + '"' + ext + ">" +
          ICB.s("openOrGetApp") + R.extIcon() + R.extNote(R.hostOf(store)) + "</a>" +
        '<a class="btn btn-ghost btn-sm" href="' + R.esc(bank.online) + '"' + ext + ">" +
          ICB.s("useOnlineBanking") + R.extIcon() + R.extNote(R.hostOf(bank.online)) + "</a>";
    } else {
      /* On a desktop, online banking leads and the store pages stay
         available for whoever is setting a phone up. */
      actions =
        '<a class="btn btn-primary btn-sm" href="' + R.esc(bank.online) + '"' + ext + ">" +
          ICB.s("useOnlineBanking") + R.extIcon() + R.extNote(R.hostOf(bank.online)) + "</a>";
    }

    var stores = store ? "" :
      '<p class="bank-stores">' + R.esc(ICB.s("getTheApp")) + " " +
        '<a href="' + R.esc(bank.ios) + '"' + ext + ">iOS" + R.extNote("apps.apple.com") + "</a>" +
        '<span aria-hidden="true"> / </span>' +
        '<a href="' + R.esc(bank.android) + '"' + ext + ">Android" + R.extNote("play.google.com") + "</a>" +
      "</p>";

    return '' +
      '<article class="bank-card rv">' +
        "<h3>" + R.esc(bank.name) + "</h3>" +
        '<dl class="bank-meta">' +
          "<div><dt>" + R.esc(ICB.s("accountName")) + "</dt><dd>" + R.esc(bank.accountName) + "</dd></div>" +
        "</dl>" +
        '<div class="bank-acct">' +
          '<span class="bank-acct-label" id="acct-' + R.esc(bank.id) + '">' + R.esc(ICB.s("accountNumber")) + "</span>" +
          '<span class="bank-acct-num" data-account>' + R.esc(bank.account) + "</span>" +
          '<button type="button" class="bank-copy" data-copy="' + R.esc(bank.account) + '"' +
            ' aria-describedby="acct-' + R.esc(bank.id) + '">' +
            ICB.art.glyph("document") + '<span data-copy-label>' + R.esc(ICB.s("copyAccount")) + "</span>" +
          "</button>" +
        "</div>" +
        '<div class="btn-row bank-actions">' + actions + "</div>" +
        stores +
      "</article>";
  }

  /* The payment-confirmation directory, derived from the receipt flag on
     the location dataset. A branch appears here only because ICB says
     that line receives payment confirmations. */
  function receiptDirectory(R) {
    var pay = ICB.DATA.payments;
    var groups = ICB.DATA.districts.map(function (d) {
      var here = ICB.DATA.receiptLines().filter(function (r) { return r.location.district === d; });
      if (!here.length) return "";
      var rows = here.map(function (r) {
        return r.lines.map(function (w) {
          var name = r.location.name + (w.label ? " (" + ICB.t(w.label) + ")" : "");
          return '<a class="wa-row" href="' + R.esc(R.waHref(w.wa, pay.receipts.prefill)) + '"' + R.extAttrs() + ">" +
            ICB.art.waIcon("roundel") +
            '<span class="wa-row-main">' +
              '<span class="wa-row-name">' + R.esc(name) + "</span>" +
            "</span>" +
            '<span class="wa-row-cta">' + R.esc(ICB.s("sendConfirmation")) + "</span>" +
            R.extNote("wa.me") +
          "</a>";
        }).join("");
      }).join("");
      return '<section class="wa-group" aria-label="' + R.esc(ICB.s("district", { d: d })) + '"><h3>' + R.esc(d) + "</h3>" + rows + "</section>";
    }).join("");

    return '<div class="receipt-dir rv">' + groups + "</div>";
  }

  ICB.views.payments = {
    title: { en: "Make a payment | ICB", es: "Hacer un pago | ICB" },
    render: function () {
      var R = ICB.render;
      var site = ICB.DATA.site;
      var pay = ICB.DATA.payments;
      var plat = platform();

      var banks = pay.banks.map(function (b) { return bankCard(b, R, plat); }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="pay-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="payments-hero" aria-hidden="true">' + ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome(ICB.s("makeAPayment")) +
            '<span class="eyebrow">' + R.esc(ICB.s("payments")) + "</span>" +
            '<h1 id="pay-title">' + R.esc(pay.heading) + "</h1>" +
            '<p class="hero-lead">' + R.esc(pay.standfirst) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="pay-how-title">' +
          '<div class="shell">' +
            '<div class="prod-prose rv">' +
              '<h2 id="pay-how-title">' + R.esc(ICB.s("howPayingWorks")) + "</h2>" +
              pay.intro.map(function (t) { return "<p>" + R.esc(t) + "</p>"; }).join("") +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint section--flush-top" aria-labelledby="pay-steps-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: ICB.s("stepByStep"), title: ICB.s("sixSteps"), id: "pay-steps-title" }) +
            R.steps(pay.steps) +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="pay-banks-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: ICB.s("icbBankAccounts"),
              title: ICB.s("transferToAccounts"),
              sub: ICB.s("accountsHeldAs", { name: pay.accountName }),
              id: "pay-banks-title"
            }) +
            '<div class="bank-grid">' + banks + "</div>" +
            '<p class="bank-foot rv">' + R.esc(ICB.s("transferElsewhere")) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint section--flush-top" aria-labelledby="pay-wa-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: ICB.s("stepFive"),
              title: pay.receipts.title,
              sub: pay.receipts.body,
              id: "pay-wa-title"
            }) +
            '<p class="receipt-attach rv">' + ICB.art.glyph("check") + "<span>" + R.esc(pay.receipts.attachNote) + "</span></p>" +
            receiptDirectory(R) +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + T("Help with a payment", "Ayuda con un pago") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: ICB.s("hereToHelp"),
              title: pay.help.title,
              body: pay.help.body,
              motif: "heritage",
              actions: [
                { label: ICB.s("callN", { n: site.corporate.phoneDisplay }), href: "tel:" + site.corporate.phoneTel },
                { label: ICB.s("emailN", { n: site.corporate.email }), href: "mailto:" + site.corporate.email },
                { label: ICB.s("findYourBranch"), href: "#/locations" }
              ]
            }) +
            '<p class="pay-help-note rv">' + R.esc(pay.help.emailNote) + "</p>" +
          "</div>" +
        "</section>";
    },

    mounted: function (mount) {
      /* Copy the account number. Clipboard API where it is allowed, and a
         hidden-textarea fallback where it is not, which includes a page
         opened straight off the filesystem. The button reports what
         happened either way: silence after a tap reads as failure. */
      mount.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-copy]");
        if (!btn) return;
        var value = btn.getAttribute("data-copy");
        var label = btn.querySelector("[data-copy-label]");
        var original = btn.getAttribute("data-original") || label.textContent;
        btn.setAttribute("data-original", original);

        function done(okay) {
          label.textContent = ICB.s(okay ? "copied" : "copyManually");
          btn.classList.toggle("is-copied", okay);
          btn.classList.toggle("is-failed", !okay);
          clearTimeout(btn.__t);
          btn.__t = setTimeout(function () {
            label.textContent = original;
            btn.classList.remove("is-copied", "is-failed");
          }, 2600);
        }

        function fallback() {
          try {
            var ta = document.createElement("textarea");
            ta.value = value;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            var okay = document.execCommand("copy");
            document.body.removeChild(ta);
            done(okay);
          } catch (err) { done(false); }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () { done(true); }, fallback);
        } else {
          fallback();
        }
      });
    }
  };
})();
