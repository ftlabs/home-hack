const debug = require('debug')('bin:lib:sapi');
const fetch = require('node-fetch');

function searchForArticlesByKeyword(keyword){

	const queryParams = {
		"queryString": keyword,
		"queryContext" : {          
		    "curations" : [ "ARTICLES", "BLOGS" ]
		},      
		"resultContext" : {          
		    "maxResults" : 3,          
		    "offset" : "0",
		    "aspects" : [ "title", "location", "summary", "lifecycle", "metadata"],
		    "sortOrder": "DESC",          
		    "sortField": "lastPublishDateTime"
		}
	};
	
	return fetch(`https://${process.env.SEARCH_API_HOSTNAME}/content/search/v1`, {
			method : 'POST',
			headers : {
				'X-Api-Key' : process.env.CAPI_API_KEY,
				'Content-Type' : 'application/json',
				'Content-Length': JSON.stringify(queryParams).length
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
			return JSON.stringify(data);
		})
	;

}

module.exports = {
	keyword : searchForArticlesByKeyword
};