import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const users = {};
const queue = {};
const matches = {};

// 👤 init user + referral
app.post("/user/init", (req, res) => {
  const { id, username, ref } = req.body;

  if (!users[id]) {
    users[id] = {
      id,
      username,
      balance: 0,
      refBy: ref || null,
      wins: 0
    };

    if (ref && users[ref]) {
      users[ref].balance += 1; // referral bonus (simple)
    }
  }

  res.json(users[id]);
});

// 💰 deposit (Stars placeholder)
app.post("/user/deposit", (req, res) => {
  const { userId, amount } = req.body;

  users[userId].balance += amount;

  res.json(users[userId]);
});

// ⚔️ PvP queue
app.post("/pvp/join", (req, res) => {
  const { userId, stake } = req.body;

  queue[userId] = { userId, stake };

  const players = Object.values(queue);

  if (players.length >= 2) {
    const a = players[0];
    const b = players[1];

    Object.keys(queue).forEach(k => delete queue[k]);

    const matchId = uuid();

    matches[matchId] = {
      id: matchId,
      a,
      b,
      stake,
      status: "waiting"
    };

    setTimeout(() => resolve(matchId), 10000);

    return res.json({
      status: "match_found",
      matchId
    });
  }

  res.json({ status: "waiting" });
});

// 🎡 resolve match
function resolve(matchId) {
  const m = matches[matchId];

  const aScore = Math.random() * m.a.stake + 50;
  const bScore = Math.random() * m.b.stake + 50;

  const total = aScore + bScore;
  const roll = Math.random() * total;

  const winner = roll < aScore ? m.a.userId : m.b.userId;

  users[winner].balance += m.stake * 2;
  users[winner].wins++;

  m.winner = winner;
  m.status = "finished";
}

// 📊 result
app.get("/match/:id", (req, res) => {
  res.json(matches[req.params.id] || {});
});

// 👤 user
app.get("/user/:id", (req, res) => {
  res.json(users[req.params.id] || {});
});

app.listen(3001, () => console.log("casino running"));
