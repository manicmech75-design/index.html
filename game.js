(() => {
  // ----- STATE -----
  let cash = 0;
  let perTap = 1;
  let upgradeCost = 10;

  // tiles: each tile can be "empty" or "built"
  const tiles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    built: false,
    name: "Empty Lot",
    level: 0
  }));

  // ----- DOM -----
  const cashEl = document.getElementById("cash");
  const perTapEl = document.getElementById("perTap");
  const upgradeCostEl = document.getElementById("upgradeCost");
  const statusEl = document.getElementById("status");

  const tapBtn = document.getElementById("tapBtn");
  const upgradeBtn = document.getElementById("upgradeBtn");
  const cityGrid = document.getElementById("cityGrid");

  // ----- UI -----
  function updateUI() {
    cashEl.textContent = cash;
    perTapEl.textContent = perTap;
    upgradeCostEl.textContent = upgradeCost;

    // button enable/disable
    upgradeBtn.disabled = cash < upgradeCost;
    upgradeBtn.style.opacity = cash < upgradeCost ? 0.6 : 1;
  }

  function renderTiles() {
    cityGrid.innerHTML = "";

    tiles.forEach(tile => {
      const el = document.createElement("div");
      el.className = "tile";

      if (!tile.built) {
        el.innerHTML = `
          <div class="tTitle">Empty Lot</div>
          <div class="tSub">Tap to build (cost 25)</div>
        `;
      } else {
        el.innerHTML = `
          <div class="tTitle">${tile.name}</div>
          <div class="tSub">Level ${tile.level} • Tap earns +${tile.level}</div>
        `;
      }

      el.addEventListener("click", () => onTileClick(tile.id));
      cityGrid.appendChild(el);
    });
  }

  // ----- GAME LOGIC -----
  function earn(amount) {
    cash += amount;
    updateUI();
  }

  function onTileClick(id) {
    const t = tiles.find(x => x.id === id);
    if (!t) return;

    if (!t.built) {
      const buildCost = 25;
      if (cash < buildCost) {
        statusEl.textContent = `Need ${buildCost} cash to build a tile.`;
        return;
      }
      cash -= buildCost;
      t.built = true;
      t.level = 1;
      t.name = "Starter Shop";
      statusEl.textContent = `Built: ${t.name} ✅`;
      updateUI();
      renderTiles();
      return;
    }

    // built tile tap earnings
    earn(t.level);
    statusEl.textContent = `Tile earned +${t.level}.`;
  }

  // ----- EVENTS -----
  tapBtn.addEventListener("click", () => {
    earn(perTap);
    statusEl.textContent = `Tapped +${perTap}.`;
  });

  upgradeBtn.addEventListener("click", () => {
    if (cash < upgradeCost) return;
    cash -= upgradeCost;
    perTap += 1;
    upgradeCost = Math.floor(upgradeCost * 1.35) + 5;
    statusEl.textContent = `Upgrade bought ✅ Per Tap is now ${perTap}.`;
    updateUI();
  });

  // ----- INIT -----
  function init() {
    statusEl.innerHTML = `Game loaded <span class="ok">✅</span> Tap to earn. Build tiles.`;
    updateUI();
    renderTiles();
  }

  init();
})();
