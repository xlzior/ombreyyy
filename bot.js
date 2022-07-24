const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;

let bot;
if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendGame(chatId, "ombreyyy")
})

bot.on('inline_query', query => {
  bot.answerInlineQuery(query.id, [{
    type: "game",
    id: "1",
    game_short_name: "ombreyyy"
  }])
})

bot.on('callback_query', query => {
  bot.answerCallbackQuery(query.id, {
    url: "https://xlzior.github.io/ombreyyy/"
  })
})

module.exports = bot;