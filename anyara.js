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
  var VERSION = '1.07.01';

  /* Wordmark de Anyara. Va inline y con fill=currentColor para que herede
     el color del contexto — en fondo claro sale en tinta, en el player y en
     bienvenida sale en blanco, sin necesitar dos archivos. */
  var LOGO_SVG =
    '<svg class="logo-mark" viewBox="0 0 349.57 135.96" fill="currentColor" ' +
    'role="img" aria-label="Anyara">' +
    '<path d="M278.77,82.99c-5.38.45-10.22.44-15.04-.02,3.47-8.32,3.85-16.33,3.29-25.55-4.99,6.81-10.48,11.98-16.5,17.58-.63,2.03.48,5.97,3.34,7.97-3.64,1.01-7.23-1.56-10.56-3.37-8.43,3.97-18,7.44-27.44,5.15-6.18-1.5-12.23-5.21-13.46-11.69-3.71-19.6,24.35-29.06,38.44-33.59,1.85-4.27-1.18-11.15-5.66-12.57-7.45-2.35-14.44,1.01-19.42,6.99-1.04-2.83-3.22-4.36-6.02-7.5,11.64.97,16.57-3.91,29.21-.89,7.15,1.71,10.42,7.3,10.49,14.37.11,10.82-.81,20.92.83,32.56,20-17.15,20-20.4,13.67-45.56,3.49-.19,7.5-.38,11.08,0,.82,4.31-.68,7.85.77,12.42,3.93-11.54,15.52-17.47,26.64-13.61.46.82-1.37,4.11-2.41,3.75-10.6-3.65-20.84,1.91-23.54,13.19-1.98,8.28-2.23,31.34,2.31,40.38ZM242.5,77.64c-.24-2.65-.82-4.12-.84-5.91l-.28-30.33c-12.69,4.34-29.29,13.87-29.66,28.22-.28,4.47,1.23,8.22,4.17,10.93,6.71,6.19,19.15,1.88,26.6-2.91Z"/>' +
    '<path d="M45.14,43.23c-4.49,14.74-15.99,43.61-35.33,39.95-7.01-1.32-10.56-8.75-9.66-15.51,2.28-17.23,22.49-24.34,38.26-26.14,5.48-12.76,9.1-25.77,12.5-39.57-8.04-.8-15.69,1.89-20.45,7.83-2.34,2.92-3,6.54-1.69,10.16.94,2.6,3.65,4.72,7.03,5.42-5.03,2.58-9.79-.79-10.57-5.65-1.33-8.34,4-16.07,12.58-18.41,20.1-5.48,47.43,6.86,43.67,23.13-.96,4.14-4.17,7.38-9.25,9.89,4.74,12.16,12.27,40.98,22.31,48.96-3.76.74-7.39.47-12.26.25,1.89-11.79-8.79-34.75-13.1-47.49-8.53,3.19-15.97,5.14-24.05,7.17ZM76.82,15.47c-3.22-6.03-8.5-10.51-15.53-11.66l10.16,28.57c6.4-3.14,8.77-10.55,5.38-16.91ZM68.51,33.76l-10.25-27.31-12.01,33.67c8.01-.91,14.7-2.82,22.26-6.36ZM15.38,77.98c10.19-5.42,18.5-22.41,21.92-33.49-9.09.41-16.83,3.25-23.4,8.38-9.04,7.07-13.21,20.29-6.64,24.92,2.17,1.53,5.02,1.55,8.12.19Z"/>' +
    '<path d="M213.16,105.49c1.55,10.79-3.19,22.21-12.39,27.8-7.42,4.51-15.71,3.33-21.08-3.76,5.17,2.58,11.3,2.59,16.52-1.22,11.95-8.73,15.36-27.26,6.99-32.28-12.75-7.64-20.54,14.39-27.37,23.9-7.07,9.83-19.86,12.66-30.19,6.11-7.02-4.46-9.38-12.98-5.84-20.5,2.99-6.35,7.85-11.14,14.1-14.3l21.15-10.69c-6.58-17.11-13.6-41.41-25.85-53.85,4.73-.74,8.64-.61,13.33-.1-2.92,12.35,9.43,38.44,14.43,52.31,18.4-9.37,18.92-34.61,17.09-52.15,3.3-.67,6.33-.55,9.83-.21,3.11,23.38-8.37,45.75-29,57.29-6.48,3.63-12.09,7.59-17.97,12.03-7.36,5.56-11.11,15.13-8.01,23.75,2.6,7.23,9.6,9.71,16.56,7.01,16.26-6.3,16.88-37.4,36.66-33.18,5.44,1.16,10.1,5.57,11.03,12.03Z"/>' +
    '<path d="M127.49,28.71c-22.54.77-18.35,33.74-16.37,48.8.35,2.68,1.67,4.34,3.53,5.87-5.65.46-10.35.4-16.57.13,5.2-8.48,5.29-47.39.08-55.98,3.68-.69,7.32-.44,11.24-.23l.79,12.1c4.12-10.2,12.71-15.62,23.29-14.25,26.09,3.38,7.93,38.7,18.78,58.28-5.47.42-10.14.4-15.61,0,5.05-7.23,4.08-33.88,3.68-43.15-.31-7.01-5.94-11.81-12.86-11.58Z"/>' +
    '<path d="M305.08,82.12c-6.35-3.56-8.33-10.02-6.65-16.38,4.12-15.67,24.98-21.52,38.2-26.32,1.91-4.15-1.21-11.13-5.65-12.52-7.47-2.34-14.44,1.01-19.43,7-1.04-2.84-3.22-4.36-6.02-7.51,11.48.99,16.76-3.93,29.23-.87,6.53,1.6,10.31,6.65,10.38,13.36.08,6.94-1.58,42.57,4.43,44.19-4.4.14-8.63-.96-11.89-6.02-8.86,8.56-21.61,11.23-32.6,5.07ZM317.69,83.52c8,.77,15.59-2.93,19.74-9.67l-.24-32.47c-13.35,4.76-29.72,13.96-29.7,29.29,0,6.39,4.01,11.6,10.2,12.85Z"/>' +
    '</svg>';

  /* Fotos por disciplina en img/. El nombre del archivo trae la disciplina,
     así que se asignan por nombre: nunca hace falta mirar el contenido.
     Se reparten rotando, para que dos tarjetas de la misma disciplina en la
     misma pantalla no salgan con la misma foto. */
  var ART = { barre:6, funcional:6, somara:6, sculpt:4, tone:3, pilates:2, anyara:4 };
  /* no hay fotos de Pilates a secas — las de Mat cubren ambas */
  var ART_ALIAS = { pilatesmat:'pilates' };

  /* Disciplinas: etiqueta y si ya tiene página propia. Sólo Somara la tiene
     por ahora — las demás siguen cayendo en el catálogo filtrado. */
  var DISC = {
    barre:      { label:'Barre',       page:false },
    funcional:  { label:'Funcional',   page:false },
    pilatesmat: { label:'Pilates Mat', page:false },
    pilates:    { label:'Pilates',     page:false },
    sculpt:     { label:'Sculpt',      page:false },
    somara:     { label:'Somara',      page:true  },
    tone:       { label:'Tone',        page:false }
  };
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

    DISC: DISC,
    discLabel: function (d) { return (DISC[d] && DISC[d].label) || d; },
    /* null si esa disciplina todavía no tiene página propia */
    discHref: function (d) { return (DISC[d] && DISC[d].page) ? 'disciplina.html?d=' + d : null; },

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
          '<div class="tr-logo">' + LOGO_SVG + '</div>' +
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
    paintArt();
    paintFavs();
    renderLogos();
    renderNav();
    renderVersion();
    renderDayPicker();
    renderChargeNotice();
  });

  /* Pone la foto de la disciplina en cada bloque .gart. Corre dos veces: al
     cargar el DOM para lo estático, y en load para las tarjetas que las
     páginas arman con su propio script. data-img fuerza otro grupo. */
  var artSeen = {};
  function paintArt() {
    document.querySelectorAll('.gart').forEach(function (el) {
      if (el.getAttribute('data-art')) return;
      var pool = el.getAttribute('data-img');
      if (!pool) {
        Object.keys(ART).forEach(function (k) {
          if (!pool && el.classList.contains(k)) pool = k;
        });
        Object.keys(ART_ALIAS).forEach(function (k) {
          if (!pool && el.classList.contains(k)) pool = ART_ALIAS[k];
        });
      }
      if (!pool || !ART[pool]) return;
      var i = artSeen[pool] || 0;
      artSeen[pool] = i + 1;
      el.style.setProperty('--art', 'url("img/' + pool + '-' + ((i % ART[pool]) + 1) + '.jpg")');
      el.setAttribute('data-art', '1');
    });
  }
  A.paintArt = paintArt;
  window.addEventListener('load', paintArt);

  /* Corazón en cada tarjeta. Se inyecta aquí para no repetirlo en ocho páginas.
     Por ahora sólo alterna visualmente: no persiste, así que el contador de
     Favoritos de la home sigue siendo de utilería. */
  function paintFavs() {
    document.querySelectorAll('.ccard .art').forEach(function (art) {
      if (art.querySelector('.fav')) return;
      var b = document.createElement('button');
      b.className = 'fav';
      b.type = 'button';
      b.setAttribute('aria-label', 'Guardar en favoritos');
      b.textContent = '♡';
      b.addEventListener('click', function (e) {
        /* la tarjeta entera es un <a>: sin esto, guardar te saca a la clase */
        e.preventDefault();
        e.stopPropagation();
        var on = b.classList.toggle('on');
        b.textContent = on ? '♥' : '♡';
      });
      art.appendChild(b);
    });
  }
  A.paintFavs = paintFavs;
  window.addEventListener('load', paintFavs);

  /* Los dos tags de la tarjeta navegan: la disciplina a su página, y la serie
     o reto al suyo. Van delegados en el documento porque las tarjetas se
     generan en distintos momentos, y con stopPropagation para que el clic no
     se lo lleve la tarjeta entera. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var s = e.target.closest('.serie-link');
    if (s) {
      e.preventDefault(); e.stopPropagation();
      location.href = s.getAttribute('data-href') || 'series.html';
      return;
    }
    var d = e.target.closest('.disc-link');
    if (d) {
      e.preventDefault(); e.stopPropagation();
      var slug = d.getAttribute('data-d');
      /* si esa disciplina aún no tiene página, cae al catálogo filtrado */
      location.href = A.discHref(slug) || ('explorar.html?d=' + slug);
    }
  });

  /* Cambia el wordmark de texto por el SVG en todas las marcas del sitio.
     Si el JS no corre, queda el texto "Anyara" — el logo nunca desaparece. */
  function renderLogos() {
    document.querySelectorAll('.logo, .tr-logo').forEach(function (el) {
      if (el.querySelector('.logo-mark')) return;
      el.innerHTML = LOGO_SVG;
    });
  }

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
