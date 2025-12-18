/* styles.css */
:root{
  --bg0:#050617;
  --bg1:#0b1220;
  --glass: rgba(255,255,255,.08);
  --glass2: rgba(255,255,255,.06);
  --border: rgba(255,255,255,.14);
  --txt: rgba(255,255,255,.92);
  --muted: rgba(255,255,255,.70);
  --shadow: 0 14px 40px rgba(0,0,0,.45);
  --radius: 18px;
  --radius2: 14px;
  --tile: rgba(255,255,255,.08);
  --tileBorder: rgba(255,255,255,.16);
  --good: #2ef2a5;
  --warn: #ffd36a;
  --bad: #ff6b6b;
}

*{ box-sizing:border-box; -webkit-tap-highlight-color: transparent; }
html,body{ height:100%; }
body{
  margin:0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, Arial, sans-serif;
  color: var(--txt);
  background: radial-gradient(1200px 900px at 50% -10%, #6b2cff 0%, #1a1a44 35%, var(--bg0) 80%);
  overflow:hidden;
}

#app{ height:100%; display:flex; flex-direction:column; }

.topbar{
  padding: 12px 14px 10px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
}
.brand{ display:flex; align-items:center; gap:10px; min-width:0; }
.logo{
  width:40px; height:40px; border-radius: 14px;
  background:
    radial-gradient(10px 10px at 30% 30%, rgba(255,255,255,.35), transparent 60%),
    linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.04));
  border: 1px solid var(--border);
  box-shadow: 0 12px 24px rgba(0,0,0,.35);
}
.titles{ min-width:0; }
.name{ font-weight:800; letter-spacing:.2px; font-size:16px; line-height:1.1; }
.tagline{ font-size:12px; color: var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }

.top-actions{ display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.chip{
  appearance:none; border:none; cursor:pointer;
  padding: 9px 10px;
  border-radius: 999px;
  background: var(--glass);
  color: var(--txt);
  font-weight:700;
  font-size:12px;
  border: 1px solid var(--border);
  box-shadow: 0 10px 20px rgba(0,0,0,.22);
}
.chip:active{ transform: translateY(1px); }
.dot{
  display:inline-block; width:8px; height:8px; border-radius:999px;
  background: var(--good);
  margin-right:8px;
  box-shadow: 0 0 12px rgba(46,242,165,.55);
}

.stage{
  position:relative;
  flex:1;
  display:flex;
  flex-direction:column;
  gap: 10px;
  padding: 0 14px 14px;
  overflow:hidden;
}

#bgCanvas{
  position:absolute;
  inset: 0;
  width:100%;
  height:100%;
  z-index:0;
}

.hud{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat{
  background: var(--glass2);
  border: 1px solid var(--border);
  border-radius: var(--radius2);
  padding: 10px 12px;
  box-shadow: 0 12px 26px rgba(0,0,0,.20);
  backdrop-filter: blur(8px);
}
.statLabel{ font-size:11px; color: var(--muted); font-weight:800; letter-spacing:.3px; text-transform:uppercase; }
.statValue{ font-size:18px; font-weight:900; margin-top:3px; }

.panel{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 10px;
}
.nextTitle{
  font-size:11px;
  color: var(--muted);
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.35px;
  margin: 0 0 6px 2px;
}
.nextCard, .missionCard{
  background: var(--glass2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  box-shadow: 0 16px 34px rgba(0,0,0,.22);
  backdrop-filter: blur(10px);
}
.nextCard{ display:flex; gap:10px; align-items:center; }
.nextGlyph{
  width:46px; height:46px;
  border-radius: 14px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.16);
  display:grid;
  place-items:center;
  font-size:20px;
  font-weight:900;
}
.nextName{ font-weight:900; font-size:14px; }
.nextHint{ color: var(--muted); font-size:12px; margin-top:2px; }

.missionText{ font-weight:900; font-size:13px; }
.missionProg{ margin-top:8px; display:flex; align-items:center; gap:10px; }
.bar{
  height:10px; flex:1;
  background: rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.14);
  border-radius: 999px;
  overflow:hidden;
}
.barFill{
  height:100%;
  width: 0%;
  background: linear-gradient(90deg, rgba(46,242,165,.95), rgba(141,255,248,.70));
  border-radius: 999px;
  transition: width .25s ease;
}
.missionMeta{ font-size:12px; color: var(--muted); font-weight:800; min-width:64px; text-align:right; }

.boardWrap{
  position:relative;
  z-index:2;
  display:flex;
  justify-content:center;
  align-items:center;
  flex:1;
  min-height: 260px;
}
.board{
  width:min(92vw, 420px);
  aspect-ratio: 1 / 1;
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 24px;
  background: rgba(0,0,0,.20);
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}
.cell{
  position:relative;
  border-radius: 18px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.14);
  overflow:hidden;
  display:grid;
  place-items:center;
  user-select:none;
  touch-action: manipulation;
  cursor:pointer;
  transition: transform .12s ease, background .12s ease;
}
.cell:active{ transform: scale(.985); }

