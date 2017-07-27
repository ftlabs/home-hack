const debug = require('debug')('bin:lib:enforce-env-vars');

const REQUIRED_ENV_VARS = [
	'WEB_APP_ENDPOINT',
	'SEARCH_API_HOSTNAME',
	'CONTENT_API_HOSTNAME',
	'CAPI_API_KEY'
];

(function(){

	REQUIRED_ENV_VARS.forEach(ENV_VAR => {
		if(process.env[ENV_VAR] === undefined || process.env[ENV_VAR] === ''){
			debug(`Missing required environment variable '${ENV_VAR}'. Exiting app.`);
			process.exit();
		}
	});

})()