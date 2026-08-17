/* Anyara prototype — shared behaviour.
   Renders the limited-time offer banner when the onboarding has set an expiry.
   Demo only: the countdown lives in localStorage, nothing is sent anywhere. */
(function () {
  var KEY = 'anyara_offer_expires';
  var raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { return; }
  if (!raw) return;

  var expires = parseInt(raw, 10);
  if (!expires || Date.now() >= expires) {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return;
  }

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
    if (left <= 0) {
      clearInterval(timer);
      remove();
      try { localStorage.removeItem(KEY); } catch (e) {}
      return;
    }
    var h = Math.floor(left / 3600),
        m = Math.floor((left % 3600) / 60),
        s = left % 60;
    clock.textContent = h + ':' + pad(m) + ':' + pad(s);
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function remove() {
    bar.remove();
    document.body.classList.remove('has-offerbar');
  }

  bar.querySelector('.ob-x').addEventListener('click', function () {
    clearInterval(timer);
    remove();
  });
})();
