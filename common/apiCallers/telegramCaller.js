/**
 * APIs for Telegram Server
 */

const axios = require('axios');
const async = require('async');
const sleep = require('await-sleep');
const is = require('is_js');

const config = require('../../config');
const logger = require('../logger');
const randomUtil = require('../utils/randomUtil');

/**
 * Post request to Telegram Server
 * @param {string} tgMethod
 * @param {Object} payload
 *
 * @private
 */
async function postToTelegram(tgMethod, payload) {
  try {
    const response = await axios({
      url: `${config.telegram.TELEGRAM_API_URL}/${tgMethod}`,
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      data: payload,
    });
    if (response.status !== 200) {
      throw new Error(JSON.stringify(response.data));
    }
    return JSON.stringify(response.data);
  } catch (error) {
    const errMessage = `Telegram Caller: method="${tgMethod}" error="${JSON.stringify(
      error.response.data,
    )}" \naxiosConfig="${JSON.stringify(error.config)}`;
    throw new Error(errMessage);
  }
}

/**
 * Set Webhook on Telegram
 *
 * @public
 */
async function setWebHook() {
  logger.tg.info('Setting webhook on Telegram');
  try {
    await postToTelegram('setWebHook', {
      url: config.telegram.WEBHOOK_URL,
    });
    logger.tg.info('Telegram webhook set');
  } catch (error) {
    throw new Error(`Error: Failed to set Telegram Webhook. ${error}`);
  }
}

/**
 * Send Message to Telegram User
 *
 * @param {string} chatId
 * @param {string} message
 * @param {Object} options (optional)
 *
 * @public
 */
async function sendMessage(chatId, message, options) {
  logger.tg.info(`Sending Message to chat_id: ${chatId}`);

  let parseMode = '';
  let replyMarkup = {};
  if (options) {
    parseMode = options.parse_mode || '';
    replyMarkup = options.force_reply
      || options.inline_keyboard
      || options.keyboard
      || options.remove_keyboard
      || {};
  }
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: parseMode,
    reply_markup: replyMarkup,
    disable_web_page_preview: true,
  };
  try {
    const response = await postToTelegram('sendMessage', payload);
    logger.tg.info(`Message sent to ${chatId}. ${JSON.parse(response).ok}`);
  } catch (error) {
    throw new Error(`Error: Failed to send message to ${chatId}. ${error}`);
  }
}

/**
 * Sends a Chat Action to a Telegram User
 * Available Actions: typing, upload_photo, record_video, upload_video,
 * record_audio, upload_audio, upload_document, find_location, record_video_note,
 * upload_video_note
 *
 * @param {string} chatId
 * @param {string} actionToSend
 *
 * @public
 */
async function sendChatAction(chatId, actionToSend) {
  logger.tg.info(`Sending chat action (${actionToSend}) to chat_id: ${chatId}`);
  const payload = {
    chat_id: chatId,
    action: actionToSend,
  };
  try {
    const result = await postToTelegram('sendChatAction', payload);
    logger.tg.info(`Chat Action sent to ${chatId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to send chat action to ${chatId}. ${error}`);
  }
}

/**
 * Send a Photo to a Telegram User
 * @param {string} chatId
 * @param {string} imgUrl
 * @param {{caption: string, inline_keyboard: []}} options (optional)
 *
 * @public
 */
async function sendPhoto(chatId, imgUrl, options) {
  logger.tg.info(`Sending photo (${imgUrl}) to ${chatId}`);
  await sendChatAction(chatId, 'upload_photo').catch((error) => {
    logger.tg.err(error);
  });
  const payload = {
    chat_id: chatId,
    photo: imgUrl,
    parse_mode: 'markdown',
  };
  if (is.propertyDefined(options, 'caption')) {
    payload.caption = options.caption;
  }
  if (is.propertyDefined(options, 'inline_keyboard')) {
    payload.reply_markup = { inline_keyboard: options.inline_keyboard };
  } else if (is.propertyDefined(options, 'reply_keyboard')) {
    payload.reply_markup = { reply_keyboard: options.reply_keyboard };
  } else if (is.propertyDefined(options, 'remove_keyboard')) {
    payload.reply_markup = { remove_keyboard: options.remove_keyboard };
  }
  try {
    const result = await postToTelegram('sendPhoto', payload);
    logger.tg.info(`Photo Sent to chat_id: ${chatId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to send photo to ${chatId}. ${error}`);
  }
}

/**
 * Send Message with Forced Reply to Telegram User
 *
 * @param {string} chatId
 * @param {string} message
 *
 * @public
 */
