const express = require('express');
const evtHandler = require('../telegram/handlers/eventHandler');
const logger = require('../common/logger');

const router = express.Router();

// Receive Events from Telegram
router.post('/', (req, res) => {
  const eventObj = req.body;
  logger.tg.info(`Received event from Telegram ${JSON.stringify(eventObj)}`);
  evtHandler.handleTgEvent(eventObj);
  res.status(200).send('All Good');
});

module.exports = router;
