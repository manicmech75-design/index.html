(() => {
  const SAVE_KEY = "flipcity_save_v1";

  // ----- DEFAULT STATE -----
  const defaultState = () => ({
    cash: 0,
    perTap: 1,
    upgradeCost: 10,
    tiles: Array.from({ length: 8 }, (_, i) => ({
      id: i,
      built: false,
      name: "Empty Lot",
      level: 0
    })),
    lastTick: Date.now()
  });

  let state = defaultState();

  // ----- DOM -----
  const cashEl = document.getElementById("cash");
  const perTapEl = document.getElementById("perTap");
  const upgradeCostEl = document.getElementById("upgradeCost");
  const statusEl = document.getElementById("status");

  const tapBtn = document.getElementById("tapBtn");
  const upgradeBtn = document.getElementById("upgradeBtn");
  const cityGrid = document.getElementById("cityGrid");

  // ----- SAVE / LOAD -----
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      // If storage is blocked/full, game still runs.
      console.warn("Save failed:", e);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw);

      // Merge with defaults so missing fields don't break updates
      const d = defaultState();
      state = {
        ...d,
        ...parsed,
        tiles: Array.isArray(parsed.tiles) ? parsed.tiles : d.tiles
      };

      // Ensure tile ids exist and are consistent
      state.tiles = state.tiles.map((t, idx) => ({
        id: typeof t.id === "number" ? t.id : idx,
        built: !!t.built,
        name: typeof t.name === "string" ? t.name : (t.built ? "Starter Shop" : "Empty Lot"),
        level: Number.isFinite(t.level) ? Math.max(0, Math.floor(t.level)) : 0
      }));

      if (!Number.isFinite(state.cash)) state.cash = 0;
      if (!Number.isFinite(state.perTap)) state.perTap = 1;
      if (!Number.isFinite(state.upgradeCost)) state.upgradeCost = 10;

      if (!Number.isFinite(state.lastTick)) state.lastTick = Date.now();
      return true;
    } catch (e) {
      console.warn("Load failed:", e);
      return false;
    }
  }

  // Throttled save so we don't hammer storage
  let savePending = false;
  function requestSave() {
    if (savePending) return;
    savePending = true;
    setTimeout(() => {
      savePending = false;
      saveGame();
    }, 300);
  }

  // ----- HELPERS -----
  function getPassivePerSecond() {
    // Each built tile earns its level per second
    return state.tiles.reduce((sum, t) => sum + (t.built ? t.level : 0), 0);
  }

  function earn(amount) {
    state.cash += amount;
    updateUI();
    requestSave();
  }

  function spend(amount) {
    if (state.cash < amount) return false;
    state.cash -= amount;
    updateUI();
    requestSave();
    return true;
  }

  // ----- UI -----
  function updateUI() {
    cashEl.textContent = Math.floor(state.cash);
    perTapEl.textContent = state.perTap;
    upgradeCostEl.textContent = state.upgradeCost;

    const canUpgrade = state.cash >= state.upgradeCost;
    upgradeBtn.disabled = !canUpgrade;
    upgradeBtn.style.opacity = canUpgrade ? 1 : 0.6;
  }

  function renderTiles() {
    cityGrid.innerHTML = "";

    state.tiles.forEach(tile => {
      const el = document.createElement("div");
      el.className = "tile";

      if (!tile.built) {
        el.innerHTML = `
          <div class="tTitle">Empty Lot</div>
          <div class="tSub">Tap to build (cost 25)</div>
        `;
      } else {
        const upgradeCost = 20 + tile.level * 15; // scalable
        el.innerHTML = `
          <div class="tTitle">${tile.name}</div>
          <div class="tSub">Level ${tile.level} • +${tile.level}/sec</div>
          <div class="tSub">Tap to upgrade (cost ${upgradeCost})</div>
        `;
      }

      el.addEventListener("click", () => onTileClick(tile.id));
      cityGrid.appendChild(el);
    });
  }

  // ----- GAME LOGIC -----
  function onTileClick(id) {
    const t = state.tiles.find(x => x.id === id);
    if (!t) return;

    if (!t.built) {
      const buildCost = 25;
      if (!spend(buildCost)) {
        statusEl.textContent = `Need ${buildCost} cash to build a tile.`;
        return;
      }
      t.built = true;
      t.level = 1;
      t.name = "Starter Shop";
      statusEl.textContent = `Built: ${t.name} ✅ (+1/sec)`;
      renderTiles();
      requestSave();
      return;
    }

    // Upgrade built tile
    const cost = 20 + t.level * 15;
    if (!spend(cost)) {
      statusEl.textContent = `Need ${cost} cash to upgrade this tile.`;
      return;
    }
    t.level += 1;

    // Rename a bit as it grows (simple flavor)
    if (t.level === 3) t.name = "Neighborhood Store";
    if (t.level === 6) t.name = "Busy Market";
    if (t.level === 10) t.name = "City Plaza";

    statusEl.textContent = `Upgraded! ${t.name} is now Level ${t.level} ✅ (+${t.level}/sec)`;
    renderTiles();
    requestSave();
  }

  // ----- BUTTONS -----
  tapBtn.addEventListener("click", () => {
    earn(state.perTap);
    statusEl.textContent = `Tapped +${state.perTap}.`;
  });

  upgradeBtn.addEventListener("click", () => {
    if (!spend(state.upgradeCost)) return;
    state.perTap += 1;
    state.upgradeCost = Math.floor(state.upgradeCost * 1.35) + 5;
    statusEl.textContent = `Upgrade bought ✅ Per Tap is now ${state.perTap}.`;
    updateUI();
    requestSave();
  });

  // ----- PASSIVE INCOME TICK -----
  function applyOfflineProgress() {
    // Give earnings for time away (capped so it doesn't explode)
    const now = Date.now();
    const elapsedMs = Math.max(0, now - (state.lastTick || now));
    const elapsedSec = Math.min(60 * 60 * 6, Math.floor(elapsedMs / 1000)); // cap at 6 hours
    const pps = getPassivePerSecond();

    if (elapsedSec > 1 && pps > 0) {
      const gained = elapsedSec * pps;
      state.cash += gained;
      statusEl.textContent = `Welcome back ✅ You earned +${gained} while away.`;
    }

    state.lastTick = now;
    requestSave();
  }

  function startPassiveLoop() {
    setInterval(() => {
      const pps = getPassivePerSecond();
      if (pps > 0) {
        state.cash += pps; // per second
        updateUI();
        requestSave();
      }
      state.lastTick = Date.now();
    }, 1000);
  }

  // ----- INIT -----
  function init() {
    const loaded = loadGame();
    if (!loaded) {
      state = defaultState();
      saveGame();
    }

    updateUI();
    renderTiles();

    applyOfflineProgress();
    startPassiveLoop();

    // also save when user leaves / background
    window.addEventListener("beforeunload", saveGame);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveGame();
    });

    const pps = getPassivePerSecond();
    statusEl.innerHTML = `Game loaded <span class="ok">✅</span> Passive: ${pps}/sec.`;
  }

  init();
})();
