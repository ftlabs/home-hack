'use strict';
require('dotenv').config();
const debug = require('debug')('routes:bcc');
const express = require('express');
const router = express.Router();
const path = require('path');
const fetch = require('node-fetch');

const data = require('../public/data/articles.js');
let currentArticle = 1;
let expectedAnswer;

//TODO: move these to .env const USER = 'Lily'; const SENTIMENT_API =
process.env.SENTIMENT_API; const SWEAR_PRICE = 0.2;

const { ApiAiApp } = require('actions-on-google');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  WELCOME: 'BBC.welcome',
  ASK: 'BBC.comment', 
  ANSWER: 'BBC.answer',
  RECORD: 'BBC.record',
  PICK: 'BBC.pick',
  CONFIRM: 'BBC.confirm'
};

const Context = {
	CHOOSE_ACTION: 'choose_action', 
	ASK_LEAVE_COMMENT: 'leave_comment',
	CHECK_QUIZ_ANWSER: 'answer_quiz',
	CAN_LEAVE_COMMENT: 'record_comment',
	CONFIRM_COMMENT:   'confirm_comment'
}

const playWelcome = google => {
	//TODO change context + add map action
	console.log('PLAY WELCOME:::');
	console.log(google);
	google.setContext(Context.CHOOSE_ACTION, 1);
	google.ask(`I'm saying something basic here`);
	// google.ask(`<speak>Hi ${USER}, other readers are discussing the articles you red today. Would you like to talk about the last one you red, "${data[currentArticle].title}" <break time="0.5s" /> or another one?</speak>`);
	// google.setContext(Context.CHOOSE_ACTION, 1);
};

const pickLastArticle = google => {
	google.ask(`<speak>OK! Do you want to hear what others had to say or leave a comment?</speak>`);
	google.setContext(Context.ASK_LEAVE_COMMENT, 1);
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
	google.ask(`Grate, to make sure you red the story, answer one question about the article correctly. ${question.question} ${options}`);
};

const matchAnswer = google => {
	const userAnswer = google.getRawInput().toLowerCase();

	let reply = `Sorry that's not the correct answer, would you like to try another question?`;
	let setContext = Context.CHECK_QUIZ_ANWSER;

	if(userAnswer.startsWith(expectedAnswer.option.toLowerCase()) || userAnswer === expectedAnswer.value.toLowerCase()) {
		reply = `Correct. Go ahead and record your comment.`
	}

	google.ask(reply);
};

const recordComment = google => {
	const comment = google.getRawInput();

	console.log('USER COMMENT::', comment);
	//TODO: analyse in promise + try and play mp3
	const options = {
		method: 'POST', 
		body: JSON.stringify({'sentences': [comment]}), 
		headers : {
			'Content-Type' : 'application/json'
		}
	};

	return fetch(SENTIMENT_API, options)
	.then(res => {
		if(res.ok){
			return res;
		} else {
			throw res;
		}
	})
	.then(res => res.json())
	.then(data => {
		console.log(data);
		const charge = data.swear_count*SWEAR_PRICE;
		let reply = (charge > 0)?`You will be charged £${charge.toFixed(2)} for your swear words. `:'';
		reply += `Are you sure you want to publish "${comment}"?`;


		google.setContext(Context.CONFIRM_COMMENT, 10);
		return google.ask(`<speak>${reply}</speak>`);
	})
	.catch(err => {
		console.log(err);
		google.ask(`<speak>Sorry I could not process your comment. Please try again.</speak>`);
	});
};

const postComment = google => {
	console.log('POSTING');
	google.tell(`Thanks, I've posted your comment.`);
}

const actionMap = new Map();
actionMap.set(Actions.WELCOME, playWelcome);
actionMap.set(Actions.ASK, askQuiz);
actionMap.set(Actions.ANSWER, matchAnswer);
actionMap.set(Actions.RECORD, recordComment);
actionMap.set(Actions.PICK, pickLastArticle);
actionMap.set(Actions.CONFIRM, postComment);

router.post('/', (request, response) => {
  const google = new ApiAiApp({ request, response });
  google.handleRequest(actionMap);
});

module.exports = router;
