/* Modules to handle events from external servers
*   Exported Modules:
*     1. handleTgEvent(eventObj): For handling telegram Events
*/

const msgHandler = require('./messageHandler');
// const cqHandler = require('./callbackQueryHandler');
// const iqHandler = require('./inlineQueryHandler');
const logger = require('../../common/logger');

async function handleTgEvent(eventObj) {
  logger.tg.info('Handling Telegram Event');
  if (eventObj.message) {
    msgHandler.handleMessageEvent(eventObj.message);
  } else if (eventObj.edited_message) {
    logger.tg.info('edited_message event detected');
  } else if (eventObj.channel_post) {
    logger.tg.info('channel_post event detected');
  } else if (eventObj.edited_channel_post) {
    logger.tg.info('edited_channel_post event detected');
  } else if (eventObj.inline_query) {
    // iqHandler.handleInlineQueryEvent(eventObj.inline_query);
  } else if (eventObj.chosen_inline_result) {
    logger.tg.info('chosen_inline_result event detected');
  } else if (eventObj.callback_query) {
    // cqHandler.handleCallbackQueryEvent(eventObj.callback_query);
  } else {
    logger.tg.info('unknown event detected');
  }
}

module.exports = {
  handleTgEvent,
};
