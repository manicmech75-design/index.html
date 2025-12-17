// Flip City — v3 (5 upgrades + tile visuals + skyline + stages + events)
// No external assets. GitHub Pages safe.

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) return console.error("❌ Missing <div id='game'></div>");

  // ---------- Styles ----------
  const style = document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#eaf0ff; min-height:100vh; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 18px; }
    .top { display:flex; gap:12px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; }
    h1 { margin:0; font-size: 20px; }
    .sub { opacity:.82; font-size: 13px; }
    .row { display:flex; gap:10px; flex-wrap:wrap; align-items:stretch; }
    .card {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
    }
    .card h2 { margin:0 0 10px 0; font-size: 14px; opacity:.92; letter-spacing:.2px; }
    .btn {
      appearance:none; border:0; cursor:pointer;
      background: rgba(255,255,255,.10);
      color:#eaf0ff;
      border:1px solid rgba(255,255,255,.16);
      border-radius: 14px;
      padding: 10px 12px;
      font-weight: 750;
      transition: transform .05s ease, background .15s ease, opacity .15s ease;
      user-select:none;
      white-space: nowrap;
    }
    .btn:hover { background: rgba(255,255,255,.14); }
    .btn:active { transform: translateY(1px) scale(.99); }
    .btn.primary { background: rgba(94, 203, 255, .18); border-color: rgba(94, 203, 255, .35); }
    .btn.danger { background: rgba(255, 94, 94, .14); border-color: rgba(255, 94, 94, .35); }
    .btn.small { padding: 8px 10px; border-radius: 12px; font-weight: 750; }

    .hr { height:1px; background: rgba(255,255,255,.10); border-radius:99px; margin:12px 0; }

    .pill {
      display:inline-flex; align-items:center; gap:8px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.14);
      font-size: 12px;
      opacity: .95;
    }

    .grid {
      display:grid;
      grid-template-columns: 1.2fr 2fr;
      gap: 12px;
    }
    @media (max-width: 920px) { .grid { grid-template-columns: 1fr; } }

    .statsGrid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
    .stat { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); border-radius: 14px; padding: 10px; }
    .k { font-size: 12px; opacity:.78; }
    .v { margin-top: 4px; font-size: 16px; font-weight: 800; }

    .shop { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    @media (max-width: 560px) { .shop { grid-template-columns: 1fr; } }

    .shopItem { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 12px; display:flex; flex-direction:column; gap: 8px; }
    .shopItem .t { font-weight: 850; }
    .shopItem .d { font-size: 12px; opacity:.8; }
    .shopItem .b { display:flex; justify-content:space-between; align-items:center; gap: 10px; }
    .shopItem .meta { font-size: 12px; opacity:.85; }

    .skyBox {
      border-radius: 18px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.14);
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
      overflow:hidden;
    }
    .skyline {
      font-size: 34px;
      line-height: 1.15;
      letter-spacing: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,.35));
    }

    .tilesWrap { display:flex; flex-direction:column; gap: 10px; }
    .tiles {
      display:grid;
      grid-template-columns: repeat(6, minmax(0,1fr));
      gap: 10px;
    }
    @media (max-width: 900px) { .tiles { grid-template-columns: repeat(4, minmax(0,1fr)); } }
    @media (max-width: 520px) { .tiles { grid-template-columns: repeat(3, minmax(0,1fr)); } }

    .tile {
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      padding: 12px 10px;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap: 6px;
      cursor:pointer;
      user-select:none;
      min-height: 86px;
      transition: transform .06s ease, background .15s ease;
    }
    .tile:hover { background: rgba(255,255,255,.09); }
    .tile:active { transform: translateY(1px) scale(.99); }
    .tile .icon { font-size: 30px; }
    .tile .lvl { font-size: 12px; opacity:.82; }

    .toast {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      bottom: 16px;
      background: rgba(0,0,0,.65);
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s ease, transform .2s ease;
      max-width: 92vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(-4px); }
  `;
  document.head.appendChild(style);

  // ---------- Helpers ----------
  const SAVE_KEY = "flipcity_v3_save";
  const now = () => Date.now();

  function fmt(n) {
    if (!Number.isFinite(n)) return "∞";
    const abs = Math.abs(n);
    if (abs < 1000) return n.toFixed(0);
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let u = -1, v = abs;
    while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
    const sign = n < 0 ? "-" : "";
    return `${sign}${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)}${units[u]}`;
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 1400);
  }

  function safeParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  // ---------- Visual building levels ----------
  const BUILDING = ["⬜", "🏠", "🏢", "🏬", "🏙️", "🌆"]; // 0..5
  const MAX_LVL = BUILDING.length - 1;

  // ---------- City stages (by City Dev) ----------
  const STAGES = [
    { name: "Campsite", req: 0,   bg: "night" },
    { name: "Hamlet",   req: 6,   bg: "dawn" },
    { name: "Village",  req: 16,  bg: "morning" },
    { name: "Town",     req: 32,  bg: "day" },
    { name: "City",     req: 60,  bg: "sunset" },
    { name: "Metro",    req: 110, bg: "neon" },
  ];
  const BGS = {
    night:   "radial-gradient(1200px 500px at 20% 10%, rgba(94,203,255,.20), transparent 55%), linear-gradient(180deg, #081022, #070b14 60%, #05070d)",
    dawn:    "radial-gradient(900px 450px at 30% 20%, rgba(255,206,94,.24), transparent 55%), linear-gradient(180deg, #0a1230, #0b1220 60%, #070b12)",
    morning: "radial-gradient(900px 450px at 30% 10%, rgba(94,203,255,.22), transparent 55%), linear-gradient(180deg, #0b1733, #0b1220 60%, #070b12)",
    day:     "radial-gradient(900px 450px at 40% 10%, rgba(124,255,170,.16), transparent 55%), linear-gradient(180deg, #0b1730, #0b1220 60%, #070b12)",
    sunset:  "radial-gradient(900px 450px at 40% 12%, rgba(255,94,94,.20), transparent 55%), linear-gradient(180deg, #1c1030, #0b1220 60%, #070b12)",
    neon:    "radial-gradient(900px 450px at 40% 12%, rgba(186,94,255,.22), transparent 55%), radial-gradient(900px 450px at 70% 18%, rgba(94,203,255,.18), transparent 55%), linear-gradient(180deg, #120b2a, #0b1220 60%, #070b12)",
  };

  function currentStage(cityDev) {
    let s = STAGES[0];
    for (const st of STAGES) if (cityDev >= st.req) s = st;
    return s;
  }

  function applyBg() {
    const s = currentStage(state.up.cityDev);
    document.body.style.background = BGS[s.bg] || BGS.night;
  }

  // ---------- State ----------
  const state = {
    cash: 0,
    totalEarned: 0,
    lastTickAt: now(),
    lastSaveAt: 0,

    // 18 tiles (good on desktop + mobile)
    tiles: Array.from({ length: 18 }, () => ({ lvl: 0 })),

    // 5 upgrades
    up: {
      tapBoost: 0,     // increases per tap
      passive: 0,      // passive per second
      cityDev: 0,      // global multiplier + unlock stage changes
      buildSpeed: 0,   // higher chance to upgrade tile levels on click
      zoning: 0,       // tile level value multiplier (makes buildings worth more)
    },

    // Events (simple)
    event: {
      active: null,   // { name, endsAt, tapMult, passMult }
      pending: null,  // { name, desc, ... }
      nextAt: now() + 35_000
    }
  };

  // ---------- Economy ----------
  function cityMult() {
    return 1 + state.up.cityDev * 0.06; // 6% per level
  }

  function tileValueMult() {
    // zoning makes each building level contribute more to income
    return 1 + state.up.zoning * 0.12; // 12% per level
  }

  function tilesScore() {
    // total "development score" from tiles: sum(level)
    return state.tiles.reduce((a, t) => a + t.lvl, 0);
  }

  function perTapBase() {
    return 1 + state.up.tapBoost * 1.6 + Math.pow(state.up.tapBoost, 1.18) * 0.25;
  }

  function passiveBasePerSec() {
    return state.up.passive * 0.35 + Math.pow(state.up.passive, 1.22) * 0.06;
  }

  function eventMults() {
    if (!state.event.active) return { tap: 1, pas: 1 };
    return { tap: state.event.active.tapMult, pas: state.event.active.passMult };
  }

  function tileIncomeBonus() {
    // tiles add meaningful visible progression: more buildings = more money
    // scaled so it matters, but doesn’t explode instantly
    return (tilesScore() * 0.18) * tileValueMult();
  }

  function perTap() {
    const e = eventMults();
    return (perTapBase() + tileIncomeBonus()) * cityMult() * e.tap;
  }

  function passivePerSec() {
    const e = eventMults();
    return (passiveBasePerSec() + tileIncomeBonus() * 0.25) * cityMult() * e.pas;
  }

  // ---------- Costs (5 upgrades) ----------
  function costTapBoost()   { return 12  * Math.pow(1.18, state.up.tapBoost); }
  function costPassive()    { return 30  * Math.pow(1.20, state.up.passive); }
  function costCityDev()    { return 160 * Math.pow(1.22, state.up.cityDev) * (1 + state.up.cityDev * 0.02); }
  function costBuildSpeed() { return 90  * Math.pow(1.24, state.up.buildSpeed); }
  function costZoning()     { return 110 * Math.pow(1.25, state.up.zoning); }

  // ---------- Save / Load ----------
  function exportSave() {
    const data = {
      v: 3,
      cash: state.cash,
      totalEarned: state.totalEarned,
      tiles: state.tiles,
      up: state.up,
      event: state.event,
      lastTickAt: state.lastTickAt
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  function importSave(code) {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = safeParse(json, null);
    if (!data || data.v !== 3) throw new Error("Bad save");

    state.cash = Number(data.cash ?? 0) || 0;
    state.totalEarned = Number(data.totalEarned ?? 0) || 0;
    state.tiles = Array.isArray(data.tiles) ? data.tiles.map(t => ({ lvl: clampInt(t.lvl, 0, MAX_LVL) })) : state.tiles;
    state.up = {
      tapBoost: clampInt(data.up?.tapBoost, 0, 1e9),
      passive: clampInt(data.up?.passive, 0, 1e9),
      cityDev: clampInt(data.up?.cityDev, 0, 1e9),
      buildSpeed: clampInt(data.up?.buildSpeed, 0, 1e9),
      zoning: clampInt(data.up?.zoning, 0, 1e9),
    };
    state.event = data.event ?? state.event;
    state.lastTickAt = Number(data.lastTickAt ?? now()) || now();
  }

  function clampInt(n, a, b) {
    n = Number(n);
    if (!Number.isFinite(n)) return a;
    return Math.max(a, Math.min(b, Math.floor(n)));
  }

  function save() {
    localStorage.setItem(SAVE_KEY, exportSave());
    state.lastSaveAt = now();
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try { importSave(raw); } catch (e) { console.warn("Save load failed", e); }
  }

  // ---------- Events ----------
  const EVENTS = [
    { name: "City Festival 🎉", desc: "2× Tap for 25s", duration: 25_000, tapMult: 2.0, passMult: 1.0 },
    { name: "Construction Boom 🏗️", desc: "2× Passive for 25s", duration: 25_000, tapMult: 1.0, passMult: 2.0 },
    { name: "Investment Grant 💡", desc: "Instant cash payout", duration: 0, tapMult: 1.0, passMult: 1.0, instant: true },
  ];

  function maybeSpawnEvent() {
    if (state.event.pending || state.event.active) return;
    if (now() < state.event.nextAt) return;

    // small chance gate; city dev increases frequency a bit
    const luck = 1 + state.up.cityDev * 0.01;
    if (Math.random() > 0.55 / Math.min(2.2, luck)) {
      state.event.nextAt = now() + 35_000 + Math.random() * 35_000;
      return;
    }

    state.event.pending = { ...EVENTS[Math.floor(Math.random() * EVENTS.length)] };
  }

  function activateEvent() {
    const e = state.event.pending;
    if (!e) return;

    if (e.instant) {
      const grant = passivePerSec() * (12 + state.up.cityDev * 0.25);
      addCash(grant);
      toast(`💡 Grant: +$${fmt(grant)}`);
      state.event.pending = null;
      state.event.nextAt = now() + 45_000;
      render();
      return;
    }

    state.event.active = {
      name: e.name,
      tapMult: e.tapMult,
      passMult: e.passMult,
      endsAt: now() + e.duration
    };
    state.event.pending = null;
    state.event.nextAt = now() + 60_000;
    toast("✅ Event activated");
    render();
  }

  function tickEventEnd() {
    if (state.event.active && now() >= state.event.active.endsAt) {
      state.event.active = null;
      toast("⏱️ Event ended");
      render();
    }
  }

  // ---------- Tile visuals ----------
  function buildChance() {
    // buildSpeed makes tile upgrades VERY noticeable
    // base 45% + 6% per level, capped at 92%
    return Math.min(0.92, 0.45 + state.up.buildSpeed * 0.06);
  }

  function clickTile(i) {
    // earn money
    const gain = perTap();
    addCash(gain);

    // visibly upgrade the clicked tile
    const t = state.tiles[i];
    if (t.lvl < MAX_LVL && Math.random() < buildChance()) {
      t.lvl++;
      // tiny reward so leveling feels good
      addCash(2 + t.lvl * 1.5);
    }

    // ALSO: small chance to upgrade a random other tile (city "spreads") as City Dev grows
    if (state.up.cityDev >= 10 && Math.random() < Math.min(0.18, state.up.cityDev * 0.003)) {
      const j = Math.floor(Math.random() * state.tiles.length);
      if (state.tiles[j].lvl < MAX_LVL) state.tiles[j].lvl++;
    }

    render();
  }

  function skylineString() {
    // skyline is based on the highest tiles (top 12)
    const lvls = state.tiles.map(t => t.lvl).sort((a,b) => b - a).slice(0, 12);
    // always show something
    if (lvls.every(x => x === 0)) return "⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜";
    return lvls.map(l => BUILDING[l]).join(" ");
  }

  // ---------- Cash helpers ----------
  function addCash(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.cash += amount;
    state.totalEarned += amount;
  }

  // ---------- Buying upgrades ----------
  function buy(cost, applyFn, msg) {
    if (state.cash < cost) return toast("Not enough cash.");
    state.cash -= cost;
    applyFn();
    toast(msg);
    render();
    save();
  }

  // ---------- UI ----------
  function render() {
    applyBg();
    const stage = currentStage(state.up.cityDev);
    const e = eventMults();

    const eventLine = state.event.active
      ? `${state.event.active.name} (ends in ${Math.max(0, Math.ceil((state.event.active.endsAt - now())/1000))}s)`
      : state.event.pending
        ? `${state.event.pending.name} — ${state.event.pending.desc}`
        : "No event right now";

    root.innerHTML = `
      <div class="wrap">
        <div class="top">
          <div>
            <h1>Flip City</h1>
            <div class="sub">Click tiles to build. Buildings = visible progress + more income.</div>
          </div>
          <div class="row">
            <button class="btn small" id="btnExport">Export</button>
            <button class="btn small" id="btnImport">Import</button>
            <button class="btn small danger" id="btnReset">Reset</button>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="skyBox card" style="flex:1 1 520px;">
            <h2>Skyline</h2>
            <div class="skyline" title="Your skyline grows as tiles level up.">${skylineString()}</div>
            <div class="row" style="margin-top:10px;">
              <span class="pill">Stage: <b>${stage.name}</b></span>
              <span class="pill">City Dev: <b>${state.up.cityDev}</b></span>
              <span class="pill">Build chance: <b>${Math.round(buildChance()*100)}%</b></span>
              <span class="pill">Event: <b>${e.tap.toFixed(2)}× tap</b> · <b>${e.pas.toFixed(2)}× passive</b></span>
            </div>

            <div class="hr"></div>

            <div class="row" style="justify-content:space-between; align-items:center;">
              <div class="sub" style="max-width: 720px;">
                <b>City Event:</b> ${eventLine}
              </div>
              <button class="btn ${state.event.pending ? "primary" : ""}" id="btnEvent" ${state.event.pending ? "" : "disabled"} style="${state.event.pending ? "" : "opacity:.55; cursor:not-allowed;"}">
                ${state.event.pending ? "Activate" : "No Event"}
              </button>
            </div>
          </div>
        </div>

        <div class="grid" style="margin-top:12px;">
          <div class="card">
            <h2>Stats</h2>
            <div class="statsGrid">
              <div class="stat"><div class="k">Cash</div><div class="v">$${fmt(state.cash)}</div></div>
              <div class="stat"><div class="k">Total Earned</div><div class="v">$${fmt(state.totalEarned)}</div></div>
              <div class="stat"><div class="k">Per Tap</div><div class="v">$${fmt(perTap())}</div></div>
              <div class="stat"><div class="k">Passive / sec</div><div class="v">$${fmt(passivePerSec())}</div></div>
            </div>

            <div class="hr"></div>

            <button class="btn primary" id="btnTap">Tap Anywhere (+$${fmt(perTap())})</button>
            <div class="sub" style="margin-top:10px;">
              Tip: Clicking tiles is best because it also <b>builds</b> (visible upgrades).
            </div>
          </div>

          <div class="card">
            <h2>Upgrades (5)</h2>
            <div class="shop">
              ${shopItem("Tap Boost", "More money per click.", `Level ${state.up.tapBoost}`, costTapBoost(), "buyTapBoost")}
              ${shopItem("Passive Income", "Earn money every second.", `Level ${state.up.passive}`, costPassive(), "buyPassive")}
              ${shopItem("City Development", "Boosts all income + unlock stages.", `Level ${state.up.cityDev}`, costCityDev(), "buyCityDev")}
              ${shopItem("Build Speed", "Tiles level up more often (VISUAL!).", `Level ${state.up.buildSpeed}`, costBuildSpeed(), "buyBuildSpeed")}
              ${shopItem("Zoning Policy", "Buildings are worth more.", `Level ${state.up.zoning}`, costZoning(), "buyZoning")}
            </div>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="card" style="flex: 1 1 100%;">
            <h2>City Tiles (click to build)</h2>
            <div class="sub">You should see tiles change from ⬜ → 🏠 → 🏢 → 🏬 → 🏙️ → 🌆</div>
            <div class="tilesWrap" style="margin-top:10px;">
              <div class="tiles" id="tiles"></div>
            </div>
          </div>
        </div>

        <div id="toast" class="toast"></div>
      </div>
    `;

    // Wire buttons
    document.getElementById("btnTap").onclick = () => { addCash(perTap()); render(); };

    document.getElementById("buyTapBoost").onclick = () => buy(costTapBoost(), () => state.up.tapBoost++, "Tap Boost upgraded!");
    document.getElementById("buyPassive").onclick = () => buy(costPassive(), () => state.up.passive++, "Passive Income upgraded!");
    document.getElementById("buyCityDev").onclick = () => buy(costCityDev(), () => state.up.cityDev++, "City Development upgraded!");
    document.getElementById("buyBuildSpeed").onclick = () => buy(costBuildSpeed(), () => state.up.buildSpeed++, "Build Speed upgraded!");
    document.getElementById("buyZoning").onclick = () => buy(costZoning(), () => state.up.zoning++, "Zoning Policy upgraded!");

    const btnEvent = document.getElementById("btnEvent");
    if (btnEvent && state.event.pending) btnEvent.onclick = activateEvent;

    document.getElementById("btnExport").onclick = () => {
      const code = exportSave();
      navigator.clipboard?.writeText(code).catch(() => {});
      prompt("Copy your save code:", code);
    };

    document.getElementById("btnImport").onclick = () => {
      const code = prompt("Paste your save code:");
      if (!code) return;
      try { importSave(code); save(); toast("✅ Save imported"); render(); }
      catch { toast("❌ Import failed"); }
    };

    document.getElementById("btnReset").onclick = () => {
      const ok = confirm("Reset everything? (Export first if you want a backup.)");
      if (!ok) return;
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    };

    // Render tiles
    const tilesEl = document.getElementById("tiles");
    state.tiles.forEach((t, i) => {
      const btn = document.createElement("div");
      btn.className = "tile";
      btn.innerHTML = `<div class="icon">${BUILDING[t.lvl]}</div><div class="lvl">Tile Lv ${t.lvl}</div>`;
      btn.onclick = () => clickTile(i);
      tilesEl.appendChild(btn);
    });
  }

  function shopItem(title, desc, meta, cost, id) {
    const affordable = state.cash >= cost;
    return `
      <div class="shopItem">
        <div class="t">${title}</div>
        <div class="d">${desc}</div>
        <div class="b">
          <div>
            <div class="meta">${meta}</div>
            <div class="meta">Cost: <b>$${fmt(cost)}</b></div>
          </div>
          <button class="btn ${affordable ? "primary" : ""}" id="${id}">Buy</button>
        </div>
      </div>
    `;
  }

  // ---------- Main loop ----------
  function tick() {
    const t = now();
    const dt = (t - state.lastTickAt) / 1000;
    state.lastTickAt = t;

    // passive income
    addCash(passivePerSec() * dt);

    // events
    maybeSpawnEvent();
    tickEventEnd();

    // autosave
    if (t - state.lastSaveAt > 10_000) save();
  }

  // ---------- Start ----------
  load();
  applyBg();
  render();

  setInterval(() => {
    tick();
    render();
  }, 250);

  window.addEventListener("beforeunload", () => save());
});
