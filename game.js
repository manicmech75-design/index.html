// game.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Game loaded");

  const SAVE_KEY = "flipcity_save_v1";

  let coins = 0;

  const upgrades = {
    clickPower: { level: 0, baseCost: 10, costMult: 1.6, addPerLevel: 1 },
    autoEarn:   { level: 0, baseCost: 25, costMult: 1.7, cpsPerLevel: 0.2 },
    critChance: { level: 0, baseCost: 50, costMult: 1.8, addPerLevel: 0.02 }
  };

  function saveGame() {
    const data = {
      coins,
      upgrades: {
        clickPower: upgrades.clickPower.level,
        autoEarn: upgrades.autoEarn.level,
        critChance: upgrades.critChance.level
      }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (typeof data.coins === "number") coins = data.coins;

      if (data.upgrades) {
        if (typeof data.upgrades.clickPower === "number") upgrades.clickPower.level = data.upgrades.clickPower;
        if (typeof data.upgrades.autoEarn === "number") upgrades.autoEarn.level = data.upgrades.autoEarn;
        if (typeof data.upgrades.critChance === "number") upgrades.critChance.level = data.upgrades.critChance;
      }
    } catch (e) {
      console.warn("Save data invalid, starting fresh.");
    }
  }

  function upgradeCost(key) {
    const u = upgrades[key];
    return Math.ceil(u.baseCost * Math.pow(u.costMult, u.level));
  }

  function updateUI() {
    const coinsEl = document.getElementById("coins");
    if (coinsEl) coinsEl.textContent = "Coins: " + Math.floor(coins);

    const b1 = document.getElementById("buyClickPower");
    const b2 = document.getElementById("buyAutoEarn");
    const b3 = document.getElementById("buyCrit");

    if (b1) b1.textContent = `Buy Click Power (Lv ${upgrades.clickPower.level}) - ${upgradeCost("clickPower")} coins`;
    if (b2) b2.textContent = `Buy Auto Earn (Lv ${upgrades.autoEarn.level}) - ${upgradeCost("autoEarn")} coins`;
    if (b3) b3.textContent = `Buy Crit Chance (Lv ${upgrades.critChance.level}) - ${upgradeCost("critChance")} coins`;
  }

  function buyUpgrade(key) {
    const cost = upgradeCost(key);
    if (coins < cost) return;
    coins -= cost;
    upgrades[key].level += 1;
    updateUI();
    saveGame();
  }

  function earnClick() {
    const clickPower = 1 + upgrades.clickPower.level * upgrades.clickPower.addPerLevel;
    const critChance = upgrades.critChance.level * upgrades.critChance.addPerLevel;

    const isCrit = Math.random() < critChance;
    const gained = isCrit ? clickPower * 3 : clickPower;

    coins += gained;
    updateUI();
    saveGame();
  }

  const game = document.getElementById("game");
  if (!game) {
    console.error("Game container not found (#game)");
    return;
  }

  game.innerHTML = `
    <h2>🏙️ Flip City</h2>
    <p>Tap to earn coins</p>

    <button id="earn">Earn 💰</button>
    <p id="coins">Coins: 0</p>

    <hr>

    <h3>Upgrades</h3>
    <div style="display:grid; gap:10px; width:min(420px, 100%); margin: 0 auto;">
      <button id="buyClickPower"></button>
      <button id="buyAutoEarn"></button>
      <button id="buyCrit"></button>
    </div>

    <div style="margin-top:14px; opacity:.75; font-size:12px;">
      <button id="resetSave" style="background: rgba(255,255,255,0.12); color:#fff; box-shadow:none;">Reset Save</button>
    </div>
  `;

  document.getElementById("earn").onclick = earnClick;
  document.getElementById("buyClickPower").onclick = () => buyUpgrade("clickPower");
  document.getElementById("buyAutoEarn").onclick   = () => buyUpgrade("autoEarn");
  document.getElementById("buyCrit").onclick       = () => buyUpgrade("critChance");

  document.getElementById("resetSave").onclick = () => {
    localStorage.removeItem(SAVE_KEY);
    coins = 0;
    upgrades.clickPower.level = 0;
    upgrades.autoEarn.level = 0;
    upgrades.critChance.level = 0;
    updateUI();
  };

  // Load saved data BEFORE starting loops/UI updates
  loadGame();
  updateUI();

  // Auto earn loop
  setInterval(() => {
    const cps = upgrades.autoEarn.level * upgrades.autoEarn.cpsPerLevel;
    if (cps > 0) {
      coins += cps;
      updateUI();
      saveGame();
    }
  }, 1000);

  // Backup save (in case they idle)
  setInterval(saveGame, 5000);
});
