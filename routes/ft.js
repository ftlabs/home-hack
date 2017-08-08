'use strict';
const debug = require('debug')('routes:ft');
const express = require('express');
const router = express.Router();

const { ApiAiApp } = require('actions-on-google');
const { sprintf } = require('sprintf-js');

const strings = require('../assets/strings');
const content = require('../bin/lib/content-interface');
const search = require('../bin/lib/sapi');
const sessions = require('../bin/lib/session-store');

process.env.DEBUG = 'actions-on-google:*';

/** API.AI Actions {@link https://api.ai/docs/actions-and-parameters#actions} */

const Actions = {
  FT_WELCOME: 'ft.welcome',
  FT_READ:    'ft.read',
  FT_TOPIC:   'ft.other.topic',
  FT_SEARCH:  'ft.other.fallback'  
};

const concat = messages => messages.map(message => message.trim()).join(' ');

// Polyfill Object.values to get the values of the keys of an object
if (!Object.values) {
  Object.values = o => Object.keys(o).map(k => o[k]);
}

const getTopic = app => {
  console.log(app.data);
  const topic = app.data['app-topics'];
  const userChoice = app.data['app-topics.original'];

  content.getHeadlinesAndBody(3, topic)
  .then(results => {
    let responseText = '<speak>Our top stories on ' + userChoice + ' are:';

    for(let i = 0; i < results.length; ++i) {
      responseText += '<break time="0.8s" />'+ ((i === results.length - 1)?'and, ':'') + results[i].title;
    }

    sessions.set(app.body_.sessionId, { originalHeadlines : results });

    responseText += '</speak>';

    app.ask(responseText, strings.general.noInputs);
  });
}

const searchTopic = app => {
  const userQuery = app.body_.result.resolvedQuery;
  let userChoice = (userQuery.split('about ').length > 1)?userQuery.split('about ')[1]:userQuery;

  search.keyword(userChoice).then(results => {
    let responseText = '<speak>Our top stories on ' + userChoice + ' are:';

    for(let i = 0; i < results.length; ++i) {
      responseText += '<break time="0.8s" />'+ ((i === results.length - 1)?'and, ':'') + results[i].title.title;
    }

    responseText += '<break time="0.5s" />You can read those articles on ft.com, or would you like to search for something else?';

    // sessions.set(app.body_.sessionId, { originalHeadlines : results });

    responseText += '</speak>';

    app.ask(responseText, strings.general.noInputs);
  });
}

const readArticle = app => {
  let responseText = 'You chose article number ';

  switch(app.data['article-choice']) {
    case '0':
      responseText += 'one,';
    break;

    case '1':
      responseText += 'two,';
    break;

    case '2':
      responseText += 'three, ';
    break;
  }

  const articles = sessions.get(app.body_.sessionId).originalHeadlines;
  responseText += articles[parseInt(app.data['article-choice'])].title + '.' + '<break time="1s" />';

  const article_body = articles[parseInt(app.data['article-choice'])].body;
  if(article_body !== undefined) {
    responseText += article_body;
  }

  app.ask(`<speak>${responseText}</speak>`, strings.general.noInputs);
}


const welcomeWithHeadlines = app => {
  content.getHeadlinesAndBody(3).then(results => {
    let responseText = '<speak>Welcome to the F.T.<break time="0.5s" />Our top stories right now:';

    for(let i = 0; i < results.length; ++i) {

      responseText += '<break time="0.8s" />'+ ((i === results.length - 1)?'and, ':'') + results[i].title;
      
    }

    sessions.set(app.body_.sessionId, { originalHeadlines : results });

    responseText += '<break time="0.5s" /> Would you like me to read one of them or hear about something else?</speak>';

    const richResponse = app.buildRichResponse()
    .addSimpleResponse(responseText);

    app.ask(richResponse, strings.general.noInputs);
  })
};

const actionMap = new Map();
actionMap.set(Actions.FT_WELCOME, welcomeWithHeadlines);
actionMap.set(Actions.FT_READ, readArticle);
actionMap.set(Actions.FT_TOPIC, getTopic);
actionMap.set(Actions.FT_SEARCH, searchTopic);

router.post('/', (request, response) => {
  const app = new ApiAiApp({ request, response });
  app.handleRequest(actionMap);
});

module.exports = router;