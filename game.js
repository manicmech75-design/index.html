const tilesEl = document.getElementById("tiles");
const cashEl = document.getElementById("cash");
const perTapEl = document.getElementById("perTap");
const perSecEl = document.getElementById("perSec");
const logEl = document.getElementById("log");

let cash = 0;
let perTap = 1;

function fmtMoney(n){ return "$" + Math.floor(n).toLocaleString(); }

function log(msg){
  const line = document.createElement("div");
  line.textContent = msg;
  logEl.prepend(line);
}

function renderStats(){
  cashEl.textContent = fmtMoney(cash);
  perTapEl.textContent = fmtMoney(perTap);
  perSecEl.textContent = "$0/s";
}

function createTiles(){
  tilesEl.innerHTML = "";
  for (let i = 0; i < 9; i++){
    const btn = document.createElement("button");
    btn.className = "tileBtn";
    btn.textContent = "🏙️ Tile " + (i + 1);

    btn.addEventListener("click", () => {
      cash += perTap;
      renderStats();
    });

    tilesEl.appendChild(btn);
  }
  log("Tiles created ✅");
}

createTiles();
renderStats();
