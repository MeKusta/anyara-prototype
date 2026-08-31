/* Anyara prototype — shared state & chrome.
   Demo only: everything lives in localStorage, nothing is sent anywhere.

   Three states drive the whole site:
   - anon    (no account)     → hasn't done onboarding, sees the marketing shell
   - free    (has account)    → personalised welcome class + 2 weekly free
                                 classes are unlocked, the rest is Membresía
   - member  (trial or paid)  → everything unlocked, no locks anywhere */
(function () {
  var VERSION = '1.01.05';
  var K = {
    member:   'anyara_member',
    plan:     'anyara_plan',
    account:  'anyara_account',
    streak:   'anyara_streak',
    name:     'anyara_name',
    paused:   'anyara_paused',
    reason:   'anyara_reason',
    welcome:  'anyara_welcome',
    wplan:    'anyara_welcome_plan',
    day:      'anyara_day'
  };
  /* the two catalog classes marked "Gratis" — always playable once you
     have a free account, no trial required */
  var FREE_SLUGS = ['barre-esencial', 'pilatesmat-fundamental'];
  /* demo-only "time machine" — simulates which day of the trial week it
     is, so the day-by-day class unlock can be shown without waiting a
     real week. 1 = Lunes ... 7 = Domingo */
  var DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  var DAY_NAMES   = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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
    isMember: function () { return get(K.member) === '1'; },
    hasAccount: function () { return A.isMember() || get(K.account) === '1'; },

    /* onboarding creates the free account — no trial, no card */
    createAccount: function (name) {
      set(K.account, '1');
      if (name) set(K.name, name);
    },
    join: function (plan) {
      set(K.member, '1'); set(K.account, '1'); set(K.plan, plan || 'mensual'); del(K.paused);
    },
    cancel: function () { del(K.member); del(K.paused); },
    pause:  function () { set(K.paused, '1'); },
    isPaused: function () { return get(K.paused) === '1'; },
    plan: function () { return get(K.plan) || 'mensual'; },

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

    isFreeSlug: function (slug) { return FREE_SLUGS.indexOf(slug) > -1; },
    /* can this class be watched right now? */
    canWatch: function (slug) { return A.isMember() || (slug && A.isFreeSlug(slug)); },

    streak: function () { return parseInt(get(K.streak) || '0', 10); },
    bumpStreak: function () { set(K.streak, String(A.streak() + 1)); },

    /* demo time machine: 1=Lunes ... 7=Domingo, defaults to Lunes */
    DAY_LETTERS: DAY_LETTERS,
    DAY_NAMES: DAY_NAMES,
    currentDay: function () { return parseInt(get(K.day) || '1', 10); },
    setDay: function (n) { set(K.day, String(Math.max(1, Math.min(7, n)))); },

    /* Pre-roll: people in "visita" (no trial) see an Anyara trailer before
       the class starts. Members watch straight through. The trailer is a
       placeholder card standing in for the real video, skippable at any time.
       Calls onDone() once — when skipped or when the pre-roll runs out. */
    playTrailer: function (screenEl, onDone) {
      if (A.isMember() || !screenEl) { onDone(); return; }

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
    var state = A.isMember() ? 'member' : (A.hasAccount() ? 'free' : 'anon');
    document.body.classList.add('is-' + state);
    /* legacy pair, kept so guest-only/member-only keeps working everywhere */
    document.body.classList.add(state === 'member' ? 'is-member' : 'is-guest');
    renderNav();
    renderVersion();
    renderDayPicker();
  });

  /* prototype-only "time machine": floating L M M J V S D picker, bottom
     right, on every page. Lets us demo the day-by-day trial unlock
     without waiting a real week — click a day and the site jumps there. */
  function renderDayPicker() {
    if (document.getElementById('dayPicker')) return;
    var box = document.createElement('div');
    box.id = 'dayPicker';
    box.className = 'day-picker';
    box.title = 'Prototipo: simula el día para probar el desbloqueo diario';
    box.innerHTML = '<span class="dp-lab">Día</span>';
    var today = A.currentDay();
    DAY_LETTERS.forEach(function (letter, idx) {
      var n = idx + 1;
      var btn = document.createElement('button');
      btn.textContent = letter;
      btn.title = DAY_NAMES[idx];
      if (n === today) btn.classList.add('on');
      btn.addEventListener('click', function () {
        A.setDay(n);
        location.reload();
      });
      box.appendChild(btn);
    });
    document.body.appendChild(box);
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

  /* anon visitors get a CTA into onboarding; free + member get their avatar */
  function renderNav() {
    var right = document.querySelector('.nav-right');
    if (!right) return;
    var avatar = right.querySelector('.avatar');
    if (!avatar) return;

    if (A.hasAccount()) {
      avatar.textContent = A.initials();
      if (!A.isMember()) {
        var trial = document.createElement('a');
        trial.href = 'membresia.html';
        trial.className = 'btn btn-gold btn-join';
        trial.textContent = 'Prueba gratis';
        avatar.insertAdjacentElement('beforebegin', trial);
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
