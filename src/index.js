import 'dotenv/config';
import express from 'express';
import { Telegraf, session } from 'telegraf';
import { schedulePoll, sendPollUser } from './pollScheduler.js';
import { upsertUser, saveResponse } from './db.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const bot = new Telegraf('8374639778:AAGtsLfhjYop6OOHXLrEwynfUmFtY8hn6B8');

bot.start(async (ctx) => {
  const user = ctx.from;

  try {
    await upsertUser(user)
    await ctx.replyWithPhoto(
      { source: fs.createReadStream('./images/greating.webp') },
      { caption: `Вітаю ${user.first_name}! 😊 \nВід сьогодні будемо разом турбуватися про твій спокій.\nУвечері запитаю, як ти 💛` }
    );
  } catch (e) {
    console.error('DB error:', e);
  }
});

bot.use(session({
  defaultSession: () => ({
    waitingForResponse: false
  })
}));

bot.on('callback_query', async (ctx) => {
  const action = ctx.callbackQuery.data;
  const user = ctx.from;

  if (action === 'done') {
    await ctx.answerCbQuery('🔥 Молодець!');
    await ctx.reply('Відмінно! 🎉  Твоя спокійна хвилина пройшла успішно.\nРозкажи, що зараз відчуваєш? 👇');

    ctx.session.waitingForResponse = true;
  }

  if (action === 'delay') {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery('⏳ Нагадую пізніше');
    await ctx.reply('Все гаразд, світ зачекає 🌍\nЗа який проміжок часу тобі зручно повторне нагадування?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Через 30 хвилин', callback_data: 'delayOne' }],
          [{ text: 'Через 1 годину', callback_data: 'delayTwo' }]
        ]
      }
    });
  }

  if (action === 'delayOne') {
    await ctx.answerCbQuery('⏳ Нагадування через 30 хвилин встановлено');
    setTimeout(() => {
      sendPollUser(user, bot);
    }, 1800000);
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply('Встановлено нагадування через 30 хвилин ⏳');
  }
  if (action === 'delayTwo') {
    await ctx.answerCbQuery('⏳ Нагадування через 1 годину встановлено');
    setTimeout(() => {
      sendPollUser(user, bot);
    }, 3600000);
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply('Встановлено нагадування через 1 годину ⏳');
  }
});

bot.on('text', async (ctx) => {
  if (!ctx.session.waitingForResponse) return;
  const userText = ctx.message.text;
  try {
    await saveResponse(ctx.from, userText);
    await ctx.replyWithPhoto(
      { source: fs.createReadStream('./images/thanks.webp') },
      { caption: 'Супер! 🫁 \nТвої почуття збережено, і вони готові допомагати тобі в майбутньому.\nПродовжимо завтра у цей самий час ☺️' }
    );
  } catch (err) {
    console.error(err);
    await ctx.reply('Сталася помилка при збереженні 😔');
  }

  ctx.session.waitingForResponse = false;
});

schedulePoll(bot);

bot.launch();