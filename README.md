<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>City Flip</title>

<style>
* { box-sizing: border-box; }

body {
  margin: 0;
  height: 100vh;
  background: #05070f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  text-align: center;
}

h1 {
  margin-bottom: 10px;
}

button {
  background: #6ee7ff;
  color: #000;
  border: none;
  padding: 14px 24px;
  font-size: 18px;
  border-radius: 14px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 70px);
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.card {
  width: 70px;
  height: 70px;
  background: #111a33;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  user-select: none;
}

.card.revealed {
  background: #1e2a55;
}
</style>
</head>

<body>
<div id="app">
  <h1>City Flip</h1>
  <button onclick="startGame()">Start</button>
  <div class="grid" id="grid"></div>
</div>

<script>
const symbols = ["🏙️","🌆","🌃","🌇","🏢","🏬","🏦","🏨"];
let cards = [];
let first = null;
let lock = false;

function startGame() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  first = null;
  lock = false;

  cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.symbol = symbol;
    card.onclick = () => flip(card);
    grid.appendChild(card);
  });
}

function flip(card) {
  if (lock || card.classList.contains("revealed")) return;

  card.textContent = card.dataset.symbol;
  card.classList.add("revealed");

  if (!first) {
    first = card;
    return;
  }

  if (first.dataset.symbol === card.dataset.symbol) {
    first = null;
  } else {
    lock = true;
    setTimeout(() => {
      card.textContent = "";
      first.textContent = "";
      card.classList.remove("revealed");
      first.classList.remove("revealed");
      first = null;
      lock = false;
    }, 700);
  }
}
</script>
</body>
</html>
