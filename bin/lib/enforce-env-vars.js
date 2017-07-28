const debug = require('debug')('bin:lib:enforce-env-vars');

const REQUIRED_ENV_VARS = [
	'WEB_APP_ENDPOINT',
	'SEARCH_API_HOSTNAME',
	'CONTENT_API_HOSTNAME',
	'CAPI_API_KEY',
	'BASIC_AUTH_USERNAME',
	'BASIC_AUTH_PASSWORD'
];

(function(){

	const missingVars = [];

	REQUIRED_ENV_VARS.forEach(ENV_VAR => {
		if(process.env[ENV_VAR] === undefined || process.env[ENV_VAR] === ''){
			missingVars.push(ENV_VAR);
		}
	});

	if(missingVars.length > 0){
		debug(`Missing required environment variable(s) '${missingVars.join('\', ')}'. Exiting app.`);
		process.exit();		
	}

}());