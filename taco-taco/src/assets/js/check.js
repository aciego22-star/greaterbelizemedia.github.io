/* The kitchen's copy of an order.

   Everything on this page is worked out here. The link holds what was ordered
   and the moment it was placed; it holds no prices at all, and the three
   figures the site generated travel with it only so that this page can say
   whether the link itself has been tampered with. They are never displayed as
   the answer. The answer is always the one computed below from the menu.

   That is the whole idea: there is nothing in the customer's hands for this
   page to believe. */
(function () {
  var D = window.TT_CHECK || {};
  var out = document.getElementById('chk-out');
  if (!out) return;

  function money(n) { return '$' + (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* the same seal site.js stamps, so a hand-edited link fails here loudly */
  function seal(str) {
    var h1 = 0x811c9dc5, h2 = 0x01000193, m = str + (D.key || '');
    for (var i = 0; i < m.length; i++) {
      var c = m.charCodeAt(i);
      h1 = ((h1 ^ c) >>> 0) * 16777619 >>> 0;
      h2 = ((h2 + c * 31) >>> 0) ^ ((h2 << 7) | (h2 >>> 25)); h2 = h2 >>> 0;
    }
    return (h1 >>> 0).toString(36).slice(-4) + (h2 >>> 0).toString(36).slice(-4);
  }
  function unb64(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  function say(kind, title, body) {
    out.innerHTML = '<div class="chk-card chk-' + kind + '">' +
      '<p class="chk-head">' + esc(title) + '</p>' +
      '<p class="chk-note">' + esc(body) + '</p></div>';
  }

  /* Which promotion, if any, was running when this order was placed. Not which
     one is running now: an order sent at half past eleven on the last night of
     a promotion is still a promotional order when the kitchen opens it. */
  function promoAt(ms) {
    var list = D.promos || [];
    for (var i = 0; i < list.length; i++) {
      if (ms >= list[i].from && ms <= list[i].to) return list[i];
    }
    return null;
  }

  function price(line) {
    /* A deal: the id survives translation where the title does not, and its
       price is checked against the prices that deal is actually allowed to
       have rather than taken on trust. */
    if (line.d) {
      var d = (D.deals || {})[line.d];
      if (!d) return { ok: false, why: 'unknown deal', unit: +line.p || 0 };
      var allowed = d.p || [];
      var unit = +line.p || 0;
      return { ok: allowed.indexOf(unit) >= 0, why: 'price not on this deal',
               unit: unit, name: d.t, allowed: allowed };
    }
    /* A menu item: priced from our own table, plus the meat surcharge if the
       chosen meat carries one. Nothing here came off the link. */
    var base = (D.prices || {})[line.n];
    if (base == null) return { ok: false, why: 'not on the menu', unit: 0 };
    var extra = (D.surcharge || {})[line.m] || 0;
    return { ok: true, unit: base + extra, name: line.n };
  }

  function render(p, intact) {
    var rows = '', sub = 0, problems = [];
    (p.o || []).forEach(function (line) {
      var q = Math.max(0, parseInt(line.q, 10) || 0);
      var r = price(line);
      var lineTotal = r.unit * q;
      sub += lineTotal;
      if (!r.ok) problems.push((line.n || line.d) + ': ' + r.why);
      var label = esc(r.name || line.n || line.d || '?');
      if (line.m) label += ' <span class="chk-meat">(' + esc(line.m) + ')</span>';
      rows += '<tr' + (r.ok ? '' : ' class="chk-bad"') + '>' +
              '<td class="chk-q">' + q + '&times;</td>' +
              '<td>' + label + (r.ok ? '' : ' <span class="chk-flag">' + esc(r.why) + '</span>') + '</td>' +
              '<td class="chk-money">' + money(lineTotal) + '</td></tr>';
    });

    var pr = promoAt(+p.t || 0);
    var base = sub;
    if (pr && pr.deals === false) {
      base = 0;
      (p.o || []).forEach(function (line) {
        if (line.d) return;
        var r = price(line);
        base += r.unit * Math.max(0, parseInt(line.q, 10) || 0);
      });
    }
    var off = pr ? Math.round((base * pr.pct / 100 + Number.EPSILON) * 100) / 100 : 0;
    var total = Math.round((sub - off + Number.EPSILON) * 100) / 100;
    sub = Math.round((sub + Number.EPSILON) * 100) / 100;

    var when = new Date(+p.t || 0);
    var foot = '';
    if (pr) {
      foot = '<tr class="chk-off"><td></td><td>' + esc(pr.label) + '</td>' +
             '<td class="chk-money">&minus;' + money(off) + '</td></tr>';
    }

    /* Did the figures the site generated survive the trip? This says nothing
       about the message text, which is the thing that actually gets edited; it
       says whether the link was left alone. The total below is computed either
       way. */
    var drift = (Math.abs((+p.g || 0) - total) > 0.005);

    out.innerHTML =
      '<div class="chk-card ' + (intact && !drift && !problems.length ? 'chk-ok' : 'chk-warn') + '">' +
        '<p class="chk-head">' +
          (intact ? (drift || problems.length ? 'Check this one' : 'Order is consistent')
                  : 'This link has been altered') + '</p>' +
        '<p class="chk-when">Placed ' + esc(when.toLocaleString()) + '</p>' +
        '<table class="chk-tbl"><tbody>' + rows + foot +
          '<tr class="chk-sum"><td></td><td>Charge this</td>' +
          '<td class="chk-money">' + money(total) + '</td></tr>' +
        '</tbody></table>' +
        (problems.length
          ? '<p class="chk-note">' + esc(problems.join('. ')) + '.</p>' : '') +
        (drift
          ? '<p class="chk-note">The message said ' + money(+p.g || 0) +
            '. The menu says ' + money(total) + '. Charge the menu.</p>' : '') +
        '<p class="chk-fine">Worked out here from the menu. No price was taken ' +
        'from the customer’s message.</p>' +
      '</div>';
  }

  function read() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (!raw) return;
    var bits = raw.split('.');
    var body = bits[0], stamp = bits[1] || '';
    var intact = stamp !== '' && seal(body) === stamp;
    var p;
    try { p = JSON.parse(unb64(body)); } catch (e) {
      say('warn', 'This link cannot be read',
          'It was cut short or edited. Price the order from the menu by hand.');
      return;
    }
    if (!p || !p.o || !p.o.length) {
      say('warn', 'This link carries no order',
          'Price the order from the menu by hand.');
      return;
    }
    render(p, intact);
  }

  read();
  addEventListener('hashchange', read);
})();
