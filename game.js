// Flip City - complete playable clicker with upgrades + offline earnings + saving
document.addEventListener("DOMContentLoaded", () => {
  const SAVE_KEY = "flipcity_save_v3"; // bump if you ever change save format

  // ---------- State ----------
  let state = {
    coins: 0,
    totalEarned: 0,
    lastSave: Date.now(),
    streak: 0,
    lastClickAt: 0,
    upgrades: {
      clickPower: 0,     // + click power
      autoEarn: 0,       // coins/sec
      critChance: 0,     // chance per click
      critPower: 0,      // crit multiplier
      coinMult: 0,       // global multiplier
      streakBonus: 0,    // streak strength
      offlineBoost: 0    // offline earnings multiplier
    }
  };

  // ---------- Upgrade definitions ----------
  const UPG = {
    clickPower:  { name: "Click Power", desc: "+1 coin per click", base: 10, mult: 1.55, max: 200 },
    autoEarn:    { name: "Auto Earn", desc: "+0.25 coins/sec", base: 25, mult: 1.60, max: 200 },
    critChance:  { name: "Crit Chance", desc: "+2% crit chance", base: 50, mult: 1.70, max: 50 },
    critPower:   { name: "Crit Power", desc: "+0.5 crit multiplier", base: 75, mult: 1.75, max: 50 },
    coinMult:    { name: "Coin Mult", desc: "+10% all earnings", base: 100, mult: 1.80, max: 100 },
    streakBonus: { name: "Lucky Streak", desc: "Stronger streak bonus", base: 150, mult: 1.85, max: 100 },
    offlineBoost:{ name: "Offline Boost", desc: "+20% offline earnings", base: 200, mult: 1.90, max: 100 },
  };

  function cost(key) {
    const lvl = state.upgrades[key] ?? 0;
    return Math.ceil(UPG[key].base * Math.pow(UPG[key].mult, lvl));
  }

  // ---------- Helpers ----------
  const fmt = (n) => {
    n = Number(n) || 0;
    if (n < 1000) return Math.floor(n).toString();
    const units = ["K","M","B","T","Qa","Qi"];
    let u = -1;
    while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : n.toFixed(0)) + units[u];
  };

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  // ---------- Persistence ----------
  function save() {
    state.lastSave = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;

      // merge safely
      state.coins = typeof data.coins === "number" ? data.coins : 0;
      state.totalEarned = typeof data.totalEarned === "number" ? data.totalEarned : 0;
      state.lastSave = typeof data.lastSave === "number" ? data.lastSave : Date.now();
      state.streak = typeof data.streak === "number" ? data.streak : 0;
      state.lastClickAt = typeof data.lastClickAt === "number" ? data.lastClickAt : 0;

      if (data.upgrades && typeof data.upgrades === "object") {
        for (const k of Object.keys(state.upgrades)) {
          const v = data.upgrades[k];
          state.upgrades[k] = typeof v === "number" ? v : 0;
        }
      }
    } catch {
      // ignore bad saves
    }
  }

  // Offline earnings (based on auto earn + mult)
  function applyOfflineEarnings() {
    const now = Date.now();
    const secondsAway = Math.max(0, Math.floor((now - (state.lastSave || now)) / 1000));
    if (secondsAway <= 2) return { secondsAway: 0, gained: 0 };

    const cps = getCoinsPerSecond();
    const base = cps * secondsAway;

    // Offline boost: +20% per level
    const offMult = 1 + 0.20 * (state.upgrades.offlineBoost || 0);
    const gained = base * offMult;

    if (gained > 0) {
      state.coins += gained;
      state.totalEarned += gained;
    }
    return { secondsAway, gained };
  }

  // ---------- Earnings formulas ----------
  function getGlobalMult() {
    // +10% per level
    return 1 + 0.10 * (state.upgrades.coinMult || 0);
  }

  function getClickPower() {
    // base click = 1 + clickPower levels
    const base = 1 + (state.upgrades.clickPower || 0) * 1;
    return base;
  }

  function getCritChance() {
    // 0% base, +2% per level, cap 60%
    const chance = (state.upgrades.critChance || 0) * 0.02;
    return clamp(chance, 0, 0.60);
  }

  function getCritMult() {
    // base crit = 2x, +0.5 per level, cap 10x
    const mult = 2 + (state.upgrades.critPower || 0) * 0.5;
    return clamp(mult, 2, 10);
  }

  function getStreakMult() {
    // streak builds if clicks < 2s apart
    // base streak effect: +1% per streak
    // streakBonus increases effect by +0.5% per level
    const per = 0.01 + (state.upgrades.streakBonus || 0) * 0.005;
    // cap streak multiplier to prevent runaway
    const m = 1 + clamp(state.streak, 0, 200) * per;
    return clamp(m, 1, 4.0); // cap at 4x
  }

  function getCoinsPerSecond() {
    // +0.25 cps per autoEarn level
    const cps = (state.upgrades.autoEarn || 0) * 0.25;
    return cps * getGlobalMult();
  }

  // ---------- UI ----------
  const gameEl = document.getElementById("game");
  if (!gameEl) return;

  gameEl.innerHTML = `
    <div style="width: min(680px, 100%); margin: 0 au
