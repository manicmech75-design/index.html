// Flip City — Builder Edition (All Updates)
// - NO offline income (no catch-up, pauses when hidden)
// - Activity Meter: "Collect Revenue" fills while visible; collect only when full
// - Skyline reacts to buildings
// - Manual Save/Load (optional)
// Support: cityflipsupport@gmail.com

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) return console.error("❌ Missing <div id='game'></div> in index.html");

  const SUPPORT_EMAIL = "cityflipsupport@gmail.com";
  const SAVE_KEY = "flipcity_save_v1";

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const fmtInt = (n) => Math.floor(n).toLocaleString();

  // -------------------- State --------------------
  const state = {
    money: 0,
    rps: 1,

    // Buildings
    buildings: {
      homes: 0,     // +2 rps each
      shops: 0,     // +5 rps each
      offices: 0,   // +10 rps each
    },

    // Activity meter (fills while visible)
    meter: {
      progress: 0,          // 0..1
      fillSeconds: 12,      // time to fill while visible
      reward: 15,           // money gained when collected
    },

    running: true,
    lastTick: performance.now(),
  };

  function recalcRps() {
    state.rps =
      1 +
      state.buildings.homes * 2 +
      state.buildings.shops * 5 +
      state.buildings.offices * 10;
  }

  // -------------------- Styles --------------------
  const style = document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }

    body{
      min-height:100vh;
      background:
        radial-gradient(900px 450px at 50% 0%, rgba(255,160,110,.55), transparent 60%),
        linear-gradient(to top, #0b1220 0%, #1a2b4c 40%, #ff915e 100%);
      color:#eaf0ff;
    }

    .wrap{ max-width:1020px; margin:0 auto; padding:20px; }
    .top{ display:flex; gap:12px; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; }
    h1{ font-size:24px; margin:0; letter-spacing:.3px; }
    .sub{ opacity:.85; font-size:13px; margin-top:4px; }

    .grid{ display:grid; grid-template-columns: 1.15fr .85fr; gap:14px; margin-top:14px; }
    @media (max-width: 920px){ .grid{ grid-template-columns:1fr; } }

    .card{
      background: rgba(0,0,0,.35);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 12px 30px rgba(0,0,0,.35);
    }

    .row{ display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
    .stat{ font-size:16px; }
    .stat b{ font-variant-numeric: tabular-nums; }

    .pill{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,.10);
      border: 1px solid rgba(255,255,255,.08);
      font-size: 13px;
      opacity:.95;
      user-select:none;
    }

    button{
      background: linear-gradient(180deg,#6aa8ff,#3b6cff);
      color:#fff;
      border:0;
      border-radius: 12px;
      padding: 10px 14px;
      font-size:14px;
      cursor:pointer;
      box-shadow: 0 10px 24px rgba(0,0,0,.35);
      user-select:none;
    }
    button:disabled{ opacity:.45; cursor:not-allowed; }

    .btnRow{ display:flex; gap:10px; flex-wrap:wrap; }

    /* Meter */
    .meterWrap{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .bar{
      width: 260px;
      max-width: 100%;
      height: 12px;
      background: rgba(255,255,255,.12);
      border-radius: 999px;
      overflow:hidden;
      border: 1px solid rgba(255,255,255,.08);
    }
    .bar > i{
      display:block;
      height:100%;
      width:0%;
      background: linear-gradient(90deg, rgba(255,220,170,.9), rgba(120,200,255,.9));
    }
    .tiny{ opacity:.75; font-size:12px; }

    /* Shop list */
    .shop{
      display:grid;
      grid-template-columns: 1fr auto;
      gap:10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.08);
      margin-top: 10px;
    }
    .shop .name{ font-weight:700; }
    .shop .desc{ opacity:.8; font-size:12px; margin-top:3px; }
    .shop .cost{ font-size:12px; opacity:.8; margin-top:4px; }

    /* Skyline preview */
    .sky{
      position:relative;
      height:160px;
      border-radius: 12px;
      overflow:hidden;
      background:
        linear-gradient(to top, rgba(11,18,32,1) 0%, rgba(26,43,76,1) 55%, rgba(255,145,94,1) 100%);
      border: 1px solid rgba(255,255,255,.10);
    }
    .sun{
      position:absolute; left:10%; top:14%;
      width:68px; height:68px; border-radius:50%;
      background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.9), rgba(255,220,170,.6) 35%, rgba(255,160,110,.15) 70%, transparent 72%);
      opacity:.95;
    }
    .layer{
      position:absolute; left:0; right:0; bottom:0;
      background: linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.12) 60%, transparent);
      display:flex;
      align-items:flex-end;
      gap:6px;
      padding: 0 10px 10px;
    }
    .b{
      width: 22px;
      border-radius: 4px 4px 0 0;
      background: rgba(0,0,0,.65);
      border: 1px solid rgba(255,255,255,.06);
      position:relative;
      overflow:hidden;
    }
    .b:after{
      content:"";
      position:absolute; inset:0;
      background:
        repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 6px,
          rgba(255,210,140,.20) 6px,
          rgba(255,210,140,.20) 7px
        );
      mix-blend-mode: screen;
      opacity:.6;
      transform: translateY(2px);
    }

    details{
      margin-top: 10px;
      border-radius: 12px;
      overflow:hidden;
      border: 1px solid rgba(255,255,255,.10);
      background: rgba(0,0,0,.25);
    }
    summary{
      cursor:pointer;
      padding: 10px 12px;
      user-select:none;
      font-weight:700;
      list-style:none;
    }
    details > div{ padding: 10px 12px 12px; }
    .helpLine{ opacity:.85; font-size:13px; line-height:1.35; }

    footer{
      opacity:.72;
      font-size:12px;
      text-align:center;
      margin: 18px 0 4px;
      line-height: 1.4;
    }

    a { color: #a9c7ff; }
  `;
  document.head.appendChild(style);

  // -------------------- UI --------------------
  root.innerHTML = `
    <div class="wrap">
      <div class="top">
        <div>
          <h1>🌆 Flip City</h1>
          <div class="sub">Builder Edition · Money only earns while this tab is open & visible</div>
        </div>
        <div class="pill" id="statusPill">🟢 Earning</div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="row">
            <div class="stat">💰 Money: <b>$<span id="money">0</span></b></div>
            <div class="stat">📈 Revenue: <b>$<span id="rps">1</span></b>/sec</div>
          </div>

          <div style="height:10px"></div>

          <div class="meterWrap">
            <div class="pill">⚡ Activity Meter</div>
            <div class="bar" title="Fills while visible. Collect only when full."><i id="meterFill"></i></div>
            <button id="collectRevenueBtn" disabled>Collect Revenue +$<span id="meterReward">15</span></button>
            <div class="tiny" id="meterHint">Filling…</div>
          </div>

          <div style="height:12px"></div>

          <div class="btnRow">
            <button id="saveBtn">Save City</button>
            <button id="loadBtn">Load City</button>
            <button id="resetBtn" title="Resets your save + current session.">Reset</button>
          </div>

          <details>
            <summary>Help & Rules</summary>
            <div class="helpLine">
              • Earnings pause when you switch tabs (no catch-up).<br>
              • Activity Meter fills only while visible; you can collect only when it’s full.<br>
              • Save/Load stores your current city state (still no offline earnings).<br>
              • Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
            </div>
          </details>

          <div style="height:6px"></div>

          <div class="shop" id="buyHomes">
            <div>
              <div class="name">🏠 Add Homes (+2/sec)</div>
              <div class="desc">Starter neighborhoods.</div>
              <div class="cost">Cost: $<span id="costHomes">50</span></div>
            </div>
            <button id="btnHomes">Buy</button>
          </div>

          <div class="shop" id="buyShops">
            <div>
              <div class="name">🏪 Add Shops (+5/sec)</div>
              <div class="desc">Local commerce boosts revenue.</div>
              <div class="cost">Cost: $<span id="costShops">150</span></div>
            </div>
            <button id="btnShops">Buy</button>
          </div>

          <div class="shop" id="buyOffices">
            <div>
              <div class="name">🏢 Add Offices (+10/sec)</div>
              <div class="desc">Big productivity, bigger payout.</div>
              <div class="cost">Cost: $<span id="costOffices">400</span></div>
            </div>
            <button id="btnOffices">Buy</button>
          </div>

          <div class="tiny" style="margin-top:10px;">
            Tip: switching tabs pauses earnings (no catch-up).
          </div>
        </div>

        <div class="card">
          <div class="row" style="align-items:flex-end">
            <div>
              <div style="font-weight:700; margin-bottom:6px;">City Preview</div>
              <div class="sub">Sunset skyline (reacts to your buildings)</div>
            </div>
            <div class="pill" id="cityCounts">🏠 0 · 🏪 0 · 🏢 0</div>
          </div>

          <div style="height:10px"></div>

          <div class="sky">
            <div class="sun"></div>
            <div class="layer" id="skyLayer"></div>
          </div>
        </div>
      </div>

      <footer>
        Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
      </footer>
    </div>
  `;

  const moneyEl = document.getElementById("money");
  const rpsEl = document.getElementById("rps");
  const statusPill = document.getElementById("statusPill");

  const meterFillEl = document.getElementById("meterFill");
  const meterHintEl = document.getElementById("meterHint");
  const meterRewardEl = document.getElementById("meterReward");
  const collectRevenueBtn = document.getElementById("collectRevenueBtn");

  const saveBtn = document.getElementById("saveBtn");
  const loadBtn = document.getElementById("loadBtn");
  const resetBtn = document.getElementById("resetBtn");

  const costHomesEl = document.getElementById("costHomes");
  const costShopsEl = document.getElementById("costShops");
  const costOfficesEl = document.getElementById("costOffices");

  const btnHomes = document.getElementById("btnHomes");
  const btnShops = document.getElementById("btnShops");
  const btnOffices = document.getElementById("btnOffices");

  const cityCounts = document.getElementById("cityCounts");
  const skyLayer = document.getElementById("skyLayer");

  // -------------------- Pricing --------------------
  function costHomes()   { return 50  + state.buildings.homes   * 25; }
  function costShops()   { return 150 + state.buildings.shops   * 60; }
  function costOffices() { return 400 + state.buildings.offices * 140; }

  // -------------------- Save/Load --------------------
  function saveGame() {
    const data = {
      money: state.money,
      buildings: state.buildings,
      meterReward: state.meter.reward,
      meterFillSeconds: state.meter.fillSeconds,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return false;

      state.money = Number(data.money || 0);
      state.buildings = {
        homes: Number(data.buildings?.homes || 0),
        shops: Number(data.buildings?.shops || 0),
        offices: Number(data.buildings?.offices || 0),
      };
      state.meter.reward = Number(data.meterReward || 15);
      state.meter.fillSeconds = Number(data.meterFillSeconds || 12);

      // IMPORTANT: do NOT load meter progress; keep it fair and online-only
      state.meter.progress = 0;

      recalcRps();
      return true;
    } catch {
      return false;
    }
  }

  // -------------------- Rendering --------------------
  function renderSkyline() {
    const total =
      state.buildings.homes +
      state.buildings.shops +
      state.buildings.offices;

    cityCounts.textContent = `🏠 ${state.buildings.homes} · 🏪 ${state.buildings.shops} · 🏢 ${state.buildings.offices}`;

    // Create a simple skyline based on counts
    skyLayer.innerHTML = "";

    const makeBuildings = (count, minH, maxH, width) => {
      for (let i = 0; i < count; i++) {
        const d = document.createElement("div");
        d.className = "b";
        const h = minH + Math.random() * (maxH - minH);
        d.style.height = `${h}px`;
        d.style.width = `${width}px`;
        d.style.opacity = `${0.55 + Math.random() * 0.25}`;
        skyLayer.appendChild(d);
      }
    };

    // If nothing built yet, show a few starter silhouettes
    if (total === 0) {
      makeBuildings(12, 35, 90, 20);
      return;
    }

    // More homes = shorter buildings
    makeBuildings(Math.max(8, state.buildings.homes * 4), 30, 85, 18);

    // Shops = medium
    makeBuildings(Math.max(4, state.buildings.shops * 3), 55, 120, 22);

    // Offices = tall
    makeBuildings(Math.max(2, state.buildings.offices * 2), 90, 150, 24);
  }

  function render() {
    moneyEl.textContent = fmtInt(state.money);
    rpsEl.textContent = fmtInt(state.rps);

    // Meter
    meterRewardEl.textContent = fmtInt(state.meter.reward);
    meterFillEl.style.width = `${Math.floor(state.meter.progress * 100)}%`;
    const full = state.meter.progress >= 1;
    collectRevenueBtn.disabled = !full;

    meterHintEl.textContent = full ? "Ready!" : "Filling…";

    // Prices + enable/disable buy buttons
    const ch = costHomes(), cs = costShops(), co = costOffices();
    costHomesEl.textContent = fmtInt(ch);
    costShopsEl.textContent = fmtInt(cs);
    costOfficesEl.textContent = fmtInt(co);

    btnHomes.disabled = state.money < ch;
    btnShops.disabled = state.money < cs;
    btnOffices.disabled = state.money < co;
  }

  // -------------------- NO OFFLINE / NO HIDDEN TAB EARNINGS --------------------
  function setRunning(isRunning) {
    state.running = isRunning;

    // Reset clock so there is NO catch-up when returning
    state.lastTick = performance.now();

    statusPill.textContent = isRunning ? "🟢 Earning" : "⏸️ Paused";
    statusPill.style.opacity = isRunning ? "0.95" : "0.75";
  }

  document.addEventListener("visibilitychange", () => {
    setRunning(!document.hidden);
  });
  window.addEventListener("blur", () => setRunning(false));
  window.addEventListener("focus", () => setRunning(!document.hidden));

  function tick(now) {
    if (state.running) {
      const delta = (now - state.lastTick) / 1000;
      state.lastTick = now;

      // Earn while visible
      state.money += state.rps * delta;

      // Fill meter while visible (no catch-up)
      state.meter.progress = clamp01(state.meter.progress + (delta / state.meter.fillSeconds));

      render();
    } else {
      // Keep lastTick fresh without accumulating
      state.lastTick = now;
    }
    requestAnimationFrame(tick);
  }

  // -------------------- Actions --------------------
  collectRevenueBtn.addEventListener("click", () => {
    if (state.meter.progress < 1) return;
    state.money += state.meter.reward;
    state.meter.progress = 0;
    render();
  });

  btnHomes.addEventListener("click", () => {
    const cost = costHomes();
    if (state.money < cost) return;
    state.money -= cost;
    state.buildings.homes += 1;
    recalcRps();
    renderSkyline();
    render();
  });

  btnShops.addEventListener("click", () => {
    const cost = costShops();
    if (state.money < cost) return;
    state.money -= cost;
    state.buildings.shops += 1;
    recalcRps();
    renderSkyline();
    render();
  });

  btnOffices.addEventListener("click", () => {
    const cost = costOffices();
    if (state.money < cost) return;
    state.money -= cost;
    state.buildings.offices += 1;
    recalcRps();
    renderSkyline();
    render();
  });

  saveBtn.addEventListener("click", () => {
    saveGame();
    saveBtn.textContent = "Saved ✅";
    setTimeout(() => (saveBtn.textContent = "Save City"), 900);
  });

  loadBtn.addEventListener("click", () => {
    const ok = loadGame();
    if (ok) {
      loadBtn.textContent = "Loaded ✅";
      recalcRps();
      renderSkyline();
      render();
    } else {
      loadBtn.textContent = "No Save Found";
    }
    setTimeout(() => (loadBtn.textContent = "Load City"), 900);
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    state.money = 0;
    state.buildings = { homes: 0, shops: 0, offices: 0 };
    state.meter.progress = 0;
    state.meter.reward = 15;
    state.meter.fillSeconds = 12;
    recalcRps();
    renderSkyline();
    render();
    resetBtn.textContent = "Reset ✅";
    setTimeout(() => (resetBtn.textContent = "Reset"), 900);
  });

  // -------------------- Boot --------------------
  // Try auto-load once (optional). If you don't want auto-load, comment these 2 lines.
  loadGame();
  recalcRps();

  renderSkyline();
  render();
  setRunning(!document.hidden);
  requestAnimationFrame(tick);
});
