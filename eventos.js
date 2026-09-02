/* Utilidades compartidas por el listado de eventos y la página de detalle.
   Viven aquí para que las dos pantallas dibujen el mismo boleto. */

/* Confirmación ligera: el prototipo no habla con ningún calendario real. */
function addCal(e, el) {
  e.preventDefault();
  e.stopPropagation();
  var original = el.textContent;
  el.textContent = 'Agregado';
  setTimeout(function () { el.textContent = original; }, 1800);
}

/* QR de utilería: el patrón es determinista a partir del código, así que un
   mismo boleto siempre dibuja lo mismo y dos boletos distintos se ven
   distintos. No codifica nada: es una vista previa. */
function drawQr(seedText) {
  var N = 25, cell = 100 / N, rects = '';
  var seed = 0;
  for (var i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function inFinder(x, y) {
    return (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  }
  for (var y = 0; y < N; y++) {
    for (var x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.55) {
        rects += '<rect x="' + (x * cell).toFixed(2) + '" y="' + (y * cell).toFixed(2) +
                 '" width="' + cell.toFixed(2) + '" height="' + cell.toFixed(2) + '"/>';
      }
    }
  }
  function finder(ox, oy) {
    var u = cell;
    return '<rect x="' + (ox * u) + '" y="' + (oy * u) + '" width="' + (7 * u) + '" height="' + (7 * u) + '"/>' +
           '<rect x="' + ((ox + 1) * u) + '" y="' + ((oy + 1) * u) + '" width="' + (5 * u) + '" height="' + (5 * u) + '" fill="#fff"/>' +
           '<rect x="' + ((ox + 2) * u) + '" y="' + ((oy + 2) * u) + '" width="' + (3 * u) + '" height="' + (3 * u) + '"/>';
  }
  return '<svg viewBox="0 0 100 100" role="img" aria-label="Código QR del boleto">' +
    '<g fill="#1a1a1a">' + rects + finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7) + '</g></svg>';
}

function showTicket(ev, when, code) {
  document.getElementById('tkEv').innerHTML = ev;
  document.getElementById('tkWhen').textContent = when;
  document.getElementById('tkCode').textContent = code;
  document.getElementById('tkQr').innerHTML = drawQr(code);
  document.getElementById('tk').classList.add('open');
}
