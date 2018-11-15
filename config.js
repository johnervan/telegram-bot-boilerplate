/* Config for FamChamps Bot Server */

module.exports = {
  telegram: {
    TELEGRAM_API_URL: `https://api.telegram.org/bot${process.env.BOT_TOKEN}`,
    BOT_TOKEN: process.env.BOT_TOKEN,
    WEBHOOK_URL: `${process.env.PUBLIC_URL_SECURE}/telegrambot${process.env.BOT_TOKEN}`,
    BOT_PLATFORM_TYPE: 'telegram',
  },
};