async function sendMessageWithReply(chatId, message) {
  logger.tg.info('Forcing reply on message to be sent:', chatId);
  await sendMessage(chatId, message, {
    parse_mode: 'markdown',
    force_reply: { force_reply: true },
  });
}

/**
 * Send Message with Inline Keyboard to Telegram User
 *
 * @param {string} chatId
 * @param {string} message
 * @param {Array} inlineKeyboardButtonList
 *
 * @public
 */
async function sendMessageWithInlineKeyboard(chatId, message, inlineKeyboardButtonList) {
  logger.tg.info('Sending message with inline keyboard:', chatId);
  const sendOptions = {
    parse_mode: 'markdown',
    inline_keyboard: {
      inline_keyboard: inlineKeyboardButtonList,
    },
  };
  await sendMessage(chatId, message, sendOptions);
}

/**
 * Send Message with Reply Keyboard to Telegram User
 *
 * @param {string} chatId
 * @param {string} message
 * @param {Array} replyKeyboardButtonList
 *
 * @public
 */
async function sendMessageWithReplyKeyboard(chatId, message, replyKeyboardButtonList) {
  logger.tg.info('Sending message with reply keyboard:', chatId);
  const sendOptions = {
    parse_mode: 'markdown',
    keyboard: {
      keyboard: replyKeyboardButtonList,
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  };
  await sendMessage(chatId, message, sendOptions);
}

/**
 * Send Message with Reply Keyboard Removed to Telegram User
 *
 * @param {string} chatId
 * @param {string} message
 *
 * @public
 */
async function sendMessageWithReplyKeyboardRemoved(chatId, message) {
  logger.tg.info('Sending message with reply keyboard removed:', chatId);
  const sendOptions = {
    parse_mode: 'markdown',
    remove_keyboard: {
      remove_keyboard: true,
    },
  };
  await sendMessage(chatId, message, sendOptions);
}

/**
 * Send Message to List of Telegram Users.
 *
 * @param {array} chatIdList
 * @param {string} message
 * @param {{image_url: string, inline_keyboard: Array}} options
 *
 * @public
 *
 * @returns {{success_list: [string], failure_list: [string]}}
 */
async function sendMessageToList(chatIdList, message, options) {
  logger.tg.info(`Sending message to list of chatIds: ${chatIdList}`);
  const successList = [];
  const failureList = [];
  const waitQueue = () => new Promise((resolve) => {
    const q = async.queue(async (chatId) => {
      try {
        if (options && is.propertyDefined(options, 'image_url')) {
          await sendPhoto(chatId, options.image_url);
        }
        if (options && is.propertyDefined(options, 'inline_keyboard')) {
          await sendMessageWithInlineKeyboard(chatId, message, options.inline_keyboard);
        } else {
          await sendMessage(chatId, message, {
            parse_mode: 'markdown',
          });
        }
        successList.push(chatId);
        await sleep(randomUtil.getRandomIntInclusive(100, 300));
      } catch (error) {
        logger.tg.err(`Unable to send message to ${chatId}`);
        failureList.push(chatId);
      }
    }, 15);

    q.push(chatIdList);

    q.drain = () => {
      logger.tg.info('Message successfully sent to list of chatIds');
      resolve();
    };
  });

  await waitQueue();
  return { success_list: successList, failure_list: failureList };
}

/**
 * Edit a specified Telegram Message
 *
 * @param {string} chatId
 * @param {string} msgId
 * @param {string} editedMessage
 * @param {Object} options (optional)
 *
 * @public
 */
async function editMessage(chatId, msgId, editedMessage, options) {
  logger.tg.info(`Editing Message[${msgId}] for chat_id: ${chatId}`);
  let parseMode = '';
  let replyMarkup = {};
  if (options) {
    parseMode = options.parse_mode || '';
    replyMarkup = options.force_reply || options.inline_keyboard || {};
  }
  const payload = {
    chat_id: chatId,
    message_id: msgId,
    text: editedMessage,
    parse_mode: parseMode,
    reply_markup: replyMarkup,
  };
  try {
    const result = await postToTelegram('editMessageText', payload);
    logger.tg.info(`Message sent to ${chatId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to edit message at ${chatId}. ${error}`);
  }
}

/**
 * Edit a specified Telegram Message with Inline Keyboard and Message
 *
 * @param {string} chatId
 * @param {string} msgId
 * @param {string} editedMessage
 * @param {Array} editedInlineKeyboardButtonList
 *
 * @public
 */
async function editMessageWithInlineKeyboard(
  chatId,
  msgId,
  editedMessage,
  editedInlineKeyboardButtonList,
) {
  logger.tg.info('Editing message with inline keyboard:', chatId);
  const sendOptions = {
    parse_mode: 'markdown',
    inline_keyboard: {
      inline_keyboard: editedInlineKeyboardButtonList,
    },
  };
  await editMessage(chatId, msgId, editedMessage, sendOptions);
}

/**
 * Edit a specified Telegram Message with only Inline Keyboard
 *
 * @param {string} chatId
 * @param {string} msgId
 * @param {Array} inlineKeyboardButtonList
 *
 * @public
 */
async function editInlineKeyboardOnly(chatId, msgId, inlineKeyboardButtonList) {
  logger.tg.info(`Editing InlineKeyboard for message[${msgId}] for chat_id: ${chatId}`);
  const payload = {
    chat_id: chatId,
    message_id: msgId,
    reply_markup: {
      inline_keyboard: inlineKeyboardButtonList,
    },
  };
  try {
    const result = await postToTelegram('editMessageReplyMarkup', payload);
    logger.tg.info(`Message sent to ${chatId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to edit inline_keyboard at ${chatId}. ${error}`);
  }
}

/**
 * Edits message caption for Telegram message
 *
 * @param {string} chatId
 * @param {string} msgId
 * @param {string} updatedCaption
 *
 * @public
 */
async function editMessageCaption(chatId, msgId, updatedCaption) {
  logger.tg.info(`Editing caption for message[${msgId}] for chat_id: ${chatId}`);
  const payload = {
    chat_id: chatId,
    message_id: msgId,
    caption: updatedCaption,
    parse_mode: 'markdown',
  };
  try {
    const result = await postToTelegram('editMessageCaption', payload);
    logger.tg.info(`Caption updated for ${chatId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to edit caption at ${chatId}. ${error}`);
  }
}

/**
 * Send Answer Callback Query to Telegram User.
 * Use this method whenever the Telegram User clicks on a button.
 *
 * @param {string} callbackQueryId
 * @param {object} callbackOptions
 *
 * @public
 */
async function sendAnswerCallbackQuery(callbackQueryId, callbackOptions) {
  logger.tg.info(
    `Sending answer callback query (${JSON.stringify(
      callbackOptions,
    )}) to callback query: ${callbackQueryId}`,
  );
  let payload = {
    callback_query_id: callbackQueryId,
  };
  if (callbackOptions) {
    payload = Object.assign({}, payload, callbackOptions);
  }
  try {
    const result = await postToTelegram('answerCallbackQuery', payload);
    logger.tg.info(
      `Answer Callback Query sent to callback_query_id: ${callbackQueryId}. ${result}`,
    );
  } catch (error) {
    throw new Error(`Error: Failed to send answer callback query to ${callbackQueryId}. ${error}`);
  }
}

/**
 * Send response to Inline Query by a Telegram User
 *
 * @param {string} inlineQueryId
 * @param {Array} resultList
 *
 * @public
 */
async function sendAnswerInlineQuery(inlineQueryId, resultList) {
  logger.tg.info(`Sending answer to inline query ${inlineQueryId}`);
  const payload = {
    inline_query_id: inlineQueryId,
    results: resultList,
    is_personal: true,
    cache_time: 5,
    next_offset: '',
  };
  try {
    const result = await postToTelegram('answerInlineQuery', payload);
    logger.tg.info(`Answer sent to inline query: ${inlineQueryId}. ${result}`);
  } catch (error) {
    throw new Error(`Error: Failed to send answer to inline query ${inlineQueryId}. ${error}`);
  }
}

async function sendGetLocation(chatId, message) {
  logger.tg.info(`Sending message to get location from user ${chatId}`);
  await sendMessageWithReplyKeyboard(chatId, message, [
    [
      {
        text: 'Send Location 📌',
        request_location: true,
      },
      {
        text: 'Cancel',
      },
    ],
  ]);
}

module.exports = {
  setWebHook,
  sendMessage,
  editMessage,
  editMessageCaption,
  editMessageWithInlineKeyboard,
  editInlineKeyboardOnly,
  sendMessageWithReply,
  sendMessageWithInlineKeyboard,
  sendMessageToList,
  sendChatAction,
  sendAnswerCallbackQuery,
  sendPhoto,
  sendGetLocation,
  sendAnswerInlineQuery,
  sendMessageWithReplyKeyboard,
  sendMessageWithReplyKeyboardRemoved,
};
