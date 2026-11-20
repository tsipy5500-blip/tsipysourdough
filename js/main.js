/* תפריט לנייד + בקרת גודל טקסט. אין כאן שום תלות חיצונית ואין איסוף נתונים. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- תפריט בנייד ---------- */
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- גודל טקסט ---------- */
  var KEY = 'tzipi-text-size';
  var sizes = { normal: '', large: 'text-large', xlarge: 'text-xlarge' };
  var buttons = document.querySelectorAll('[data-text-size]');

  function apply(size) {
    root.classList.remove('text-large', 'text-xlarge');
    if (sizes[size]) { root.classList.add(sizes[size]); }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-text-size') === size ? 'true' : 'false');
    }
    try { localStorage.setItem(KEY, size); } catch (e) { /* אין אחסון זמין, זה בסדר */ }
  }

  var saved = 'normal';
  try { saved = localStorage.getItem(KEY) || 'normal'; } catch (e) { /* ממשיכים בלי אחסון */ }
  if (!sizes.hasOwnProperty(saved)) { saved = 'normal'; }
  apply(saved);

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (ev) {
      apply(ev.currentTarget.getAttribute('data-text-size'));
    });
  }
})();

/* ---------- קרוסלות: כפתורים וחיצים. בלי תנועה אוטומטית ---------- */
(function () {
  'use strict';
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.car-track');
    if (!track) { return; }
    function step() { var f = track.querySelector('li'); return f ? f.getBoundingClientRect().width + 16 : 300; }
    c.querySelectorAll('.car-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        /* בעברית (RTL) גלילה "קדימה" היא שמאלה; בשפות משמאל לימין היא ימינה */
        var dir = parseInt(b.getAttribute('data-dir'), 10);
        var rtl = window.getComputedStyle(track).direction === 'rtl';
        track.scrollBy({ left: (rtl ? -dir : dir) * step(), behavior: 'smooth' });
      });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -step(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step(), behavior: 'smooth' }); e.preventDefault(); }
    });
  });
})();

/* ---------- התאמות נגישות: כפתור פתיחה, והגדרות שנשמרות בדפדפן בלבד ---------- */
(function () {
  'use strict';
  var root = document.documentElement;
  var open = document.getElementById('a11y-open');
  var panel = document.getElementById('a11y-panel');
  if (!open || !panel) { return; }
  var KEY = 'tzipi-a11y';
  var flags = { contrast: 'a11y-contrast', links: 'a11y-links', font: 'a11y-font', motion: 'a11y-nomotion' };
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }

  function render() {
    Object.keys(flags).forEach(function (k) {
      var on = !!state[k];
      root.classList.toggle(flags[k], on);
      var b = panel.querySelector('[data-a11y="' + k + '"]');
      if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* בלי אחסון זה בסדר */ }
  }
  open.addEventListener('click', function () {
    var show = panel.hasAttribute('hidden');
    if (show) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
    open.setAttribute('aria-expanded', show ? 'true' : 'false');
  });
  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { panel.setAttribute('hidden', ''); open.setAttribute('aria-expanded', 'false'); open.focus(); }
  });
  panel.querySelectorAll('[data-a11y]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-a11y');
      if (k === 'reset') {
        state = {};
        var normal = document.querySelector('[data-text-size="normal"]');
        if (normal) { normal.click(); }
      } else { state[k] = !state[k]; }
      render();
    });
  });
  render();
})();

/* ---------- פופ אפ: מופיע פעם אחת בכל ביקור, נגיש ממקלדת וקורא מסך ---------- */
(function () {
  var pop = document.getElementById('site-popup');
  if (!pop) return;
  var KEY = 'tzipi-popup-seen';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { /* בלי אחסון, יוצג שוב בטעינה הבאה */ }
  var opener = null;
  var focusables = function () { return pop.querySelectorAll('a[href], button:not([disabled])'); };
  function close() {
    pop.hidden = true;
    document.body.classList.remove('popup-open');
    document.removeEventListener('keydown', onKey);
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* בסדר */ }
    if (opener && opener.focus) opener.focus();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open() {
    opener = document.activeElement;
    pop.hidden = false;
    document.body.classList.add('popup-open');
    document.addEventListener('keydown', onKey);
    var f = focusables(); if (f.length) f[0].focus();
  }
  pop.addEventListener('click', function (e) { if (e.target === pop || e.target.closest('[data-popup-close]')) close(); });
  setTimeout(open, 4000);
})();
