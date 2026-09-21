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
  var VERSION = '1.26.01';

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

  /* Corazón de favoritos. Va como SVG y no como el glifo ♡, que es
     puntiagudo: los lóbulos aquí son arcos de círculo, así que sale redondo.
     El relleno lo controla el CSS con .fav.on, no dos íconos distintos. */
  var HEART_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 20.4s-7.6-4.6-7.6-10.1a4.6 4.6 0 0 1 7.6-2.6 4.6 4.6 0 0 1 7.6 2.6' +
    'c0 5.5-7.6 10.1-7.6 10.1z" stroke-linejoin="round"/></svg>';

  /* Fotos por disciplina en img/. El nombre del archivo trae la disciplina,
     así que se asignan por nombre: nunca hace falta mirar el contenido.
     Se reparten rotando, para que dos tarjetas de la misma disciplina en la
     misma pantalla no salgan con la misma foto. */
  var ART = { barre:6, funcional:6, somara:6, sculpt:4, tone:3, pilates:2, anyara:4 };
  /* no hay fotos de Pilates a secas — las de Mat cubren ambas */
  var ART_ALIAS = { pilatesmat:'pilates' };

  /* Disciplinas: etiqueta y si ya tiene página propia. Sólo Somara la tiene
     por ahora — las demás siguen cayendo en el catálogo filtrado. */
  /* Disciplinas. Desde la llamada del 2 de septiembre las siete tienen página
     propia: hacer clic en una disciplina lleva a su portada — tráiler, clases
     recomendadas y filtros propios — y no al catálogo filtrado.
     `lead` es la línea que acompaña al pilar en la home. */
  var DISC = {
    barre:      { label:'Barre',       page:true, lead:'Precisión en la barra' },
    funcional:  { label:'Funcional',   page:true, lead:'Fuerza aplicada' },
    pilatesmat: { label:'Pilates Mat', page:true, lead:'La base de todo' },
    pilates:    { label:'Pilates',     page:true, lead:'Control y centro' },
    sculpt:     { label:'Sculpt',      page:true, lead:'Tono con peso' },
    somara:     { label:'Somara',      page:true, lead:'Movimiento somático' },
    tone:       { label:'Tone',        page:true, lead:'Constancia' }
  };

  /* Orden en que se muestran los pilares. Fijo, no alfabético: abre con las
     dos disciplinas insignia y cierra con las de mantenimiento. */
  var DISC_ORDER = ['barre','pilates','sculpt','somara','pilatesmat','funcional','tone'];

  /* Subcategorías por disciplina.
     Mariana lo pidió así en la llamada: la categorización depende de la
     disciplina — Barre y Pilates se navegan por "Tipo de clase", Somara por
     zona del cuerpo, y las de acondicionamiento por enfoque. Vive aquí y no
     en disciplina.html porque el catálogo también lo usa para su filtro de
     "Tipo de clase": una sola taxonomía para las dos pantallas. */
  var SUBS = {
    barre: { head:'Tipo de clase', subs:[
      { id:'esencial', n:'Esencial' },
      { id:'fuerza',   n:'Fuerza' },
      { id:'postura',  n:'Postura y centro' } ] },
    pilates: { head:'Tipo de clase', subs:[
      { id:'core',      n:'Centro y control' },
      { id:'espalda',   n:'Espalda sana' },
      { id:'movilidad', n:'Movilidad' } ] },
    pilatesmat: { head:'Tipo de clase', subs:[
      { id:'fundamentos', n:'Fundamentos' },
      { id:'core',        n:'Centro' },
      { id:'cierre',      n:'Cierre suave' } ] },
    sculpt: { head:'Tipo de clase', subs:[
      { id:'completo', n:'Cuerpo completo' },
      { id:'tren-inf', n:'Glúteos y piernas' },
      { id:'tren-sup', n:'Brazos y centro' } ] },
    somara: { head:'Por zona del cuerpo', subs:[
      { id:'espalda',  n:'Espalda y cuello' },
      { id:'caderas',  n:'Caderas y piernas' },
      { id:'completo', n:'Cuerpo completo' } ] },
    funcional: { head:'Enfoque', subs:[
      { id:'fuerza',      n:'Fuerza' },
      { id:'resistencia', n:'Resistencia' },
      { id:'movilidad',   n:'Movilidad' } ] },
    tone: { head:'Enfoque', subs:[
      { id:'fuerza',    n:'Fuerza ligera' },
      { id:'movilidad', n:'Movilidad' },
      { id:'calma',     n:'Calma' } ] }
  };

  /* Materiales. La instructora marca casillas en su formulario de carga y la
     página de clase arma estos íconos sola — nadie vuelve a escribir "necesitas
     tapete y una banda" a mano. La clave es la que viaja en la URL (?p=). */
  var PROPS = {
    ninguno: { n:'Sin equipo',
      svg:'<circle cx="12" cy="12" r="8.2"/><path d="M6.2 17.8 17.8 6.2"/>' },
    tapete:  { n:'Tapete',
      svg:'<rect x="2.6" y="7" width="18.8" height="10" rx="2.4"/><path d="M7.4 7v10"/><path d="M18 9.4a2.6 2.6 0 0 1 0 5.2"/>' },
    pesas:   { n:'Pesas',
      svg:'<path d="M3 9.6v4.8M6 7.6v8.8M18 7.6v8.8M21 9.6v4.8"/><path d="M6 12h12"/>' },
    banda:   { n:'Banda',
      svg:'<path d="M4.5 6.5c6 0 6 11 15 11"/><path d="M4.5 9.2c4.4 0 4.4 5.6 9.2 5.6"/>' },
    bloques: { n:'Bloques',
      svg:'<rect x="2.6" y="13.4" width="8.6" height="6" rx="1.6"/><rect x="12.8" y="4.6" width="8.6" height="6" rx="1.6"/>' },
    pelota:  { n:'Pelota',
      svg:'<circle cx="12" cy="12" r="8.4"/><path d="M3.9 9.4h16.2M3.9 14.6h16.2"/><path d="M12 3.6c-3 4.9-3 11.9 0 16.8M12 3.6c3 4.9 3 11.9 0 16.8"/>' },
    silla:   { n:'Silla',
      svg:'<path d="M6.4 3.6v9.2M17.6 3.6v9.2"/><path d="M5 12.8h14"/><path d="M7.6 12.8 6.6 20.4M16.4 12.8l1 7.6"/>' },
    toalla:  { n:'Toalla',
      svg:'<path d="M6.4 3.8h11.2v16.4H6.4z"/><path d="M9.4 3.8v16.4M6.4 8.2h11.2"/>' },
    cojin:   { n:'Cojín',
      svg:'<rect x="3.4" y="6.4" width="17.2" height="11.2" rx="4"/><path d="M7.2 9.4c2.4 2 7.2 2 9.6 0"/>' }
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
    goal:     'anyara_week_goal',
    charged:  'anyara_charged',  // one-shot: show the "day 3 charge" notice once
    vista:    'anyara_vista'     // prototipo: escritorio · telefono · tele
  };
  /* Instructoras: rol y bio para el bloque de la página de clase. Mismos
     nombres y cifras que coaches.html, para que no se contradigan. */
  /* `discs` son las disciplinas que imparte — se pintan como etiquetas en su
     perfil y cada una lleva a su página. `redes` es opcional por instructora:
     la que no tenga TikTok simplemente no lo llena y el ícono no se dibuja. */
  var INSTRUCTORS = {
    'Valeria Méndez': { rol:'Sculpt · Barre', art:'sculpt',
      cifras:'42 clases · 1,840 seguidoras',
      discs:['sculpt','barre'],
      redes:{ instagram:'#', tiktok:'#', whatsapp:'#' },
      bio:'Doce años enseñando barre y sculpt. Sus clases son cortas, precisas y sin relleno.' },
    'Sofía Ruiz':     { rol:'Funcional · Pilates', art:'funcional',
      cifras:'38 clases · 1,220 seguidoras',
      discs:['funcional','pilates','pilatesmat'],
      redes:{ instagram:'#', tiktok:'#' },
      bio:'Viene del entrenamiento funcional. Le importa que entiendas por qué haces cada movimiento.' },
    'Daniela Ortiz':  { rol:'Pilates Mat · Tone', art:'pilatesmat',
      cifras:'27 clases · 960 seguidoras',
      discs:['pilatesmat','tone','barre'],
      redes:{ instagram:'#', whatsapp:'#' },
      bio:'Especialista en trabajo de centro. Sus clases cortas están pensadas para días sin tiempo.' },
    'Renata Solís':   { rol:'Somara · Meditación', art:'somara',
      cifras:'19 clases · 780 seguidoras',
      discs:['somara'],
      redes:{ instagram:'#', tiktok:'#' },
      bio:'Trabaja movimiento somático y respiración. El ritmo lento es el punto, no una versión fácil.' },
    'Alina Prado':    { rol:'Somara · Movilidad', art:'tone',
      cifras:'11 clases · 430 seguidoras',
      discs:['somara','tone'],
      redes:{ instagram:'#' },
      bio:'Enfocada en movilidad y recuperación, para sostener la práctica sin lesionarse.' }
  };

  /* Íconos de redes. Sólo las tres que pidió Mariana: Instagram, TikTok y
     WhatsApp. Agregar otra es una entrada aquí y otra en `redes`. */
  var REDES = {
    instagram: { n:'Instagram',
      svg:'<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4"/><circle cx="12" cy="12" r="4.4"/>' +
          '<circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>' },
    tiktok:    { n:'TikTok',
      svg:'<path d="M14.2 3.2v11.3a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14.2 3.2a5.2 5.2 0 0 0 5.2 5.2"/>' },
    whatsapp:  { n:'WhatsApp',
      svg:'<path d="M3.4 20.6l1.3-4.3a8.3 8.3 0 1 1 3.2 3.1z"/>' +
          '<path d="M8.7 8.5c.4 2.7 2.2 4.5 4.9 4.9l1-1.3 1.9.9-.3 1.6c-2.9.6-6.7-3.2-6.1-6.1l1.6-.3z"/>' }
  };

  /* Descripción por disciplina. Antes la página mostraba el mismo texto de
     "Funcional HIIT" en cualquier clase; esto al menos describe lo correcto. */
  var DISC_ABOUT = {
    sculpt:'Trabajo de tonificación con peso ligero y muchas repeticiones. Buscas fatiga muscular controlada, no impacto.',
    barre:'Movimientos pequeños y precisos con apoyo en la barra. Fortalece piernas, glúteos y centro sin cargar las articulaciones.',
    funcional:'Patrones de movimiento de la vida diaria, a intensidad alta. Mejora fuerza, resistencia y capacidad cardiovascular.',
    pilates:'Control, respiración y trabajo profundo de centro. Precisión antes que velocidad.',
    pilatesmat:'Pilates en colchoneta, con tu propio peso. La base sobre la que se construye todo lo demás.',
    somara:'Movimiento somático: lento, consciente y sin impacto. Movilidad y respiración para soltar tensión acumulada.',
    tone:'Sesiones de tono general, de ritmo sostenido y baja carga. Buenas para mantener constancia.'
  };

  /* ---- catálogo ----
     Una sola lista para todo el sitio. Antes el catálogo de explorar.html
     estaba escrito a mano en HTML y las páginas de disciplina tenían su
     propia lista: al abrir las siete disciplinas eso dejaba 39 clases que
     existían en una pantalla y no en la otra. Ahora las dos leen de aquí.

     sub   · subcategoría dentro de su disciplina (ver SUBS)
     foco  · fuerza / movilidad / resistencia, el filtro de "Enfoque"
     props · material, con las mismas claves que PROPS
     date  · fecha de publicación; ordena el catálogo, más reciente primero */
  var CATALOG = [
    { slug:'barre-brazos', t:'Barre : Brazos y espalda', d:'barre', i:'Valeria Méndez', m:30, x:'Intermedio', sub:'fuerza', foco:'fuerza', props:'silla,tapete', date:'2026-03-30' },
    { slug:'barre-esencial', t:'Barre Esencial', d:'barre', i:'Valeria Méndez', m:20, x:'Principiante', sub:'esencial', foco:'fuerza', props:'silla', date:'2026-04-26', free:true },
    { slug:'barre-piernas', t:'Barre : Piernas largas', d:'barre', i:'Valeria Méndez', m:30, x:'Intermedio', sub:'fuerza', foco:'fuerza', props:'silla,tapete', date:'2026-05-28' },
    { slug:'barre-gluteos', t:'Barre Glúteos & Piernas', d:'barre', i:'Valeria Méndez', m:45, x:'Intermedio', sub:'fuerza', foco:'resistencia', props:'silla,tapete', date:'2026-06-18' },
    { slug:'barre-centro', t:'Barre : Centro', d:'barre', i:'Valeria Méndez', m:25, x:'Principiante', sub:'postura', foco:'movilidad', props:'silla,tapete', date:'2026-07-19' },
    { slug:'barre-express', t:'Barre : Express', d:'barre', i:'Valeria Méndez', m:20, x:'Principiante', sub:'esencial', foco:'fuerza', props:'silla,tapete', date:'2026-08-02' },
    { slug:'barre-postura', t:'Barre : Postura Perfecta', d:'barre', i:'Valeria Méndez', m:35, x:'Intermedio', sub:'postura', foco:'movilidad', props:'silla,tapete', date:'2026-08-22' },
    { slug:'func-express', t:'Funcional : Express', d:'funcional', i:'Sofía Ruiz', m:20, x:'Principiante', sub:'resistencia', foco:'resistencia', props:'ninguno', date:'2026-03-12' },
    { slug:'func-movilidad', t:'Funcional : Movilidad', d:'funcional', i:'Sofía Ruiz', m:20, x:'Principiante', sub:'movilidad', foco:'movilidad', props:'ninguno', date:'2026-04-18' },
    { slug:'func-potencia', t:'Funcional : Potencia', d:'funcional', i:'Sofía Ruiz', m:35, x:'Avanzado', sub:'fuerza', foco:'fuerza', props:'pesas', date:'2026-05-08' },
    { slug:'func-intervalos', t:'Funcional : Intervalos', d:'funcional', i:'Sofía Ruiz', m:25, x:'Intermedio', sub:'resistencia', foco:'resistencia', props:'ninguno', date:'2026-06-24' },
    { slug:'func-hiit', t:'Funcional HIIT', d:'funcional', i:'Sofía Ruiz', m:30, x:'Intermedio', sub:'resistencia', foco:'resistencia', props:'ninguno', date:'2026-07-02', serie:'Fuerza Total' },
    { slug:'func-fuerza', t:'Funcional : Fuerza Total', d:'funcional', i:'Sofía Ruiz', m:45, x:'Avanzado', sub:'fuerza', foco:'fuerza', props:'pesas', date:'2026-08-19' },
    { slug:'pilates-cierre', t:'Pilates : Cierre largo', d:'pilates', i:'Sofía Ruiz', m:25, x:'Principiante', sub:'movilidad', foco:'movilidad', props:'tapete,pelota', date:'2026-04-02' },
    { slug:'pilates-movilidad', t:'Pilates : Movilidad', d:'pilates', i:'Sofía Ruiz', m:25, x:'Intermedio', sub:'movilidad', foco:'movilidad', props:'tapete', date:'2026-05-15' },
    { slug:'pilates-espalda', t:'Pilates : Espalda sana', d:'pilates', i:'Sofía Ruiz', m:35, x:'Principiante', sub:'espalda', foco:'movilidad', props:'tapete,pelota', date:'2026-06-21' },
    { slug:'pilates-control', t:'Pilates : Control', d:'pilates', i:'Sofía Ruiz', m:30, x:'Principiante', sub:'core', foco:'fuerza', props:'tapete,pelota', date:'2026-07-08' },
    { slug:'pilates-core', t:'Core Profundo', d:'pilates', i:'Sofía Ruiz', m:40, x:'Avanzado', sub:'core', foco:'fuerza', props:'tapete,pelota', date:'2026-08-11', serie:'Core & Flexibilidad' },
    { slug:'pilates-avanzado', t:'Pilates : Core Avanzado', d:'pilates', i:'Sofía Ruiz', m:40, x:'Avanzado', sub:'core', foco:'fuerza', props:'tapete,pelota', date:'2026-08-25' },
    { slug:'mat-despierta', t:'Despierta el core', d:'pilatesmat', i:'Daniela Ortiz', m:15, x:'Principiante', sub:'core', foco:'fuerza', props:'tapete', date:'2026-03-04' },
    { slug:'mat-fundamental', t:'Pilates Mat Fundamental', d:'pilatesmat', i:'Daniela Ortiz', m:40, x:'Principiante', sub:'fundamentos', foco:'fuerza', props:'tapete', date:'2026-04-09', free:true, serie:'Core & Flexibilidad' },
    { slug:'mat-cierre', t:'Pilates Mat : Cierre', d:'pilatesmat', i:'Daniela Ortiz', m:20, x:'Principiante', sub:'cierre', foco:'movilidad', props:'tapete', date:'2026-05-20' },
    { slug:'mat-centro', t:'Pilates Mat : Centro firme', d:'pilatesmat', i:'Daniela Ortiz', m:25, x:'Intermedio', sub:'core', foco:'fuerza', props:'tapete', date:'2026-06-11' },
    { slug:'mat-precision', t:'Pilates Mat : Precisión', d:'pilatesmat', i:'Daniela Ortiz', m:30, x:'Intermedio', sub:'fundamentos', foco:'fuerza', props:'tapete', date:'2026-07-02' },
    { slug:'mat-larga', t:'Pilates Mat : Sesión larga', d:'pilatesmat', i:'Daniela Ortiz', m:40, x:'Intermedio', sub:'fundamentos', foco:'fuerza', props:'tapete', date:'2026-08-08' },
    { slug:'sculpt-brazos', t:'Sculpt Brazos & Core', d:'sculpt', i:'Valeria Méndez', m:45, x:'Intermedio', sub:'tren-sup', foco:'fuerza', props:'pesas', date:'2026-05-12', serie:'Fuerza Total' },
    { slug:'sculpt-total', t:'Sculpt Total', d:'sculpt', i:'Valeria Méndez', m:60, x:'Avanzado', sub:'completo', foco:'resistencia', props:'pesas,banda,tapete', date:'2026-05-30', serie:'Fuerza Total' },
    { slug:'sculpt-centro', t:'Sculpt : Centro y brazos', d:'sculpt', i:'Valeria Méndez', m:35, x:'Intermedio', sub:'tren-sup', foco:'fuerza', props:'pesas,banda,tapete', date:'2026-06-14' },
    { slug:'sculpt-express', t:'Sculpt : Express', d:'sculpt', i:'Valeria Méndez', m:20, x:'Principiante', sub:'completo', foco:'fuerza', props:'pesas,banda,tapete', date:'2026-07-05' },
    { slug:'sculpt-glut', t:'20 min · Sculpt : Glúteos', d:'sculpt', i:'Valeria Méndez', m:20, x:'Intermedio', sub:'tren-inf', foco:'fuerza', props:'pesas,tapete', date:'2026-08-17', serie:'Fuerza Total' },
    { slug:'sculpt-piernas', t:'Sculpt : Piernas de Acero', d:'sculpt', i:'Valeria Méndez', m:30, x:'Intermedio', sub:'tren-inf', foco:'fuerza', props:'pesas,banda,tapete', date:'2026-08-28' },
    { slug:'somara-movilidad', t:'Somara : Movilidad completa', d:'somara', i:'Renata Solís', m:30, x:'Intermedio', sub:'completo', foco:'movilidad', props:'tapete,bloques,cojin', date:'2026-06-09' },
    { slug:'somara-piernas', t:'Somara : Piernas ligeras', d:'somara', i:'Renata Solís', m:20, x:'Principiante', sub:'caderas', foco:'movilidad', props:'tapete,bloques,cojin', date:'2026-06-28' },
    { slug:'somara-caderas', t:'Somara : Caderas abiertas', d:'somara', i:'Renata Solís', m:25, x:'Intermedio', sub:'caderas', foco:'movilidad', props:'tapete,bloques,cojin', date:'2026-07-11', serie:'Core & Flexibilidad' },
    { slug:'somara-restaurativo', t:'Somara : Restaurativo', d:'somara', i:'Renata Solís', m:40, x:'Intermedio', sub:'completo', foco:'movilidad', props:'bloques,tapete', date:'2026-07-24' },
    { slug:'somara-cuello', t:'Somara : Cuello y hombros', d:'somara', i:'Renata Solís', m:15, x:'Principiante', sub:'espalda', foco:'movilidad', props:'tapete,bloques,cojin', date:'2026-07-30' },
    { slug:'somara-flow', t:'Somara : Flow', d:'somara', i:'Renata Solís', m:25, x:'Principiante', sub:'completo', foco:'movilidad', props:'tapete,bloques', date:'2026-08-05' },
    { slug:'somara-respiracion', t:'Somara : Respiración y Calma', d:'somara', i:'Renata Solís', m:18, x:'Principiante', sub:'completo', foco:'movilidad', props:'tapete,cojin', date:'2026-08-30' },
    { slug:'somara-espalda', t:'Somara : Espalda que respira', d:'somara', i:'Renata Solís', m:20, x:'Principiante', sub:'espalda', foco:'movilidad', props:'tapete,bloques,cojin', date:'2026-08-14', serie:'Core & Flexibilidad' },
    { slug:'tone-completo', t:'Tone Cuerpo Completo', d:'tone', i:'Alina Prado', m:30, x:'Intermedio', sub:'fuerza', foco:'fuerza', props:'banda,tapete', date:'2026-03-21' },
    { slug:'tone-calma', t:'Tone : Calma', d:'tone', i:'Alina Prado', m:20, x:'Principiante', sub:'calma', foco:'movilidad', props:'tapete', date:'2026-05-25' },
    { slug:'tone-ligero', t:'Tone : Ligero', d:'tone', i:'Alina Prado', m:20, x:'Principiante', sub:'fuerza', foco:'fuerza', props:'banda,tapete', date:'2026-06-02' },
    { slug:'tone-movilidad', t:'Tone : Movilidad diaria', d:'tone', i:'Alina Prado', m:25, x:'Principiante', sub:'movilidad', foco:'movilidad', props:'banda,tapete', date:'2026-07-16' },
    { slug:'tone-definicion', t:'Tone : Definición', d:'tone', i:'Alina Prado', m:40, x:'Intermedio', sub:'fuerza', foco:'resistencia', props:'banda,tapete', date:'2026-08-07' }
  ];

  /* Contenido de los retos. Vive aquí para que la página del reto y la de la
     clase cuenten lo mismo: al entrar a una clase de un reto hay que poder
     mostrar qué sigue mañana. */
  var RETOS = {
    volver: {
      t: 'Reto Volver a Ti',
      dias: [
        { d:'barre',     t:'Barre Esencial',  i:'Valeria Méndez', m:45 },
        { d:'sculpt',    t:'Sculpt Total',    i:'Valeria Méndez', m:60 },
        { d:'funcional', t:'Funcional HIIT',  i:'Sofía Ruiz',     m:30 }
      ]
    }
  };

  /* Eventos. Viven aquí y no en la página para que el listado y el detalle
     nunca se contradigan: events.html arma las tarjetas y evento.html abre
     el mismo objeto por id. "boleto" existe sólo si ya tienes lugar. */
  var EVENTS = [
    {
      id:'masterclass-barre', d:'barre',
      t:'Masterclass en vivo: Barre & Breathwork',
      i:'Valeria Méndez',
      dia:'24', mes:'ago', fechaLarga:'24 de agosto', hora:'19:00',
      lugar:'Estudio Anyara, CDMX', ciudad:'CDMX',
      formato:'Presencial · cupo limitado', cupo:'24 lugares',
      lead:'Una práctica en vivo que abre con trabajo de barra y cierra con una secuencia de respiración guiada.',
      desc:'Empezamos con barra clásica: piernas, glúteos y centro, con series cortas y mucha precisión. ' +
           'A la mitad bajamos el ritmo y entramos en trabajo de respiración guiada para soltar lo que se ' +
           'acumuló. La idea es salir fuerte, más suelta y con una cadencia que puedas llevarte al resto ' +
           'de la semana.',
      lleva:'Ropa cómoda y calcetines antiderrapantes. La barra y los props los pone el estudio.',
      boleto:{ code:'ANY-4KQ2-8817', detalle:'Fila A' }
    },
    {
      id:'retiro-volver', d:'funcional',
      t:'Retiro de fin de semana: Volver a Ti',
      i:'Mariana y Sofía Ruiz',
      dia:'07', mes:'sep', fechaLarga:'7 al 9 de septiembre', hora:'Todo el día',
      lugar:'Valle de Bravo', ciudad:'Valle de Bravo',
      formato:'Residencial · dos noches', cupo:'16 lugares',
      lead:'Tres días fuera de la ciudad para reiniciar la práctica sin prisa y sin pantallas.',
      desc:'Dos sesiones de movimiento al día, comida de estación y tiempo libre de verdad. ' +
           'Las mañanas son de trabajo funcional al aire libre y las tardes de somático y respiración. ' +
           'No hay nivel mínimo: el retiro se adapta a quien llega.',
      lleva:'Todo el equipo está incluido. Sólo traes ropa de movimiento y ganas de desconectarte.',
      boleto:{ code:'ANY-9RM5-2043', detalle:'2 personas' }
    },
    {
      id:'sculpt-sunset', d:'sculpt',
      t:'Sculpt Sunset: Flow & Strength',
      i:'Sofía Ruiz',
      dia:'18', mes:'sep', fechaLarga:'18 de septiembre', hora:'18:30',
      lugar:'Estudio Anyara, CDMX', ciudad:'CDMX',
      formato:'Presencial · cupo limitado', cupo:'20 lugares',
      lead:'Sculpt al atardecer: peso ligero, muchas repeticiones y un cierre largo de movilidad.',
      desc:'Una hora de tonificación con mancuernas ligeras y bandas, construida en bloques de tren ' +
           'inferior, tren superior y centro. Cerramos con quince minutos de movilidad para que al día ' +
           'siguiente puedas volver a entrenar.',
      lleva:'Tapete propio si lo prefieres. Las pesas y las bandas las pone el estudio.'
    },
    {
      id:'somara-luna', d:'somara',
      t:'Somara: sesión de luna llena',
      i:'Renata Solís',
      dia:'02', mes:'oct', fechaLarga:'2 de octubre', hora:'20:00',
      lugar:'Jardín Anyara, CDMX', ciudad:'CDMX',
      formato:'Presencial · al aire libre', cupo:'30 lugares',
      lead:'Movimiento somático lento, afuera y de noche. Sin impacto y sin prisa.',
      desc:'Una sesión pensada para cerrar el día: movilidad suave, respiración y quietud, con el ritmo ' +
           'lento como el punto y no como una versión fácil. Termina con diez minutos de descanso guiado.',
      lleva:'Una capa extra de ropa. El tapete y la cobija los pone el estudio.'
    },
    {
      id:'pilates-taller', d:'pilatesmat',
      t:'Taller de Pilates Mat: centro y control',
      i:'Daniela Ortiz',
      dia:'15', mes:'oct', fechaLarga:'15 de octubre', hora:'11:00',
      lugar:'Estudio Anyara, CDMX', ciudad:'CDMX',
      formato:'Presencial · taller de dos horas', cupo:'18 lugares',
      lead:'Dos horas para entender el trabajo de centro desde la base, sin correr.',
      desc:'Un taller, no una clase: paramos, corregimos y explicamos por qué cada movimiento hace lo que ' +
           'hace. Salimos con una secuencia corta que puedes repetir en casa cualquier día de la semana.',
      lleva:'Ropa ajustada para que se vea la postura. El tapete y los bloques los pone el estudio.'
    }
  ];

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

  /* segundos → m:ss, para las barras de los players de maqueta */
  function reloj(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

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

    /* La landing no es la app: no lleva barra de navegación ni pestañas,
       pero sí el wordmark y las fotos. Por eso estas dos salen del módulo. */
    /* ---- precios ----
       Estaban escritos a mano en membresia.html, en checkout.html y en la
       landing, y ya se habían desincronizado: la página de los tres días
       anunciaba una cifra y la de planes otra. Aquí viven una sola vez.
       `moneda` es el prefijo que se pinta; cámbialo y cambia en todas. */
    PRECIOS: {
      moneda:  '$',
      mensual: { mes:39,  anio:468 },
      anual:   { mes:29,  anio:349 },
      ahorro:  119,
      /* "$349" a partir del número, para no repetir el formato en cada página */
      fmt: function (n) { return '$' + n.toLocaleString('es-MX'); }
    },

    LOGO_SVG: LOGO_SVG,
    renderLogos: function () { renderLogos(); },

    RETOS: RETOS,
    INSTRUCTORS: INSTRUCTORS,
    REDES: REDES,
    /* Disciplinas que imparte de verdad: se deducen del catálogo, no de una
       lista escrita a mano, para que una etiqueta nunca lleve a una
       disciplina donde esa instructora no tiene ni una clase. `discs` queda
       como respaldo para quien todavía no tiene clases publicadas. */
    coachDiscs: function (nombre) {
      var vistos = {}, fuera = [];
      CATALOG.forEach(function (c) {
        if (c.i === nombre && !vistos[c.d]) { vistos[c.d] = 1; fuera.push(c.d); }
      });
      if (fuera.length) return fuera;
      var prof = INSTRUCTORS[nombre];
      return (prof && prof.discs) || [];
    },

    /* etiquetas de disciplina del perfil: cada una lleva a su página */
    coachTags: function (nombre) {
      return A.coachDiscs(nombre).map(function (d) {
        return '<a class="coach-tag ' + d + '" href="' +
          (A.discHref(d) || 'explorar.html?d=' + d) + '">' +
          '<span class="dot"></span>' + A.discLabel(d) + '</a>';
      }).join('');
    },
    /* redes de la instructora; devuelve '' si no llenó ninguna */
    coachSocials: function (nombre) {
      var prof = INSTRUCTORS[nombre];
      if (!prof || !prof.redes) return '';
      return Object.keys(REDES).filter(function (k) { return !!prof.redes[k]; })
        .map(function (k) {
          return '<a class="social" href="' + prof.redes[k] + '" target="_blank" rel="noopener"' +
            ' title="' + REDES[k].n + ' de ' + nombre + '"' +
            ' aria-label="' + REDES[k].n + ' de ' + nombre + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true">' + REDES[k].svg + '</svg></a>';
        }).join('');
    },
    discAbout: function (d) { return DISC_ABOUT[d] || ''; },

    /* Eventos: listado, uno por id, y el enlace al detalle. Las tarjetas y la
       página de detalle salen de aquí, así que no se pueden desincronizar. */
    events:     function () { return EVENTS.slice(); },
    event:      function (id) {
      for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === id) return EVENTS[i];
      return null;
    },
    eventHref:  function (id) { return 'evento.html?e=' + id; },
    myTickets:  function () { return EVENTS.filter(function (e) { return !!e.boleto; }); },
    /* clases de una instructora, del mismo catálogo que alimenta el resto
       del sitio: el perfil no puede listar clases que no existan */
    classesBy: function (nombre, n) {
      return A.catalog().filter(function (c) { return c.i === nombre; }).slice(0, n || 8);
    },

    /* recomendaciones: primero de la misma disciplina, luego el resto */
    suggest: function (disc, excludeTitle, n) {
      var todo = A.catalog();
      var same = todo.filter(function (c) { return c.d === disc && c.t !== excludeTitle; });
      var rest = todo.filter(function (c) { return c.d !== disc && c.t !== excludeTitle; });
      return same.concat(rest).slice(0, n || 4);
    },

    /* ---- materiales ----
       `p` viaja en la URL como "tapete,banda". Devuelve los chips con ícono
       que la página de clase pinta; lo desconocido se ignora en vez de
       romper, para que una clase mal etiquetada no rompa la página. */
    PROPS: PROPS,
    propList: function (p) {
      if (!p) return [];
      return String(p).split(',')
        .map(function (s) { return s.trim().toLowerCase(); })
        .filter(function (s) { return !!PROPS[s]; });
    },
    /* Material en la tarjeta, no sólo en la ficha. "Sin equipo" es el dato
       que decide si practicas hoy o no, y antes había que abrir la clase
       para verlo. Van como glifos pequeños, abajo a la derecha del arte,
       enfrente de la duración; máximo tres, para no volverlo una lista. */
    propGlyphs: function (p) {
      var list = A.propList(p);
      if (!list.length || (list.length === 1 && list[0] === 'ninguno')) {
        return '<span class="cprops cprops-none">Sin equipo</span>';
      }
      return '<span class="cprops">' + list.slice(0, 3).map(function (k) {
        return '<span class="cprop" title="' + PROPS[k].n + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + PROPS[k].svg + '</svg></span>';
      }).join('') + '</span>';
    },

    propChips: function (p) {
      var list = A.propList(p);
      if (!list.length) list = ['ninguno'];
      return '<ul class="props">' + list.map(function (k) {
        return '<li class="prop"><span class="prop-i">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + PROPS[k].svg + '</svg>' +
          '</span><span class="prop-n">' + PROPS[k].n + '</span></li>';
      }).join('') + '</ul>';
    },

    /* ---- enfoque ----
       Pedido en la llamada: además de la zona del cuerpo, poder filtrar por
       lo que la clase entrena. Son tres y no más a propósito. */
    /* Material típico de cada disciplina. Es el respaldo para cuando la clase
       no trae ?p= propio: mejor mostrar el equipo correcto de la disciplina
       que no mostrar nada. En producción esto lo manda el formulario de la
       instructora clase por clase y este mapa deja de usarse. */
    defaultProps: function (d) {
      var POR_DISC = {
        barre:      'silla,tapete',
        funcional:  'ninguno',
        pilates:    'tapete,pelota',
        pilatesmat: 'tapete',
        sculpt:     'pesas,banda,tapete',
        somara:     'tapete,bloques,cojin',
        tone:       'banda,tapete'
      };
      return POR_DISC[d] || 'tapete';
    },

    ENFOQUE: [
      { id:'fuerza',      n:'Fuerza' },
      { id:'movilidad',   n:'Movilidad' },
      { id:'resistencia', n:'Resistencia' }
    ],

    /* ---- tu semana en Anyara ----
       El calendario semanal que va en la home justo después de la biblioteca.
       Siete días, con la clase sugerida de cada uno y dos días de descanso.
       Es maqueta: el día de hoy sale del reloj del navegador, el plan no. */
    week: function () {
      var DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      var PLAN = [
        { disc:'sculpt',     t:'Sculpt : Glúteos',        i:'Valeria Méndez', m:20, x:'Intermedio' },
        { disc:'somara',     t:'Somara : Flow',           i:'Renata Solís',   m:25, x:'Principiante' },
        { disc:'barre',      t:'Barre : Postura Perfecta',i:'Valeria Méndez', m:35, x:'Intermedio' },
        { rest:true },
        { disc:'pilates',    t:'Core Profundo',           i:'Sofía Ruiz',     m:40, x:'Avanzado' },
        { disc:'funcional',  t:'Funcional HIIT',          i:'Sofía Ruiz',     m:30, x:'Intermedio' },
        { rest:true }
      ];
      /* la semana abre en lunes, así que el índice 0 es lunes y no domingo */
      var hoy = (new Date().getDay() + 6) % 7;
      var base = new Date();
      base.setDate(base.getDate() - hoy);
      return PLAN.map(function (d, i) {
        var fecha = new Date(base);
        fecha.setDate(base.getDate() + i);
        return {
          dia:   DIAS[fecha.getDay()],
          num:   fecha.getDate(),
          hoy:   i === hoy,
          pasado:i < hoy,
          rest:  !!d.rest,
          clase: d.rest ? null : d
        };
      });
    },

    /* catálogo completo, o sólo el de una disciplina; siempre ordenado de
       más reciente a más antiguo, que es como abre el catálogo */
    CATALOG: CATALOG,
    catalog: function (disc) {
      return CATALOG.filter(function (c) { return !disc || c.d === disc; })
                    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    },
    /* fecha corta "17 ago", para la línea de la tarjeta */
    fechaCorta: function (iso) {
      var MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      var p = iso.split('-');
      return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1];
    },
    /* La tarjeta de clase del sitio, en un solo lugar. La pintan el catálogo,
       las páginas de disciplina y el perfil de instructora, así que si cambia
       el diseño de la tarjeta cambia en las tres. */
    classCard: function (c, opts) {
      opts = opts || {};
      /* Ya no se marca lo bloqueado sino lo abierto: con 46 de 48 clases en
         membresía, el candado era lo primero que veía cualquiera que llegaba.
         Una tarjeta sin insignia se lee como "parte de la membresía" sin
         gritarlo, y "Gratis" vuelve a ser un premio y no una excepción. */
      var meta = c.i + (opts.fecha && c.date ? ' · ' + A.fechaCorta(c.date) : '');
      return '<a href="' + A.classHref({ t:c.t, i:c.i, d:c.d, m:c.m, x:c.x,
               p:c.props, free:c.free ? 1 : 0 }) + '" class="ccard"' +
        ' data-d="' + c.d + '" data-sub="' + (c.sub || '') + '"' +
        ' data-enfoque="' + (c.foco || '') + '" data-props="' + (c.props || '') + '"' +
        ' data-date="' + (c.date || '') + '">' +
        '<div class="art gart ' + c.d + '">' +
          (c.free ? '<span class="free">Gratis</span>' : '') +
          (opts.nuevo && c.date >= opts.nuevo ? '<span class="nuevo">Nuevo</span>' : '') +
          '<span class="len">' + c.m + ':00</span>' +
          A.propGlyphs(c.props) +
        '</div>' +
        '<div class="title">' + c.t + '</div>' +
        '<div class="meta">' + meta + '</div>' +
        '<div class="lvl">' + c.x + '</div>' +
        (c.serie ? '<div class="serie">Serie: <span class="serie-link" data-href="serie.html">' +
                   c.serie + '</span></div>' : '') +
        '<div class="tag disc-link" data-d="' + c.d + '">' +
          A.discLabel(c.d).toUpperCase() + '</div></a>';
    },

    DISC_ORDER: DISC_ORDER,
    SUBS: SUBS,
    /* encabezado y opciones de subcategoría de una disciplina; {} si no tiene */
    subsOf: function (d) { return SUBS[d] || { head:'', subs:[] }; },
    discLead: function (d) { return (DISC[d] && DISC[d].lead) || ''; },
    DISC: DISC,
    discLabel: function (d) { return (DISC[d] && DISC[d].label) || d; },
    /* null si esa disciplina todavía no tiene página propia */
    discHref: function (d) { return (DISC[d] && DISC[d].page) ? 'disciplina.html?d=' + d : null; },

    /* builds a clase.html link; pass free:1 o t3:N para el acceso, y x/p/v
       para que la página de clase muestre nivel, equipo y vistas propios */
    classHref: function (c) {
      var q = ['t=' + encodeURIComponent(c.t), 'i=' + encodeURIComponent(c.i),
               'd=' + c.d, 'm=' + c.m];
      if (c.x)    q.push('x=' + encodeURIComponent(c.x));
      if (c.p)    q.push('p=' + encodeURIComponent(c.p));
      if (c.v)    q.push('v=' + encodeURIComponent(c.v));
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

    /* objetivo semanal de días entrenados, editable desde la home */
    weekGoal: function () { return parseInt(get(K.goal) || '5', 10); },
    setWeekGoal: function (n) { set(K.goal, String(Math.max(1, Math.min(7, n)))); },

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
          '<button class="tr-skip" type="button">Saltar anuncio</button>' +
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

    /* ---- carrusel de retos y series ----
       Mismo formato grande en la home, en retos y en series, así que la
       mecánica vive aquí: desplaza de a una diapositiva, apaga la flecha que
       ya no lleva a nada y conecta el botón de play con el player de tráiler.
       Se le pasa el contenedor .ccar. */
    carousel: function (root) {
      if (!root) return;
      var track = root.querySelector('.ccar-track');
      var prev  = root.querySelector('.ccar-prev');
      var next  = root.querySelector('.ccar-next');
      if (!track) return;

      function paso() {
        var s = track.querySelector('.ccar-slide');
        return s ? s.getBoundingClientRect().width + 22 : track.clientWidth;
      }
      function estado() {
        if (!prev || !next) return;
        prev.disabled = track.scrollLeft < 4;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left:-paso(), behavior:'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: paso(), behavior:'smooth' }); });
      track.addEventListener('scroll', estado);
      window.addEventListener('resize', estado);
      estado();

      /* el play del tráiler no abre el reto: reproduce el avance ahí mismo */
      track.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.ccar-play');
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        var slide = b.closest('.ccar-slide');
        var disc = '';
        Object.keys(DISC).forEach(function (k) {
          if (!disc && slide.classList.contains(k)) disc = k;
        });
        A.trailer({
          kicker:  b.getAttribute('data-kicker') || 'Tráiler',
          titulo:  b.getAttribute('data-trailer'),
          disc:    disc || 'somara',
          segundos: 105
        });
      });
    },

    /* ---- player de tráiler compartido ----
       Mariana pidió botón de play en retos y series. En vez de copiar el
       markup del player a cada página, se arma aquí a demanda: cualquier
       página llama Anyara.trailer({...}) y obtiene el mismo reproductor que
       ya usan disciplina.html y tres-dias.html. Es maqueta: la barra avanza
       sola y no hay video detrás. */
    trailer: function (opts) {
      opts = opts || {};
      var largo = opts.segundos || 120;
      var viejo = document.getElementById('anyaraTrailer');
      if (viejo) viejo.remove();

      var el = document.createElement('div');
      el.className = 'vp-scrim open';
      el.id = 'anyaraTrailer';
      el.innerHTML =
        '<button class="vp-close" aria-label="Cerrar">✕</button>' +
        '<div class="vp">' +
          '<div class="vp-title"><span>' + (opts.kicker || 'Tráiler') + '</span>' +
            (opts.titulo || 'Anyara') + '</div>' +
          '<div class="vp-screen gart ' + (opts.disc || 'somara') + '">' +
            '<button class="vp-bigplay" aria-label="Reproducir">▶</button></div>' +
          '<div class="vp-bar">' +
            '<button class="vp-toggle" aria-label="Reproducir">▶</button>' +
            '<span class="t-now">0:00</span>' +
            '<div class="vp-timeline"><i></i></div>' +
            '<span>' + reloj(largo) + '</span>' +
            '<button class="vp-toggle" title="Pantalla completa">⛶</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(el);
      paintArt();

      var seg = 0, timer = null;
      var barra = el.querySelector('.vp-timeline > i');
      var ahora = el.querySelector('.t-now');
      var big   = el.querySelector('.vp-bigplay');
      var play  = el.querySelector('.vp-bar .vp-toggle');

      function pintar() {
        barra.style.width = (seg / largo * 100) + '%';
        ahora.textContent = reloj(seg);
      }
      function alternar() {
        if (timer) { clearInterval(timer); timer = null; big.textContent = '▶'; play.textContent = '▶'; return; }
        big.textContent = '❚❚'; play.textContent = '❚❚';
        timer = setInterval(function () {
          seg++;
          if (seg >= largo) { seg = largo; alternar(); }
          pintar();
        }, 1000);
      }
      function cerrar() {
        if (timer) clearInterval(timer);
        el.remove();
        document.removeEventListener('keydown', esc);
      }
      function esc(e) { if (e.key === 'Escape') cerrar(); }

      big.addEventListener('click', alternar);
      play.addEventListener('click', alternar);
      el.querySelector('.vp-close').addEventListener('click', cerrar);
      /* clic en el fondo cierra; clic dentro del player, no */
      el.addEventListener('click', function (e) { if (e.target === el) cerrar(); });
      document.addEventListener('keydown', esc);

      pintar();
      alternar();
      return { close: cerrar };
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

    /* La tele no usa nada de este armazón: no hay barra de navegación con
       enlaces, ni pestañas, ni "saltar al contenido", porque ahí no hay ni
       ratón ni teclado — se navega moviendo el foco con el control. tv.html
       se marca con data-no-chrome y arma lo suyo en tv.js. Las fotos sí se
       comparten, que para eso está paintArt arriba. */
    if (document.documentElement.hasAttribute('data-no-chrome')) return;

    paintFavs();
    makeFocusable();
    addSkipLink();
    fitCompGrids();
    renderLogos();
    renderNav();
    renderVersion();
    renderVista();
    renderTabBar();
    if (A.vista() === 'telefono') montarMarco();
    renderChargeNotice();
  });

  /* Varias piezas interactivas se escribieron como <div> o <span>: las
     píldoras del catálogo, los chips de búsqueda y las etiquetas de
     disciplina y serie. Con ratón funcionan; con teclado o con el control
     del Apple TV no existen, porque no reciben foco. Esto las vuelve
     alcanzables sin tener que reescribir el HTML de veinte páginas. */
  function makeFocusable() {
    var SELECTORES = '.pill, .chip, .disc-link, .serie-link, .subchip, .dp-save';
    document.querySelectorAll(SELECTORES).forEach(function (el) {
      if (el.tabIndex >= 0) return;                 /* ya es enfocable */
      var nativo = /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
      el.tabIndex = 0;
      if (!nativo && !el.getAttribute('role')) el.setAttribute('role', 'button');
      if (nativo) return;
      /* Enter y Espacio hacen lo mismo que el clic, que es lo que espera
         cualquiera que navegue sin ratón */
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        el.click();
      });
    });
  }
  A.makeFocusable = makeFocusable;
  window.addEventListener('load', makeFocusable);

  /* Primer elemento enfocable de cada página: saltarse la navegación. Se
     inyecta aquí para no repetirlo en cada archivo. */
  function addSkipLink() {
    if (document.querySelector('.skip-link')) return;
    var main = document.querySelector('.wrap, main, .hero-carousel');
    if (!main) return;
    if (!main.id) main.id = 'contenido';
    var a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#' + main.id;
    a.textContent = 'Saltar al contenido';
    document.body.insertBefore(a, document.body.firstChild);
  }

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
      var b = art.querySelector('.fav');
      if (b && b.querySelector('svg')) return;      /* ya quedó listo */

      /* si la página trae el botón vacío, lo rellenamos; si no, lo creamos */
      var esNuevo = !b;
      if (esNuevo) {
        b = document.createElement('button');
        b.className = 'fav';
        b.type = 'button';
      }
      b.setAttribute('aria-label', 'Guardar en favoritos');
      b.innerHTML = HEART_SVG;
      b.addEventListener('click', function (e) {
        /* la tarjeta entera es un <a>: sin esto, guardar te saca a la clase */
        e.preventDefault();
        e.stopPropagation();
        b.classList.toggle('on');                   /* el relleno lo hace el CSS */
      });
      if (esNuevo) art.appendChild(b);
    });
  }
  A.paintFavs = paintFavs;
  window.addEventListener('load', paintFavs);

  /* Un listado de retos o series sólo se justifica en parrilla 4:5 cuando hay
     suficientes. Con 4 o menos se expanden a lo ancho de la fila. */
  function fitCompGrids() {
    document.querySelectorAll('.comp-grid').forEach(function (g) {
      var n = g.querySelectorAll('.compcard').length;
      if (n > 0 && n <= 4) {
        g.classList.add('wide');
        g.style.setProperty('--cols', n);
      } else {
        g.classList.remove('wide');
      }
    });
  }
  A.fitCompGrids = fitCompGrids;
  window.addEventListener('load', fitCompGrids);

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

  /* ---- barra de pestañas del teléfono ----
     En el teléfono la navegación de arriba no se alcanza con el pulgar, así
     que baja. Cinco destinos, los mismos del menú de escritorio menos Series,
     que vive dentro de Retos, más el perfil, que arriba era el avatar.
     Se inyecta desde aquí para no repetir markup en veinticuatro páginas; el
     CSS decide si se ve (sólo ≤767px), no el JS, para que al girar el
     teléfono o cambiar de tamaño no haya que volver a pintar nada. */
  function renderTabBar() {
    if (document.getElementById('tabBar')) return;
    /* Los flujos de pantalla completa no llevan pestañas: onboarding,
       checkout, la clase de bienvenida y el player son de una sola vía, y
       ofrecer una salida a "Eventos" a media compra es invitarse a perderla. */
    var SIN_PESTANAS = ['onboarding.html', 'checkout.html', 'bienvenida.html',
                        'completada.html', 'landing.html'];
    if (SIN_PESTANAS.indexOf(location.pathname.split('/').pop()) > -1) return;

    var ICONOS = {
      inicio:  '<path d="M3.6 10.2 12 3.6l8.4 6.6"/><path d="M5.6 9v10.4h12.8V9"/>',
      buscar:  '<circle cx="11" cy="11" r="6.6"/><path d="M15.8 15.8 20.4 20.4"/>',
      retos:   '<path d="M12 3.4l2.5 5.6 6.1.6-4.6 4.1 1.3 6-5.3-3.1-5.3 3.1 1.3-6L3.4 9.6l6.1-.6z"/>',
      eventos: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.6"/>' +
               '<path d="M3.4 10h17.2M8.4 3.2v4M15.6 3.2v4"/>'
    };
    var TABS = [
      { href:'index.html',    n:'Para ti',  i:'inicio' },
      { href:'explorar.html', n:'Explorar', i:'buscar' },
      { href:'retos.html',    n:'Retos',    i:'retos' },
      { href:'events.html',   n:'Eventos',  i:'eventos' }
    ];
    /* la página actual se marca por nombre de archivo; series.html y
       serie.html cuentan como Retos, y las de clase como Explorar */
    var aqui = (location.pathname.split('/').pop() || 'index.html');
    var EQUIV = {
      'series.html':'retos.html', 'serie.html':'retos.html', 'reto.html':'retos.html',
      'clase.html':'explorar.html', 'disciplina.html':'explorar.html',
      'coach.html':'explorar.html', 'coaches.html':'explorar.html',
      'evento.html':'events.html', 'biblioteca.html':'index.html'
    };
    var activo = EQUIV[aqui] || aqui;

    var bar = document.createElement('nav');
    bar.className = 'tabbar';
    bar.id = 'tabBar';
    bar.setAttribute('aria-label', 'Navegación principal');
    bar.innerHTML = '<div class="tabbar-in">' +
      TABS.map(function (t) {
        return '<a class="tab' + (t.href === activo ? ' on' : '') + '" href="' + t.href + '"' +
          (t.href === activo ? ' aria-current="page"' : '') + '>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[t.i] + '</svg>' +
          '<span>' + t.n + '</span></a>';
      }).join('') +
      /* La quinta pestaña es el perfil, y sólo existe si hay cuenta — igual
         que en escritorio, donde el avatar aparece cuando hay cuenta y en su
         lugar sale el botón "Empezar" en la barra de arriba. Sin cuenta la
         barra se queda en cuatro: una pestaña que no es un destino sino una
         llamada a la acción no pertenece aquí. */
      (A.hasAccount()
        ? '<a class="tab' + (aqui === 'profile.html' ? ' on' : '') + '" href="profile.html">' +
          '<span class="tab-av">' + A.initials() + '</span><span>Perfil</span></a>'
        : '') +
      '</div>';
    bar.classList.add(A.hasAccount() ? 'tabs-5' : 'tabs-4');
    document.body.appendChild(bar);
  }

  /* ---- selector de vista (sólo prototipo) ----
     Anyara se va a poder ver en tres sitios: la web de escritorio, la app de
     teléfono y la tele. Son tres maquetaciones distintas, no una que se
     encoge, así que para revisarlas hay que poder saltar entre ellas sin
     cambiar de dispositivo. Este control es nuestro, no del producto: va
     marcado como prototipo para que no se confunda con una sección.

     Las pantallas de trabajo — sistema de diseño, formulario de material —
     se movieron a Ajustes, que es donde corresponde. */
  var VISTAS = {
    escritorio: { n:'Web de escritorio', d:'El sitio como se ve en una computadora' },
    telefono:   { n:'App de teléfono',   d:'La maquetación del móvil, en un marco de 390×844' },
    tele:       { n:'Apple TV',          d:'La versión de tele, con la cruceta' }
  };
  A.vista = function () { return get(K.vista) || 'escritorio'; };
  A.setVista = function (v) {
    if (v === 'tele') { set(K.vista, 'escritorio'); location.href = 'tv.html'; return; }
    set(K.vista, v);
    location.reload();
  };

  function renderVista() {
    /* dentro del marco del teléfono no se pinta: el control vive fuera */
    if (window.self !== window.top) return;
    var nav = document.querySelector('.nav-links');
    if (!nav || document.getElementById('vistaMenu')) return;

    var actual = A.vista();
    var box = document.createElement('div');
    box.className = 'proto';
    box.id = 'vistaMenu';
    box.innerHTML =
      '<button type="button" class="proto-b" aria-expanded="false">' +
        '<span class="proto-tag">Prototipo</span>' +
        '<span class="proto-v">' + VISTAS[actual].n + '</span>' +
        '<span class="proto-ch">▾</span>' +
      '</button>' +
      '<div class="proto-m" hidden>' +
        '<div class="proto-h">Ver Anyara como</div>' +
        Object.keys(VISTAS).map(function (k) {
          return '<button type="button" class="proto-o' + (k === actual ? ' on' : '') + '" ' +
            'data-vista="' + k + '">' +
            '<span class="proto-o-n">' + VISTAS[k].n + '</span>' +
            '<span class="proto-o-d">' + VISTAS[k].d + '</span></button>';
        }).join('') +
        '<a class="proto-a" href="profile.html#prototipo">Pantallas de trabajo →</a>' +
      '</div>';
    nav.appendChild(box);

    var b = box.querySelector('.proto-b');
    var m = box.querySelector('.proto-m');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var abierto = !m.hidden;
      m.hidden = abierto;
      b.setAttribute('aria-expanded', String(!abierto));
    });
    m.addEventListener('click', function (e) {
      var o = e.target.closest('.proto-o');
      if (!o) return;
      A.setVista(o.dataset.vista);
    });
    document.addEventListener('click', function () {
      m.hidden = true;
      b.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { m.hidden = true; b.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* La vista de teléfono no se puede simular con CSS: las media queries miran
     el ancho de la ventana, no el de una caja. Lo que sí tiene su propio
     ancho es un iframe, así que la página se carga dentro de uno de 390px y
     las mismas media queries de siempre hacen su trabajo. Nada de una
     segunda hoja de estilos que se pueda desincronizar. */
  function montarMarco() {
    if (window.self !== window.top) return;      /* ya estamos dentro */
    var stage = document.createElement('div');
    stage.className = 'vista-stage';
    stage.innerHTML =
      '<div class="vista-bar">' +
        '<span class="proto-tag">Prototipo</span>' +
        '<span class="vista-t">App de teléfono · 390 × 844</span>' +
        '<button type="button" class="vista-x">Volver a la web de escritorio</button>' +
      '</div>' +
      '<div class="vista-phone">' +
        /* barra de estado: el recorte vive aquí y no encima de la página,
           igual que en un teléfono de verdad */
        '<div class="vista-status">' +
          '<span>9:41</span>' +
          '<span class="vista-notch"></span>' +
          '<span class="vista-icons">▮▮▮ ▮</span>' +
        '</div>' +
        '<iframe title="Anyara en teléfono" src="' + location.pathname + location.search + '"></iframe>' +
      '</div>';
    document.documentElement.classList.add('en-marco');
    document.body.appendChild(stage);
    stage.querySelector('.vista-x').addEventListener('click', function () {
      A.setVista('escritorio');
    });
  }

  /* small grey version tag next to the wordmark  /* small grey version tag next to the wordmark, so redeploys are visible at a glance */
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
      /* Mariana lo pidió junto a la lupa: quien está en la prueba tiene que
         poder abrir todo el catálogo sin esperar al día 2 y al día 3, y sin
         ir a buscar la salida al fondo de tres-dias.html. */
      if (lvl === 2) {
        var skip = document.createElement('a');
        skip.className = 'nav-skip';
        skip.href = 'checkout.html?plan=anual&saltar=1';
        skip.textContent = 'Saltar prueba';
        skip.title = 'Abre el catálogo completo hoy, sin esperar los tres días';
        var lupa = right.querySelector('.icon-btn');
        if (lupa) lupa.insertAdjacentElement('beforebegin', skip);
        else right.insertBefore(skip, right.firstChild);
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
