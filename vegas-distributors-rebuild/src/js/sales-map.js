/* The sales network map.
 *
 * Progressive enhancement: the page already carries every representative as a
 * complete card, and the stylesheet shows them all until this file marks the
 * section ready. A visitor whose script never arrives keeps the full list of
 * nine, grouped by region, with every telephone number and address intact.
 *
 * Nothing here holds a copy of anyone's details. The panels are read out of
 * the markup the site generated, so the map and the page can never disagree
 * about who covers where.
 */
(function () {
  'use strict';

  // Every map on the page, not just the first: the whole site also builds into
  // one file, where the English and the Spanish page share a document.
  Array.prototype.forEach.call(document.querySelectorAll('[data-sales-map]'), setup);

  function setup(root) {
    var svg = root.querySelector('svg');
    var list = root.querySelector('[data-sales-map-reps]');
    var hint = root.querySelector('[data-sales-map-hint]');
    var overflow = root.closest('.shell').querySelector('[data-sales-map-list]');
    if (!svg || !list) return;

    var panels = Array.prototype.slice.call(list.querySelectorAll('[data-rep]'));
    if (panels.length < 2) return;

    var byRep = {};
    panels.forEach(function (panel) { byRep[panel.getAttribute('data-rep')] = panel; });

    var districts = Array.prototype.slice.call(svg.querySelectorAll('[data-district]'));
    var pins = Array.prototype.slice.call(svg.querySelectorAll('[data-rep]'));
    var current = panels[0].getAttribute('data-rep');

    /* The row of names under the panel, shown only where a district holds more
       than one representative. It is built here rather than in the markup
       because without a script there is nothing for it to switch between. */
    var choices = document.createElement('div');
    choices.className = 'sales-map__choices';
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', root.getAttribute('data-choices-label') || '');
    list.parentNode.insertBefore(choices, list.nextSibling);

    /* The one representative who is not tied to a district. */
    var national = null;
    var nationalPanel = null;
    panels.forEach(function (panel) {
      if (panel.getAttribute('data-district') === 'national') nationalPanel = panel;
    });
    if (nationalPanel) {
      national = document.createElement('button');
      national.type = 'button';
      national.className = 'sales-map__national';
      national.textContent = root.getAttribute('data-national-label') || '';
      national.setAttribute('aria-pressed', 'false');
      national.addEventListener('click', function () {
        group = null;
        show(nationalPanel.getAttribute('data-rep'));
      });
      list.parentNode.insertBefore(national, list);
    }

    /* Which representatives a district offers is the artwork's to say, not the
       panel's. A representative can cover a district their pin does not stand
       in: the northern territory reaches across Orange Walk, so that district
       offers both of them while the pin stays in Corozal. */
    function repsIn(district) {
      var shape = districts.filter(function (d) { return d.getAttribute('data-district') === district; })[0];
      var declared = shape && shape.getAttribute('data-reps');
      var ids = declared ? declared.split(/\s+/) : [];
      ids = ids.filter(function (id) { return byRep[id]; });
      if (ids.length) return ids;
      return panels
        .filter(function (panel) { return panel.getAttribute('data-district') === district; })
        .map(function (panel) { return panel.getAttribute('data-rep'); });
    }

    /* The district whose row of names is showing. A pin sets it from the ground
       it stands on, so stepping onto a pin keeps its neighbours reachable. */
    var group = null;

    function paintChoices(rep) {
      var siblings = repsIn(group || byRep[rep].getAttribute('data-district'));
      if (siblings.indexOf(rep) === -1) siblings = [rep];
      // A lone representative needs no row of names to choose between.
      if (siblings.length < 2) {
        choices.replaceChildren();
        choices.hidden = true;
        return;
      }
      choices.hidden = false;
      choices.replaceChildren();
      siblings.forEach(function (id) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'sales-map__choice';
        // The name as the page already spells it, never a second copy of it.
        button.textContent = byRep[id].querySelector('.sales-map-rep__name').textContent;
        button.setAttribute('aria-pressed', id === rep ? 'true' : 'false');
        button.addEventListener('click', function () { show(id); });
        choices.appendChild(button);
      });
    }

    function paintMap(rep) {
      // The district lit is the one that was pressed, not the one the
      // representative's own pin stands in: the northern territory reaches into
      // Orange Walk, and pressing Orange Walk should light Orange Walk.
      var district = group || byRep[rep].getAttribute('data-district');
      var wide = byRep[rep].getAttribute('data-district') === 'national';
      pins.forEach(function (pin) {
        pin.classList.toggle('is-active', pin.getAttribute('data-rep') === rep);
      });
      districts.forEach(function (shape) {
        var active = !wide && shape.getAttribute('data-district') === district;
        shape.classList.toggle('is-active', active);
        shape.classList.toggle('is-muted', !wide && !active);
      });
      if (national) national.setAttribute('aria-pressed', String(wide));
    }

    function show(rep) {
      if (!byRep[rep]) return;
      current = rep;
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-rep') !== rep;
      });
      paintChoices(rep);
      paintMap(rep);
    }

    function pick(element) {
      if (element.hasAttribute('data-rep')) {
        group = element.getAttribute('data-district-pin') || null;
        return show(element.getAttribute('data-rep'));
      }
      var district = element.getAttribute('data-district');
      var members = repsIn(district);
      if (!members.length) return;
      group = district;
      // A district already showing one of its own keeps them, so pressing it a
      // second time never jumps to somebody else.
      show(members.indexOf(current) === -1 ? members[0] : current);
    }

    districts.concat(pins).forEach(function (element) {
      // Now that pressing it does something, it says so and joins the tab order.
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.addEventListener('click', function () { pick(element); });
      element.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          pick(element);
        }
      });
    });

    svg.classList.add('is-enhanced');
    /* A picture is read as one thing and its insides are not announced, which
       would bury fourteen controls. Now that they are controls, the map becomes
       a group and they can each be reached and named. */
    svg.setAttribute('role', 'group');
    root.setAttribute('data-ready', '');
    if (hint) hint.hidden = false;
    // The full regional list stays for anyone without the map, and is redundant
    // once the map is doing the work.
    if (overflow) overflow.hidden = true;
    show(current);
  }
}());
