// Flip City — Builder Edition (v4)
// Real builder feel: place buildings on a grid, adjacency bonuses, 5 upgrades, intro + instructions.
// No external assets. GitHub Pages safe.

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) return console.error("❌ Missing <div id='game'></div> in index.html");

  // -------------------- Styles --------------------
  const style = document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    body{
      margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color:#eaf0ff; min-height:100vh;
      background:
        radial-gradient(900px 450px at 35% 10%, rgba(94,203,255,.16), transparent 55%),
        radial-gradient(900px 450px at 70% 18%, rgba(186,94,255,.12), transparent 55%),
        linear-gradient(180deg, #060716, #0b1220 55%, #05060f);
    }

    .wrap{ max-width: 1180px; margin: 0 auto; padding: 18px; }
    .top{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
    h1{ margin:0; font-size: 20px; letter-spacing:.2px; }
    .sub{ opacity:.82; font-size: 13px; }

    .row{ display:flex; gap:12px; flex-wrap:wrap; align-items:stretch; }
    .grid2{
      display:grid; gap: 12px;
      grid-template-columns: 1.05fr 1.95fr;
      align-items:start;
    }
    @media (max-width: 980px){ .grid2{ grid-template-columns: 1fr; } }

    .card{
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 18px;
      padding: 14px;
      box-shadow: 0 12px 35px rgba(0,0,0,.35);
      backdrop-filter: blur(6px);
    }
    .card h2{ margin:0 0 10px 0; font-size: 14px; opacity:.92; letter-spacing:.2px; }
    .hr{ height:1px; background: rgba(255,255,255,.10); border-radius:99px; margin: 12px 0; }

    .btn{
      appearance:none; border:0; cursor:pointer;
      background: rgba(255,255,255,.10);
      color:#eaf0ff;
      border:1px solid rgba(255,255,255,.16);
      border-radius: 14px;
      padding: 10px 12px;
      font-weight: 800;
      transition: transform .06s ease, background .15s ease, opacity .15s ease;
      user-select:none;
      white-space: nowrap;
    }
    .btn:hover{ background: rgba(255,255,255,.14); }
    .btn:active{ transform: translateY(1px) scale(.99); }
    .btn.primary{ background: rgba(94,203,255,.18); border-color: rgba(94,203,255,.35); }
    .btn.danger{ background: rgba(255,94,94,.14); border-color: rgba(255,94,94,.35); }
    .btn.small{ padding: 8px 10px; border-radius: 12px; font-weight: 800; }
    .btn.ghost{ background: rgba(255,255,255,.06); }

    .pill{
      display:inline-flex; align-items:center; gap:8px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.14);
      font-size: 12px;
      opacity: .95;
    }

    .statsGrid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
    .stat{ background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); border-radius: 14px; padding: 10px; }
    .k{ font-size: 12px; opacity:.78; }
    .v{ margin-top: 4px; font-size: 16px; font-weight: 900; }

    .shop{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    @media (max-width: 560px){ .shop{ grid-template-columns: 1fr; } }
    .shopItem{ background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 12px; display:flex; flex-direction:column; gap: 8px; }
    .shopItem .t{ font-weight: 900; }
    .shopItem .d{ font-size: 12px; opacity:.82; }
    .shopItem .b{ display:flex; justify-content:space-between; align-items:center; gap: 10px; }
    .shopItem .meta{ font-size: 12px; opacity:.86; }

    .buildBar{
      display:flex; gap: 8px; flex-wrap:wrap; align-items:center;
      background: rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.10);
      border-radius: 16px;
      padding: 10px;
    }
    .tool{
      display:flex; gap: 10px; align-items:center;
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      cursor:pointer; user-select:none;
      transition: transform .06s ease, background .15s ease, border-color .15s ease;
      min-width: 170px;
    }
    .tool:hover{ background: rgba(255,255,255,.09); }
    .tool:active{ transform: translateY(1px) scale(.99); }
    .tool.sel{
      background: rgba(94,203,255,.15);
      border-color: rgba(94,203,255,.35);
      box-shadow: 0 0 0 3px rgba(94,203,255,.10);
    }
    .tool .icon{ font-size: 18px; }
    .tool .name{ font-weight: 900; }
    .tool .info{ font-size: 12px; opacity: .82; }

    .cityWrap{ display:flex; flex-direction:column; gap: 10px; }
    .sky{
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.14);
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
      padding: 12px;
      overflow:hidden;
    }
    .skyline{ font-size: 30px; line-height: 1.1; letter-spacing: 2px; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; }
    .hint{ font-size: 12px; opacity:.78; margin-top: 6px; }

    .board{
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.04);
      padding: 12px;
    }
    .grid{
      display:grid;
      grid-template-columns: repeat(10, minmax(0,1fr));
      gap: 8px;
    }
    @media (max-width: 820px){ .grid{ grid-template-columns: repeat(8, minmax(0,1fr)); } }
    @media (max-width: 520px){ .grid{ grid-template-columns: repeat(6, minmax(0,1fr)); } }

    .tile{
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      min-height: 56px;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      cursor:pointer; user-select:none;
      transition: transform .06s ease, background .15s ease, border-color .15s ease;
      position: relative;
      overflow:hidden;
    }
    .tile:hover{ background: rgba(255,255,255,.09); }
    .tile:active{ transform: translateY(1px) scale(.99); }
    .tile .e{ font-size: 22px; }
    .tile .s{ font-size: 10px; opacity:.78; margin-top: 2px; }

    .tile.flash::after{
      content:"";
      position:absolute; inset:-2px;
      background: radial-gradient(250px 140px at 50% 50%, rgba(94,203,255,.30), transparent 60%);
      opacity:.0;
      animation: flash .4s ease;
    }
    @keyframes flash { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }

    .tile.bad{
      border-color: rgba(255,94,94,.45);
      box-shadow: 0 0 0 3px rgba(255,94,94,.10);
    }

    .panelSmall{ font-size: 12px; opacity:.85; line-height: 1.35; }
    .mono{ font-variant-numeric: tabular-nums; }

    .toast{
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
      z-index: 50;
    }
    .toast.show{ opacity: 1; transform: translateX(-50%) translateY(-4px); }

    /* Modal */
    .modalBackdrop{
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      display:flex; align-items:center; justify-content:center;
      padding: 18px;
      z-index: 100;
    }
    .modal{
      width: min(860px, 96vw);
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.16);
      background:
        radial-gradient(900px 450px at 25% 0%, rgba(94,203,255,.18), transparent 55%),
        radial-gradient(900px 450px at 75% 10%, rgba(186,94,255,.14), transparent 55%),
        rgba(11,18,32,.95);
      box-shadow: 0 25px 70px rgba(0,0,0,.55);
      overflow:hidden;
    }
    .modalHeader{
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,.10);
      display:flex; align-items:flex-start; justify-content:space-between; gap: 12px;
    }
    .modalHeader h3{ margin:0; font-size: 16px; letter-spacing:.2px; }
    .modalBody{ padding: 16px; }
    .modalGrid{
      display:grid; gap: 12px;
      grid-template-columns: 1.2fr .8fr;
    }
    @media (max-width: 820px){ .modalGrid{ grid-template-columns: 1fr; } }
    .step{
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 12px;
    }
    .step .title{ font-weight: 950; margin-bottom: 6px; }
    .step .text{ font-size: 12px; opacity:.86; line-height: 1.4; }
    .modalFooter{
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,.10);
      display:flex; align-items:center; justify-content:space-between; gap: 10px;
      flex-wrap:wrap;
    }

    a { color: inherit; }
  `;
  document.head.appendChild(style);

  // -------------------- Helpers --------------------
  const now = () => Date.now();
  const SAVE_KEY = "flipcity_builder_v4";

  const fmt = (n) => {
    if (!Number.isFinite(n)) return "∞";
    const abs = Math.abs(n);
    if (abs < 1000) return n.toFixed(0);
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let u = -1, v = abs;
    while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
    const sign = n < 0 ? "-" : "";
    return `${sign}${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)}${units[u]}`;
  };

  const toast = (msg) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 1400);
  };

  const safeParse = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };

  // Grid size (10x8 = 80 tiles, good builder feel; responsive CSS reduces columns on small screens)
  const W = 10, H = 8;

  // Tile contents
  const EMPTY = "empty";
  const TYPES = {
    empty:  { key: "empty",  name: "Empty",  icon: "⬜", cost: 0,  base: 0,  info: "Open land." },
    road:   { key: "road",   name: "Road",   icon: "🛣️", cost: 8,  base: 0,  info: "Boosts nearby Shops/Factories." },
    house:  { key: "house",  name: "House",  icon: "🏠", cost: 15, base: 0.6,info: "+Passive income. Likes Parks & Roads." },
    shop:   { key: "shop",   name: "Shop",   icon: "🏪", cost: 35, base: 0.0,info: "+Per-tap income. Likes Roads & Houses." },
    factory:{ key: "factory",name: "Factory",icon: "🏭", cost: 80, base: 2.2,info: Big passive. Likes Roads. Hates Parks." },
    park:   { key: "park",   name: "Park",   icon: "🌳", cost: 20, base: 0.0,info: Boosts nearby Houses/Shops." },
  };

  // Build menu order
  const BUILD_MENU = ["house","shop","factory","park","road","bulldoze"];

  // -------------------- State --------------------
  const state = {
    cash: 50,
    totalEarned: 0,
    lastTickAt: now(),
    lastSaveAt: 0,

    // board tiles store { type, lvl }
    board: Array.from({ length: W * H }, () => ({ type: EMPTY, lvl: 0 })),

    // placement tool
    tool: "house", // default selection

    // 5 upgrades (builder-focused)
    up: {
      zoning: 0,     // increases all building output
      efficiency: 0, // reduces building costs
      commerce: 0,   // increases shop per-tap power
      logistics: 0,  // increases road adjacency effects
      parks: 0,      // increases park adjacency effects (and reduces factory-park penalty)
    },

    // first run intro flag
    seenIntro: false
  };

  // -------------------- Mechanics --------------------
  function idx(x, y) { return y * W + x; }
  function inBounds(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }

  function neighbors4(x, y) {
    const n = [];
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx,dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (inBounds(nx, ny)) n.push([nx, ny]);
    }
    return n;
  }
  function neighbors8(x, y) {
    const n = [];
    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
      if (dx===0 && dy===0) continue;
      const nx = x + dx, ny = y + dy;
      if (inBounds(nx, ny)) n.push([nx, ny]);
    }
    return n;
  }

  // Upgrade effects
  function zoningMult() { return 1 + state.up.zoning * 0.08; }          // +8%/lvl
  function costMult() { return 1 - Math.min(0.45, state.up.efficiency * 0.05); } // -5%/lvl up to -45%
  function roadPower() { return 1 + state.up.logistics * 0.10; }         // +10%/lvl
  function parkPower() { return 1 + state.up.parks * 0.12; }             // +12%/lvl
  function shopMult() { return 1 + state.up.commerce * 0.12; }           // +12%/lvl

  function buildingCost(typeKey) {
    if (typeKey === "bulldoze") return 0;
    const t = TYPES[typeKey];
    return Math.ceil(t.cost * costMult());
  }

  function bulldozeRefund(tile) {
    if (tile.type === EMPTY) return 0;
    // small refund so bulldozing isn't a total loss
    const base = buildingCost(tile.type);
    return Math.floor(base * 0.35);
  }

  // Adjacency rules (builder feel)
  // - Parks boost Houses & Shops in 8-neighborhood
  // - Roads boost Shops & Factories in 4-neighborhood (logistics)
  // - Houses near Shops get small bonus (walkability)
  // - Factories near Parks get penalty (pollution), reduced by park upgrade
  function computeTileYield(x, y) {
    const tile = state.board[idx(x,y)];
    if (tile.type === EMPTY || tile.type === "road" || tile.type === "park") {
      return { passive: 0, tap: 0, mood: "" };
    }

    let passive = 0;
    let tap = 0;
    let moodParts = [];

    const t = TYPES[tile.type];
    // base output
    passive += t.base;

    // scan neighbors
    let parksAround = 0, roads4 = 0, houses8 = 0, shops8 = 0;
    for (const [nx, ny] of neighbors8(x, y)) {
      const nt = state.board[idx(nx, ny)].type;
      if (nt === "park") parksAround++;
      if (nt === "house") houses8++;
      if (nt === "shop") shops8++;
    }
    for (const [nx, ny] of neighbors4(x, y)) {
      const nt = state.board[idx(nx, ny)].type;
      if (nt === "road") roads4++;
    }

    // type-specific interactions
    if (tile.type === "house") {
      // Houses love parks & a bit of road access
      const pBonus = 1 + parksAround * 0.08 * parkPower();
      const rBonus = 1 + roads4 * 0.05 * roadPower();
      passive *= pBonus * rBonus;
      if (parksAround > 0) moodParts.push(`+Parks`);
      if (roads4 > 0) moodParts.push(`+Roads`);
    }

    if (tile.type === "shop") {
      // Shops convert city activity into per-tap power; roads help deliveries; houses help customers
      const rBonus = 1 + roads4 * 0.10 * roadPower();
      const hBonus = 1 + houses8 * 0.03;
      // Shops primarily add per-tap, but also tiny passive
      tap += (0.7 + state.up.commerce * 0.12) * rBonus * hBonus; // per-tap additive
      passive += 0.08 * rBonus; // small passive
      if (roads4 > 0) moodParts.push(`+Roads`);
      if (houses8 > 0) moodParts.push(`+Houses`);
    }

    if (tile.type === "factory") {
      // Factories big passive; roads very important; parks nearby are bad (pollution)
      const rBonus = 1 + roads4 * 0.14 * roadPower();
      passive *= rBonus;
      if (roads4 > 0) moodParts.push(`+Roads`);

      if (parksAround > 0) {
        // penalty reduced by parks upgrade
        const penaltyPerPark = Math.max(0.02, 0.06 - state.up.parks * 0.007);
        const pen = 1 - parksAround * penaltyPerPark;
        passive *= Math.max(0.55, pen);
        moodParts.push(`-Parks`);
      }
    }

    // global zoning multiplier
    passive *= zoningMult();
    tap *= zoningMult() * shopMult();

    return { passive, tap, mood: moodParts.join(" ") };
  }

  function totalYields() {
    let passive = 0;
    let tap = 0;
    for (let y=0; y<H; y++) for (let x=0; x<W; x++) {
      const yld = computeTileYield(x,y);
      passive += yld.passive;
      tap += yld.tap;
    }
    return { passive, tap };
  }

  function skylineString() {
    // show the “top row vibe”: count buildings and show a small skyline preview
    const counts = { house:0, shop:0, factory:0, park:0, road:0 };
    for (const t of state.board) if (t.type !== EMPTY) counts[t.type] = (counts[t.type]||0)+1;

    const b = [];
    const pushN = (icon, n) => { for (let i=0;i<n;i++) b.push(icon); };

    // skyline composition: factories, shops, houses + some trees
    pushN("🏭", Math.min(3, counts.factory));
    pushN("🏪", Math.min(4, counts.shop));
    pushN("🏠", Math.min(8, counts.house));
    pushN("🌳", Math.min(4, counts.park));
    if (b.length === 0) return "⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜";
    return b.slice(0, 12).join(" ");
  }

  // -------------------- Save / Load --------------------
  function exportSave() {
    const data = {
      v: 4,
      cash: state.cash,
      totalEarned: state.totalEarned,
      board: state.board,
      up: state.up,
      seenIntro: state.seenIntro,
      lastTickAt: state.lastTickAt
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  function importSave(code) {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = safeParse(json, null);
    if (!data || data.v !== 4) throw new Error("Bad save");

    state.cash = Number(data.cash ?? 0) || 0;
    state.totalEarned = Number(data.totalEarned ?? 0) || 0;

    if (Array.isArray(data.board) && data.board.length === W*H) {
      state.board = data.board.map(t => ({
        type: TYPES[t.type]?.key ? t.type : EMPTY,
        lvl: 0
      }));
    }

    state.up = {
      zoning: Math.max(0, Math.floor(Number(data.up?.zoning ?? 0) || 0)),
      efficiency: Math.max(0, Math.floor(Number(data.up?.efficiency ?? 0) || 0)),
      commerce: Math.max(0, Math.floor(Number(data.up?.commerce ?? 0) || 0)),
      logistics: Math.max(0, Math.floor(Number(data.up?.logistics ?? 0) || 0)),
      parks: Math.max(0, Math.floor(Number(data.up?.parks ?? 0) || 0)),
    };

    state.seenIntro = !!data.seenIntro;
    state.lastTickAt = Number(data.lastTickAt ?? now()) || now();
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

  // -------------------- Upgrades (5) --------------------
  function costUpgrade(key) {
    const lvl = state.up[key];
    const base = {
      zoning: 120,
      efficiency: 140,
      commerce: 130,
      logistics: 150,
      parks: 125
    }[key] || 120;
    const growth = {
      zoning: 1.22,
      efficiency: 1.24,
      commerce: 1.23,
      logistics: 1.25,
      parks: 1.23
    }[key] || 1.23;

    return Math.ceil(base * Math.pow(growth, lvl) * (1 + lvl * 0.02));
  }

  function buyUpgrade(key) {
    const c = costUpgrade(key);
    if (state.cash < c) return toast("Not enough cash.");
    state.cash -= c;
    state.up[key] += 1;
    toast("Upgrade purchased!");
    render();
    save();
  }

  // -------------------- Building Placement --------------------
  function tryPlace(x, y) {
    const i = idx(x, y);
    const tile = state.board[i];

    if (state.tool === "bulldoze") {
      if (tile.type === EMPTY) return toast("Nothing to bulldoze.");
      const refund = bulldozeRefund(tile);
      state.board[i] = { type: EMPTY, lvl: 0 };
      state.cash += refund;
      toast(`Bulldozed (+$${fmt(refund)})`);
      flashTile(i);
      render();
      save();
      return;
    }

    const type = state.tool;
    const cost = buildingCost(type);

    if (tile.type !== EMPTY) return toast("That tile is occupied. Use Bulldoze.");
    if (state.cash < cost) return toast("Not enough cash to build that.");

    state.cash -= cost;
    state.board[i] = { type, lvl: 0 };
    toast(`Built: ${TYPES[type].icon} ${TYPES[type].name}`);
    flashTile(i);
    render();
    save();
  }

  function flashTile(index) {
    const el = document.querySelector(`[data-i="${index}"]`);
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth; // restart animation
    el.classList.add("flash");
  }

  // -------------------- Tapping --------------------
  function tapCity() {
    const { tap } = totalYields();
    const baseTap = 1.0;
    const gain = (baseTap + tap) * (1 + state.up.zoning * 0.02);
    state.cash += gain;
    state.totalEarned += gain;
    toast(`+$${fmt(gain)} (tap)`);
    render();
  }

  // -------------------- Main tick (passive) --------------------
  function tick() {
    const t = now();
    const dt = (t - state.lastTickAt) / 1000;
    state.lastTickAt = t;

    const { passive } = totalYields();
    const gain = passive * dt;
    if (gain > 0) {
      state.cash += gain;
      state.totalEarned += gain;
    }

    if (t - state.lastSaveAt > 10_000) save();
  }

  // -------------------- UI --------------------
  function toolCard(key) {
    if (key === "bulldoze") {
      const sel = state.tool === "bulldoze";
      return `
        <div class="tool ${sel ? "sel" : ""}" data-tool="bulldoze">
          <div class="icon">🧹</div>
          <div>
            <div class="name">Bulldoze</div>
            <div class="info">Clear a tile (refund ~35%).</div>
          </div>
        </div>
      `;
    }

    const t = TYPES[key];
    const sel = state.tool === key;
    const cost = buildingCost(key);

    return `
      <div class="tool ${sel ? "sel" : ""}" data-tool="${key}">
        <div class="icon">${t.icon}</div>
        <div>
          <div class="name">${t.name} <span class="mono" style="opacity:.75;">$${fmt(cost)}</span></div>
          <div class="info">${t.info}</div>
        </div>
      </div>
    `;
  }

  function shopItem(title, desc, meta, cost, id, primary=false) {
    return `
      <div class="shopItem">
        <div class="t">${title}</div>
        <div class="d">${desc}</div>
        <div class="b">
          <div>
            <div class="meta">${meta}</div>
            <div class="meta">Cost: <b>$${fmt(cost)}</b></div>
          </div>
          <button class="btn ${primary ? "primary" : ""}" id="${id}">Buy</button>
        </div>
      </div>
    `;
  }

  function renderModal() {
    if (state.seenIntro) return "";

    return `
      <div class="modalBackdrop" id="introBackdrop">
        <div class="modal">
          <div class="modalHeader">
            <div>
              <h3>Welcome to Flip City — Builder Edition</h3>
              <div class="sub">You’re the city planner. Place buildings, connect roads, and grow a living economy.</div>
            </div>
            <button class="btn small ghost" id="btnSkipIntro">Close</button>
          </div>

          <div class="modalBody">
            <div class="modalGrid">
              <div class="step">
                <div class="title">1) Pick a building</div>
                <div class="text">
                  Use the <b>Build Menu</b> (House, Shop, Factory, Park, Road). Each has a cost and a role.
                </div>
              </div>
              <div class="step">
                <div class="title">Pro tip</div>
                <div class="text">
                  Start with <b>Houses</b> + <b>Parks</b>, then add <b>Roads</b> and <b>Shops</b> for tap power.
                </div>
              </div>

              <div class="step">
                <div class="title">2) Place on the grid</div>
                <div class="text">
                  Click a tile to build. If you make a mistake, choose <b>Bulldoze</b>.
                </div>
              </div>
              <div class="step">
                <div class="title">Adjacency matters</div>
                <div class="text">
                  <b>Parks</b> boost nearby Houses/Shops. <b>Roads</b> boost Shops/Factories.
                  Keep <b>Factories away from Parks</b> (pollution penalty).
                </div>
              </div>

              <div class="step">
                <div class="title">3) Earn two ways</div>
                <div class="text">
                  <b>Passive</b> comes from Houses/Factories (with bonuses). <b>Tap</b> power comes mostly from Shops.
                  Use the big <b>Tap</b> button when you want bursts of cash.
                </div>
              </div>
              <div class="step">
                <div class="title">Upgrades (5)</div>
                <div class="text">
                  Improve the whole city: <b>Zoning</b>, <b>Efficiency</b> (cheaper builds), <b>Commerce</b> (shops),
                  <b>Logistics</b> (roads), <b>Parks</b> (green bonuses).
                </div>
              </div>
            </div>
          </div>

          <div class="modalFooter">
            <span class="sub">You can reopen instructions anytime with <b>Help</b>.</span>
            <button class="btn primary" id="btnStartGame">Start Building</button>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const yields = totalYields();

    root.innerHTML = `
      <div class="wrap">
        <div class="top">
          <div>
            <h1>Flip City</h1>
            <div class="sub">A city builder where placement + adjacency = profit.</div>
          </div>
          <div class="row">
            <button class="btn small" id="btnHelp">Help</button>
            <button class="btn small" id="btnExport">Export</button>
            <button class="btn small" id="btnImport">Import</button>
            <button class="btn small danger" id="btnReset">Reset</button>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="card sky" style="flex:1 1 680px;">
            <h2>Skyline Preview</h2>
            <div class="skyline">${skylineString()}</div>
            <div class="hint">Your skyline changes as you place buildings. Parks + roads improve yields.</div>
            <div class="row" style="margin-top:10px;">
              <span class="pill">Cash: <b class="mono">$${fmt(state.cash)}</b></span>
              <span class="pill">Passive/sec: <b class="mono">$${fmt(yields.passive)}</b></span>
              <span class="pill">Tap power: <b class="mono">$${fmt(1 + yields.tap)}</b></span>
              <span class="pill">Zoning: <b>${(zoningMult()).toFixed(2)}×</b></span>
              <span class="pill">Build discount: <b>${Math.round((1-costMult())*100)}%</b></span>
            </div>
          </div>
        </div>

        <div class="grid2" style="margin-top:12px;">
          <div class="card">
            <h2>Stats</h2>
            <div class="statsGrid">
              <div class="stat"><div class="k">Cash</div><div class="v mono">$${fmt(state.cash)}</div></div>
              <div class="stat"><div class="k">Total Earned</div><div class="v mono">$${fmt(state.totalEarned)}</div></div>
              <div class="stat"><div class="k">Passive / sec</div><div class="v mono">$${fmt(yields.passive)}</div></div>
              <div class="stat"><div class="k">Tap Power</div><div class="v mono">$${fmt(1 + yields.tap)}</div></div>
            </div>

            <div class="hr"></div>

            <button class="btn primary" id="btnTap">Tap (collect activity)</button>
            <div class="panelSmall" style="margin-top:10px;">
              Tap is boosted by <b>Shops</b>, and Shops get stronger with <b>Roads</b> and nearby <b>Houses</b>.
            </div>

            <div class="hr"></div>

            <h2>Build Menu</h2>
            <div class="buildBar" id="buildBar">
              ${BUILD_MENU.map(toolCard).join("")}
            </div>

            <div class="panelSmall" style="margin-top:10px;">
              Selected: <b>${state.tool === "bulldoze" ? "Bulldoze" : TYPES[state.tool].name}</b>
              ${state.tool !== "bulldoze" ? ` · Cost: <b>$${fmt(buildingCost(state.tool))}</b>` : ""}
            </div>
          </div>

          <div class="card cityWrap">
            <h2>City Grid</h2>
            <div class="panelSmall">
              Click a tile to place the selected building. Hover/tap tiles to see their yields.
            </div>
            <div class="board">
              <div class="grid" id="grid"></div>
            </div>

            <div class="hr"></div>

            <h2>Upgrades (5)</h2>
            <div class="shop">
              ${shopItem(
                "Zoning Policy",
                "All buildings earn more (global multiplier).",
                `Level ${state.up.zoning} · ${(zoningMult()).toFixed(2)}× output`,
                costUpgrade("zoning"),
                "up_zoning",
                true
              )}
              ${shopItem(
                "Construction Efficiency",
                "Buildings cost less to place.",
                `Level ${state.up.efficiency} · ${Math.round((1-costMult())*100)}% discount`,
                costUpgrade("efficiency"),
                "up_efficiency"
              )}
              ${shopItem(
                "Commerce Boost",
                "Shops generate more tap power.",
                `Level ${state.up.commerce} · ${(shopMult()).toFixed(2)}× shop tap`,
                costUpgrade("commerce"),
                "up_commerce"
              )}
              ${shopItem(
                "Logistics Network",
                "Road bonuses get stronger.",
                `Level ${state.up.logistics} · ${(roadPower()).toFixed(2)}× road effects`,
                costUpgrade("logistics"),
                "up_logistics"
              )}
              ${shopItem(
                "Parks Department",
                "Park bonuses get stronger; factories less annoyed by parks.",
                `Level ${state.up.parks} · ${(parkPower()).toFixed(2)}× park effects`,
                costUpgrade("parks"),
                "up_parks"
              )}
            </div>

            <div class="panelSmall" style="margin-top:10px;">
              Builder tip: <b>Parks near Houses</b> are huge early. <b>Roads next to Shops/Factories</b> are huge mid-game.
            </div>
          </div>
        </div>

        <div id="toast" class="toast"></div>
        ${renderModal()}
      </div>
    `;

    // Wire build tools
    document.querySelectorAll("[data-tool]").forEach(el => {
      el.addEventListener("click", () => {
        state.tool = el.getAttribute("data-tool");
        render();
      });
    });

    // Render grid tiles
    const grid = document.getElementById("grid");
    for (let y=0; y<H; y++) for (let x=0; x<W; x++) {
      const i = idx(x,y);
      const tile = state.board[i];
      const yld = computeTileYield(x,y);
      const icon = TYPES[tile.type].icon;

      const title = (() => {
        if (tile.type === EMPTY) return "Empty land";
        const parts = [
          `${TYPES[tile.type].name}`,
          `Passive: $${fmt(yld.passive)}/sec`,
          `Tap: +$${fmt(yld.tap)} per tap`,
        ];
        if (yld.mood) parts.push(`Adjacency: ${yld.mood}`);
        return parts.join(" • ");
      })();

      const div = document.createElement("div");
      div.className = "tile";
      div.setAttribute("data-i", String(i));
      div.title = title;
      div.innerHTML = `
        <div class="e">${icon}</div>
        <div class="s">${tile.type === EMPTY ? "" : yld.mood || ""}</div>
      `;
      div.addEventListener("click", () => tryPlace(x,y));
      grid.appendChild(div);
    }

    // Wire buttons
    document.getElementById("btnTap").onclick = tapCity;

    document.getElementById("up_zoning").onclick = () => buyUpgrade("zoning");
    document.getElementById("up_efficiency").onclick = () => buyUpgrade("efficiency");
    document.getElementById("up_commerce").onclick = () => buyUpgrade("commerce");
    document.getElementById("up_logistics").onclick = () => buyUpgrade("logistics");
    document.getElementById("up_parks").onclick = () => buyUpgrade("parks");

    document.getElementById("btnHelp").onclick = () => {
      state.seenIntro = false;
      render();
    };

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

    // Modal buttons
    const startBtn = document.getElementById("btnStartGame");
    const skipBtn = document.getElementById("btnSkipIntro");
    if (startBtn) startBtn.onclick = () => { state.seenIntro = true; save(); render(); };
    if (skipBtn) skipBtn.onclick = () => { state.seenIntro = true; save(); render(); };
  }

  // -------------------- Boot --------------------
  load();
  render();

  setInterval(() => {
    tick();
    render();
  }, 400);

  window.addEventListener("beforeunload", () => save());
});
