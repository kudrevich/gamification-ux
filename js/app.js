/* ==========================================================================
   Общий слой приложения: состояние, навигация, диалоги, форматирование.
   Состояние живёт в localStorage — баланс, квест, признание и покупки
   переносятся между экранами, как в реальном продукте.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'gamif.state.v1';

  var DEFAULTS = {
    name: 'Иван Кудревич',
    initials: 'ИК',
    level: 7,
    levelTitle: 'Охотник',
    xp: 2840,
    xpNext: 3500,
    balanceActive: 1240,
    balanceFrozen: 500,
    streak: 12,
    streakRecord: 21,
    league: 'Серебро',
    rank: 3,
    quest: { id: 'close-nice', title: 'Дожать красиво', accepted: true, progress: 2, target: 5, frozen: 500 },
    kudosToday: 0,
    kudosTo: [],
    purchases: [],
    goal: 60000,
    bonuses: { interview: true, gk: true, crm: false, air: false }
  };

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      var saved = JSON.parse(raw);
      return Object.assign(clone(DEFAULTS), saved);
    } catch (e) {
      return clone(DEFAULTS);
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function reset() {
    state = clone(DEFAULTS);
    save();
  }

  /* --- Форматирование ---------------------------------------------------- */
  function num(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function money(n) { return num(n) + ' ₽'; }

  /* --- Нижняя навигация --------------------------------------------------- */
  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"/>',
    calls: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h1.7a1 1 0 0 1 .96.73l.8 2.8a1 1 0 0 1-.36 1.06l-1.3.98a12 12 0 0 0 5.13 5.13l.98-1.3a1 1 0 0 1 1.06-.36l2.8.8a1 1 0 0 1 .73.96v1.7a2.5 2.5 0 0 1-2.5 2.5A13.5 13.5 0 0 1 4 6.5Z"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 12h.01M17.5 12h.01"/>',
    rank: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    team: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 20a5.6 5.6 0 0 0-2-4.3"/>'
  };

  var TABS_REP = [
    { id: 'dashboard', href: 'dashboard.html', label: 'Главная', icon: 'home' },
    { id: 'calls', href: 'calls.html', label: 'Звонки', icon: 'calls' },
    { id: 'earnings', href: 'earnings.html', label: 'Заработок', icon: 'money' },
    { id: 'leaderboard', href: 'leaderboard.html', label: 'Рейтинг', icon: 'rank' }
  ];

  var TABS_LEAD = TABS_REP.concat([
    { id: 'team', href: 'team.html', label: 'Команда', icon: 'team' }
  ]);

  function buildTabbar() {
    var nav = document.querySelector('[data-tabbar]');
    if (!nav) return;
    var current = nav.getAttribute('data-tabbar');
    var role = nav.getAttribute('data-role') === 'lead' ? TABS_LEAD : TABS_REP;
    nav.innerHTML = role.map(function (t) {
      var on = t.id === current;
      return '<a class="tab" href="' + t.href + '"' + (on ? ' aria-current="page"' : '') +
        ' data-od-id="tab-' + t.id + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[t.icon] + '</svg>' +
        '<span>' + t.label + '</span></a>';
    }).join('');
  }

  /* --- Диалоги ------------------------------------------------------------ */
  function openSheet(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var focusable = el.querySelector('input, textarea, select, button');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }
  function closeSheet(id) {
    var el = id ? document.getElementById(id) : document.querySelector('.sheet.is-open');
    if (!el) return;
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function bindSheets() {
    document.addEventListener('click', function (e) {
      var open = e.target.closest('[data-sheet-open]');
      if (open) { e.preventDefault(); openSheet(open.getAttribute('data-sheet-open')); return; }
      var close = e.target.closest('[data-sheet-close]');
      if (close) { e.preventDefault(); closeSheet(close.getAttribute('data-sheet-close') || null); return; }
      if (e.target.classList && e.target.classList.contains('scrim')) closeSheet();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });
  }

  /* --- Тост --------------------------------------------------------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  /* --- Сегментированные переключатели ------------------------------------- */
  function bindSegments() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        seg.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        seg.dispatchEvent(new CustomEvent('segchange', {
          bubbles: true, detail: { value: btn.getAttribute('data-value') }
        }));
      });
    });
  }

  /* --- Шапка: аватар и инициалы ------------------------------------------- */
  function hydrateChrome() {
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var path = el.getAttribute('data-bind');
      var val = path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, state);
      if (val == null) return;
      var fmt = el.getAttribute('data-format');
      if (fmt === 'money') val = money(val);
      else if (fmt === 'num') val = num(val);
      el.textContent = val;
    });
  }

  function init() {
    buildTabbar();
    bindSheets();
    bindSegments();
    hydrateChrome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.App = {
    state: state,
    save: save,
    reset: reset,
    num: num,
    money: money,
    toast: toast,
    openSheet: openSheet,
    closeSheet: closeSheet,
    hydrate: hydrateChrome
  };
})();
