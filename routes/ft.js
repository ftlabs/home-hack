// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
const debug = require('debug')('routes:ft');
const express = require('express');
const router = express.Router();

const { ApiAiApp } = require('actions-on-google');
const { sprintf } = require('sprintf-js');

const strings = require('../assets/strings');
const content = require('../bin/lib/content-interface');
const sessions = require('../bin/lib/session-store');

process.env.DEBUG = 'actions-on-google:*';

/** API.AI Actions {@link https://api.ai/docs/actions-and-parameters#actions} */

//TODO: define custom actions here
const Actions = {
  FT_WELCOME: 'ft.welcome',
  FT_READ:    'ft.read',
  FT_TOPIC:   'ft.other.topic' 
};
/** API.AI Parameters {@link https://api.ai/docs/actions-and-parameters#parameters} */
//TODO: read on params?
// const Parameters = {
//   CATEGORY: 'category'
// };
// /** API.AI Contexts {@link https://api.ai/docs/contexts} */
// //TODO: add contexts + lifespans if needed
// const Contexts = {
//   FACTS: 'choose_fact-followup',
//   CATS: 'choose_cats-followup'
// };
// /** API.AI Context Lifespans {@link https://api.ai/docs/contexts#lifespan} */
// const Lifespans = {
//   DEFAULT: 5,
//   END: 0
// };

/**
 * @template T
 * @param {Array<T>} array The array to get a random value from
 */
// const getRandomValue = array => array[Math.floor(Math.random() * array.length)];

/** @param {Array<string>} facts The array of facts to choose a fact from */
//TODO: replace with get latest headlines?
// const getRandomFact = facts => {
//   if (!facts.length) {
//     return null;
//   }
//   const fact = getRandomValue(facts);
//   // Delete the fact from the local data since we now already used it
//   facts.splice(facts.indexOf(fact), 1);
//   return fact;
// };

/** @param {Array<string>} messages The messages to concat */
const concat = messages => messages.map(message => message.trim()).join(' ');

// Polyfill Object.values to get the values of the keys of an object
if (!Object.values) {
  Object.values = o => Object.keys(o).map(k => o[k]);
}

/** @typedef {*} ApiAiApp */

/**
 * Greet the user and direct them to next turn
 * @param {ApiAiApp} app ApiAiApp instance
 * @return {void}
 */
// const unhandledDeepLinks = app => {
//   /** @type {string} */
//   const rawInput = app.getRawInput();
//   const response = sprintf(strings.general.unhandled, rawInput);
//   /** @type {boolean} */
//   const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
//   if (!screenOutput) {
//     return app.ask(response, strings.general.noInputs);
//   }
//   const suggestions = Object.values(strings.categories).map(category => category.suggestion);
//   const richResponse = app.buildRichResponse()
//     .addSimpleResponse(response)
//     .addSuggestions(suggestions);

//   app.ask(richResponse, strings.general.noInputs);
// };

/**
 * @typedef {Object} FactsData
 * @prop {{[category: string]: Array<string>}} content
 * @prop {Array<string> | null} cats
 */

/**
 * @typedef {Object} AppData
 * @prop {FactsData} facts
 */

/**
 * Set up app.data for use in the action
 * @param {ApiAiApp} app ApiAiApp instance
 */
// const initData = app => {
//   /** @type {AppData} */
//   const data = app.data;
//   if (!data.facts) {
//     //TODO change object params below
//     data.facts = {
//       content: {},
//       cats: null
//     };
//   }
//   return data;
// };

/**
 * Say they've heard it all about this category
 * @param {ApiAiApp} app ApiAiApp instance
 * @param {string} currentCategory The current category
 * @param {string} redirectCategory The category to redirect to since there are no facts left
 */

 //TODO delete as not needed, + rem responses associated with it
// const noFactsLeft = (app, currentCategory, redirectCategory) => {
//   const data = initData(app);
//   // Replace the outgoing facts context with different parameters
//   app.setContext(Contexts.FACTS, Lifespans.DEFAULT, { [Parameters.CATEGORY]: redirectCategory });
//   const response = [sprintf(strings.transitions.content.heardItAll, currentCategory, redirectCategory)];
//   const catFacts = data.facts.cats;
//   if (!catFacts || catFacts.length) {
//     response.push(strings.transitions.content.alsoCats);
//   }
//   response.push(strings.general.wantWhat);
//   return concat(response);
// };

/**
 * Say a fact
 * @param {ApiAiApp} app ApiAiApp instance
 * @return {void}
 */
