require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const tgRouter = require('./routes/telegram');

const config = require('./config');

const tgCaller = require('./common/apiCallers/telegramCaller');

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(`/telegrambot${config.telegram.BOT_TOKEN}`, tgRouter);

async function init() {
  try {
    // start cache provider
    // cacheProvider.start();

    // start worker service
    // wkService.init();

    // set Telegram Webhook
    await tgCaller.setWebHook();
  } catch (error) {
    console.log(error);
  }
}

init();

module.exports = app;
