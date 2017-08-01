const debug = require('debug')('bin:lib:sapi');
const fetch = require('node-fetch');

function searchForArticlesByKeyword(keyword){
	
	return fetch(`https://${process.env.SEARCH_API_HOSTNAME}/content/search/v1`, {
			method : 'POST',
			body :  JSON.stringify({
				'queryString': keyword
			}),
			headers : {
				'X-Api-Key' : process.env.CAPI_API_KEY,
				'Content-Type' : 'application/json'
			}
		})
		.then(res => {
			if(res.ok){
				return res;
			} else {
				throw res;
			}
		})
		.then(res => res.json())
		.then(data => {
			debug(data);
			return JSON.stringify(data.results[0].curations);
		})
	;

}

module.exports = {
	keyword : searchForArticlesByKeyword
};