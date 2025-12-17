// game.js — Flip City (visible city + stages + districts + events)
// Works on GitHub Pages. No external assets required.

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) {
    console.error("❌ #game not found. Add <div id='game'></div> to index.html");
    return;
  }

  // ---------- Styles ----------
  const style = document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    body {
      margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: #0b1220; color: #e8eefc;
      min-height: 100vh;
    }
    .wrap { max-width: 1060px; margin: 0 auto; padding: 20px; }
    .top { display:flex; gap:12px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; }
    h1 { font-size: 20px; margin: 0 0 4px 0; }
    .sub { opacity: .85; font-size: 13px; }
    .row { display:flex; gap:12px; flex-wrap:wrap; align-items:stretch; }
    .card {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
    }
    .card h2 { margin: 0 0 8px 0; font-size: 14px; opacity: .95; letter-spacing: .2px; }
    .statgrid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
    .stat { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.10); border-radius: 14px; padding: 10px; }
    .stat .k { font-size: 12px; opacity: .8; }
    .stat .v { font-size: 16px; margin-top: 4px; }
    .btn {
      appearance: none; border: 0; cursor: pointer;
      background: rgba(255,255,255,.10);
      color: #e8eefc;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 14px;
      padding: 10px 12px;
      font-weight: 650;
      transition: transform .05s ease, background .15s ease;
      user-select: none;
      white-space: nowrap;
    }
    .btn:hover { background: rgba(255,255,255,.14); }
    .btn:active { transform: translateY(1px) scale(.99); }
    .btn.primary { background: rgba(94, 203, 255, .18); border-color: rgba(94, 203, 255, .35); }
    .btn.danger { background: rgba(255, 94, 94, .14); border-color: rgba(255, 94, 94, .35); }
    .btn.small { padding: 8px 10px; border-radius: 12px; font-weight: 650; }
    .muted { opacity: .78; }
    .hr { height: 1px; background: rgba(255,255,255,.10); margin: 12px 0; border-radius: 99px; }
    .spacer { height: 8px; }

    .cityBox {
      border-radius: 18px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.14);
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
      position: relative;
      overflow: hidden;
    }
    .skyline {
      font-size: 34px;
      line-height: 1.1;
      letter-spacing: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,.35));
    }
    .stageLine { display:flex; gap:10px; align-items:center; flex-wrap: wrap; margin-top: 8px; }
    .pill {
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.14);
      font-size: 12px;
      opacity: .95;
    }

    .shop { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
    @media (max-width: 900px) { .shop { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media (max-width: 560px) { .shop { grid-template-columns: 1fr; } }

    .shopItem {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 12px;
      display:flex;
      flex-direction: column;
      gap: 8px;
    }
    .shopItem .t { font-weight: 750; }
    .shopItem .d { font-size: 12px; opacity: .8; }
    .shopItem .b { display:flex; align-items:center; justify-content:space-between; gap: 10px; }
    .shopItem .cost { font-size: 12px; opacity: .85; }
    .shopItem .lvl { font-size: 12px; opacity: .85; }

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

    .eventBox {
      border-radius: 16px;
      padding: 12px;
      border: 1px dashed rgba(255,255,255,.22);
      background: rgba(255,255,255,.05);
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .eventBox .left { display:flex; flex-direction: column; gap: 4px; }
    .eventBox .name { font-weight: 800; }
    .eventBox .desc { font-size: 12px; opacity: .82; }
  `;
  document.head.appendChild(style);

  // ---------- Helpers ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const now = () => Date.now();

  function fmt(n) {
    if (!Number.isFinite(n)) return "∞";
    const abs = Math.abs(n);
    if (abs < 1000) return n.toFixed(0);
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let u = -1;
    let v = abs;
    while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
    const sign = n < 0 ? "-" : "";
    return `${sign}${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)}${units[u]}`;
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.remove("show"), 1400);
  }

  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
  }

  // ---------- Game Data ----------
  const SAVE_KEY = "flipcity_save_v2";

  const CITY_STAGES = [
    { name: "Campsite",    req: 0,    skyline: ["⛺","🔥","🌲","🌲","🏕️"], bg: "night" },
    { name: "Hamlet",      req: 5,    skyline: ["🏡","🏡","🌳","🚜","🏠"], bg: "dawn" },
    { name: "Village",     req: 15,   skyline: ["🏠","🏠","🏡","🌳","🛤️","🏠"], bg: "morning" },
    { name: "Town",        req: 30,   skyline: ["🏫","🏤","🏠","🏡","🚏","🏠"], bg: "day" },
    { name: "City",        req: 60,   skyline: ["🏢","🏬","🏥","🏦","🚦","🏢"], bg: "sunset" },
    { name: "Metropolis",  req: 120,  skyline: ["🏙️","🏢","🏢","🏬","🏦","🚇","🏙️"], bg: "neon" },
    { name: "Mega City",   req: 240,  skyline: ["🌆","🏙️","🏢","🏢","🏬","🏦","🌉","🌆"], bg: "midnight" },
  ];

  const BACKGROUNDS = {
    night:   "radial-gradient(1200px 500px at 20% 10%, rgba(94,203,255,.20), transparent 55%), linear-gradient(180deg, #081022, #070b14 60%, #05070d)",
    dawn:    "radial-gradient(900px 450px at 30% 20%, rgba(255,206,94,.24), transparent 55%), linear-gradient(180deg, #0a1230, #0b1220 60%, #070b12)",
    morning: "radial-gradient(900px 450px at 30% 10%, rgba(94,203,255,.22), transparent 55%), linear-gradient(180deg, #0b1733, #0b1220 60%, #070b12)",
    day:     "radial-gradient(900px 450px at 40% 10%, rgba(124,255,170,.16), transparent 55%), linear-gradient(180deg, #0b1730, #0b1220 60%, #070b12)",
    sunset:  "radial-gradient(900px 450px at 40% 12%, rgba(255,94,94,.20), transparent 55%), linear-gradient(180deg, #1c1030, #0b1220 60%, #070b12)",
    neon:    "radial-gradient(900px 450px at 40% 12%, rgba(186,94,255,.22), transparent 55%), radial-gradient(900px 450px at 70% 18%, rgba(94,203,255,.18), transparent 55%), linear-gradient(180deg, #120b2a, #0b1220 60%, #070b12)",
    midnight:"radial-gradient(900px 450px at 35% 12%, rgba(94,203,255,.15), transparent 55%), radial-gradient(900px 450px at 75% 18%, rgba(255,94,186,.14), transparent 55%), linear-gradient(180deg, #050615, #0b1220 60%, #04050b)",
  };

  // Districts: unlocked by City Dev level; give passive/tap boosts (multiplicative)
  const DISTRICTS = [
    { id: "res", name: "Residential", icon: "🏘️", req: 10,  desc: "+5% tap & +5% passive", tapMult: 1.05, passMult: 1.05, level: 0 },
    { id: "ind", name: "Industrial",  icon: "🏭", req: 35,  desc: "+12% passive",          tapMult: 1.00, passMult: 1.12, level: 0 },
    { id: "com", name: "Commercial",  icon: "🏬", req: 70,  desc: "+12% tap",             tapMult: 1.12, passMult: 1.00, level: 0 },
    { id: "civ", name: "Civic",       icon: "🏛️", req: 140, desc: "+8% all + event luck", tapMult: 1.08, passMult: 1.08, level: 0, luck: 1.20 },
  ];

  // Events: temporary boosts you can activate when they appear
  const EVENTS = [
    { id: "festival", name: "City Festival 🎉", desc: "2× tap for 30s", durationMs: 30_000, tapMult: 2.0, passMult: 1.0 },
    { id: "boom",     name: "Construction Boom 🏗️", desc: "2× passive for 30s", durationMs: 30_000, tapMult: 1.0, passMult: 2.0 },
    { id: "grant",    name: "Innovation Grant 💡", desc: "Instant cash (based on passive)", durationMs: 0, tapMult: 1.0, passMult: 1.0, instant: true },
  ];

  // ---------- State ----------
  const state = {
    cash: 0,
    totalEarned: 0,

    tapLevel: 0,
    passiveLevel: 0,
    cityDevLevel: 0,

    prestigePoints: 0,     // "permanent multiplier currency"
    prestigeMult: 1,       // derived from prestigePoints

    districts: structuredClone(DISTRICTS),

    // event system
    activeEvent: null,     // { id, endsAt, tapMult, passMult }
    pendingEvent: null,    // { id, name, desc, ... }
    nextEventAt: now() + 45_000,

    lastTickAt: now(),
    lastSaveAt: 0,
  };

  // ---------- Economy ----------
  function basePerTap() {
    // tap level is very strong early, slightly less later
    return 1 + state.tapLevel * 1.25 + Math.pow(state.tapLevel, 1.15) * 0.35;
  }
  function basePassivePerSec() {
    return state.passiveLevel * 0.35 + Math.pow(state.passiveLevel, 1.20) * 0.05;
  }

  function cityDevMult() {
    // city dev boosts both tap & passive
    return 1 + state.cityDevLevel * 0.06;
  }

  function districtMults() {
    let tap = 1, pas = 1, luck = 1;
    for (const d of state.districts) {
      if (d.level > 0) {
        tap *= Math.pow(d.tapMult ?? 1, d.level);
        pas *= Math.pow(d.passMult ?? 1, d.level);
        if (d.luck) luck *= Math.pow(d.luck, d.level);
      }
    }
    return { tap, pas, luck };
  }

  function currentEventMults() {
    if (!state.activeEvent) return { tap: 1, pas: 1 };
    return { tap: state.activeEvent.tapMult ?? 1, pas: state.activeEvent.passMult ?? 1 };
  }

  function prestigeMultiplierFromPoints(points) {
    // smooth scaling: 1 + 0.25*pp + diminishing
    return 1 + points * 0.25 + Math.pow(points, 0.85) * 0.05;
  }

  function perTap() {
    const { tap: dTap } = districtMults();
    const { tap: eTap } = currentEventMults();
    return basePerTap() * cityDevMult() * state.prestigeMult * dTap * eTap;
  }

  function passivePerSec() {
    const { pas: dPas } = districtMults();
    const { pas: ePas } = currentEventMults();
    return basePassivePerSec() * cityDevMult() * state.prestigeMult * dPas * ePas;
  }

  function costTap() {
    return 10 * Math.pow(1.18, state.tapLevel) * (1 + state.tapLevel * 0.02);
  }
  function costPassive() {
    return 25 * Math.pow(1.20, state.passiveLevel) * (1 + state.passiveLevel * 0.02);
  }
  function costCityDev() {
    return 120 * Math.pow(1.22, state.cityDevLevel) * (1 + state.cityDevLevel * 0.03);
  }
  function costDistrictUpgrade(d) {
    // district levels are optional side scaling
    return (300 + d.req * 20) * Math.pow(1.35, d.level);
  }

  // ---------- City View ----------
  function currentStage() {
    let stage = CITY_STAGES[0];
    for (const s of CITY_STAGES) {
      if (state.cityDevLevel >= s.req) stage = s;
    }
    return stage;
  }

  function skylineString() {
    const s = currentStage();
    // add more buildings with city dev level
    const extra = clamp(Math.floor(state.cityDevLevel / 18), 0, 14);
    const base = s.skyline.slice();
    const fillers = ["🏠","🏢","🏬","🏦","🏥","🏫","🏭","🌳","🚦","🚇"];
    for (let i = 0; i < extra; i++) base.push(fillers[i % fillers.length]);
    return base.join(" ");
  }

  function applyBackground() {
    const s = currentStage();
    document.body.style.background = BACKGROUNDS[s.bg] || BACKGROUNDS.night;
  }

  // ---------- Save / Load ----------
  function exportSave() {
    const data = {
      v: 2,
      cash: state.cash,
      totalEarned: state.totalEarned,
      tapLevel: state.tapLevel,
      passiveLevel: state.passiveLevel,
      cityDevLevel: state.cityDevLevel,
      prestigePoints: state.prestigePoints,
      districts: state.districts.map(d => ({ id: d.id, level: d.level })),
      activeEvent: state.activeEvent,
      pendingEvent: state.pendingEvent,
      nextEventAt: state.nextEventAt,
      lastTickAt: state.lastTickAt
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  function importSave(code) {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = safeParse(json, null);
    if (!data || (data.v !== 2 && data.v !== 1)) throw new Error("Bad save.");

    // basic fields
    state.cash = Number(data.cash ?? 0) || 0;
    state.totalEarned = Number(data.totalEarned ?? 0) || 0;
    state.tapLevel = Number(data.tapLevel ?? 0) || 0;
    state.passiveLevel = Number(data.passiveLevel ?? 0) || 0;
    state.cityDevLevel = Number(data.cityDevLevel ?? 0) || 0;
    state.prestigePoints = Number(data.prestigePoints ?? 0) || 0;

    // districts by id
    const byId = new Map((data.districts ?? []).map(x => [x.id, x.level]));
    state.districts = structuredClone(DISTRICTS).map(d => ({ ...d, level: Number(byId.get(d.id) ?? 0) || 0 }));

    state.activeEvent = data.activeEvent ?? null;
    state.pendingEvent = data.pendingEvent ?? null;
    state.nextEventAt = Number(data.nextEventAt ?? (now() + 45_000)) || (now() + 45_000);
    state.lastTickAt = Number(data.lastTickAt ?? now()) || now();

    state.prestigeMult = prestigeMultiplierFromPoints(state.prestigePoints);
    applyBackground();
    render();
    toast("✅ Save imported");
  }

  function save() {
    const payload = exportSave();
    localStorage.setItem(SAVE_KEY, payload);
    state.lastSaveAt = now();
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state.prestigeMult = prestigeMultiplierFromPoints(state.prestigePoints);
      applyBackground();
      return;
    }
    try {
      importSave(raw);
      toast("✅ Save loaded");
    } catch (e) {
      console.warn("Save load failed:", e);
      toast("⚠️ Save load failed (starting fresh)");
    }
  }

  // ---------- Prestige ----------
  function prestigeGainEstimate() {
    // based on lifetime earned: sqrt scaling
    const gained = Math.floor(Math.sqrt(state.totalEarned / 5000));
    return Math.max(0, gained - state.prestigePoints);
  }

  function doPrestige() {
    const gain = prestigeGainEstimate();
    if (gain <= 0) {
      toast("Not enough progress to prestige yet.");
      return;
    }
    state.prestigePoints += gain;
    state.prestigeMult = prestigeMultiplierFromPoints(state.prestigePoints);

    // reset progress
    state.cash = 0;
    state.tapLevel = 0;
    state.passiveLevel = 0;
    state.cityDevLevel = 0;

    // keep districts but reset district levels (optional: keep them; here we reset for balance)
    state.districts = structuredClone(DISTRICTS);

    // reset events
    state.activeEvent = null;
    state.pendingEvent = null;
    state.nextEventAt = now() + 25_000;
    state.lastTickAt = now();

    applyBackground();
    render();
    save();
    toast(`✨ Prestige! +${gain} PP`);
  }

  // ---------- Events ----------
  function trySpawnEvent() {
    if (state.pendingEvent || state.activeEvent) return;
    if (now() < state.nextEventAt) return;

    const { luck } = districtMults();
    const roll = Math.random() * (1 / clamp(luck, 1, 3.5)); // higher luck = more frequent
    // base ~ 55s to 95s between events, modified by luck in schedule, and roll gate
    if (roll > 0.55) {
      state.nextEventAt = now() + (55_000 + Math.random() * 40_000) / clamp(luck, 1, 3.5);
      return;
    }

    const e = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    state.pendingEvent = { ...e };
    // next event schedule set after resolved
  }

  function activatePendingEvent() {
    const e = state.pendingEvent;
    if (!e) return;

    if (e.instant) {
      // grant based on passive, plus a small city-dev factor
      const grant = passivePerSec() * (15 + state.cityDevLevel * 0.15);
      addCash(grant);
      toast(`💡 Grant received: +${fmt(grant)}`);
      state.pendingEvent = null;
      state.nextEventAt = now() + 50_000;
      render();
      return;
    }

    state.activeEvent = {
      id: e.id,
      name: e.name,
      desc: e.desc,
      tapMult: e.tapMult ?? 1,
      passMult: e.passMult ?? 1,
      endsAt: now() + (e.durationMs ?? 30_000),
    };
    state.pendingEvent = null;
    state.nextEventAt = now() + 70_000;
    render();
    toast(`✅ Event started`);
  }

  function tickEvents() {
    if (state.activeEvent && now() >= state.activeEvent.endsAt) {
      state.activeEvent = null;
      toast("⏱️ Event ended");
      render();
    }
  }

  // ---------- Cash ----------
  function addCash(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.cash += amount;
    state.totalEarned += amount;
  }

  // ---------- UI ----------
  function render() {
    const stage = currentStage();
    applyBackground();

    const dUnlocked = state.districts.filter(d => state.cityDevLevel >= d.req);
    const { tap: dTap, pas: dPas } = districtMults();
    const eMults = currentEventMults();

    const eventStatus = state.activeEvent
      ? `${state.activeEvent.name} (ends in ${Math.max(0, Math.ceil((state.activeEvent.endsAt - now()) / 1000))}s)`
      : state.pendingEvent
        ? `${state.pendingEvent.name}`
        : "No event right now";

    root.innerHTML = `
      <div class="wrap">
        <div class="top">
          <div>
            <h1>Flip City</h1>
            <div class="sub">Build a city from nothing → prestige → rebuild faster.</div>
          </div>
          <div class="row">
            <button class="btn small" id="btnExport">Export</button>
            <button class="btn small" id="btnImport">Import</button>
            <button class="btn small danger" id="btnReset">Reset</button>
          </div>
        </div>

        <div class="spacer"></div>

        <div class="cityBox card">
          <h2>City View</h2>
          <div class="skyline" title="${stage.name}">${skylineString()}</div>
          <div class="stageLine">
            <span class="pill">Stage: <b>${stage.name}</b></span>
            <span class="pill">City Dev: <b>${state.cityDevLevel}</b></span>
            <span class="pill">District Boost: <b>${(dTap*dPas).toFixed(2)}×</b></span>
            <span class="pill">Prestige: <b>${state.prestigePoints}</b> PP → <b>${state.prestigeMult.toFixed(2)}×</b></span>
          </div>

          <div class="hr"></div>

          <div class="eventBox">
            <div class="left">
              <div class="name">City Event</div>
              <div class="desc">${eventStatus}</div>
              <div class="desc muted">Tap mult: ${eMults.tap.toFixed(2)}× · Passive mult: ${eMults.pas.toFixed(2)}×</div>
            </div>
            <div>
              ${state.pendingEvent ? `<button class="btn primary" id="btnEvent">Activate</button>` : `<button class="btn" id="btnEvent" disabled style="opacity:.55;cursor:not-allowed;">No Event</button>`}
            </div>
          </div>
        </div>

        <div class="spacer"></div>

        <div class="row">
          <div class="card" style="flex: 1 1 360px;">
            <h2>Stats</h2>
            <div class="statgrid">
              <div class="stat">
                <div class="k">Cash</div>
                <div class="v">$${fmt(state.cash)}</div>
              </div>
              <div class="stat">
                <div class="k">Total Earned</div>
                <div class="v">$${fmt(state.totalEarned)}</div>
              </div>
              <div class="stat">
                <div class="k">Per Tap</div>
                <div class="v">$${fmt(perTap())}</div>
              </div>
              <div class="stat">
                <div class="k">Passive / sec</div>
                <div class="v">$${fmt(passivePerSec())}</div>
              </div>
            </div>

            <div class="hr"></div>

            <div class="row">
              <button class="btn primary" id="btnTap">Tap (+$${fmt(perTap())})</button>
              <button class="btn" id="btnPrestige">Prestige (+${prestigeGainEstimate()} PP)</button>
            </div>

            <div class="sub muted" style="margin-top:10px;">
              Tip: Prestige when it gives <b>+2× to +3×</b> speed-up (usually +2 PP or more early).
            </div>
          </div>

          <div class="card" style="flex: 2 1 520px;">
            <h2>Upgrades</h2>
            <div class="shop">
              ${shopItemHtml("Tap Boost", `Increase per-tap income.`, `Level ${state.tapLevel}`, costTap(), "buyTap")}
              ${shopItemHtml("Passive Income", `Earn money automatically each second.`, `Level ${state.passiveLevel}`, costPassive(), "buyPassive")}
              ${shopItemHtml("City Development", `Boosts everything & unlocks districts/stages.`, `Level ${state.cityDevLevel}`, costCityDev(), "buyCityDev")}
            </div>

            <div class="hr"></div>

            <h2>Districts</h2>
            <div class="sub muted" style="margin: 0 0 10px 0;">
              Districts unlock as City Development increases. They give multiplicative boosts.
            </div>

            <div class="shop">
              ${state.districts.map(d => districtHtml(d)).join("")}
            </div>
          </div>
        </div>

        <div id="toast" class="toast"></div>
      </div>
    `;

    // Wire buttons
    document.getElementById("btnTap").onclick = () => {
      addCash(perTap());
      renderQuickStats();
    };

    document.getElementById("buyTap").onclick = () => buy(costTap(), () => state.tapLevel++, "Tap Boost upgraded!");
    document.getElementById("buyPassive").onclick = () => buy(costPassive(), () => state.passiveLevel++, "Passive upgraded!");
    document.getElementById("buyCityDev").onclick = () => buy(costCityDev(), () => state.cityDevLevel++, "City Development upgraded!");

    document.getElementById("btnPrestige").onclick = doPrestige;

    const btnEvent = document.getElementById("btnEvent");
    if (btnEvent && state.pendingEvent) btnEvent.onclick = activatePendingEvent;

    document.getElementById("btnExport").onclick = () => {
      const code = exportSave();
      navigator.clipboard?.writeText(code).catch(() => {});
      prompt("Copy your save code:", code);
    };

    document.getElementById("btnImport").onclick = () => {
      const code = prompt("Paste your save code:");
      if (!code) return;
      try { importSave(code); save(); }
      catch { toast("❌ Import failed"); }
    };

    document.getElementById("btnReset").onclick = () => {
      const ok = confirm("Reset EVERYTHING? This cannot be undone (unless you exported a save).");
      if (!ok) return;
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    };

    for (const d of state.districts) {
      const btn = document.getElementById(`buyDistrict_${d.id}`);
      if (!btn) continue;
      btn.onclick = () => {
        if (state.cityDevLevel < d.req) { toast("Locked — raise City Development"); return; }
        buy(costDistrictUpgrade(d), () => d.level++, `${d.name} upgraded!`);
      };
    }
  }

  function shopItemHtml(title, desc, lvl, cost, id) {
    const affordable = state.cash >= cost;
    return `
      <div class="shopItem">
        <div class="t">${title}</div>
        <div class="d">${desc}</div>
        <div class="b">
          <div>
            <div class="lvl">${lvl}</div>
            <div class="cost">Cost: $${fmt(cost)}</div>
          </div>
          <button class="btn ${affordable ? "primary" : ""}" id="${id}">
            Buy
          </button>
        </div>
      </div>
    `;
  }

  function districtHtml(d) {
    const locked = state.cityDevLevel < d.req;
    const cost = costDistrictUpgrade(d);
    const affordable = state.cash >= cost;
    const boostTxt = d.desc;
    return `
      <div class="shopItem" style="${locked ? "opacity:.65" : ""}">
        <div class="t">${d.icon} ${d.name}</div>
        <div class="d">${boostTxt}</div>
        <div class="d muted">Unlocks at City Dev ${d.req}</div>
        <div class="b">
          <div>
            <div class="lvl">Level ${d.level}</div>
            <div class="cost">Cost: $${fmt(cost)}</div>
          </div>
          <button class="btn ${(!locked && affordable) ? "primary" : ""}" id="buyDistrict_${d.id}" ${locked ? "disabled" : ""} style="${locked ? "cursor:not-allowed;" : ""}">
            ${locked ? "Locked" : "Upgrade"}
          </button>
        </div>
      </div>
    `;
  }

  function buy(cost, applyFn, msg) {
    if (state.cash < cost) { toast("Not enough cash."); return; }
    state.cash -= cost;
    applyFn();
    state.prestigeMult = prestigeMultiplierFromPoints(state.prestigePoints);
    applyBackground();
    render();
    toast(msg);
    save();
  }

  // Update only key numbers quickly after tap (keeps UI snappy)
  function renderQuickStats() {
    // easiest reliable approach: rerender (still fast)
    render();
  }

  // ---------- Main Loop ----------
  function tick() {
    const t = now();
    const dt = (t - state.lastTickAt) / 1000;
    state.lastTickAt = t;

    // passive income
    const income = passivePerSec() * dt;
    addCash(income);

    // events
    trySpawnEvent();
    tickEvents();

    // autosave (every ~10s)
    if (t - state.lastSaveAt > 10_000) save();

    // refresh UI (every ~250ms)
    // (We keep it simple: rerender each tick interval.)
  }

  // ---------- Start ----------
  load();
  state.prestigeMult = prestigeMultiplierFromPoints(state.prestigePoints);
  applyBackground();
  render();

  setInterval(() => {
    tick();
    render();
  }, 250);

  window.addEventListener("beforeunload", () => save());
});
