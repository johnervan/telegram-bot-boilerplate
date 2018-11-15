/* Modules to handle message events from Telegram
 *   Exported Modules:
 *     1. handleMessageEvent(msgObj): Handle Telegram Message Event
 */
const is = require('is_js');

const tgCaller = require('../../common/apiCallers/telegramCaller');
const logger = require('../../common/logger');

function isReply(msgObj) {
  if (msgObj.reply_to_message) {
    return true;
  }
  return false;
}

function isLocationReceived(msgObj) {
  return is.propertyDefined(msgObj, 'location');
}

function isCommandReceived(msgObj) {
  if (msgObj.entities && msgObj.entities[0].type === 'bot_command') {
    return true;
  }
  return false;
}

async function handleMessageEvent(msgObj) {
  logger.tg.info('Handling Telegram Message Event');
  const chatId = msgObj.chat.id;
  // const firstName = msgObj.chat.first_name || '';
  let { text } = msgObj;
  if (text) {
    text = text.trim();
    if (isReply(msgObj)) {
      logger.tg.info('Reply Detected');
      // rpHandler.handleReply(chatId, msgObj);
    } else if (isCommandReceived(msgObj)) {
      const command = text.split('@')[0].substr(1);
      logger.tg.info(`Command Detected: ${command}`);
      // cmdHandler.handleCommand(chatId, msgObj, command);
    } else {
      logger.tg.info('Natural Language Detected:', text);
      try {
        await tgCaller.sendMessage(chatId, text);
      } catch (error) {
        logger.tg.err(error);
      }
    }
  } else if (isLocationReceived(msgObj)) {
    logger.tg.info(`Location Received: ${JSON.stringify(msgObj.location)}`);
  } else {
    logger.tg.info(`Unhandled Message Event received: ${msgObj}`);
  }
}

module.exports = {
  handleMessageEvent,
};
