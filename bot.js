import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🎮 open app
bot.start((ctx) => {
  ctx.reply("🎰 Minion Casino", {
    reply_markup: {
      keyboard: [
        [{ text: "Play 🎮", web_app: { url: process.env.WEBAPP_URL } }]
      ],
      resize_keyboard: true
    }
  });
});

// ⭐ Stars deposit (official Telegram)
bot.command("topup", async (ctx) => {
  await ctx.replyWithInvoice({
    title: "Deposit Stars",
    description: "Add balance",
    payload: "stars_deposit",
    currency: "XTR",
    prices: [{ label: "Stars", amount: 10 }]
  });
});

bot.launch();
