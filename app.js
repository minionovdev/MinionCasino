const tg = window.Telegram.WebApp;
tg.expand();

const API = "http://localhost:3001";

let userId = null;
let matchId = null;

// 👤 init
async function init() {
  const u = tg.initDataUnsafe.user;

  const ref = new URLSearchParams(location.search).get("ref");

  const res = await fetch(`${API}/user/init`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      id: u.id,
      username: u.username,
      ref
    })
  });

  const data = await res.json();

  userId = data.id;
  load();
}

async function load() {
  const res = await fetch(`${API}/user/${userId}`);
  const data = await res.json();

  document.getElementById("bal").innerText = data.balance;
}

// ⚔️ join PvP
async function join() {
  const stake = +document.getElementById("stake").value;

  const res = await fetch(`${API}/pvp/join`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId, stake })
  });

  const data = await res.json();

  if (data.status === "match_found") {
    matchId = data.matchId;

    document.getElementById("status").innerText =
      "Match found... spinning in 10s";

    startTimer();
  }
}

// ⏱ 10 sec wait
function startTimer() {
  let t = 10;

  const i = setInterval(() => {
    document.getElementById("status").innerText =
      "Spinning in " + t + "s";

    t--;

    if (t < 0) {
      clearInterval(i);
      spin();
    }
  }, 1000);
}

// 🎡 wheel animation
function spin() {
  const wheel = document.getElementById("wheel");

  const deg = 3600 + Math.random() * 360;
  wheel.style.transform = `rotate(${deg}deg)`;

  document.getElementById("status").innerText =
    "Spinning... 🎡";

  setTimeout(result, 3000);
}

// 🏁 result
async function result() {
  const res = await fetch(`${API}/match/${matchId}`);
  const data = await res.json();

  document.getElementById("status").innerText =
    "Winner: " + data.winner;

  load();
}

init();
