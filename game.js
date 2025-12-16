(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // UI
  const cashEl = $("cash");
  const perTapEl = $("perTap");
  const perSecEl = $("perSec");
  const tilesEl = $("tiles");
  const logEl = $("log");

  const installBtn = $("installBtn");
  const exportBtn = $("exportBtn");
  const importBtn = $("importBtn");
  const resetBtn = $("resetBtn");

  const tapBoostPriceEl = $("tapBoostPrice");
  const passivePriceEl = $("passivePrice");
  const tileUpPriceEl = $("tileUpPrice");

  const buyTapBoostBtn = $("buyTapBoost");
  const buyPassiveBtn = $("buyPassive");
  const buyTileUpBtn = $("buyTileUp");

  const soundToggleEl = $("soundToggle");
  const hapticToggleEl = $("hapticToggle");

  const offlineModalEl = $("offlineModal");
  const offlineTextEl = $("offlineText");
  const offlineOkEl = $("offlineOk");

  // State
  const SAVE_KEY = "cityflip_save_v2";

  const TILE_NAMES = [
    "Downtown", "Suburbs", "Industrial",
    "Beach", "Airport", "Old Town",
    "Tech Park", "Harbor", "Hills"
  ];

  const defaultState = () => ({
    cash: 0,
    perTap: 1,
    perSec: 0,

    tapBoostLevel: 0,
    passiveLevel: 0,
    cityDevLevel: 0, // boosts all tiles

    tiles: Array.from({ length: 9 }, () => ({ level: 0 })), // per-tile levels

    settings: {
      sound: true,
      haptics: true
    },

    lastTick: Date.now()
  });

  let state = load() ?? defaultState();

  // ---------- Helpers ----------
  function formatMoney(n) {
    const sign = n < 0 ? "-" : "";
    n = Math.abs(n);

    if (n < 1000) return `${sign}$${Math.floor(n)}`;
    if (n < 1e6) return `${sign}$${(n / 1e3).toFixed(1)}K`;
    if (n < 1e9) return `${sign}$${(n / 1e6).toFixed(1)}M`;
    return `${sign}$${(n / 1e9).toFixed(1)}B`;
  }

  function log(msg) {
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] ${msg}`;
    const div = document.createElement("div");
    div.textContent = line;
    logEl.prepend(div);
    while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
  }

  // Tiny click sound (no external files)
  let audioCtx = null;
  function clickSound() {
    if (!state.settings.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "square";
      o.frequency.value = 520;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  function hapticTap() {
    if (!state.settings.haptics) return;
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) {}
    }
  }

  // ---------- Tile math ----------
  function tileTapBonus(tileIndex) {
    const perTileLevel = state.tiles[tileIndex]?.level ?? 0;
    // base bonus is 1, plus city development, plus per-tile level
    return 1 + state.cityDevLevel + perTileLevel;
  }

  function tileUpgradeCost(tileIndex) {
    const lvl = state.tiles[tileIndex]?.level ?? 0;
    // slightly different base cost per tile so they feel distinct
    const base = 30 + tileIndex * 6;
    return Math.floor(base * Math.pow(1.65, lvl));
  }

  function tileTapEarn(tileIndex) {
    return state.perTap + tileTapBonus(tileIndex);
  }

  // ---------- Render ----------
  function renderTiles() {
    tilesEl.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      const tile = document.createElement("div");
      tile.className = "tile";

      const top = document.createElement("div");
      top.className = "tileTop";

      const name = document.createElement("div");
      name.className = "name";
      name.textContent = TILE_NAMES[i];

      const lvl = document.createElement("div");
      lvl.className = "lvl";
      lvl.textContent = `Lv ${state.tiles[i]?.level ?? 0}`;

      top.appendChild(name);
      top.appendChild(lvl);

      const small = document.createElement("div");
      small.className = "small";
      small.textContent = `Bonus: +${tileTapBonus(i)}  (City Dev +${state.cityDevLevel})`;

      const gain = document.createElement("div");
      gain.className = "gain";
      gain.textContent = `Tap: +${formatMoney(tileTapEarn(i))}`;

      const upBtn = document.createElement("button");
      upBtn.className = "tileBtn";
      upBtn.textContent = `Upgrade (${formatMoney(tileUpgradeCost(i))})`;

      // Tap to earn
      tile.addEventListener("click", () => {
        const earned = tileTapEarn(i);
        state.cash += earned;
        clickSound();
        hapticTap();
        updateUI();
        maybeSaveSoon();
      });

      // Upgrade button
      upBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cost = tileUpgradeCost(i);
        if (state.cash < cost) return;

        state.cash -= cost;
        state.tiles[i].level += 1;

        clickSound();
        hapticTap();
        log(`${TILE_NAMES[i]} upgraded to Lv ${state.tiles[i].level}.`);
        renderTiles();
        updateUI();
        save();
      });

      tile.appendChild(top);
      tile.appendChild(small);
      tile.appendChild(gain);
      tile.appendChild(upBtn);

      tilesEl.appendChild(tile);
    }
  }

  function updateUI() {
    cashEl.textContent = formatMoney(state.cash);
    perTapEl.textContent = formatMoney(state.perTap);
    perSecEl.textContent = `${formatMoney(state.perSec)}/s`;

    tapBoostPriceEl.textContent = formatMoney(priceTapBoost());
    passivePriceEl.textContent = formatMoney(pricePassive());
    tileUpPriceEl.textContent = formatMoney(priceCityDev());

    buyTapBoostBtn.disabled = state.cash < priceTapBoost();
    buyPassiveBtn.disabled = state.cash < pricePassive();
    buyTileUpBtn.disabled = state.cash < priceCityDev();

    soundToggleEl.checked = !!state.settings.sound;
    hapticToggleEl.checked = !!state.settings.haptics;

    // Also update per-tile upgrade button states
    // (quick pass: re-render ensures correct disabled text, but this helps without full re-render)
    const buttons = tilesEl.querySelectorAll(".tileBtn");
    buttons.forEach((btn, idx) => {
      const cost = tileUpgradeCost(idx);
      btn.disabled = state.cash < cost;
      btn.textContent = `Upgrade (${formatMoney(cost)})`;
    });
  }

  // ---------- Prices (global upgrades) ----------
  function priceTapBoost() {
    return Math.floor(25 * Math.pow(1.8, state.tapBoostLevel));
  }
  function pricePassive() {
    return Math.floor(50 * Math.pow(2.0, state.passiveLevel));
  }
  function priceCityDev() {
    return Math.floor(75 * Math.pow(1.9, state.cityDevLevel));
  }

  // ---------- Upgrade handlers ----------
  buyTapBoostBtn.addEventListener("click", () => {
    const cost = priceTapBoost();
    if (state.cash < cost) return;

    state.cash -= cost;
    state.tapBoostLevel += 1;
    state.perTap += 1 + Math.floor(state.tapBoostLevel / 2);

    clickSound();
    hapticTap();
    log(`Bought Tap Boost (Lv ${state.tapBoostLevel}). Per Tap now ${formatMoney(state.perTap)}.`);
    renderTiles();
    updateUI();
    save();
  });

  buyPassiveBtn.addEventListener("click", () => {
    const cost = pricePassive();
    if (state.cash < cost) return;

    state.cash -= cost;
    state.passiveLevel += 1;
    state.perSec += 1 + Math.floor(state.passiveLevel / 3);

    clickSound();
    hapticTap();
    log(`Bought Passive Income (Lv ${state.passiveLevel}). Per Second now ${formatMoney(state.perSec)}/s.`);
    updateUI();
    save();
  });

  buyTileUpBtn.addEventListener("click", () => {
    const cost = priceCityDev();
    if (state.cash < cost) return;

    state.cash -= cost;
    state.cityDevLevel += 1;

    clickSound();
    hapticTap();
    log(`City Development upgraded to Lv ${state.cityDevLevel}. All tile bonuses increased.`);
    renderTiles();
    updateUI();
    save();
  });

  // ---------- Settings toggles ----------
  soundToggleEl.addEventListener("change", () => {
    state.settings.sound = !!soundToggleEl.checked;
    save();
    if (state.settings.sound) clickSound();
  });

  hapticToggleEl.addEventListener("change", () => {
    state.settings.haptics = !!hapticToggleEl.checked;
    save();
    if (state.settings.haptics) hapticTap();
  });

  // ---------- Passive loop + offline catch-up ----------
  function tick() {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;

    if (dt > 0 && state.perSec > 0) {
      state.cash += state.perSec * dt;
      updateUI();
      maybeSaveSoon();
    }
  }

  function showOfflineModal(amount) {
    offlineTextEl.textContent = `You earned ${formatMoney(amount)} while away.`;
    offlineModalEl.style.display = "flex";
  }

  offlineOkEl.addEventListener("click", () => {
    offlineModalEl.style.display = "none";
    save();
  });

  // ---------- Save / Load ----------
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      return obj;
    } catch (e) {
      return null;
    }
  }

  // Autosave throttle
  let saveTimer = null;
  function maybeSaveSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      save();
    }, 1200);
  }

  // Export / Import
  exportBtn.addEventListener("click", async () => {
    const data = JSON.stringify(state);
    try {
      await navigator.clipboard.writeText(data);
      log("Export copied to clipboard.");
    } catch (e) {
      prompt("Copy your save data:", data);
    }
  });

  importBtn.addEventListener("click", () => {
    const data = prompt("Paste save data to import:");
    if (!data) return;

    try {
      const obj = JSON.parse(data);
      if (!obj || typeof obj !== "object") throw new Error("bad");

      // merge safely
      state = { ...defaultState(), ...obj };
      state.tiles = Array.isArray(obj.tiles) && obj.tiles.length === 9
        ? obj.tiles.map(t => ({ level: Math.max(0, (t?.level ?? 0) | 0) }))
        : defaultState().tiles;

      state.settings = { ...defaultState().settings, ...(obj.settings || {}) };
      state.lastTick = Date.now();

      save();
      renderTiles();
      updateUI();
      log("Imported save successfully.");
    } catch (e) {
      log("Import failed (invalid data).");
      alert("Import failed. Data was not valid.");
    }
  });

  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset all progress?")) return;
    state = defaultState();
    save();
    renderTiles();
    updateUI();
    log("Progress reset.");
  });

  // Save on background/close
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });
  window.addEventListener("beforeunload", () => save());

  // Install prompt (PWA)
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-block";
  });
  installBtn?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null;
    installBtn.style.display = "none";
  });

  // ---------- Init ----------
  (function init() {
    // Ensure shape (older saves)
    if (!Array.isArray(state.tiles) || state.tiles.length !== 9) {
      state.tiles = defaultState().tiles;
    } else {
      state.tiles = state.tiles.map(t => ({ level: Math.max(0, (t?.level ?? 0) | 0) }));
    }
    state.settings = { ...defaultState().settings, ...(state.settings || {}) };

    // Offline earnings (cap at 8 hours)
    const now = Date.now();
    const last = state.lastTick || now;
    const offlineSec = Math.min(8 * 3600, Math.max(0, (now - last) / 1000));

    if (offlineSec > 1 && state.perSec > 0) {
      const earned = state.perSec * offlineSec;
      state.cash += earned;
      showOfflineModal(earned);
      log(`Welcome back! Offline earnings: ${formatMoney(earned)}.`);
    }

    state.lastTick = now;

    renderTiles();
    updateUI();
    log("Game loaded. Tap tiles to earn. Upgrade tiles for bigger bonuses.");

    setInterval(tick, 250);
    setInterval(save, 6000);
    save(); // initial
  })();
})();
