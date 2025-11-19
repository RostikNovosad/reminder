import cron from 'node-cron';
import fs from 'fs';
import { getAllUsers } from './db.js';

export function schedulePoll(bot) {

  cron.schedule('00 22 * * *', async () => {
    await sendPollToAll(bot);
  }, { timezone: 'UTC' });
}

export async function sendPollToAll(bot) {
  const users = await getAllUsers();

  for (const user of users) {
    await bot.telegram.sendPhoto(user.tg_id,
      { source: fs.createReadStream('./images/main.webp') },
      {
        caption: `Привіт ${user.first_name}! 🌸 Нагадую про дихальні вправи — твій маленький ритуал спокою.`,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Так! уже зроблено 😊', callback_data: 'done' }],
            [{ text: 'Ще ні 😔 Трішки пізніше', callback_data: 'delay' }]
          ]
        }
      }
    );
  }
}

export async function sendPollUser(user, bot) {
  await bot.telegram.sendPhoto(user.id,
    { source: fs.createReadStream('./images/main.webp') },
    {
      caption: `${user.first_name}, сподіваюся вправи вже зроблені?`,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Так! уже зроблено 😊', callback_data: 'done' }],
          [{ text: 'Ще ні 😔 Трішки пізніше', callback_data: 'delay' }]
        ]
      }
    }
  );
}