'use strict';
const debug = require('debug')('routes:bcc');
const express = require('express');
const router = express.Router();
const path = require('path');

const data = require('../public/data/articles.js');
let currentArticle = 1;
let expectedAnswer;

//TODO: move these to .env
const USER = 'Martin';


const { ApiAiApp } = require('actions-on-google');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  WELCOME: 'BBC.welcome',
  ASK: 'BBC.comment', 
  ANSWER: 'BBC.answer',
  RECORD: 'BBC.record',
  PICK: 'BBC.pick'
};

const Context = {
	CHOOSE_ACTION: 'choose_action', 
	ASK_LEAVE_COMMENT: 'leave_comment',
	CHECK_QUIZ_ANWSER: 'answer_quiz',
	CAN_LEAVE_COMMENT: 'record_comment'
}

const playWelcome = google => {
	//TODO change context + add map action
	google.setContext(Context.CHOOSE_ACTION, 1);
	google.ask(`Hi ${USER}, other readers are discussing the articles you read today. Which article would you like to talk about? The last one you read, or do you want me to repeat the articles for you?`);
};

const pickLastArticle = google => {
	google.setContext(Context.ASK_LEAVE_COMMENT, 1);
	google.ask(`<speak>OK! The last article you read was "${data[currentArticle].title}".<break time="0.5s" />Do you want to hear what others had to say about the article or leave a comment?</speak>`);
};

const askQuiz = google => {
	const question = data[currentArticle].fact_check[0];
	let options = '';
	for(let i = 0; i < question.answers.length; ++i) {
		if(question.hasOptions) {
			options += `${question.answers[i].option}) ${question.answers[i].value}. `;
		}

		if(question.answers[i].isCorrect) {
			expectedAnswer = question.answers[i];
		}
	}

	google.setContext(Context.CHECK_QUIZ_ANWSER, 1);
	google.ask(`Great, to make sure you read the story, answer one question about the article correctly. ${question.question} ${options}`);
};

const matchAnswer = google => {
	const userAnswer = google.getRawInput().toLowerCase();

	let reply = `Sorry that's not the correct answer, would you like to try another question?`;
	let setContext = Context.CHECK_QUIZ_ANWSER;

	if(userAnswer.startsWith(expectedAnswer.option.toLowerCase()) || userAnswer === expectedAnswer.value.toLowerCase()) {
		reply = `You gave the correct answer. Please record your comment.`
	}

	google.ask(reply);
};

const recordComment = google => {
	const comment = google.getRawInput();

	console.log('USER COMMENT::', comment);
	//TODO: analyse in promise + try and play mp3
	
	google.ask(`<speak>Are you sure you want to publish "${comment}"?</speak>`);
};

const actionMap = new Map();
actionMap.set(Actions.WELCOME, playWelcome);
actionMap.set(Actions.ASK, askQuiz);
actionMap.set(Actions.ANSWER, matchAnswer);
actionMap.set(Actions.RECORD, recordComment);
actionMap.set(Actions.PICK, pickLastArticle);

router.post('/', (request, response) => {
  const google = new ApiAiApp({ request, response });
  google.handleRequest(actionMap);
});

module.exports = router;
