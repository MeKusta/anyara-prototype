/* Anyara · landing
   ---------------------------------------------------------------------------
   Lo que se puede sacar del producto, se saca del producto: las disciplinas,
   el conteo de clases y las instructoras salen de anyara.js, el mismo módulo
   que alimenta la app. Así la landing no puede prometer siete disciplinas
   cuando hay seis, ni quedarse con un catálogo viejo.

   Lo que es propio de la landing — el guion del video, los testimonios, las
   preguntas — vive aquí arriba, junto, para poder editarlo sin buscar. */
(function () {
  'use strict';
  var A = window.Anyara;

  /* ------------------------------------------------------------ contenido */

  /* El guion del video. Mismo formato que el video de bienvenida de la app:
     no hay grabación, así que el reproductor enseña lo que dirá. */
  var GUION = [
    { t:0, n:'No es que te falte disciplina',
      d:'Abre nombrando el problema, no el producto. Quien llega aquí ya lo intentó antes.',
      p:['Empezar sola, sin plan y sin tiempo',
         'La app llena de clases donde nunca sabes cuál poner',
         'El arranque de enero que se apaga en febrero'] },
    { t:20, n:'Qué es Anyara',
      d:'Una frase, no un listado. Qué es y para quién.',
      p:['Pilates, Barre, Sculpt, Somara y ejercicio funcional',
         'En casa, desde 15 minutos',
         '"Muévete con intención": constancia antes que intensidad'] },
    { t:50, n:'Cómo se arma tu plan',
      d:'La parte que la distingue de cualquier catálogo de videos. Con grabación de pantalla.',
      p:['Cinco preguntas: objetivo, tiempo, tipo de movimiento, nivel y equipo',
         'Sale una clase elegida para ti, no una lista',
         'Y una semana completa: qué día, qué clase y por qué',
         'Dos días de descanso dentro del plan, no fuera de él'] },
    { t:90, n:'Lo que incluye',
      d:'Rápido y concreto. Es un vistazo, no un manual.',
      p:['Siete disciplinas y el catálogo completo',
         'Retos y series: programas con principio y final',
         'Tu biblioteca, tus favoritos y tus playlists',
         'Eventos presenciales en CDMX',
         'En el teléfono, en la computadora y en la tele'] },
    { t:130, n:'Cuánto cuesta y los tres días',
      d:'La letra chica dicha por ella. Es lo que más frena a la gente.',
      p:['Tres días de bienvenida con plan de día 1, 2 y 3',
         'Se elige plan hoy pero no se cobra hasta el día 3',
         'Cancelas antes y no hay cargo',
         'Mensual o anual — el anual sale bastante más barato al mes'] },
    { t:160, n:'Empieza hoy',
      d:'Cierre corto. Una sola llamada a la acción.',
      p:['Dos minutos de preguntas y tienes tu plan',
         'Corta al botón de "Empezar mis tres días"'] }
  ];
  var TOTAL = 180;

  /* Testimonios de ejemplo. NO son reales: están para poder ver y aprobar la
     sección antes de tener los de verdad, y la sección lo dice en pantalla.
     Hay que sustituirlos por testimonios con permiso antes de publicar. */
  var TESTIMONIOS = [
    { q:'Llevaba tres años pagando un gimnasio al que iba dos veces al mes. ' +
         'Aquí llevo cinco meses seguidos porque no tengo que decidir nada: abro y ya está puesto.',
      n:'Nombre por confirmar', d:'34 años · CDMX · 5 meses en Anyara', art:'barre' },
    { q:'Lo que me enganchó fue que las clases dicen cuánto duran y qué necesitas. ' +
         'Tengo dos niñas; si son 20 minutos y sin equipo, sí lo hago.',
      n:'Nombre por confirmar', d:'41 años · Monterrey · 8 meses en Anyara', art:'somara' },
    { q:'Venía de lesionarme la espalda. Empecé por Somara y a los dos meses ya estaba ' +
         'haciendo Sculpt. Nadie me apuró y eso fue justo lo que necesitaba.',
      n:'Nombre por confirmar', d:'29 años · Guadalajara · 7 meses en Anyara', art:'sculpt' }
  ];

  var PREGUNTAS = [
    { q:'¿Qué incluyen los tres días de bienvenida?',
      a:'Un video de bienvenida de Mariana y un plan de día 1, 2 y 3 con cuatro clases cada ' +
        'día, armado con lo que contestaste al principio. Más tu clase personalizada y las ' +
        'dos clases que siempre están abiertas. Los retos y las series también se abren.' },
    { q:'¿Por qué piden tarjeta si son tres días gratis?',
      a:'Para que el día 3 tu membresía siga sin que tengas que volver a empezar. No hay ' +
        'ningún cargo antes de ese día, y si cancelas durante la prueba no se cobra nada. ' +
        'Te avisamos por correo un día antes.' },
    { q:'¿Necesito equipo?',
      a:'Para muchas clases no. Cada clase dice antes de abrirla qué material necesitas, con ' +
        'íconos, y puedes filtrar el catálogo por "sin equipo". Lo más que se usa es un ' +
        'tapete, una banda y unas pesas ligeras.' },
    { q:'Nunca he hecho Pilates ni Barre. ¿Es para mí?',
      a:'Sí. Las preguntas del inicio incluyen tu nivel, y el plan empieza por donde estás. ' +
        'Hay clases de principiante en las siete disciplinas, y las instructoras explican ' +
        'el porqué de cada movimiento, no solo el cómo.' },
    { q:'¿Cuánto tiempo necesito al día?',
      a:'Desde 15 minutos. El plan por defecto son cinco días a la semana, pero el objetivo ' +
        'lo pones tú y lo puedes cambiar cuando quieras. Dos días de descanso son parte del ' +
        'plan, no una falla.' },
    { q:'¿En qué dispositivos puedo verlo?',
      a:'En el teléfono, en la tableta, en la computadora y en la tele con Apple TV. La clase ' +
        'sigue donde la dejaste: puedes empezarla en el iPad y terminarla en la tele.' },
    { q:'¿Puedo cancelar o pausar?',
      a:'Cancelas cuando quieras desde tu perfil, sin llamar a nadie. Y si prefieres no ' +
        'perder tu progreso, puedes pausar hasta tres meses: tus favoritos, tus playlists y ' +
        'tu racha quedan como los dejaste.' },
    { q:'¿Puedo cambiar de plan después?',
      a:'Sí, de mensual a anual o al revés, desde tu perfil. El cambio aplica en tu siguiente ' +
        'periodo de cobro.' }
  ];

  function esc(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* -------------------------------------------------------------- piezas */

  document.addEventListener('DOMContentLoaded', function () {
    A.renderLogos();

    /* ---- cifras, contadas del catálogo real ---- */
    var clases = A.catalog();
    var minimo = Math.min.apply(null, clases.map(function (c) { return c.m; }));
    var coaches = Object.keys(A.INSTRUCTORS).length;
    document.getElementById('lpStats').innerHTML = [
      [A.DISC_ORDER.length, 'disciplinas'],
      [clases.length, 'clases en el catálogo'],
      [coaches, 'instructoras'],
      ['desde ' + minimo + ' min', 'por sesión']
    ].map(function (s) {
      return '<li><b>' + s[0] + '</b><span>' + s[1] + '</span></li>';
    }).join('');

    /* ---- disciplinas: la misma pieza que la app ---- */
    document.getElementById('lpPillars').innerHTML = A.DISC_ORDER.map(function (d) {
      return '<a class="pillar gart ' + d + '" href="' +
        (A.discHref(d) || 'explorar.html?d=' + d) + '" data-cta="disciplina-' + d + '">' +
        '<span class="pillar-b">' +
          '<span class="pillar-n">' + A.discLabel(d) + '</span>' +
          '<span class="pillar-d">' + esc(A.discLead(d)) + '</span>' +
        '</span></a>';
    }).join('');

    /* ---- lo que incluye la membresía ---- */
    document.getElementById('lpIncl').innerHTML = [
      'Las ' + A.DISC_ORDER.length + ' disciplinas y las ' + clases.length + ' clases del catálogo',
      'Tu plan semanal, armado con tus respuestas',
      'Retos y series: programas con principio y final',
      'Biblioteca, favoritos y playlists',
      'Teléfono, computadora y Apple TV',
      'Acceso a los eventos presenciales'
    ].map(function (x) { return '<li>' + x + '</li>'; }).join('');

    /* ---- testimonios ---- */
    document.getElementById('lpTests').innerHTML = TESTIMONIOS.map(function (t) {
      return '<figure class="lp-test">' +
        '<blockquote>' + esc(t.q) + '</blockquote>' +
        '<figcaption><span class="lp-test-av gart ' + t.art + '"></span>' +
          '<span><b>' + esc(t.n) + '</b><span>' + esc(t.d) + '</span></span>' +
        '</figcaption></figure>';
    }).join('');

    /* ---- preguntas ---- */
    document.getElementById('lpFaq').innerHTML = PREGUNTAS.map(function (p, i) {
      return '<details' + (i === 0 ? ' open' : '') + '>' +
        '<summary>' + esc(p.q) + '</summary><p>' + esc(p.a) + '</p></details>';
    }).join('');

    /* ---- precios, de la misma fuente que la app ---- */
    var P = A.PRECIOS;
    document.getElementById('lpMensual').innerHTML = P.fmt(P.mensual.mes) + '<small>/mes</small>';
    document.getElementById('lpAnual').innerHTML   = P.fmt(P.anual.anio) + '<small>/año</small>';
    document.getElementById('lpAnualD').textContent =
      'Sale en ' + P.fmt(P.anual.mes) + ' al mes. La constancia se construye en meses, no en semanas.';
    document.getElementById('lpAhorro').textContent =
      'Ahorras ' + P.fmt(P.ahorro) + ' al año frente al mensual';

    A.paintArt();
    arrancarVideo();
    barraFija();
  });

  /* ------------------------------------------------------------- el video */

  function reloj(s) { return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2); }

  function arrancarVideo() {
    var seg = 0, timer = null, actual = -1;
    var prog = document.getElementById('sbProg');
    var now  = document.getElementById('sbNow');
    var big  = document.getElementById('sbBig');
    var tog  = document.getElementById('sbToggle');

    document.getElementById('sbTotal').textContent = reloj(TOTAL);
    document.getElementById('sbTicks').innerHTML = GUION.slice(1).map(function (g) {
      return '<i style="left:' + (g.t / TOTAL * 100) + '%"></i>';
    }).join('');

    function tramo() {
      var i = 0;
      for (var k = 0; k < GUION.length; k++) if (seg >= GUION[k].t) i = k;
      return i;
    }
    function pintar() {
      prog.style.width = (seg / TOTAL * 100) + '%';
      now.textContent = reloj(seg);
      var i = tramo();
      if (i === actual) return;
      actual = i;
      var g = GUION[i];
      var stage = document.querySelector('.sb-stage');
      stage.classList.remove('entra');
      void stage.offsetWidth;
      stage.classList.add('entra');
      document.getElementById('sbCap').textContent =
        'Tramo ' + (i + 1) + ' de ' + GUION.length + ' · ' + reloj(g.t) +
        '–' + reloj(GUION[i + 1] ? GUION[i + 1].t : TOTAL);
      document.getElementById('sbT').textContent = g.n;
      document.getElementById('sbD').textContent = g.d;
      document.getElementById('sbP').innerHTML =
        g.p.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    }
    function alternar() {
      if (timer) {
        clearInterval(timer); timer = null;
        big.textContent = '▶'; tog.textContent = '▶';
        document.getElementById('vsl').classList.remove('corriendo');
        return;
      }
      big.textContent = '❚❚'; tog.textContent = '❚❚';
      document.getElementById('vsl').classList.add('corriendo');
      timer = setInterval(function () {
        seg += 6;
        if (seg >= TOTAL) { seg = TOTAL; alternar(); }
        pintar();
      }, 900);
    }
    big.addEventListener('click', alternar);
    tog.addEventListener('click', alternar);
    document.getElementById('sbLine').addEventListener('click', function (e) {
      var r = this.getBoundingClientRect();
      seg = Math.max(0, Math.min(TOTAL, Math.round((e.clientX - r.left) / r.width * TOTAL)));
      actual = -1;
      pintar();
    });
    pintar();
  }

  /* -------------------------------------------------------- barra fija */

  /* Aparece cuando la portada ya pasó — antes de eso el botón grande ya está
     en pantalla y dos botones compitiendo no ayudan a nadie — y se esconde
     al llegar al cierre, que trae el suyo. */
  function barraFija() {
    var barra = document.getElementById('lpSticky');
    var hero  = document.querySelector('.lp-hero');
    var cierre = document.querySelector('.lp-close');
    function mirar() {
      var pasoHero = hero.getBoundingClientRect().bottom < 0;
      var enCierre = cierre.getBoundingClientRect().top < window.innerHeight;
      barra.classList.toggle('on', pasoHero && !enCierre);
      document.getElementById('lpTop').classList.toggle('pegada', pasoHero);
    }
    window.addEventListener('scroll', mirar, { passive:true });
    window.addEventListener('resize', mirar);
    mirar();
  }
})();
