const debug = require('debug')('bin:lib:content-interface');
const fetch = require('node-fetch');

function limitListSize(maxNumber, list){
	
	if(list.length > maxNumber){
		list.length = maxNumber;
	}

	return list;
}

function getContent(){
	return fetch(process.env.WEB_APP_ENDPOINT)
		.then(res => {
			if(res.ok){
				return res;
			} else {
				throw res;
			}
		})
		.then(res => res.json())
		.catch(err => {
			debug('Failed to getContent', err);
			throw err;
		})
	;
}

function getFilteredContent(){
	return getContent()
		.then(data => {
			data.sectionlist = data.sectionlist.filter(item => item.indexOf('advert') === -1);
			return data;
		})
		.catch(err => {
			debug('Failed to getFilteredContent', err);
			throw err;
		})
	;
}

function getAListOfValidTopics(){

	return getFilteredContent()
		.then(data => {
			return data.sectionlist;
		})
		.catch(err => {
			debug('An error occurred trying to getAListOfValidTopics', err);
			throw err;
		})
	;

}

function getArticlesForATopic(section){

	debug(section);

	return getFilteredContent()
		.then(data => {

			const selectedSection = data.sections[section];

			debug('selectedSection', selectedSection);

			if(selectedSection !== undefined){
				return selectedSection.itemdata;
			} else {
				throw 'That is not a valid section';
			}

		})
		.catch(err => {
			debug('Failed to getArticlesForATopic', err);
			throw err;
		})
	;

}

function onlyGetArticlesThatHaveAHeadlineAndBody(numberOfArticles = 5, topic = 'home'){
	return getArticlesForATopic(topic)

		.then( articles => articles.filter( article => { return article.body !== undefined } ) )
		.then( filteredArticles => limitListSize(numberOfArticles, filteredArticles) )
	;
}

module.exports = {
	listTopics : getAListOfValidTopics,
	getHeadlinesAndBody : onlyGetArticlesThatHaveAHeadlineAndBody 
};