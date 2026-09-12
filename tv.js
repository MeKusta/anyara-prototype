/* Anyara TV — motor de foco y pantallas.
   ---------------------------------------------------------------------------
   En una tele no hay puntero. Se navega moviendo el foco con la cruceta del
   control, y eso cambia todo: siempre hay exactamente un elemento enfocado,
   siempre tiene que verse dónde está, y moverse de uno a otro tiene que
   sentirse geométrico — arriba es lo que está arriba, no lo siguiente en el
   orden del HTML.

   Este archivo hace tres cosas:
     1. Un motor de foco espacial: dada una dirección, elige el candidato que
        de verdad está en esa dirección y más cerca.
     2. El mapeo del control: cruceta, seleccionar y "menú" (atrás).
     3. Las pantallas, que se cambian sin recargar — una app de tele no
        navega entre páginas, cambia de vista.

   Los datos salen de anyara.js, el mismo catálogo que el sitio y el teléfono. */
(function () {
  'use strict';

  var A = window.Anyara;

  /* ------------------------------------------------------------------ foco */

  /* El motor mira lo que está pintado, no una lista que haya que mantener:
     cualquier cosa con [data-foco] entra, y lo que se pinte después también. */
  function enfocables() {
    return Array.prototype.slice
      .call(document.querySelectorAll('[data-foco]'))
      .filter(function (el) {
        if (el.hasAttribute('disabled')) return false;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return false;          /* oculto */
        return !el.closest('[hidden], .tv-screen:not(.on)');
      });
  }

  var actual = null;

  function enfocar(el, opciones) {
    if (!el || el === actual) return;
    opciones = opciones || {};
    if (actual) actual.classList.remove('foco');
    actual = el;
    el.classList.add('foco');
    el.focus({ preventScroll: true });
    if (!opciones.sinScroll) traer(el);
    document.dispatchEvent(new CustomEvent('foco', { detail: el }));
  }
  window.tvEnfocar = enfocar;

  /* Al moverse, la tele no "hace scroll" como una página: acomoda la fila
     para que lo enfocado quede en el borde de lectura, y la página para que
     la fila entera quepa. Sin barras de scroll, que en una tele no existen. */
  function traer(el) {
    var fila = el.closest('.tv-shelf-track');
    if (fila) {
      var r = el.getBoundingClientRect(), f = fila.getBoundingClientRect();
      var borde = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-x')) || 0;
      fila.scrollTo({ left: fila.scrollLeft + (r.left - f.left) - borde, behavior: 'smooth' });
    }
    var bloque = el.closest('.tv-row, .tv-nav, .tv-hero, .tv-panel');
    if (bloque) bloque.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* Elección espacial. Se compara el centro del candidato contra el del
     actual: primero tiene que estar del lado correcto, y de los que quedan
     gana el que menos se desvía del eje — moverse a la derecha no debería
     saltar tres filas hacia abajo porque ahí había algo más cerca en línea
     recta. */
  function siguiente(dir) {
    if (!actual) return enfocables()[0];
    var a = actual.getBoundingClientRect();
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var mejor = null, mejorCoste = Infinity;

    enfocables().forEach(function (el) {
      if (el === actual) return;
      var b = el.getBoundingClientRect();
      var bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var dx = bx - ax, dy = by - ay;

      var avance, desvio;
      if (dir === 'left'  || dir === 'right') {
        avance = dir === 'right' ? dx : -dx;
        /* solaparse en vertical cuenta como estar en la misma fila */
        desvio = solape(a.top, a.bottom, b.top, b.bottom) ? 0 : Math.abs(dy);
      } else {
        avance = dir === 'down' ? dy : -dy;
        desvio = solape(a.left, a.right, b.left, b.right) ? 0 : Math.abs(dx);
      }
      if (avance <= 4) return;                     /* no está de ese lado */

      /* el desvío pesa más que la distancia: mantiene el movimiento recto */
      var coste = avance + desvio * 2.5;
      if (coste < mejorCoste) { mejorCoste = coste; mejor = el; }
    });
    return mejor;
  }
  function solape(a1, a2, b1, b2) { return Math.min(a2, b2) - Math.max(a1, b1) > 4; }

  /* ---------------------------------------------------------------- control */

  /* Teclas de teclado y las del control de una tele. En un navegador de
     escritorio se prueba con las flechas; en un Apple TV llegan las mismas
     como cruceta, y "menú" llega como Escape. */
  var TECLAS = {
    ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
    Up:'up', Down:'down', Left:'left', Right:'right',
    Enter:'ok', ' ':'ok', Select:'ok',
    Escape:'atras', Backspace:'atras', GoBack:'atras', BrowserBack:'atras'
  };

  document.addEventListener('keydown', function (e) {
    var accion = TECLAS[e.key];
    if (!accion) return;
    e.preventDefault();

    if (accion === 'atras') { atras(); return; }
    if (accion === 'ok')    { if (actual) actual.click(); return; }

    var destino = siguiente(accion);
    if (destino) { enfocar(destino); return; }

    /* Arriba desde la primera fila va a la navegación: es el gesto que todo
       el mundo ya conoce de una tele, y evita quedarse encerrado. */
    if (accion === 'up') {
      var nav = document.querySelector('.tv-nav [data-foco]');
      if (nav) enfocar(nav);
    }
  });

  /* Los clics siguen funcionando para poder probar en una laptop, pero mover
     el ratón no cambia el foco: en una tele el foco sólo se mueve con la
     cruceta, y que saltara al pasar el puntero sería mentir sobre el modelo. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-foco]');
    if (el && el !== actual) enfocar(el);
  });

  /* ------------------------------------------------------------- pantallas */

  var pila = [];

  function ir(nombre, datos, opciones) {
    opciones = opciones || {};
    var anterior = document.querySelector('.tv-screen.on');
    if (anterior && !opciones.reemplazar) {
      pila.push({ nombre: anterior.dataset.pantalla, datos: anterior.__datos,
                  foco: actual && actual.dataset.id });
    }
    PANTALLAS[nombre](datos || {});
  }
  window.tvIr = ir;

  function atras() {
    var previa = pila.pop();
    if (!previa) return;
    PANTALLAS[previa.nombre](previa.datos || {}, previa.foco);
  }

  /* Pinta una pantalla y le devuelve el foco al sitio del que se salió, que
     es lo que espera cualquiera que vuelve de un detalle: no al principio de
     la lista, sino a la tarjeta que abrió. */
  function montar(nombre, datos, html, focoPrevio) {
    var cont = document.getElementById('tvApp');
    cont.innerHTML = html;
    var pantalla = cont.firstElementChild;
    pantalla.classList.add('on');
    pantalla.dataset.pantalla = nombre;
    pantalla.__datos = datos;
    A.paintArt();
    marcarNav(nombre);
    actual = null;
    var destino = (focoPrevio && cont.querySelector('[data-id="' + CSS.escape(focoPrevio) + '"]'))
               || cont.querySelector('[data-foco][data-inicial]')
               || cont.querySelector('.tv-body [data-foco]')
               || cont.querySelector('[data-foco]');
    enfocar(destino, { sinScroll:true });
    window.scrollTo(0, 0);
    ajustarNav();
  }

  function marcarNav(nombre) {
    var mapa = { home:'home', explorar:'explorar', disciplina:'explorar',
                 clase:'explorar', coach:'explorar', retos:'retos', reto:'retos',
                 eventos:'eventos', evento:'eventos', cuenta:'cuenta',
                 vista:'vista' };
    document.querySelectorAll('.tv-nav [data-nav]').forEach(function (a) {
      a.classList.toggle('activo', a.dataset.nav === (mapa[nombre] || nombre));
    });
  }

  /* ------------------------------------------------------------- piezas */

  function esc(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;');
  }

  /* La tarjeta de clase de la tele: casi toda foto. A tres metros el texto
     pequeño no existe, así que la imagen es la que identifica la clase y el
     título va debajo, grande. */
  function tarjeta(c) {
    return '<button class="tv-card" data-foco data-id="c:' + esc(c.slug) + '" ' +
      'data-accion="clase" data-slug="' + esc(c.slug) + '">' +
      '<span class="tv-card-art gart ' + c.d + '">' +
        (c.free ? '<span class="tv-badge">Gratis</span>' : '') +
        '<span class="tv-card-min">' + c.m + ' min</span>' +
      '</span>' +
      '<span class="tv-card-t">' + esc(c.t) + '</span>' +
      '<span class="tv-card-m">' + esc(c.i) + ' · ' + esc(c.x) + '</span>' +
      '</button>';
  }

  function estante(titulo, contenido, extra) {
    if (!contenido) return '';
    return '<section class="tv-row' + (extra ? ' ' + extra : '') + '">' +
      '<h2 class="tv-row-t">' + esc(titulo) + '</h2>' +
      '<div class="tv-shelf"><div class="tv-shelf-track">' + contenido + '</div></div>' +
      '</section>';
  }

  function estanteClases(titulo, lista) {
    if (!lista.length) return '';
    return estante(titulo, lista.map(tarjeta).join(''));
  }

  /* ------------------------------------------------------------ pantallas */

  var PANTALLAS = {};

  PANTALLAS.home = function (datos, foco) {
    var todo = A.catalog();
    var mia  = (A.welcomeClass() || A.welcomePlan()[0] || {}).disc;
    var sigue = { slug:'barre-postura', t:'Barre : Postura Perfecta', i:'Valeria Méndez',
                  d:'barre', m:35, x:'Intermedio', pct:64 };

    var html = '<div class="tv-screen" >' +
      '<header class="tv-hero gart ' + sigue.d + '">' +
        '<div class="tv-hero-in">' +
          '<div class="tv-kicker">Continúa donde lo dejaste</div>' +
          '<h1 class="tv-hero-t">' + esc(sigue.t) + '</h1>' +
          '<div class="tv-hero-m">' + A.discLabel(sigue.d) + ' · ' + sigue.m +
            ' min · con ' + esc(sigue.i) + '</div>' +
          '<div class="tv-bar"><i style="width:' + sigue.pct + '%"></i></div>' +
          '<div class="tv-hero-cta">' +
            '<button class="tv-btn tv-btn-gold" data-foco data-inicial ' +
              'data-accion="reproducir" data-slug="' + sigue.slug + '">' +
              '<span class="tv-play">▶</span>Reanudar · faltan ' +
              Math.round(sigue.m * (100 - sigue.pct) / 100) + ' min</button>' +
            '<button class="tv-btn" data-foco data-accion="clase" ' +
              'data-slug="' + sigue.slug + '">Ver la clase</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="tv-body">' +
        estante('Las disciplinas',
          A.DISC_ORDER.map(function (d) {
            return '<button class="tv-disc gart ' + d + '" data-foco data-id="d:' + d + '" ' +
              'data-accion="disciplina" data-d="' + d + '">' +
              '<span class="tv-disc-b"><span class="tv-disc-n">' + A.discLabel(d) + '</span>' +
              '<span class="tv-disc-d">' + esc(A.discLead(d)) + '</span></span></button>';
          }).join(''), 'tv-row-disc') +
        (mia ? estanteClases('Más de ' + A.discLabel(mia),
          todo.filter(function (c) { return c.d === mia; })) : '') +
        estanteClases('Lo más nuevo', todo.slice(0, 10)) +
        estante('Retos y series', RETOS_HTML()) +
        estanteClases('Entrenamiento corto',
          todo.filter(function (c) { return c.m <= 20; })) +
        estanteClases('Días de poca energía',
          todo.filter(function (c) { return c.foco === 'movilidad'; })) +
        estanteClases('Cuando buscas fuerza',
          todo.filter(function (c) { return c.foco === 'fuerza' && c.m >= 30; })) +
      '</div>' +
    '</div>';
    montar('home', datos, html, foco);
  };

  function RETOS_HTML() {
    var P = [
      { id:'volver',     d:'somara',     k:'Reto · 21 días', t:'Volver a Ti' },
      { id:'bienvenida', d:'funcional',  k:'Reto · 7 días',  t:'Reto de Bienvenida' },
      { id:'fuerza',     d:'sculpt',     k:'Serie · 3 clases', t:'Fuerza Total' },
      { id:'core',       d:'pilatesmat', k:'Serie · 3 clases', t:'Core & Flexibilidad' }
    ];
    return P.map(function (r) {
      return '<button class="tv-prog gart ' + r.d + '" data-foco data-id="p:' + r.id + '" ' +
        'data-accion="reto" data-reto="' + r.id + '">' +
        '<span class="tv-prog-b">' +
          '<span class="tv-prog-k">' + r.k + '</span>' +
          '<span class="tv-prog-t">' + esc(r.t) + '</span>' +
        '</span></button>';
    }).join('');
  }

  PANTALLAS.explorar = function (datos, foco) {
    var todo = A.catalog();
    var html = '<div class="tv-screen">' +
      '<div class="tv-body tv-body-top">' +
        '<h1 class="tv-page-t">Explorar</h1>' +
        '<p class="tv-page-d">' + todo.length + ' clases en ' +
          A.DISC_ORDER.length + ' disciplinas.</p>' +
        A.DISC_ORDER.map(function (d) {
          return estanteClases(A.discLabel(d),
            todo.filter(function (c) { return c.d === d; }));
        }).join('') +
      '</div>' +
    '</div>';
    montar('explorar', datos, html, foco);
  };

  PANTALLAS.disciplina = function (datos, foco) {
    var d = datos.d || 'barre';
    var suyas = A.catalog(d);
    var subs = A.subsOf(d);
    var html = '<div class="tv-screen">' +
      '<header class="tv-hero tv-hero-sm gart ' + d + '">' +
        '<div class="tv-hero-in">' +
          '<div class="tv-kicker">Disciplina</div>' +
          '<h1 class="tv-hero-t">' + A.discLabel(d) + '</h1>' +
          '<p class="tv-hero-d">' + esc(A.discAbout(d)) + '</p>' +
          '<div class="tv-hero-cta">' +
            '<button class="tv-btn tv-btn-gold" data-foco data-inicial ' +
              'data-accion="reproducir" data-slug="' + esc(suyas[0].slug) + '">' +
              '<span class="tv-play">▶</span>Empezar por aquí</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="tv-body">' +
        subs.subs.map(function (sb) {
          return estanteClases(sb.n, suyas.filter(function (c) { return c.sub === sb.id; }));
        }).join('') +
        estanteClases('Todas las clases de ' + A.discLabel(d), suyas) +
      '</div>' +
    '</div>';
    montar('disciplina', datos, html, foco);
  };

  PANTALLAS.clase = function (datos, foco) {
    var c = porSlug(datos.slug);
    var prof = A.INSTRUCTORS[c.i] || {};
    var html = '<div class="tv-screen tv-detalle">' +
      '<div class="tv-det-art gart ' + c.d + '"></div>' +
      '<div class="tv-det-in">' +
        '<div class="tv-kicker">' + A.discLabel(c.d) + '</div>' +
        '<h1 class="tv-det-t">' + esc(c.t) + '</h1>' +
        '<div class="tv-det-m">' + esc(c.x) + ' · ' + c.m + ' min · con ' + esc(c.i) + '</div>' +
        '<p class="tv-det-d">' + esc(A.discAbout(c.d)) + '</p>' +
        '<div class="tv-props">' + A.propList(c.props || A.defaultProps(c.d))
          .map(function (k) {
            return '<span class="tv-prop">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true">' + A.PROPS[k].svg + '</svg>' +
              A.PROPS[k].n + '</span>';
          }).join('') + '</div>' +
        '<div class="tv-det-cta">' +
          '<button class="tv-btn tv-btn-gold" data-foco data-inicial ' +
            'data-accion="reproducir" data-slug="' + esc(c.slug) + '">' +
            '<span class="tv-play">▶</span>Reproducir</button>' +
          '<button class="tv-btn" data-foco data-accion="favorito">Guardar</button>' +
          '<button class="tv-btn" data-foco data-accion="disciplina" data-d="' + c.d + '">' +
            'Ver ' + A.discLabel(c.d) + '</button>' +
        '</div>' +
        /* La instructora es una puerta, no un pie de foto: desde la clase se
           llega a su perfil con la cruceta, igual que en el sitio. */
        '<button class="tv-det-coach" data-foco data-id="i:' + esc(c.i) + '" ' +
          'data-accion="coach" data-coach="' + esc(c.i) + '">' +
          '<span class="tv-det-av gart ' + (prof.art || c.d) + '"></span>' +
          '<span class="tv-det-coach-b"><b>' + esc(c.i) + '</b>' +
          '<span>' + esc(prof.rol || '') + ' · Ver perfil</span></span>' +
        '</button>' +
      '</div>' +
      '<div class="tv-body tv-body-det">' +
        estanteClases('También te puede gustar', A.suggest(c.d, c.t, 10)) +
      '</div>' +
    '</div>';
    montar('clase', datos, html, foco);
  };

  /* El mismo selector de vista que el sitio, en la forma que corresponde a
     una tele: una pantalla con opciones grandes y enfocables, no un menú
     desplegable. Es una herramienta del prototipo, no una sección. */
  PANTALLAS.vista = function (datos, foco) {
    var OPC = [
      { v:'escritorio', n:'Web de escritorio', d:'El sitio como se ve en una computadora' },
      { v:'telefono',   n:'App de teléfono',   d:'La maquetación del móvil, en un marco de 390×844' },
      { v:'tele',       n:'Apple TV',          d:'Donde estás ahora' }
    ];
    var html = '<div class="tv-screen">' +
      '<div class="tv-body tv-body-top tv-panel">' +
        '<div class="tv-kicker tv-kicker-proto">Prototipo · no forma parte del producto</div>' +
        '<h1 class="tv-page-t">Ver Anyara como</h1>' +
        '<p class="tv-page-d">Son tres maquetaciones distintas, no una que se ' +
          'encoge. Esto sirve para saltar entre ellas sin cambiar de aparato.</p>' +
        '<div class="tv-vistas">' +
          OPC.map(function (o) {
            var aqui = o.v === 'tele';
            return '<button class="tv-vista' + (aqui ? ' on' : '') + '" data-foco' +
              (aqui ? '' : ' data-inicial') + ' data-accion="vista" data-v="' + o.v + '">' +
              '<span class="tv-vista-n">' + o.n + (aqui ? ' · activa' : '') + '</span>' +
              '<span class="tv-vista-d">' + o.d + '</span></button>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
    montar('vista', datos, html, foco);
  };

  PANTALLAS.coach = function (datos, foco) {
    var nombre = datos.coach;
    var prof = A.INSTRUCTORS[nombre] || {};
    var suyas = A.classesBy(nombre, 20);
    var discs = A.coachDiscs(nombre);
    var html = '<div class="tv-screen tv-detalle">' +
      '<div class="tv-det-art gart ' + (prof.art || 'somara') + '"></div>' +
      '<div class="tv-det-in">' +
        '<div class="tv-kicker">Instructora</div>' +
        '<h1 class="tv-det-t">' + esc(nombre) + '</h1>' +
        '<div class="tv-det-m">' + esc(prof.cifras || '') + '</div>' +
        '<p class="tv-det-d">' + esc(prof.bio || '') + '</p>' +
        '<div class="tv-props">' + discs.map(function (d) {
          return '<span class="tv-prop tv-prop-disc ' + d + '">' +
            '<i class="tv-dot"></i>' + A.discLabel(d) + '</span>';
        }).join('') + '</div>' +
        '<div class="tv-det-cta">' +
          (suyas.length
            ? '<button class="tv-btn tv-btn-gold" data-foco data-inicial ' +
              'data-accion="reproducir" data-slug="' + esc(suyas[0].slug) + '">' +
              '<span class="tv-play">▶</span>Empezar con ' + esc(suyas[0].t) + '</button>'
            : '') +
          '<button class="tv-btn" data-foco data-accion="atras">Volver</button>' +
        '</div>' +
      '</div>' +
      '<div class="tv-body tv-body-det">' +
        estanteClases('Clases de ' + nombre.split(' ')[0], suyas) +
      '</div>' +
    '</div>';
    montar('coach', datos, html, foco);
  };

  PANTALLAS.reto = function (datos, foco) {
    var R = A.RETOS[datos.reto] || A.RETOS.volver;
    var dias = R.dias || [];
    var html = '<div class="tv-screen">' +
      '<header class="tv-hero gart somara">' +
        '<div class="tv-hero-in">' +
          '<div class="tv-kicker">Reto · ' + dias.length + ' días</div>' +
          '<h1 class="tv-hero-t">' + esc(R.t) + '</h1>' +
          '<p class="tv-hero-d">Un recorrido guiado, un día a la vez. ' +
            'Al terminar cada clase se abre la siguiente.</p>' +
          '<div class="tv-hero-cta">' +
            '<button class="tv-btn tv-btn-gold" data-foco data-inicial ' +
              'data-accion="reproducir" data-slug="' + esc(dias[0] ? dias[0].t : '') + '">' +
              '<span class="tv-play">▶</span>Empezar el reto</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="tv-body">' +
        estante('Tu recorrido', dias.map(function (dia, i) {
          return '<button class="tv-card" data-foco data-id="r:' + i + '" ' +
            'data-accion="reproducir" data-slug="' + esc(dia.t) + '">' +
            '<span class="tv-card-art gart ' + dia.d + '">' +
              '<span class="tv-badge">Día ' + (i + 1) + '</span>' +
              '<span class="tv-card-min">' + dia.m + ' min</span></span>' +
            '<span class="tv-card-t">' + esc(dia.t) + '</span>' +
            '<span class="tv-card-m">' + esc(dia.i) + '</span></button>';
        }).join('')) +
      '</div>' +
    '</div>';
    montar('reto', datos, html, foco);
  };

  PANTALLAS.retos = function (datos, foco) {
    var html = '<div class="tv-screen">' +
      '<div class="tv-body tv-body-top">' +
        '<h1 class="tv-page-t">Retos y series</h1>' +
        '<p class="tv-page-d">Programas con principio y final.</p>' +
        estante('Retos', RETOS_HTML()) +
      '</div>' +
    '</div>';
    montar('retos', datos, html, foco);
  };

  PANTALLAS.eventos = function (datos, foco) {
    var EV = A.events();
    var html = '<div class="tv-screen">' +
      '<div class="tv-body tv-body-top">' +
        '<h1 class="tv-page-t">Eventos</h1>' +
        '<p class="tv-page-d">Encuentros en persona. Los boletos se compran ' +
          'desde el teléfono — aquí sólo se consultan.</p>' +
        estante('Próximos', EV.map(function (e) {
          return '<button class="tv-card tv-card-ev" data-foco data-id="e:' + e.id + '" ' +
            'data-accion="evento" data-ev="' + e.id + '">' +
            '<span class="tv-card-art gart ' + e.d + '">' +
              '<span class="tv-date"><b>' + e.dia + '</b><span>' + e.mes + '</span></span>' +
            '</span>' +
            '<span class="tv-card-t">' + esc(e.t) + '</span>' +
            '<span class="tv-card-m">' + esc(e.hora) + ' · ' + esc(e.ciudad) + '</span>' +
            '</button>';
        }).join('')) +
      '</div>' +
    '</div>';
    montar('eventos', datos, html, foco);
  };

  PANTALLAS.evento = function (datos, foco) {
    var e = A.event(datos.ev) || A.events()[0];
    var html = '<div class="tv-screen tv-detalle">' +
      '<div class="tv-det-art gart ' + e.d + '"></div>' +
      '<div class="tv-det-in">' +
        '<div class="tv-kicker">Evento · ' + esc(e.fechaLarga) + '</div>' +
        '<h1 class="tv-det-t">' + esc(e.t) + '</h1>' +
        '<div class="tv-det-m">' + esc(e.hora) + ' · ' + esc(e.lugar) + ' · ' + esc(e.cupo) + '</div>' +
        '<p class="tv-det-d">' + esc(e.lead) + '</p>' +
        '<div class="tv-pareado">' +
          '<div class="tv-qr" aria-hidden="true"></div>' +
          '<div><b>Resérvalo desde tu teléfono</b>' +
            '<span>Escanea el código con la cámara y terminas ahí. ' +
            'En la tele no se piden datos de pago.</span></div>' +
        '</div>' +
        '<div class="tv-det-cta">' +
          '<button class="tv-btn" data-foco data-inicial data-accion="atras">Volver</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    montar('evento', datos, html, foco);
  };

  /* La cuenta en una tele no se escribe: se emparejan los dispositivos. Pedir
     un correo y una contraseña con la cruceta es el peor momento de cualquier
     app de tele, y es evitable. */
  PANTALLAS.cuenta = function (datos, foco) {
    var dentro = A.hasAccount();
    var html = '<div class="tv-screen">' +
      '<div class="tv-body tv-body-top tv-panel">' +
        (dentro
          ? '<h1 class="tv-page-t">Hola, ' + esc(A.name()) + '</h1>' +
            '<p class="tv-page-d">Membresía ' + (A.isPaid() ? 'activa' : 'en prueba') +
              '. Los planes, los pagos y los datos se manejan desde el teléfono ' +
              'o la web; aquí sólo se practica.</p>' +
            '<div class="tv-det-cta">' +
              '<button class="tv-btn" data-foco data-inicial data-accion="salir">Cerrar sesión</button>' +
            '</div>'
          : '<h1 class="tv-page-t">Entra a Anyara</h1>' +
            '<p class="tv-page-d">No hace falta escribir nada con el control.</p>' +
            '<div class="tv-pareado tv-pareado-lg">' +
              '<div class="tv-qr" aria-hidden="true"></div>' +
              '<div><b>anyara.com/tv</b>' +
                '<span>Abre esa página en tu teléfono y escribe el código.</span>' +
                '<span class="tv-codigo">K4M · 7QP</span></div>' +
            '</div>' +
            '<div class="tv-det-cta">' +
              '<button class="tv-btn tv-btn-gold" data-foco data-inicial data-accion="entrar">' +
                'Ya lo hice</button>' +
            '</div>') +
      '</div>' +
    '</div>';
    montar('cuenta', datos, html, foco);
  };

  /* El player: a pantalla completa, sin nada encima salvo la barra, que se
     esconde sola y vuelve al tocar el control. */
  PANTALLAS.reproducir = function (datos, foco) {
    var c = porSlug(datos.slug);
    var html = '<div class="tv-screen tv-player">' +
      '<div class="tv-pl-art gart ' + c.d + '"></div>' +
      '<div class="tv-pl-bar" id="plBar">' +
        '<div class="tv-pl-t">' + esc(c.t) + '<span>' + A.discLabel(c.d) +
          ' · con ' + esc(c.i) + '</span></div>' +
        '<div class="tv-pl-line"><i id="plProg"></i></div>' +
        '<div class="tv-pl-times"><span id="plNow">0:00</span>' +
          '<span>' + c.m + ':00</span></div>' +
        '<div class="tv-pl-cta">' +
          '<button class="tv-btn tv-btn-gold" data-foco data-inicial id="plPlay" ' +
            'data-accion="pausa"><span class="tv-play">▶</span>Reproducir</button>' +
          '<button class="tv-btn" data-foco data-accion="atras">Salir</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    montar('reproducir', datos, html, foco);
    arrancarPlayer(c);
  };

  var plTimer = null, plSeg = 0, plOculto = null;
  function arrancarPlayer(c) {
    var total = parseInt(c.m, 10) * 60;
    plSeg = 0;
    clearInterval(plTimer);
    var boton = document.getElementById('plPlay');
    var barra = document.getElementById('plBar');

    function pintar() {
      var p = document.getElementById('plProg');
      if (!p) { clearInterval(plTimer); return; }
      p.style.width = (plSeg / total * 100) + '%';
      document.getElementById('plNow').textContent =
        Math.floor(plSeg / 60) + ':' + ('0' + (plSeg % 60)).slice(-2);
    }
    function alternar() {
      if (plTimer) {
        clearInterval(plTimer); plTimer = null;
        boton.innerHTML = '<span class="tv-play">▶</span>Reproducir';
        mostrarBarra(true);
      } else {
        boton.innerHTML = '<span class="tv-play">❚❚</span>Pausa';
        plTimer = setInterval(function () {
          plSeg++;
          if (plSeg >= total) { plSeg = total; alternar(); }
          pintar();
        }, 1000);
        mostrarBarra();
      }
    }
    function mostrarBarra(fija) {
      clearTimeout(plOculto);
      barra.classList.remove('oculta');
      if (fija) return;
      plOculto = setTimeout(function () { barra.classList.add('oculta'); }, 4000);
    }
    boton.__alternar = alternar;
    document.addEventListener('foco', function reaparece() { mostrarBarra(); });
    document.addEventListener('keydown', function () {
      if (document.querySelector('.tv-player')) mostrarBarra();
    });
    pintar();
    alternar();
  }

  function porSlug(slug) {
    var todo = A.catalog();
    for (var i = 0; i < todo.length; i++) {
      if (todo[i].slug === slug || todo[i].t === slug) return todo[i];
    }
    return todo[0];
  }

  /* ------------------------------------------------------------- acciones */

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-accion], [data-nav]');
    if (!el) return;
    var nav = el.dataset.nav;
    if (nav) { ir(nav === 'home' ? 'home' : nav, {}, { reemplazar:true }); return; }

    switch (el.dataset.accion) {
      case 'clase':       ir('clase', { slug: el.dataset.slug }); break;
      case 'disciplina':  ir('disciplina', { d: el.dataset.d }); break;
      case 'reto':        ir('reto', { reto: el.dataset.reto }); break;
      case 'evento':      ir('evento', { ev: el.dataset.ev }); break;
      case 'coach':       ir('coach', { coach: el.dataset.coach }); break;
      case 'vista':       if (el.dataset.v !== 'tele') A.setVista(el.dataset.v); break;
      case 'reproducir':  ir('reproducir', { slug: el.dataset.slug }); break;
      case 'pausa':       if (el.__alternar) el.__alternar(); break;
      case 'favorito':    el.classList.toggle('activo');
                          el.textContent = el.classList.contains('activo') ? 'Guardada' : 'Guardar';
                          break;
      case 'entrar':      A.createAccount('Paulo'); A.join('anual'); ir('home', {}, { reemplazar:true }); break;
      case 'salir':       A.reset(); ir('cuenta', {}, { reemplazar:true }); break;
      case 'atras':       atras(); break;
    }
  });

  /* ------------------------------------------------------------ la barra */
  /* En una tele la navegación no se queda fija encima del contenido: estorba
     y tapa la fila de abajo. Se esconde al bajar y vuelve al enfocarla —
     pulsando arriba desde la primera fila — o al volver arriba del todo. */
  function ajustarNav() {
    var nav = document.querySelector('.tv-nav');
    if (!nav) return;
    var enNav = actual && actual.closest('.tv-nav');
    var enPlayer = !!document.querySelector('.tv-player');
    nav.classList.toggle('oculta', !enNav && (enPlayer || window.scrollY > 60));
  }
  document.addEventListener('foco', ajustarNav);
  window.addEventListener('scroll', ajustarNav, { passive:true });

  /* ---------------------------------------------------------------- inicio */

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('tvName').textContent = A.hasAccount() ? A.initials() : '—';
    ir('home', {}, { reemplazar:true });
  });
})();
