import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const users = {};
const matches = {};
const tx = {};

// 👤 CREATE USER
app.post("/user/init", (req, res) => {
  const { id, username } = req.body;

  if (!users[id]) {
    users[id] = {
      id,
      username,
      balance: 0,
      wins: 0,
      losses: 0,
      rating: 1000
    };
  }

  res.json(users[id]);
});

// 💰 DEPOSIT (Stars / TON later)
app.post("/user/deposit", (req, res) => {
  const { userId, amount, type } = req.body;

  users[userId].balance += amount;

  tx[uuid()] = {
    userId,
    amount,
    type,
    time: Date.now()
  };

  res.json(users[userId]);
});


// ⚔️ CREATE MATCH (PvP stake)
app.post("/match/create", (req, res) => {
  const { userId, stake } = req.body;

  const id = uuid();

  matches[id] = {
    id,
    a: userId,
    b: null,
    stake,
    status: "waiting"
  };

  res.json(matches[id]);
});

// ⚔️ JOIN MATCH
app.post("/match/join", (req, res) => {
  const { matchId, userId } = req.body;

  const m = matches[matchId];
  if (!m || m.b) return res.status(400).send("invalid");

  m.b = userId;
  m.status = "ready";

  res.json(m);
});


// 🎲 PvP ENGINE (like rolls logic)
app.post("/match/play", (req, res) => {
  const m = matches[req.body.matchId];

  const a = users[m.a];
  const b = users[m.b];

  // 🎯 weighted system (skill + balance + randomness)
  const aPower = a.rating + a.balance * 0.1;
  const bPower = b.rating + b.balance * 0.1;

  const total = aPower + bPower;
  const roll = Math.random() * total;

  const winner = roll < aPower ? a : b;
  const loser = winner === a ? b : a;

  const winAmount = m.stake * 2;

  winner.balance += winAmount;
  winner.wins++;
  loser.losses++;

  // rating system (ELO-like)
  winner.rating += 25;
  loser.rating -= 15;

  m.winner = winner.id;
  m.status = "finished";

  res.json({
    winner: winner.username,
    match: m
  });
});


// 🎡 WHEEL (like rolls casino wheel)
app.post("/wheel/spin", (req, res) => {
  const { userId, bet } = req.body;

  const u = users[userId];

  if (u.balance < bet) return res.status(400).send("no balance");

  u.balance -= bet;

  // 🎯 probability scales with bet size (bigger bet = higher win chance but lower multiplier stability)
  const chance = Math.min(0.25 + bet / 200, 0.85);

  const win = Math.random() < chance;

  let reward = 0;

  if (win) {
    reward = bet * (1 + Math.random() * 3.5); // 1x–4.5x
    u.balance += reward;
  }

  res.json({
    win,
    reward,
    balance: u.balance
  });
});


// 📊 LEADERBOARD
app.get("/leaderboard", (req, res) => {
  res.json(
    Object.values(users).sort((a, b) => b.rating - a.rating)
  );
});

app.listen(3001, () => console.log("ROLLS engine running"));
