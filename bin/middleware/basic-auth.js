const debug = require('debug')('bin:middleware:basic-auth');
const auth = require('basic-auth');

module.exports = (req, res, next) => {

	const credentials = auth(req);
 
	if (!credentials || credentials.name !== process.env.BASIC_AUTH_USERNAME || credentials.pass !== process.env.BASIC_AUTH_PASSWORD) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="example"');
		res.json({
			status : 'err',
			message : 'You need to pass basic auth headers with valid credentials to use this service'
		});
	} else {
		// Basic authorisation credentials are valid.
		next();
	}

};