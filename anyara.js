/* Anyara prototype — shared state & chrome.
   Demo only: everything lives in localStorage, nothing is sent anywhere.
   Membership state drives the whole site: guests see locks, a free-class
   allowance and a join CTA; members see their streak, their library and
   no paywalls. */
(function () {
  var K = {
    member: 'anyara_member',
    plan:   'anyara_plan',
    offer:  'anyara_offer_expires',
    free:   'anyara_free_used',
    streak: 'anyara_streak',
    name:   'anyara_name',
    paused: 'anyara_paused',
    warned: 'anyara_lastcall_seen',
    reason: 'anyara_reason'
  };
  var FREE_ALLOWANCE = 3;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var A = {
    FREE_ALLOWANCE: FREE_ALLOWANCE,

    isMember: function () { return get(K.member) === '1'; },
    join: function (plan) { set(K.member, '1'); set(K.plan, plan || 'mensual'); del(K.offer); del(K.paused); },
    cancel: function () { del(K.member); del(K.plan); del(K.paused); },
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

    freeUsed: function () { return parseInt(get(K.free) || '0', 10); },
    freeLeft: function () { return Math.max(0, FREE_ALLOWANCE - A.freeUsed()); },
    useFree:  function () { set(K.free, String(A.freeUsed() + 1)); },

    /* can this class be watched right now? */
    canWatch: function () { return A.isMember() || A.freeLeft() > 0; },

    streak: function () { return parseInt(get(K.streak) || '0', 10); },
    bumpStreak: function () { set(K.streak, String(A.streak() + 1)); },

    offerEnds: function () { var v = get(K.offer); return v ? parseInt(v, 10) : null; },
    startOffer: function (ms) { set(K.offer, String(Date.now() + ms)); },
    clearOffer: function () { del(K.offer); },

    reset: function () { Object.keys(K).forEach(function (k) { del(K[k]); }); }
  };
  window.Anyara = A;

  /* ---------- chrome ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add(A.isMember() ? 'is-member' : 'is-guest');
    renderNav();
    renderBanner();
  });

  /* guests get a join CTA where the avatar would be */
  function renderNav() {
    var right = document.querySelector('.nav-right');
    if (!right) return;
    var avatar = right.querySelector('.avatar');
    if (!avatar) return;

    if (A.isMember()) {
      avatar.textContent = A.initials();
      return;
    }
    var join = document.createElement('a');
    join.href = 'membresia.html';
    join.className = 'btn btn-gold btn-join';
    join.textContent = 'Únete ahora';
    avatar.replaceWith(join);
  }

  var LAST_CALL_AT = 10 * 60;   // seconds left when the urgency pop-up fires
  var WARNED = K.warned;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hms(s) {
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s % 60) : pad(m) + ':' + pad(s % 60);
  }

  /* One countdown drives both the banner and the last-call pop-up, so they
     can never disagree about how much time is left. */
  function renderBanner() {
    var expires = A.offerEnds();
    if (!expires || A.isMember()) return;
    if (Date.now() >= expires) { A.clearOffer(); return; }

    /* demo helper: ?lastcall=1 drops the countdown to 10 minutes so the
       pop-up can be shown without waiting out the full two hours */
    if (new URLSearchParams(location.search).get('lastcall') === '1') {
      A.startOffer(LAST_CALL_AT * 1000);
      del(WARNED);
      expires = A.offerEnds();
    }

    /* don't interrupt someone already on the checkout page */
    var onCheckout = /checkout\.html/i.test(location.pathname);
    var bar = onCheckout ? null : buildBanner();
    var lastCall = null;
    var timer = setInterval(tick, 1000);
    tick();

    function tick() {
      var left = Math.floor((expires - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(timer);
        if (bar) removeBar();
        if (lastCall) lastCall.remove();
        A.clearOffer();
        return;
      }
      if (bar) bar.querySelector('.ob-clock').textContent = hms(left);
      if (lastCall) lastCall.querySelector('.lc-clock').textContent = hms(left);
      if (!onCheckout && !lastCall && left <= LAST_CALL_AT && get(WARNED) !== '1') {
        lastCall = buildLastCall(left);
        set(WARNED, '1');            // fires once, not on every page
      }
    }

    function buildBanner() {
      var el = document.createElement('div');
      el.className = 'offerbar';
      el.innerHTML =
        '<div class="offerbar-inner">' +
          '<span class="ob-tag">Oferta de bienvenida</span>' +
          '<span class="ob-msg"><b>15% de descuento</b> en tu primera membresía — termina en</span>' +
          '<span class="ob-clock">2:00:00</span>' +
          '<a class="ob-go" href="membresia.html">Aprovechar ahora</a>' +
          '<button class="ob-x" aria-label="Cerrar">✕</button>' +
        '</div>';
      document.body.insertBefore(el, document.body.firstChild);
      document.body.classList.add('has-offerbar');
      el.querySelector('.ob-x').addEventListener('click', removeBar);
      return el;
    }
    function removeBar() {
      if (!bar) return;
      bar.remove(); bar = null;
      document.body.classList.remove('has-offerbar');
    }

    function buildLastCall(left) {
      var el = document.createElement('div');
      el.className = 'modal-scrim lastcall open';
      el.innerHTML =
        '<div class="modal">' +
          '<button class="x" aria-label="Cerrar">✕</button>' +
          '<div class="brandline" style="justify-content:center">' +
            '<span class="star">★</span>' +
            '<span class="logo" style="font-size:22px"><b>A</b>nyara</span>' +
          '</div>' +
          '<h3>Últimos 10 minutos</h3>' +
          '<div class="lc-clock">' + hms(left) + '</div>' +
          '<div class="lc-lab">Tiempo restante</div>' +
          '<p class="sub">Tu 15% de bienvenida está por vencer. Cuando el reloj llegue a cero, ' +
            'los planes vuelven a su precio normal.</p>' +
          '<div class="lc-strike">' +
            'Anual <s>$349</s> <b>$297</b> al año<br>Mensual <s>$39</s> <b>$33</b> al mes' +
          '</div>' +
          '<a href="checkout.html?plan=anual" class="btn btn-gold btn-block" style="margin-bottom:6px">Aprovechar mi 15%</a>' +
          '<p class="trialnote" style="margin-bottom:10px">7 días gratis primero. Cancela cuando quieras.</p>' +
          '<button class="btn btn-ghost btn-block lc-no">Ahora no</button>' +
        '</div>';
      document.body.appendChild(el);
      el.querySelector('.x').addEventListener('click', function () { el.remove(); lastCall = null; });
      el.querySelector('.lc-no').addEventListener('click', function () { el.remove(); lastCall = null; });
      return el;
    }
  }
})();
