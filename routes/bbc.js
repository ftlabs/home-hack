'use strict';
const debug = require('debug')('routes:bcc');
const express = require('express');
const router = express.Router();
const path = require('path');

const data = require('../public/data/articles.js');
let currentArticle = 1;
let expectedAnswer;

const { ApiAiApp } = require('actions-on-google');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  WELCOME: 'BBC.welcome',
  ASK: 'BBC.comment', 
  ANSWER: 'BBC.answer'
};

const Context = {
	ASK_LEAVE_COMMENT: 'leave_comment',
	CHECK_QUIZ_ANWSER: 'answer_quiz'
}

const playWelcome = google => {
	google.setContext(Context.ASK_LEAVE_COMMENT, 10);
	google.ask(`Hello Lily, you've read 3 stories today. The last article you read is ${data[currentArticle].title}. Would you like to leave a comment on it?`);
};

const askQuiz = google => {
	const question = data[currentArticle].fact_check[0];
	let options = '';
	if(question.hasOptions) {
		for(let i = 0; i < question.answers.length; ++i) {
			options += `${question.answers[i].option}) ${question.answers[i].value}. `;
			if(question.answers[i].isCorrect) {
				expectedAnswer = question.answers[i];
			}
		}
	}

	google.setContext(Context.CHECK_QUIZ_ANWSER, 10);
	google.ask(`Great, to make sure you read the story, answer one question about the article correctly. ${question.question} ${options}`);
};

const matchAnswer = google => {
	const userAnswer = google.getRawInput().toLowerCase();
	let reply = `Sorry that's not the correct answer, would you like to try another question?`;
	console.log('ANSWER::', expectedAnswer);
	console.log('USER::', userAnswer);
	if(userAnswer.startsWith(expectedAnswer.option.toLowerCase()) || userAnswer === expectedAnswer.value.toLowerCase()) {
		reply = `You gave the correct answer. Please record your comment.`
	}
	google.ask(reply);
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
