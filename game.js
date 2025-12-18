// Flip City — Builder Edition (Tiles Update)
// - Tile map placement (8x6)
// - NO offline income (pauses when hidden, no catch-up)
// - Activity Meter: Collect only when full
// - Manual Save/Load
// Support: cityflipsupport@gmail.com

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) return console.error("❌ Missing <div id='game'></div> in index.html");

  const SUPPORT_EMAIL = "cityflipsupport@gmail.com";
  const SAVE_KEY = "flipcity_save_tiles_v1";

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const fmtInt = (n) => Math.floor(n).toLocaleString();

  // -------------------- State --------------------
  const MAP_W = 8;
  const MAP_H = 6;

  const state = {
    money: 0,
    rps: 1,

    buildings: { homes: 0, shops: 0, offices: 0 },

    // tilemap stores: "" | "home" | "shop" | "office"
    map: Array.from({ length: MAP_W * MAP_H }, () => ""),

    // selected build mode
    selected: "home",

    meter: {
      progress: 0,
      fillSeconds: 12,
      reward: 15,
    },

    running: true,
    lastTick: performance.now(),
  };

  function idx(x, y) { return y * MAP_W + x; }

  function recalcRps() {
    state.rps =
      1 +
      state.buildings.homes * 2 +
      state.buildings.shops * 5 +
      state.buildings.offices * 10;
  }

  // -------------------- Pricing --------------------
  function costHomes()   { return 50  + state.buildings.homes   * 25; }
  function costShops()   { return 150 + state.buildings.shops   * 60; }
  function costOffices() { return 400 + state.buildings.offices * 140; }

  function costFor(type) {
    if (type === "home") return costHomes();
    if (type === "shop") return costShops();
    return costOffices();
  }

  function canAfford(type) {
    return state.money >= costFor(type);
  }

  // -------------------- Save/Load --------------------
  function saveGame() {
    const data = {
      money: state.money,
      buildings: state.buildings,
      map: state.map,
      selected: state.selected,
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
      state.money = Number(data.money || 0);
      state.buildings = {
        homes: Number(data.buildings?.homes || 0),
        shops: Number(data.buildings?.shops || 0),
        offices: Number(data.buildings?.offices || 0),
      };
      state.map = Array.isArray(data.map) && data.map.length === MAP_W * MAP_H
        ? data.map.map(v => (v === "home" || v === "shop" || v === "office") ? v : "")
        : Array.from({ length: MAP_W * MAP_H }, () => "");

      state.selected = (data.selected === "home" || data.selected === "shop" || data.selected === "office")
        ? data.selected
        : "home";

      state.meter.reward = Number(data.meterReward || 15);
      state.meter.fillSeconds = Number(data.meterFillSeconds || 12);

      // fairness: do NOT persist meter progress
      state.meter.progress = 0;

      recalcRps();
      return true;
    } catch {
      return false;
    }
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
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      margin:0;
    }

    .wrap{ max-width:1100px; margin:0 auto; padding:20px; }
    .top{ display:flex; gap:12px; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; }
    h1{ font-size:24px; margin:0; letter-spacing:.3px; }
    .sub{ opacity:.85; font-size:13px; margin-top:4px; }

    .grid{ display:grid; grid-template-columns: 1.05fr .95fr; gap:14px; margin-top:14px; }
    @media (max-width: 980px){ .grid{ grid-template-columns:1fr; } }

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

    /* Tile map */
    .mapTop{ display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
    .seg{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      align-items:center;
    }
    .chip{
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.08);
      color:#eaf0ff;
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 13px;
      cursor:pointer;
      user-select:none;
    }
    .chip.on{
      background: rgba(120,200,255,.18);
      border-color: rgba(120,200,255,.35);
    }

    .map{
      margin-top: 10px;
      display:grid;
      grid-template-columns: repeat(${MAP_W}, 1fr);
      gap: 8px;
    }
    .tile{
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.10);
      background: rgba(0,0,0,.25);
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.2);
      cursor:pointer;
      position:relative;
      overflow:hidden;
    }
    .tile:hover{
      border-color: rgba(255,255,255,.18);
      background: rgba(255,255,255,.06);
    }
    .tile .label{
      position:absolute;
      left:8px; right:8px; bottom:8px;
      font-size: 12px;
      opacity:.9;
      text-shadow: 0 2px 10px rgba(0,0,0,.55);
      display:flex;
      justify-content:space-between;
      gap:6px;
      align-items:center;
    }
    .tile .icon{ font-size: 18px; }

    .tile.home  { background: linear-gradient(180deg, rgba(130,200,255,.14), rgba(0,0,0,.25)); }
    .tile.shop  { background: linear-gradient(180deg, rgba(255,210,140,.14), rgba(0,0,0,.25)); }
    .tile.office{ background: linear-gradient(180deg, rgba(200,160,255,.14), rgba(0,0,0,.25)); }

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
          <div class="sub">Tiles Edition · Money only earns while this tab is open & visible</div>
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
            <div class="bar"><i id="meterFill"></i></div>
            <button id="collectRevenueBtn" disabled>Collect Revenue +$<span id="meterReward">15</span></button>
            <div class="tiny" id="meterHint">Filling…</div>
          </div>

          <div style="height:12px"></div>

          <div class="btnRow">
            <button id="saveBtn">Save City</button>
            <button id="loadBtn">Load City</button>
            <button id="resetBtn">Reset</button>
          </div>

          <div style="height:12px"></div>

          <div class="mapTop">
            <div class="pill">🧱 Build Mode</div>
            <div class="seg" id="buildSeg">
              <div class="chip" data-type="home">🏠 Homes (+2/sec) · $<span id="costHome">50</span></div>
              <div class="chip" data-type="shop">🏪 Shops (+5/sec) · $<span id="costShop">150</span></div>
              <div class="chip" data-type="office">🏢 Offices (+10/sec) · $<span id="costOffice">400</span></div>
            </div>
          </div>

          <div class="tiny" style="margin-top:8px;">
            Click an empty tile to place the selected building.
          </div>

          <div class="map" id="map"></div>
        </div>

        <div class="card">
          <div class="row">
            <div style="font-weight:700;">Your City</div>
            <div class="pill" id="counts">🏠 0 · 🏪 0 · 🏢 0</div>
          </div>

          <div style="height:10px"></div>

          <div class="tiny">
            No offline income. Switching tabs pauses earnings (no catch-up).
          </div>

          <details style="margin-top:10px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.25);">
            <summary style="cursor:pointer; padding: 10px 12px; user-select:none; font-weight:700; list-style:none;">Help</summary>
            <div style="padding: 10px 12px 12px; opacity:.85; font-size:13px; line-height:1.35;">
              • Pick a building type, then click an empty tile.<br>
              • Prices increase as you build more of that type.<br>
              • Activity Meter fills only while visible; collect only when full.<br>
              • Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
            </div>
          </details>
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

  const buildSeg = document.getElementById("buildSeg");
  const mapEl = document.getElementById("map");
  const countsEl = document.getElementById("counts");

  const costHomeEl = document.getElementById("costHome");
  const costShopEl = document.getElementById("costShop");
  const costOfficeEl = document.getElementById("costOffice");

  // -------------------- Map Render --------------------
  function tileIcon(type) {
    if (type === "home") return "🏠";
    if (type === "shop") return "🏪";
    if (type === "office") return "🏢";
    return "";
  }
  function tileName(type) {
    if (type === "home") return "Homes";
    if (type === "shop") return "Shops";
    if (type === "office") return "Offices";
    return "";
  }

  function renderChips() {
    [...buildSeg.querySelectorAll(".chip")].forEach(ch => {
      ch.classList.toggle("on", ch.dataset.type === state.selected);
    });
  }

  function renderMap() {
    mapEl.innerHTML = "";
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = state.map[idx(x, y)];
        const div = document.createElement("div");
        div.className = "tile" + (t ? ` ${t}` : "");
        div.dataset.x = String(x);
        div.dataset.y = String(y);

        const label = document.createElement("div");
        label.className = "label";

        const left = document.createElement("span");
        left.className = "icon";
        left.textContent = t ? tileIcon(t) : "⬚";

        const right = document.createElement("span");
        right.textContent = t ? tileName(t) : "Empty";

        label.appendChild(left);
        label.appendChild(right);
        div.appendChild(label);

        mapEl.appendChild(div);
      }
    }
  }

  function renderCounts() {
    countsEl.textContent = `🏠 ${state.buildings.homes} · 🏪 ${state.buildings.shops} · 🏢 ${state.buildings.offices}`;
  }

  // -------------------- Rendering --------------------
  function render() {
    moneyEl.textContent = fmtInt(state.money);
    rpsEl.textContent = fmtInt(state.rps);

    // meter
    meterRewardEl.textContent = fmtInt(state.meter.reward);
    meterFillEl.style.width = `${Math.floor(state.meter.progress * 100)}%`;
    const full = state.meter.progress >= 1;
    collectRevenueBtn.disabled = !full;
    meterHintEl.textContent = full ? "Ready!" : "Filling…";

    // costs in chips
    costHomeEl.textContent = fmtInt(costHomes());
    costShopEl.textContent = fmtInt(costShops());
    costOfficeEl.textContent = fmtInt(costOffices());

    // gray out chips if can't afford (visual only)
    [...buildSeg.querySelectorAll(".chip")].forEach(ch => {
      const t = ch.dataset.type;
      ch.style.opacity = canAfford(t) ? "1" : "0.6";
    });

    renderCounts();
    renderChips();
  }

  // -------------------- NO OFFLINE / NO HIDDEN TAB EARNINGS --------------------
  function setRunning(isRunning) {
    state.running = isRunning;
    state.lastTick = performance.now(); // prevent catch-up
    statusPill.textContent = isRunning ? "🟢 Earning" : "⏸️ Paused";
    statusPill.style.opacity = isRunning ? "0.95" : "0.75";
  }

  document.addEventListener("visibilitychange", () => setRunning(!document.hidden));
  window.addEventListener("blur", () => setRunning(false));
  window.addEventListener("focus", () => setRunning(!document.hidden));

  function tick(now) {
    if (state.running) {
      const delta = (now - state.lastTick) / 1000;
      state.lastTick = now;

      state.money += state.rps * delta;
      state.meter.progress = clamp01(state.meter.progress + (delta / state.meter.fillSeconds));

      render();
    } else {
      state.lastTick = now;
    }
    requestAnimationFrame(tick);
  }

  // -------------------- Actions --------------------
  buildSeg.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const t = chip.dataset.type;
    if (t === "home" || t === "shop" || t === "office") {
      state.selected = t;
      render();
    }
  });

  mapEl.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    const i = idx(x, y);

    if (state.map[i]) return; // already occupied

    const type = state.selected;
    const cost = costFor(type);
    if (state.money < cost) return;

    // Pay + place
    state.money -= cost;
    state.map[i] = type;

    // Update counts
    if (type === "home") state.buildings.homes += 1;
    if (type === "shop") state.buildings.shops += 1;
    if (type === "office") state.buildings.offices += 1;

    recalcRps();
    renderMap();
    render();
  });

  collectRevenueBtn.addEventListener("click", () => {
    if (state.meter.progress < 1) return;
    state.money += state.meter.reward;
    state.meter.progress = 0;
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
      recalcRps();
      renderMap();
      render();
      loadBtn.textContent = "Loaded ✅";
    } else {
      loadBtn.textContent = "No Save Found";
    }
    setTimeout(() => (loadBtn.textContent = "Load City"), 900);
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    state.money = 0;
    state.buildings = { homes: 0, shops: 0, offices: 0 };
    state.map = Array.from({ length: MAP_W * MAP_H }, () => "");
    state.selected = "home";
    state.meter.progress = 0;
    state.meter.reward = 15;
    state.meter.fillSeconds = 12;
    recalcRps();
    renderMap();
    render();
    resetBtn.textContent = "Reset ✅";
    setTimeout(() => (resetBtn.textContent = "Reset"), 900);
  });

  // -------------------- Boot --------------------
  loadGame();           // optional auto-load
  recalcRps();
  renderMap();
  render();
  setRunning(!document.hidden);
  requestAnimationFrame(tick);
});
