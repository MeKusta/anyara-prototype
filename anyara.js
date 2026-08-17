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
    paused: 'anyara_paused'
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

  function renderBanner() {
    var expires = A.offerEnds();
    if (!expires || A.isMember()) return;
    if (Date.now() >= expires) { A.clearOffer(); return; }

    var bar = document.createElement('div');
    bar.className = 'offerbar';
    bar.innerHTML =
      '<div class="offerbar-inner">' +
        '<span class="ob-tag">Oferta de bienvenida</span>' +
        '<span class="ob-msg"><b>15% de descuento</b> en tu primera membresía — termina en</span>' +
        '<span class="ob-clock" id="offerClock">2:00:00</span>' +
        '<a class="ob-go" href="membresia.html">Aprovechar ahora</a>' +
        '<button class="ob-x" aria-label="Cerrar">✕</button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('has-offerbar');

    var clock = bar.querySelector('#offerClock');
    var timer = setInterval(tick, 1000);
    tick();

    function tick() {
      var left = Math.floor((expires - Date.now()) / 1000);
      if (left <= 0) { clearInterval(timer); remove(); A.clearOffer(); return; }
      var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
      clock.textContent = h + ':' + pad(m) + ':' + pad(s);
    }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function remove() { bar.remove(); document.body.classList.remove('has-offerbar'); }
    bar.querySelector('.ob-x').addEventListener('click', function () { clearInterval(timer); remove(); });
  }
})();
