/* Ginger's Doodles — content loader.
   Reads /content.json and rebuilds the editable list sections in place by cloning
   the markup already on the page, so the HTML stays the SEO-visible default and
   an edit in /admin simply replaces it. */
(function () {
  var STATUS = {
    'Waitlist open':   '#3f7a4a',
    'Puppies here':    '#8a5a34',
    'Planned':         '#8a6524',
    'Reserved':        '#6b5b47',
    'All placed':      '#6b5b47'
  };

  function txt(el, sel, value) {
    if (value == null) return;
    var t = sel ? el.querySelector(sel) : el;
    if (t) t.textContent = value;
  }
  function img(el, node, src, alt) {
    if (!node) return;
    if (src) node.setAttribute('src', src);
    if (alt) node.setAttribute('alt', alt);
  }
  function bg(node, color) {
    if (!node || !color) return;
    node.style.background = color;
  }

  /* ---- litters: cards keep their own markup; prototype 0 is a two-photo split,
          prototype 1 a single photo ---- */
  function renderLitters(grid, items) {
    var kids = [].slice.call(grid.children);
    var split = null, single = null;
    kids.forEach(function (k) {
      var n = k.querySelectorAll('img').length;
      if (n > 1 && !split) split = k;
      if (n === 1 && !single) single = k;
    });
    if (!split && !single) return;

    var built = items.map(function (it) {
      var photos = (it.photos || []).filter(function (p) { return p && p.image; });
      var proto = photos.length > 1 ? (split || single) : (single || split);
      var card = proto.cloneNode(true);

      txt(card, 'h3', it.title);
      var h3 = card.querySelector('h3');
      if (h3 && h3.nextElementSibling) h3.nextElementSibling.textContent = it.tag || '';
      txt(card, 'p', it.body);

      var imgs = card.querySelectorAll('img');
      var caps = [].slice.call(card.querySelectorAll('span')).filter(function (s) {
        return /\.14em/.test(s.getAttribute('style') || '');
      });
      photos.slice(0, imgs.length).forEach(function (p, i) {
        img(card, imgs[i], p.image, p.label ? p.label + ' — Ginger\u2019s Doodles' : '');
        if (imgs[i] && p.focus) imgs[i].style.objectPosition = 'center ' + p.focus;
        if (caps[i]) caps[i].textContent = p.label || '';
      });
      if (photos.length === 1 && caps[0]) caps[0].style.display = 'none';

      var badge = [].slice.call(card.querySelectorAll('span')).filter(function (s) {
        var st = s.getAttribute('style') || '';
        return /border-radius:999px/.test(st) && /position:absolute/.test(st);
      })[0];
      if (badge) {
        if (it.status) {
          badge.textContent = it.status.toUpperCase();
          bg(badge, STATUS[it.status] || '#6b5b47');
          badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }
      return card;
    });

    grid.innerHTML = '';
    built.forEach(function (c) { grid.appendChild(c); });
  }

  /* ---- puppy tails: one grid per litter group ---- */
  function renderTails(root, groups) {
    var grids = [].slice.call(root.querySelectorAll('[data-cms-list="tails"]'));
    if (!grids.length) return;
    var proto = grids[0].querySelector('div');
    if (!proto) return;
    proto = proto.cloneNode(true);

    grids.forEach(function (grid, gi) {
      var group = groups[gi];
      if (!group) { grid.innerHTML = ''; return; }
      var head = grid.closest('section') && grid.closest('section').querySelector('h2');
      if (head && group.litter) head.textContent = group.litter;

      grid.innerHTML = '';
      (group.entries || []).forEach(function (e) {
        var card = proto.cloneNode(true);
        txt(card, 'h3', e.name);
        img(card, card.querySelector('img'), e.photo, e.name || '');
        txt(card, 'p', e.story);
        grid.appendChild(card);
      });
    });
  }

  /* ---- gallery ---- */
  function renderGallery(grid, photos) {
    var proto = grid.querySelector('button');
    if (!proto) return;
    proto = proto.cloneNode(true);
    grid.innerHTML = '';
    photos.forEach(function (p, i) {
      var b = proto.cloneNode(true);
      var im = b.querySelector('img');
      img(b, im, p.image, p.caption || 'Ginger\u2019s Doodles photograph');
      b.setAttribute('data-i', i);
      grid.appendChild(b);
    });
    if (window.__galleryReady) window.__galleryReady(photos);
  }

  function apply(c) {
    document.querySelectorAll('[data-cms-list="litters"]').forEach(function (g) {
      if (c.litters && c.litters.length) renderLitters(g, c.litters);
    });
    if (c.tailGroups && c.tailGroups.length) renderTails(document, c.tailGroups);
    document.querySelectorAll('[data-cms-list="gallery"]').forEach(function (g) {
      if (c.gallery && c.gallery.length) renderGallery(g, c.gallery);
    });
  }

  function go() {
    fetch('/content.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) { if (c) { try { apply(c); } catch (e) { console.warn('content.json render skipped:', e); } } })
      .catch(function () { /* page keeps its built-in content */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
