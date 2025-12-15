document.addEventListener("DOMContentLoaded", () => {
  console.log("Game loaded");

  let coins = 0;

  const upgrades = {
    clickPower: { level: 0, baseCost: 10, costMult: 1.6, addPerLevel: 1 },
    autoEarn:   { level: 0, baseCost: 25, costMult: 1.7, cpsPerLevel: 0.2 },
    critChance: { level: 0, baseCost: 50, costMult: 1.8, addPerLevel: 0.02 }
  };

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
  }

  function earnClick() {
    const clickPower = 1 + upgrades.clickPower.level * upgrades.clickPower.addPerLevel;
    const critChance = upgrades.critChance.level * upgrades.critChance.addPerLevel;

    const isCrit = Math.random() < critChance;
    const gained = isCrit ? clickPower * 3 : clickPower;

    coins += gained;
    updateUI();
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
  `;

  document.getElementById("earn").onclick = earnClick;
  document.getElementById("buyClickPower").onclick = () => buyUpgrade("clickPower");
  document.getElementById("buyAutoEarn").onclick   = () => buyUpgrade("autoEarn");
  document.getElementById("buyCrit").onclick       = () => buyUpgrade("critChance");

  setInterval(() => {
    const cps = upgrades.autoEarn.level * upgrades.autoEarn.cpsPerLevel;
    if (cps > 0) {
      coins += cps;
      updateUI();
    }
  }, 1000);

  updateUI();
});
