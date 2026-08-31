/* Anyara prototype — shared state & chrome.
   Demo only: everything lives in localStorage, nothing is sent anywhere.

   Three levels drive the whole site:
   - 1 · visita  → the two always-free classes, plus the personalised class
                    the onboarding ends in. Everything else is membresía.
   - 2 · prueba  → "Tres días de bienvenida": Mariana's intro plus a curated
                    día 1 / 2 / 3 plan that opens one day at a time. Still not
                    the whole catalog — that is what skipping the trial buys.
   - 3 · pagada  → full access, no locks anywhere. */
(function () {
  var VERSION = '1.02.00';
  var K = {
    member:   'anyara_member',   // level 3 · paid
    trial:    'anyara_trial',    // level 2 · 3-day welcome
    plan:     'anyara_plan',
    account:  'anyara_account',
    streak:   'anyara_streak',
    name:     'anyara_name',
    paused:   'anyara_paused',
    reason:   'anyara_reason',
    welcome:  'anyara_welcome',
    wplan:    'anyara_welcome_plan',
    day:      'anyara_day',
    charged:  'anyara_charged'   // one-shot: show the "day 3 charge" notice once
  };
  /* the two catalog classes marked "Gratis" — playable at every level */
  var FREE_CLASSES = [
    { slug:'barre-esencial',         t:'Barre Esencial',           i:'Valeria Méndez', d:'barre',      m:20 },
    { slug:'pilatesmat-fundamental', t:'Pilates Mat Fundamental',  i:'Sofía Ruiz',     d:'pilatesmat', m:40 }
  ];
  var FREE_SLUGS = FREE_CLASSES.map(function (c) { return c.slug; });
  /* demo-only "time machine": which day of the 3-day trial we are on, so the
     day-by-day unlock can be shown without waiting three real days. */
  var TRIAL_DAYS = 3;

  /* used when someone lands on the site without having run the onboarding */
  var DEFAULT_WPLAN = [
    { disc:'sculpt',  title:'Sculpt : Glúteos',      instr:'Valeria Méndez', mins:20, why:'Tu clase de bienvenida' },
    { disc:'barre',   title:'Barre : Piernas largas', instr:'Valeria Méndez', mins:25, why:'El siguiente paso de tu práctica' },
    { disc:'somara',  title:'Somara : Cierre suave',  instr:'Renata Solís',   mins:15, why:'Para cerrar tu primera semana' }
  ];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var A = {
    TRIAL_DAYS: TRIAL_DAYS,

    /* 1 = visita · 2 = prueba de 3 días · 3 = membresía pagada */
    level: function () {
      if (get(K.member) === '1') return 3;
      if (get(K.trial) === '1')  return 2;
      return 1;
    },
    isPaid:  function () { return A.level() === 3; },
    isTrial: function () { return A.level() === 2; },
    /* full catalog access — only the paid level. The trial deliberately
       stops short of this; opening everything is what skipping it buys. */
    isMember: function () { return A.level() === 3; },
    /* has an active plan of some kind (trial or paid) */
    hasPlan: function () { return A.level() >= 2; },
    hasAccount: function () { return A.hasPlan() || get(K.account) === '1'; },

    /* onboarding creates the free account — no trial, no card */
    createAccount: function (name) {
      set(K.account, '1');
      if (name) set(K.name, name);
    },
    startTrial: function () {
      set(K.trial, '1'); set(K.account, '1'); set(K.day, '1'); del(K.paused);
    },
    join: function (plan) {
      set(K.member, '1'); set(K.account, '1'); set(K.plan, plan || 'mensual');
      del(K.trial); del(K.paused);
    },
    cancel: function () { del(K.member); del(K.trial); del(K.paused); },
    pause:  function () { set(K.paused, '1'); },
    isPaused: function () { return get(K.paused) === '1'; },
    plan: function () { return get(K.plan) || 'mensual'; },
    setPlan: function (p) { if (p) set(K.plan, p); },

    name: function () { return get(K.name) || 'Paulo'; },
    setName: function (n) { if (n) set(K.name, n); },

    /* why the welcome class was picked — echoed back as proof of personalisation */
    reason: function () { return get(K.reason) || 'Por tus preferencias de movimiento'; },
    setReason: function (r) { if (r) set(K.reason, r); },
    initials: function () {
      return A.name().trim().split(/\s+/).slice(0, 2)
              .map(function (w) { return w.charAt(0); }).join('').toUpperCase() || 'PK';
    },

    /* the personalised class picked at the end of onboarding */
    setWelcomeClass: function (obj) { try { set(K.welcome, JSON.stringify(obj)); } catch (e) {} },
    welcomeClass: function () {
      try { return JSON.parse(get(K.welcome)) || null; } catch (e) { return null; }
    },

    /* "Tu bienvenida a Anyara" — the 3-day personalised arc built at the end
       of onboarding. Day 1 is open to everyone with an account (visita);
       days 2 and 3 need the trial. Falls back to a sensible default so the
       section still renders if onboarding was skipped. */
    setWelcomePlan: function (arr) { try { set(K.wplan, JSON.stringify(arr)); } catch (e) {} },
    welcomePlan: function () {
      try {
        var p = JSON.parse(get(K.wplan));
        if (p && p.length === 3) return p;
      } catch (e) {}
      return DEFAULT_WPLAN;
    },

    FREE_CLASSES: FREE_CLASSES,
    isFreeSlug: function (slug) { return FREE_SLUGS.indexOf(slug) > -1; },

    /* builds a clase.html link; pass free:1 or t3:N to carry the access flag */
    classHref: function (c) {
      var q = ['t=' + encodeURIComponent(c.t), 'i=' + encodeURIComponent(c.i),
               'd=' + c.d, 'm=' + c.m];
      if (c.free) q.push('free=1');
      if (c.t3)   q.push('t3=' + c.t3);
      return 'clase.html?' + q.join('&');
    },

    /* Can this class be watched right now?
       free  → one of the two always-free classes, or the onboarding class
       t3    → belongs to día N of the 3-day welcome (trial only, once día N
               has arrived); paid access opens it regardless */
    canWatch: function (opts) {
      opts = opts || {};
      if (A.isPaid()) return true;
      if (opts.free) return true;
      if (opts.t3 && A.isTrial()) return A.currentDay() >= opts.t3;
      return false;
    },

    streak: function () { return parseInt(get(K.streak) || '0', 10); },
    bumpStreak: function () { set(K.streak, String(A.streak() + 1)); },

    /* demo time machine: día 1..3 of the trial, defaults to día 1 */
    currentDay: function () { return parseInt(get(K.day) || '1', 10); },
    setDay: function (n) { set(K.day, String(Math.max(1, Math.min(TRIAL_DAYS, n)))); },

    /* Pre-roll: people in "visita" (no trial) see an Anyara trailer before
       the class starts. Members watch straight through. The trailer is a
       placeholder card standing in for the real video, skippable at any time.
       Calls onDone() once — when skipped or when the pre-roll runs out. */
    playTrailer: function (screenEl, onDone) {
      if (A.level() > 1 || !screenEl) { onDone(); return; }

      var LENGTH = 12;                    // seconds of "ad" before it self-ends
      var left = LENGTH, timer = null, finished = false;

      var el = document.createElement('div');
      el.className = 'trailer';
      el.innerHTML =
        '<div class="tr-tag">Anuncio</div>' +
        '<div class="tr-body">' +
          '<div class="tr-logo"><b>A</b>nyara</div>' +
          '<div class="tr-title">Trailer de Anyara</div>' +
          '<p class="tr-sub">Clases de Sculpt, Barre, Pilates, Somara y más — ' +
            'elegidas para ti, a tu ritmo. Esto es lo que incluye tu membresía.</p>' +
        '</div>' +
        '<div class="tr-foot">' +
          '<span class="tr-count">El video empieza en <b>' + LENGTH + '</b>s</span>' +
          '<button class="tr-skip" type="button">Saltar anuncio ›</button>' +
        '</div>' +
        '<div class="tr-bar"><i></i></div>';
      screenEl.appendChild(el);

      var fill = el.querySelector('.tr-bar > i');
      /* next frame, so the transition actually animates from 0 */
      requestAnimationFrame(function () {
        fill.style.transition = 'width ' + LENGTH + 's linear';
        fill.style.width = '100%';
      });

      timer = setInterval(function () {
        left--;
        if (left <= 0) { done(); return; }
        el.querySelector('.tr-count b').textContent = left;
      }, 1000);

      el.querySelector('.tr-skip').addEventListener('click', function (e) {
        e.stopPropagation();
        done();
      });

      function done() {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        el.remove();
        onDone();
      }
    },

    reset: function () { Object.keys(K).forEach(function (k) { del(K[k]); }); }
  };
  window.Anyara = A;

  /* ---------- chrome ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var lvl = A.level();
    document.body.classList.add('is-l' + lvl);
    if (A.hasAccount()) document.body.classList.add('has-account');
    /* legacy pair: member-only means full access (level 3), guest-only means
       anything short of it, which is what the locks on premium pages want */
    document.body.classList.add(lvl === 3 ? 'is-member' : 'is-guest');
    renderNav();
    renderVersion();
    renderDayPicker();
    renderChargeNotice();
  });

  /* se muestra una sola vez, justo después de que el día 3 activa la membresía */
  function renderChargeNotice() {
    if (get(K.charged) !== '1') return;
    del(K.charged);

    var PLAN_NAMES = { mensual: 'Mensual', anual: 'Anual' };
    var el = document.createElement('div');
    el.className = 'charge-note';
    el.innerHTML =
      '<div class="cn-in">' +
        '<span class="cn-tag">Día 3</span>' +
        '<span class="cn-msg">Tu membresía <b>' + (PLAN_NAMES[A.plan()] || 'Mensual') +
          '</b> se activó. Ya tienes todo Anyara abierto.</span>' +
        '<button class="cn-x" aria-label="Cerrar">✕</button>' +
      '</div>';
    document.body.insertBefore(el, document.body.firstChild);
    el.querySelector('.cn-x').addEventListener('click', function () { el.remove(); });
  }

  /* prototype-only "time machine": floating día 1 / 2 / 3 picker, bottom
     right, on every page. Lets us demo the day-by-day unlock of the welcome
     without waiting three real days — click a day and the site jumps there. */
  function renderDayPicker() {
    if (document.getElementById('dayPicker')) return;
    var box = document.createElement('div');
    box.id = 'dayPicker';
    box.className = 'day-picker';
    box.title = 'Prototipo: simula el día de la prueba para ver el desbloqueo diario';
    box.innerHTML = '<span class="dp-lab">Día de prueba</span>';
    var today = A.currentDay();
    for (var n = 1; n <= TRIAL_DAYS; n++) {
      box.appendChild(dayBtn(n, today));
    }
    document.body.appendChild(box);

    function dayBtn(n, today) {
      var btn = document.createElement('button');
      btn.textContent = n;
      btn.title = 'Día ' + n + ' de la prueba';
      if (n === today) btn.classList.add('on');
      btn.addEventListener('click', function () {
        A.setDay(n);
        /* llegar al último día es el día del cobro: la prueba se convierte
           en membresía y el aviso lo explica al recargar */
        if (n === TRIAL_DAYS && A.isTrial()) {
          A.join(A.plan());
          set(K.charged, '1');
        }
        location.reload();
      });
      return btn;
    }
  }

  /* small grey version tag next to the wordmark, so redeploys are visible at a glance */
  function renderVersion() {
    var logo = document.querySelector('.logo');
    if (!logo || logo.querySelector('.version-badge')) return;
    var v = document.createElement('span');
    v.className = 'version-badge';
    v.textContent = 'v' + VERSION;
    logo.appendChild(v);
  }

  /* visitors without an account get a CTA into onboarding; everyone else
     gets their avatar, plus the next step for their level */
  function renderNav() {
    var right = document.querySelector('.nav-right');
    if (!right) return;
    var avatar = right.querySelector('.avatar');
    if (!avatar) return;

    if (A.hasAccount()) {
      avatar.textContent = A.initials();
      var lvl = A.level();
      if (lvl < 3) {
        var cta = document.createElement('a');
        cta.className = 'btn btn-gold btn-join';
        if (lvl === 2) {
          cta.href = 'tres-dias.html';
          cta.textContent = 'Día ' + A.currentDay() + ' de 3';
        } else {
          cta.href = 'membresia.html';
          cta.textContent = 'Tres días gratis';
        }
        avatar.insertAdjacentElement('beforebegin', cta);
      }
      return;
    }
    var start = document.createElement('a');
    start.href = 'onboarding.html';
    start.className = 'btn btn-gold btn-join';
    start.textContent = 'Empezar';
    avatar.replaceWith(start);
  }
})();
