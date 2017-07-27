const debug = require('debug')('bin:lib:capi');
const fetch = require('node-fetch');

function getContentByUUID(uuid){

	return fetch(`https://${process.env.CONTENT_API_HOSTNAME}/content/${uuid}`, {
			method : 'POST',
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
			return data;
		})
		.catch(err => {
			debug('Failed to getContentByUUID', err);
			throw err;
		})
	;

}

module.exports = {
	uuid : getContentByUUID
};