// const tellFact = app => {
//   const data = initData(app);
//   const facts = data.facts.content;
//   for (const category of Object.values(strings.categories)) {
//     // Initialize categories with all the facts if they haven't been read
//     if (!facts[category.category]) {
//       facts[category.category] = category.facts.slice();
//     }
//   }
//   if (Object.values(facts).every(category => !category.length)) {
//     // If every fact category facts stored in app.data is empty
//     return app.tell(strings.general.heardItAll);
//   }
//   const parameter = Parameters.CATEGORY;
//   /** @type {string} */
//   const factCategory = app.getArgument(parameter);
//   /** @type {boolean} */
//   const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
//   const category = strings.categories[factCategory];
//   if (!category) {
//     /** @type {string} */
//     const action = app.getIntent();
//     return console.error(`${parameter} parameter is unrecognized or not provided by API.AI ${action} action`);
//   }
//   const fact = getRandomFact(facts[category.category]);
//   if (!fact) {
//     const otherCategory = Object.values(strings.categories).find(other => other !== category);
//     if (!otherCategory) {
//       return console.error(`No other category besides ${category.category} exists`);
//     }
//     if (!screenOutput) {
//       return app.ask(noFactsLeft(app, factCategory, otherCategory.category), strings.general.noInputs);
//     }
//     const suggestions = [otherCategory.suggestion];
//     const catFacts = data.facts.cats;
//     if (!catFacts || catFacts.length) {
//       // If cat facts not loaded or there still are cat facts left
//       suggestions.push(strings.cats.suggestion);
//     }
//     const richResponse = app.buildRichResponse()
//       .addSimpleResponse(noFactsLeft(app, factCategory, otherCategory.category))
//       .addSuggestions(suggestions);

//     return app.ask(richResponse, strings.general.noInputs);
//   }
//   const factPrefix = category.factPrefix;
//   if (!screenOutput) {
//     return app.ask(concat([factPrefix, fact, strings.general.nextFact]), strings.general.noInputs);
//   }
//   const image = getRandomValue(strings.content.images);
//   const [url, name] = image;
//   const card = app.buildBasicCard(fact)
//     .addButton(strings.general.linkOut, strings.content.link)
//     .setImage(url, name);

//   const richResponse = app.buildRichResponse()
//     .addSimpleResponse(factPrefix)
//     .addBasicCard(card)
//     .addSimpleResponse(strings.general.nextFact)
//     .addSuggestions(strings.general.suggestions.confirmation);

//   app.ask(richResponse, strings.general.noInputs);
// };

/**
 * Say a cat fact
 * @param {ApiAiApp} app ApiAiApp instance
 * @return {void}
 */
// const tellCatFact = app => {
//   const data = initData(app);
//   if (!data.facts.cats) {
//     data.facts.cats = strings.cats.facts.slice();
//   }
//   const catFacts = data.facts.cats;
//   const fact = getRandomFact(catFacts);
//   /** @type {boolean} */
//   const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
//   if (!fact) {
//     // Add facts context to outgoing context list
//     app.setContext(Contexts.FACTS, Lifespans.DEFAULT, {});
//     // Replace outgoing cat-facts context with lifespan = 0 to end it
//     app.setContext(Contexts.CATS, Lifespans.END, {});
//     if (!screenOutput) {
//       return app.ask(strings.transitions.cats.heardItAll, strings.general.noInputs);
//     }
//     const richResponse = app.buildRichResponse()
//       .addSimpleResponse(strings.transitions.cats.heardItAll, strings.general.noInputs)
//       .addSuggestions(strings.general.suggestions.confirmation);

//     return app.ask(richResponse);
//   }
//   const factPrefix = sprintf(strings.cats.factPrefix, getRandomValue(strings.cats.sounds));
//   if (!screenOutput) {
//     // <speak></speak> is needed here since factPrefix is a SSML string and contains audio
//     return app.ask(`<speak>${concat([factPrefix, fact, strings.general.nextFact])}</speak>`, strings.general.noInputs);
//   }
//   const image = getRandomValue(strings.cats.images);
//   const [url, name] = image;
//   const card = app.buildBasicCard(fact)
//     .setImage(url, name)
//     .addButton(strings.general.linkOut, strings.cats.link);

//   const richResponse = app.buildRichResponse()
//     .addSimpleResponse(`<speak>${factPrefix}</speak>`)
//     .addBasicCard(card)
//     .addSimpleResponse(strings.general.nextFact)
//     .addSuggestions(strings.general.suggestions.confirmation);

//   app.ask(richResponse, strings.general.noInputs);
// };

const getTopic = app => {
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

const readArticle = app => {
  debug('App:', app.data);

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

    responseText += '</speak>';

    const richResponse = app.buildRichResponse()
    .addSimpleResponse(responseText);

    app.ask(richResponse, strings.general.noInputs);
  })
};

/** @type {Map<string, function(ApiAiApp): void>} */
const actionMap = new Map();
// actionMap.set(Actions.UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
// actionMap.set(Actions.TELL_FACT, tellFact);
// actionMap.set(Actions.TELL_CAT_FACT, tellCatFact);
actionMap.set(Actions.FT_WELCOME, welcomeWithHeadlines);
actionMap.set(Actions.FT_READ, readArticle);
actionMap.set(Actions.FT_TOPIC, getTopic);

/**
 * The entry point to handle a http request
 * @param {Request} request An Express like Request object of the HTTP request
 * @param {Response} response An Express like Response object to send back data
 */

router.post('/', (request, response) => {
  const app = new ApiAiApp({ request, response });
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);
  app.handleRequest(actionMap);
});

module.exports = router;