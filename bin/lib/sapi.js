const debug = require('debug')('bin:lib:sapi');
const fetch = require('node-fetch');

function searchForArticlesByKeyword(keyword){

	const queryParams = {
		"queryString": keyword,
		"queryContext" : {          
		    "curations" : [ "ARTICLES", "BLOGS" ]
		},      
		"resultContext" : {          
		    "maxResults" : "3",          
		    "offset" : "0",
		    "aspects" : [ "title", "location"],
		    "sortOrder": "DESC",          
		    "sortField": "lastPublishDateTime"
		}
	};
	
	return fetch(`https://${process.env.SEARCH_API_HOSTNAME}/content/search/v1`, {
			method : 'POST',
			body: JSON.stringify(queryParams),
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
			debug(JSON.stringify(data.results[0]));
			return JSON.stringify(data.results[0]);
		})
	;

}

module.exports = {
	keyword : searchForArticlesByKeyword
};