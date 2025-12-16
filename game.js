(() => {
  const $ = (id) => document.getElementById(id);

  const elCash = $("cash");
  const elPerTap = $("perTap");
  const elUpgradeCost = $("upgradeCost");
  const tapBtn = $("tapBtn");
  const upgradeBtn = $("upgradeBtn");
  const msg = $("msg");

  // Hard fail if HTML IDs don't match
  const required = [elCash, elPerTap, elUpgradeCost, tapBtn, upgradeBtn, msg];
  if (required.some((x) => !x)) {
    document.body.innerHTML =
      "<pre style='color:#fff;padding:16px;'>ERROR: Missing required HTML elements. Make sure index.html uses ids: cash, perTap, upgradeCost, tapBtn, upgradeBtn, msg.</pre>";
    return;
  }

  const SAVE_KEY = "flip_city_save_v1";

  const state = {
    cash: 0,
    perTap: 1,
    upgradeCost: 10,
  };

  function render(note = "") {
    elCash.textContent = Math.floor(state.cash).toString();
    elPerTap.textContent = state.perTap.toString();
    elUpgradeCost.textContent = state.upgradeCost.toString();
    msg.textContent = note || "Game loaded ✅ Tap to earn.";
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.cash === "number") state.cash = data.cash;
      if (typeof data.perTap === "number") state.perTap = data.perTap;
      if (typeof data.upgradeCost === "number") state.upgradeCost = data.upgradeCost;
    } catch {
      // ignore corrupted saves
    }
  }

  tapBtn.addEventListener("click", () => {
    state.cash += state.perTap;
    render();
    save();
  });

  upgradeBtn.addEventListener("click", () => {
    if (state.cash < state.upgradeCost) {
      render(`Need ${state.upgradeCost - Math.floor(state.cash)} more cash.`);
      return;
    }
    state.cash -= state.upgradeCost;
    state.perTap += 1;
    state.upgradeCost = Math.floor(state.upgradeCost * 1.35 + 1);
    render("Upgrade purchased ✅");
    save();
  });

  load();
  render();
})();
