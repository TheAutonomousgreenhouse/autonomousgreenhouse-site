(function () {
  'use strict';

  // ---- live-data seam ------------------------------------------------------
  // Everything below reads its numbers from getLiveSnapshot(). Right now it
  // returns the same simulated preview values as the original design.
  //
  // TODO: live data — once kas-server exposes a public, CORS-enabled,
  // read-only endpoint (e.g. GET /api/public/status), replace the body of
  // this function with a fetch() to that endpoint and keep the same return
  // shape. Nothing else on the page needs to change.
  let simTick = 0;
  function getLiveSnapshot() {
    const t = simTick;
    const temp = 23.8 + Math.sin(t / 6) * 2.6;
    const hum = 68 + Math.cos(t / 5) * 9;
    const open = temp > 24.5;
    const flap = open ? Math.min(22, Math.round((temp - 24.5) * 12)) : 0;
    const waterOn = (t % 30) > 22;
    return {
      temp: temp,
      hum: hum,
      roofOpen: open,
      flapAngle: flap,
      waterOn: waterOn,
    };
  }

  // ---- ticker ---------------------------------------------------------------
  function tickerItems(snap) {
    return [
      { k: 'temp_in', v: snap.temp.toFixed(1) + '°C' },
      { k: 'humidity', v: Math.round(snap.hum) + '%' },
      { k: 'roof_north', v: snap.roofOpen ? 'OPEN' : 'CLOSED' },
      { k: 'roof_south', v: snap.roofOpen ? 'OPEN' : 'CLOSED' },
      { k: 'valve_1', v: snap.waterOn ? 'WATERING (north bed)' : 'idle' },
      { k: 'weather_guard', v: 'armed · wind <50km/h' },
      { k: 'heartbeat', v: 'ok · failsafe 2h' },
      { k: 'ai_analysis', v: 'next run 00:00' },
    ];
  }

  function renderTicker(snap) {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    const items = tickerItems(snap);
    const twice = items.concat(items);
    track.innerHTML = twice.map(function (it) {
      return '<div class="ticker-item"><span class="k">' + it.k + '</span><span class="v">' + it.v + '</span></div>';
    }).join('');
  }

  // ---- live scene: metrics + SVG -------------------------------------------
  function renderScene(snap) {
    const elTemp = document.getElementById('metric-temp');
    const elHum = document.getElementById('metric-hum');
    const elRoof = document.getElementById('metric-roof');
    if (elTemp) elTemp.textContent = snap.temp.toFixed(1) + '°C';
    if (elHum) elHum.textContent = Math.round(snap.hum) + '%';
    if (elRoof) elRoof.textContent = snap.roofOpen ? 'venting' : 'closed';

    const flapNorth = document.getElementById('flap-north');
    const flapSouth = document.getElementById('flap-south');
    if (flapNorth) flapNorth.setAttribute('transform', 'rotate(' + (-snap.flapAngle) + ' 260 60)');
    if (flapSouth) flapSouth.setAttribute('transform', 'rotate(' + snap.flapAngle + ' 260 60)');

    const drip = document.getElementById('water-drip');
    const glow = document.getElementById('water-glow');
    if (drip) drip.setAttribute('opacity', snap.waterOn ? '1' : '0');
    if (glow) glow.setAttribute('fill', 'rgba(96,165,250,' + (snap.waterOn ? 0.22 : 0.04) + ')');
  }

  function tick() {
    const snap = getLiveSnapshot();
    renderTicker(snap);
    renderScene(snap);
    simTick += 1;
  }

  tick();
  setInterval(tick, 1200);

  // ---- signup: interest chips + Netlify Forms submit ------------------------
  var currentInterest = 'Build updates';

  function setInterest(row, interestInput, value) {
    currentInterest = value;
    if (interestInput) interestInput.value = value;
    row.querySelectorAll('.interest-chip').forEach(function (chip) {
      chip.classList.toggle('active', chip.getAttribute('data-interest') === value);
    });
  }

  function initSignup() {
    const row = document.getElementById('interest-row');
    const interestInput = document.getElementById('signup-interest');
    const emailInput = document.getElementById('signup-email');
    const submitBtn = document.getElementById('signup-submit');
    const form = document.getElementById('signup-form');
    const confirm = document.getElementById('signup-confirm');
    const confirmLine = document.getElementById('signup-confirm-line');
    const note = document.getElementById('signup-note');
    if (!row || !emailInput || !submitBtn || !form || !confirm) return;

    row.addEventListener('click', function (e) {
      const btn = e.target.closest('.interest-chip');
      if (!btn) return;
      setInterest(row, interestInput, btn.getAttribute('data-interest'));
    });

    document.querySelectorAll('.concept-cta').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setInterest(row, interestInput, btn.getAttribute('data-interest'));
        document.getElementById('signup').scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailInput.focus();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.focus();
        return;
      }
      submitBtn.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(function (res) {
        if (!res.ok) throw new Error('submit failed');
        confirmLine.textContent = 'Interest noted: ' + currentInterest + ' — you\'re on the list.';
        form.hidden = true;
        confirm.hidden = false;
      }).catch(function () {
        submitBtn.disabled = false;
        if (note) note.textContent = 'Something went wrong sending that — please try again in a moment.';
      });
    });
  }

  initSignup();
})();
