'use strict';
const debug = require('debug')('routes:bcc');
const express = require('express');
const router = express.Router();
const path = require('path');

const data = require('../public/data/articles.js');
let currentArticle = 0;

const { ApiAiApp } = require('actions-on-google');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  WELCOME: 'BBC.welcome',
  ASK: 'BBC.comment', 
};

const Context = {
	ASK_LEAVE_COMMENT: 'leave_comment',
	CHECK_QUIZ_ANWSER: 'check_quiz_answer'
}

const playWelcome = google => {
	google.setContext(Comment.ASK_LEAVE_COMMENT);
	google.ask(`Hello Lily, you've read 3 stories today. The last article you read is ${data[currentArticle].title}. Would you like to leave a comment on it?`);
};

const askQuiz = google => {
	google.ask(`Great, to make sure you read the story, answer one question about the article correctly.`);
};

const matchAnswer = google => {
	google.ask(`You gave the correct answer.`);
};

const actionMap = new Map();
actionMap.set(Actions.WELCOME, playWelcome);
actionMap.set(Actions.ASK, askQuiz);
actionMap.set(Actions.ANSWER, matchAnswer);

router.post('/', (request, response) => {
  const google = new ApiAiApp({ request, response });
  google.handleRequest(actionMap);
});

module.exports = router;
