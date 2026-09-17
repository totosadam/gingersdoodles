/* Gallery lightbox — vanilla replacement for the component version. */
(function () {
  var photos = [];
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  function collect() {
    photos = [].slice.call(grid.querySelectorAll('button')).map(function (b) {
      var im = b.querySelector('img');
      return { src: im ? im.getAttribute('src') : '', cap: im ? (im.getAttribute('alt') || '') : '' };
    });
  }
  collect();
  window.__galleryReady = function () { collect(); };

  var open = null, sx = null, sy = null;

  var ov = document.createElement('div');
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(24,20,16,.92);display:none;align-items:center;justify-content:center;padding:24px';
  ov.innerHTML =
    '<button type="button" data-close style="position:absolute;top:18px;right:18px;width:46px;height:46px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:22px;line-height:1;cursor:pointer" aria-label="Close">\u00d7</button>' +
    '<button type="button" data-prev style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:24px;line-height:1;cursor:pointer" aria-label="Previous">\u2039</button>' +
    '<button type="button" data-next style="position:absolute;right:14px;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:24px;line-height:1;cursor:pointer" aria-label="Next">\u203a</button>' +
    '<figure style="margin:0;max-width:min(1100px,92vw);display:flex;flex-direction:column;align-items:center;gap:14px">' +
      '<img data-img alt="" style="max-width:100%;max-height:78vh;border-radius:14px;display:block;background:#efe4d3">' +
      '<figcaption style="text-align:center;color:#f3ece1;font-size:16px;max-width:620px"><span data-cap></span>' +
        '<span data-count style="display:block;margin-top:6px;font-size:13px;letter-spacing:.14em;color:#c9bca9"></span>' +
      '</figcaption>' +
    '</figure>';
  document.body.appendChild(ov);

  var elImg = ov.querySelector('[data-img]');
  var elCap = ov.querySelector('[data-cap]');
  var elCount = ov.querySelector('[data-count]');

  function show(i) {
    if (!photos.length) return;
    open = (i + photos.length) % photos.length;
    var p = photos[open];
    elImg.setAttribute('src', p.src);
    elImg.setAttribute('alt', p.cap || '');
    elCap.textContent = p.cap || '';
    elCount.textContent = (open + 1) + ' / ' + photos.length;
    ov.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function close() {
    open = null;
    ov.style.display = 'none';
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || !grid.contains(b)) return;
    collect();
    show([].slice.call(grid.querySelectorAll('button')).indexOf(b));
  });

  ov.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-prev]')) return show(open - 1);
    if (e.target.closest('[data-next]')) return show(open + 1);
    if (!e.target.closest('figure')) close();
  });

  window.addEventListener('keydown', function (e) {
    if (open === null) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(open + 1);
    if (e.key === 'ArrowLeft') show(open - 1);
  });

  ov.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  ov.addEventListener('touchend', function (e) {
    if (sx == null || open === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    show(open + (dx < 0 ? 1 : -1));
  });
})();
