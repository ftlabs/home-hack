'use strict';
const debug = require('debug')('routes:bcc');
const express = require('express');
const router = express.Router();

const { ApiAiApp } = require('actions-on-google');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  WELCOME: 'BBC.welcome'
};

const playWelcome = google => {
	google.ask(`Hello Lily, you've read 3 stories today.`);
};

const actionMap = new Map();
actionMap.set(Actions.WELCOME, playWelcome);

router.post('/', (request, response) => {
  const google = new ApiAiApp({ request, response });
  google.handleRequest(actionMap);
});

module.exports = router;