.tile{
  width: 100%;
  height: 100%;
  display:grid;
  place-items:center;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
  border: 1px solid rgba(255,255,255,.16);
  box-shadow: 0 16px 28px rgba(0,0,0,.22);
  transform: translateZ(0);
}
.tileInner{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap: 3px;
  text-align:center;
  padding: 8px;
}
.glyph{ font-size: 20px; font-weight: 900; }
.tier{ font-size: 11px; color: rgba(255,255,255,.75); font-weight: 900; letter-spacing:.25px; text-transform:uppercase; }
.value{ font-size: 11px; color: rgba(255,255,255,.65); font-weight: 800; }

.pop{ animation: pop .18s ease-out; }
@keyframes pop{
  0%{ transform: scale(.92); }
  100%{ transform: scale(1); }
}
.shake{ animation: shake .16s linear; }
@keyframes shake{
  0%,100%{ transform: translateX(0); }
  25%{ transform: translateX(-3px); }
  75%{ transform: translateX(3px); }
}

.bottombar{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns: 1fr 1fr 1.1fr;
  gap: 10px;
  padding-bottom: max(0px, env(safe-area-inset-bottom));
}
.btn{
  appearance:none;
  border:none;
  border-radius: 16px;
  padding: 12px 12px;
  font-weight: 900;
  font-size: 14px;
  cursor:pointer;
  box-shadow: 0 16px 34px rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.14);
}
.btn.primary{
  background: linear-gradient(135deg, rgba(46,242,165,.92), rgba(106,178,255,.82));
  color: #07111e;
}
.btn.secondary{
  background: rgba(255,255,255,.08);
  color: var(--txt);
  backdrop-filter: blur(10px);
}
.btn.big{ padding: 14px 14px; border-radius: 18px; font-size: 15px; }
.btn:disabled{ opacity:.5; cursor:not-allowed; }

.toast{
  position:absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(78px + env(safe-area-inset-bottom));
  z-index: 5;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,.92);
  font-weight: 800;
  font-size: 12px;
  opacity: 0;
  pointer-events:none;
  transition: opacity .18s ease, transform .18s ease;
}
.toast.show{
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
}

/* Modals */
.modal{
  position:absolute;
  inset:0;
  background: rgba(0,0,0,.55);
  z-index: 8;
  display:none;
  padding: 18px;
  align-items:center;
  justify-content:center;
}
.modal.show{ display:flex; }
.modalCard{
  width: min(520px, 96vw);
  border-radius: 22px;
  background: rgba(18,18,38,.80);
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 24px 60px rgba(0,0,0,.55);
  backdrop-filter: blur(14px);
  overflow:hidden;
}
.modalHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 14px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,.10);
}
.modalTitle{ font-weight: 950; letter-spacing:.2px; }
.x{
  appearance:none;
  border:none;
  cursor:pointer;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.92);
  font-size: 16px;
  font-weight: 900;
  border: 1px solid rgba(255,255,255,.12);
}
.modalBody{ padding: 14px; }
.howRow{
  display:grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  padding: 10px 0;
}
.howNum{
  width: 30px; height: 30px; border-radius: 12px;
  display:grid; place-items:center;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.12);
  font-weight: 950;
}
.howTitle{ font-weight: 950; margin-bottom: 4px; }
.howText{ color: rgba(255,255,255,.78); line-height: 1.35; font-size: 13px; }
.ctaRow{ display:flex; justify-content:center; padding-top: 10px; }

/* Feedback */
.fbBox{
  width:100%;
  border-radius: 16px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.14);
  color: rgba(255,255,255,.92);
  padding: 12px;
  font-weight: 700;
  outline: none;
}

/* First-load overlay */
.firstLoad{
  position:absolute;
  inset:0;
  z-index: 9;
  display:none;
  align-items:center;
  justify-content:center;
  padding: 18px;
  background: radial-gradient(900px 700px at 50% 0%, rgba(255,140,92,.22), rgba(0,0,0,.62));
}
.firstLoad.show{ display:flex; }
.firstCard{
  width: min(560px, 96vw);
  border-radius: 26px;
  background: rgba(18,18,38,.82);
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 30px 80px rgba(0,0,0,.60);
  backdrop-filter: blur(16px);
  padding: 18px;
  text-align:center;
}
.firstKicker{
  font-weight: 950;
  letter-spacing:.25px;
  color: rgba(255,255,255,.86);
  font-size: 12px;
  text-transform:uppercase;
}
.firstTitle{
  margin-top: 8px;
  font-size: 22px;
  font-weight: 1000;
  line-height: 1.1;
}
.firstSub{
  margin-top: 8px;
  color: rgba(255,255,255,.78);
  font-weight: 750;
  font-size: 14px;
  line-height: 1.35;
}
.firstActions{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.fine{ margin-top: 10px; color: rgba(255,255,255,.62); font-size: 12px; font-weight: 750; }

@media (max-width: 390px){
  .panel{ grid-template-columns: 1fr; }
  .firstActions{ grid-template-columns: 1fr; }
}
