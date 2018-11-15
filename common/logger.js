/**
 * Logger Module
 */

/**
 * Common Info Logger
 * @param {[]]} messages
 */
function commonInfo(...messages) {
  let toPrint = '[COMMON_INFO]';
  messages.forEach((msg) => {
    toPrint = `${toPrint} ${msg}`;
  });
  console.log(toPrint);
}

/**
 * Common Error Logger
 * @param {[]]} messages
 */
function commonErr(...messages) {
  let toPrint = '[COMMON_ERR]';
  messages.forEach((msg) => {
    toPrint = `${toPrint} ${msg}`;
  });
  console.log(toPrint);
}

/**
 * Telegram Info Logger
 * @param {[]]} messages
 */
function telegramInfo(...messages) {
  let toPrint = '[TELEGRAM_INFO]';
  messages.forEach((msg) => {
    toPrint = `${toPrint} ${msg}`;
  });
  console.log(toPrint);
}

/**
 * Telegram Error Logger
 * @param {[]]} messages
 */
function telegramErr(...messages) {
  let toPrint = '[TELEGRAM_ERR]';
  messages.forEach((msg) => {
    toPrint = `${toPrint} ${msg}`;
  });
  console.log(toPrint);
}

module.exports = {
  cm: {
    info: commonInfo,
    err: commonErr,
  },
  tg: {
    info: telegramInfo,
    err: telegramErr,
  },
};
