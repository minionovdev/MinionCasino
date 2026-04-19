const tg = window.Telegram.WebApp;
tg.expand();

const API = "http://localhost:3001";

let userId = null;

// 👤 init user
async function init() {
  const u = tg.initDataUnsafe.user;

  const res = await fetch(`${API}/user/init`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id: u.id, username: u.username })
  });

  const data = await res.json();

  userId = data.id;

  document.getElementById("bal").innerText = data.balance;
  document.getElementById("rat").innerText = data.rating;
}

// ⚔️ create match
async function createMatch() {
  const stake = +document.getElementById("stake").value;

  const res = await fetch(`${API}/match/create`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId, stake })
  });

  const data = await res.json();

  document.getElementById("out").innerText = data.id;
}

// ⚔️ join
async function join() {
  const matchId = document.getElementById("matchId").value;

  await fetch(`${API}/match/join`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ matchId, userId })
  });

  document.getElementById("out").innerText = "joined";
}

// 🎲 play
async function play() {
  const matchId = document.getElementById("matchId").value;

  const res = await fetch(`${API}/match/play`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ matchId })
  });

  const data = await res.json();

  document.getElementById("out").innerText =
    "Winner: " + data.winner;
}

// 🎡 wheel
async function spin() {
  const bet = +document.getElementById("bet").value;

  const res = await fetch(`${API}/wheel/spin`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId, bet })
  });

  const data = await res.json();

  document.getElementById("out").innerText =
    data.win ? "WIN +" + data.reward : "LOSE";
}
