// Flip City — Builder Edition (Goals + Unlocks)
// - Clear "Current Goal" progression
// - NO offline income (pauses when tab hidden)
// - Manual Save/Load/Reset
// Support: cityflipsupport@gmail.com

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game");
  if (!root) return console.error("❌ Missing <div id='game'></div> in index.html");

  const SUPPORT_EMAIL = "cityflipsupport@gmail.com";
  const SAVE_KEY = "flipcity_playable_v2_goals";

  // ---------- helpers ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmt = (n) => Math.floor(n).toLocaleString();
  const now = () => performance.now();

  // ---------- state ----------
  const state = {
    money: 50,         // start with enough to feel like a game
    rps: 1.5,          // baseline (recomputed)
    built: { homes: 0, shops: 0, offices: 0 },

    // milestones (so we can toast once)
    unlocked: { shops: false, offices: false },

    toast: "",
    toastUntil: 0,
  };

  // ---------- economy ----------
  const buildings = [
    {
      key: "homes",
      name: "Homes",
      desc: "+0.8 / sec",
      baseCost: 35,
      addRps: 0.8,
      costGrowth: 1.16,
      unlockAtMoney: 0
    },
    {
      key: "shops",
      name: "Shops",
      desc: "+3.5 / sec",
      baseCost: 160,
      addRps: 3.5,
      costGrowth: 1.18,
      unlockAtMoney: 120
    },
    {
      key: "offices",
      name: "Offices",
      desc: "+12 / sec",
      baseCost: 650,
      addRps: 12,
      costGrowth: 1.20,
      unlockAtMoney: 500
    }
  ];

  function costFor(b) {
    const owned = state.built[b.key] || 0;
    return Math.floor(b.baseCost * Math.pow(b.costGrowth, owned));
  }

  function recomputeRps() {
    let rps = 1.5; // baseline so early game isn't dead
    for (const b of buildings) {
      rps += (state.built[b.key] || 0) * b.addRps;
    }
    state.rps = rps;
  }

  function collectAmount() {
    // Clicking stays useful but not required
    // Example: early: 1–3; later: scales with rps
    return Math.max(1, Math.floor(state.rps * 1.5));
  }

  // ---------- styling ----------
  const style = document.createElement("style");
  style.textContent = `
    :root{
      --bg0:#070b14;
      --bg1:#0b1220;
      --card: rgba(255,255,255,.06);
      --line: rgba(255,255,255,.10);
      --text: #eaf0ff;
      --muted: rgba(234,240,255,.72);
      --accent: rgba(120,190,255,.95);
      --shadow: 0 18px 60px rgba(0,0,0,.55);
      --radius: 18px;
    }

    /* Background scene */
    .scene{
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(1200px 700px at 20% 15%, rgba(120,190,255,.22), transparent 55%),
        radial-gradient(900px 650px at 80% 10%, rgba(255,120,200,.12), transparent 52%),
        radial-gradient(900px 600px at 50% 0%, rgba(130,255,200,.10), transparent 55%),
        linear-gradient(180deg, var(--bg1) 0%, var(--bg0) 70%, #05070f 100%);
    }
    .stars::before{
      content:"";
      position:absolute; inset:-50%;
      background-image:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,.55) 60%, transparent 61%),
        radial-gradient(1px 1px at 25% 70%, rgba(255,255,255,.40) 60%, transparent 61%),
        radial-gradient(1px 1px at 40% 35%, rgba(255,255,255,.45) 60%, transparent 61%),
        radial-gradient(1px 1px at 60% 25%, rgba(255,255,255,.35) 60%, transparent 61%),
        radial-gradient(1px 1px at 75% 65%, rgba(255,255,255,.38) 60%, transparent 61%),
        radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,.30) 60%, transparent 61%);
      background-size: 420px 260px;
      opacity: .7;
      filter: blur(.2px);
      transform: translateZ(0);
    }
    .haze{
      position:absolute; inset:0;
      background:
        radial-gradient(1000px 520px at 50% 30%, rgba(255,255,255,.08), transparent 60%),
        radial-gradient(900px 600px at 30% 50%, rgba(120,190,255,.10), transparent 65%),
        radial-gradient(900px 600px at 70% 55%, rgba(255,120,200,.06), transparent 65%);
      mix-blend-mode: screen;
      opacity: .8;
    }

    /* Skyline grows with progression */
    .skyline{
      position:absolute; left:0; right:0; bottom:0;
      height: 34vh;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.65) 85%, rgba(0,0,0,.8) 100%);
    }
    .buildings{
      position:absolute; left:-2vw; right:-2vw; bottom:-2vh;
      height: 32vh;
      filter: drop-shadow(0 25px 40px rgba(0,0,0,.6));
      opacity: .95;
    }
    .sil{
      position:absolute; bottom:0;
      width: 12vw; min-width: 90px; max-width: 170px;
      background: linear-gradient(180deg, rgba(20,25,40,.9), rgba(5,7,15,.98));
      border: 1px solid rgba(255,255,255,.05);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
      transition: transform .2s ease, filter .2s ease;
    }
    .sil::after{
      content:"";
      position:absolute; inset: 12% 10% 8% 10%;
      background:
        repeating-linear-gradient(to right, rgba(120,190,255,.0) 0px, rgba(120,190,255,.0) 12px, rgba(120,190,255,.20) 13px, rgba(120,190,255,.0) 14px),
        repeating-linear-gradient(to top, rgba(255,255,255,.0) 0px, rgba(255,255,255,.0) 10px, rgba(255,240,200,.16) 11px, rgba(255,255,255,.0) 12px);
      opacity: .55;
      border-radius: 8px 8px 0 0;
      mask: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,.8) 60%, transparent 100%);
    }
    .sil.on{ filter: brightness(1.06); transform: translateY(-2px); }

    /* App layout */
    .wrap{
      position: relative;
      z-index: 1;
      max-width: 1060px;
      margin: 0 auto;
      padding: 22px 18px 120px;
    }
    .topbar{
      display:flex; align-items:flex-end; justify-content:space-between;
      gap: 14px; flex-wrap: wrap; margin-bottom: 14px;
    }
    .title h1{ margin:0; font-size: 22px; letter-spacing: .2px; }
    .title .sub{ margin-top: 4px; font-size: 13px; color: var(--muted); }

    .pillRow{ display:flex; gap:10px; flex-wrap: wrap; align-items:center; justify-content:flex-end; }
    .pill{
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.10);
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 13px;
      color: rgba(234,240,255,.88);
      backdrop-filter: blur(10px);
    }
    .pill strong{ color: var(--text); font-weight: 800; }

    .grid{ display:grid; grid-template-columns: 1.3fr .7fr; gap: 14px; }
    @media (max-width: 900px){ .grid{ grid-template-columns: 1fr; } }

    .card{
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }
    .cardHead{
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      display:flex; align-items:center; justify-content:space-between; gap:10px;
    }
    .cardHead h2{ margin:0; font-size: 14px; letter-spacing: .2px; color: rgba(234,240,255,.92); }
    .cardBody{ padding: 14px 16px 16px; }
    .muted{ color: var(--muted); }

    .bigMoney{ font-size: 42px; font-weight: 900; letter-spacing: -.6px; margin: 6px 0 4px; }
    .rate{ font-size: 13px; color: rgba(234,240,255,.78); }

    .btnRow{ display:flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }

    button{
      appearance:none;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.08);
      color: var(--text);
      padding: 10px 12px;
      border-radius: 14px;
      font-weight: 750;
      cursor:pointer;
      transition: transform .06s ease, background .15s ease, border-color .15s ease;
      user-select:none;
    }
    button:hover{ background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.18); }
    button:active{ transform: translateY(1px); }
    button[disabled]{ opacity: .55; cursor: not-allowed; }

    .primary{
      background: rgba(120,190,255,.18);
      border-color: rgba(120,190,255,.35);
    }
    .primary:hover{
      background: rgba(120,190,255,.22);
      border-color: rgba(120,190,255,.45);
    }

    .list{ display:grid; gap: 10px; }
    .item{
      display:flex; align-items:center; justify-content:space-between;
      gap: 12px; padding: 12px;
      border-radius: 16px;
      background: rgba(0,0,0,.18);
      border: 1px solid rgba(255,255,255,.08);
    }
    .itemLeft{ display:flex; flex-direction:column; gap: 3px; }
    .itemName{ font-weight: 900; letter-spacing: .2px; }
    .itemMeta{ font-size: 12.5px; color: rgba(234,240,255,.72); }

    .itemRight{ display:flex; flex-direction:column; align-items:flex-end; gap: 6px; min-width: 170px; }
    .cost{ font-size: 12.5px; color: rgba(234,240,255,.78); }
    .owned{ font-size: 12.5px; color: rgba(234,240,255,.70); }

    .toast{
      position: fixed;
      left: 50%;
      bottom: 18px;
      transform: translateX(-50%);
      background: rgba(0,0,0,.55);
      border: 1px solid rgba(255,255,255,.14);
      color: rgba(234,240,255,.92);
      padding: 10px 14px;
      border-radius: 999px;
      backdrop-filter: blur(10px);
      box-shadow: 0 16px 60px rgba(0,0,0,.6);
      z-index: 3;
      font-size: 13px;
      max-width: min(720px, calc(100vw - 28px));
      text-align: center;
      display:none;
    }

    .footer{
      margin-top: 14px;
      font-size: 12.5px;
      color: rgba(234,240,255,.62);
      display:flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .footer a{ color: rgba(120,190,255,.92); text-decoration: none; }
    .footer a:hover{ text-decoration: underline; }

    .warn{
      display:inline-flex; align-items:center; gap: 8px;
      padding: 10px 12px; border-radius: 14px;
      background: rgba(255,200,120,.10);
      border: 1px solid rgba(255,200,120,.22);
      color: rgba(255,235,210,.92);
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);

  // ---------- UI ----------
  root.innerHTML = `
    <div class="scene stars">
      <div class="haze"></div>
      <div class="skyline">
        <div class="buildings" id="skyline">
          <div class="sil" id="b1" style="left:6vw;  height:22vh;"></div>
          <div class="sil" id="b2" style="left:18vw; height:28vh;"></div>
          <div class="sil" id="b3" style="left:30vw; height:18vh;"></div>
          <div class="sil" id="b4" style="left:42vw; height:30vh;"></div>
          <div class="sil" id="b5" style="left:56vw; height:20vh;"></div>
          <div class="sil" id="b6" style="left:68vw; height:27vh;"></div>
          <div class="sil" id="b7" style="left:80vw; height:19vh;"></div>
        </div>
      </div>
    </div>

    <div class="wrap">
      <div class="topbar">
        <div class="title">
          <h1>Flip City — Builder Edition</h1>
          <div class="sub">Build up revenue and unlock new zones. Money only earns while this tab is open.</div>
        </div>

        <div class="pillRow">
          <div class="pill">Money: <strong id="moneyPill">$0</strong></div>
          <div class="pill">Revenue: <strong id="rpsPill">0/s</strong></div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="cardHead">
            <h2>City Treasury</h2>
            <div id="pausedBadge" class="warn" style="display:none;">⏸ Paused (tab hidden)</div>
          </div>
          <div class="cardBody">
            <div class="bigMoney" id="moneyBig">$0</div>
            <div class="rate" id="rateLine">Earning 0 per second</div>

            <div class="btnRow">
              <button class="primary" id="clickEarnBtn">Collect</button>
              <button id="saveBtn">Manual Save</button>
              <button id="loadBtn">Manual Load</button>
              <button id="resetBtn" title="Resets your local save">Reset</button>
            </div>

            <div class="footer">
              <div>Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></div>
              <div class="muted">Save key: <code>${SAVE_KEY}</code></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="cardHead">
            <h2>Build</h2>
            <div class="muted" style="font-size:12.5px;">Follow the goal to unlock more.</div>
          </div>
          <div class="cardBody">
            <div class="item" style="margin-bottom:10px;">
              <div class="itemLeft">
                <div class="itemName">Current Goal</div>
                <div class="itemMeta" id="goalText">—</div>
              </div>
              <div class="itemRight" style="min-width:auto; align-items:flex-end;">
                <div class="cost" id="goalProgress">—</div>
              </div>
            </div>

            <div class="list" id="buildList"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="toast" id="toast"></div>
  `;

  const elMoneyPill = document.getElementById("moneyPill");
  const elRpsPill = document.getElementById("rpsPill");
  const elMoneyBig = document.getElementById("moneyBig");
  const elRateLine = document.getElementById("rateLine");
  const elBuildList = document.getElementById("buildList");
  const elToast = document.getElementById("toast");
  const elPausedBadge = document.getElementById("pausedBadge");
  const elGoalText = document.getElementById("goalText");
  const elGoalProgress = document.getElementById("goalProgress");

  const skylineEls = [
    document.getElementById("b1"),
    document.getElementById("b2"),
    document.getElementById("b3"),
    document.getElementById("b4"),
    document.getElementById("b5"),
    document.getElementById("b6"),
    document.getElementById("b7"),
  ];

  // ---------- save/load ----------
  function save() {
    const payload = {
      v: 2,
      money: state.money,
      built: state.built,
      unlocked: state.unlocked
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    toast("✅ Saved");
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data || (data.v !== 2 && data.v !== 1)) return;

      state.money = Number(data.money) || state.money;
      state.built = Object.assign({ homes: 0, shops: 0, offices: 0 }, data.built || {});
      state.unlocked = Object.assign({ shops: false, offices: false }, data.unlocked || {});

      recomputeRps();
      toast("✅ Loaded");
    } catch {
      toast("Save corrupted.");
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    state.money = 50;
    state.built = { homes: 0, shops: 0, offices: 0 };
    state.unlocked = { shops: false, offices: false };
    recomputeRps();
    toast("Reset complete.");
    render();
  }

  // ---------- toast ----------
  function toast(msg) {
    state.toast = msg;
    state.toastUntil = now() + 1600;
    elToast.textContent = msg;
    elToast.style.display = "block";
  }

  // ---------- goals ----------
  function nextUnlockGoal() {
    const locked = buildings
      .filter(b => (b.unlockAtMoney || 0) > 0)
      .filter(b => state.money < (b.unlockAtMoney || 0))
      .sort((a, b) => a.unlockAtMoney - b.unlockAtMoney);

    if (locked.length === 0) {
      return { text: "All buildings unlocked. Build your skyline!", progress: "100%" };
    }

    const g = locked[0];
    const need = g.unlockAtMoney;
    const pct = clamp((state.money / need) * 100, 0, 100);
    return {
      text: `Reach $${fmt(need)} to unlock ${g.name}.`,
      progress: `${pct.toFixed(0)}%`
    };
  }

  function checkUnlockToasts() {
    const shopsUnlockedNow = state.money >= 120;
    const officesUnlockedNow = state.money >= 500;

    if (shopsUnlockedNow && !state.unlocked.shops) {
      state.unlocked.shops = true;
      toast("🎉 Unlocked Shops! Bigger revenue available.");
    }
    if (officesUnlockedNow && !state.unlocked.offices) {
      state.unlocked.offices = true;
      toast("🏙️ Unlocked Offices! Major revenue available.");
    }
  }

  // ---------- render ----------
  function renderSkyline() {
    // Simple “city grows” signal based on total buildings
    const total = (state.built.homes || 0) + (state.built.shops || 0) + (state.built.offices || 0);

    // Turn on more skyline blocks as you build
    const lit = clamp(Math.floor(total / 2), 0, skylineEls.length);

    skylineEls.forEach((el, idx) => {
      if (!el) return;
      el.classList.toggle("on", idx < lit);
    });
  }

  function renderBuildList() {
    elBuildList.innerHTML = "";

    for (const b of buildings) {
      const cost = costFor(b);
      const owned = state.built[b.key] || 0;
      const unlocked = state.money >= (b.unlockAtMoney || 0);
      const canBuy = state.money >= cost && unlocked;

      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <div class="itemLeft">
          <div class="itemName">${b.name}</div>
          <div class="itemMeta">
            ${b.desc}${(b.unlockAtMoney || 0) > 0 ? ` • Unlock at $${fmt(b.unlockAtMoney)}` : ""}
          </div>
        </div>
        <div class="itemRight">
          <div class="cost">Cost: <strong>$${fmt(cost)}</strong></div>
          <div class="owned">Owned: <strong>${fmt(owned)}</strong></div>
          <button ${canBuy ? "" : "disabled"} data-buy="${b.key}">
            ${unlocked ? "Build" : "Locked"}
          </button>
        </div>
      `;
      elBuildList.appendChild(row);
    }

    elBuildList.querySelectorAll("button[data-buy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-buy");
        const b = buildings.find(x => x.key === key);
        if (!b) return;

        const unlocked = state.money >= (b.unlockAtMoney || 0);
        const cost = costFor(b);

        if (!unlocked) return toast("Locked — follow the Current Goal.");
        if (state.money < cost) return toast("Not enough money.");

        state.money -= cost;
        state.built[key] = (state.built[key] || 0) + 1;

        recomputeRps();
        checkUnlockToasts();
        toast(`🏗 Built ${b.name}`);
        render();
      });
    });
  }

  function render() {
    elMoneyPill.textContent = `$${fmt(state.money)}`;
    elMoneyBig.textContent = `$${fmt(state.money)}`;
    elRpsPill.textContent = `${state.rps.toFixed(1)}/s`;

    const cAmt = collectAmount();
    elRateLine.textContent = `Earning ${state.rps.toFixed(1)} per second (only while this tab is visible).`;
    document.getElementById("clickEarnBtn").textContent = `Collect +$${fmt(cAmt)}`;

    const goal = nextUnlockGoal();
    elGoalText.textContent = goal.text;
    elGoalProgress.textContent = goal.progress;

    renderBuildList();
    renderSkyline();
  }

  // ---------- gameplay loop (NO OFFLINE INCOME) ----------
  let lastT = now();
  let visible = !document.hidden;

  function tick() {
    const t = now();
    const dt = (t - lastT) / 1000;
    lastT = t;

    if (visible) {
      const safeDt = clamp(dt, 0, 0.25);
      state.money += state.rps * safeDt;
      checkUnlockToasts();
    }

    // toast timeout
    if (state.toastUntil && t > state.toastUntil) {
      elToast.style.display = "none";
      state.toastUntil = 0;
    }

    // lightweight UI update
    elMoneyPill.textContent = `$${fmt(state.money)}`;
    elMoneyBig.textContent = `$${fmt(state.money)}`;

    requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    elPausedBadge.style.display = visible ? "none" : "inline-flex";
    lastT = now(); // prevents “burst” income when returning
  });

  // ---------- buttons ----------
  document.getElementById("clickEarnBtn").addEventListener("click", () => {
    state.money += collectAmount();
    checkUnlockToasts();
    toast("💰 Collected!");
    render();
  });
  document.getElementById("saveBtn").addEventListener("click", save);
  document.getElementById("loadBtn").addEventListener("click", () => { load(); render(); });
  document.getElementById("resetBtn").addEventListener("click", reset);

  // ---------- boot ----------
  recomputeRps();
  load();
  recomputeRps();
  checkUnlockToasts();
  render();
  requestAnimationFrame(tick);
});
