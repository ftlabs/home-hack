const debug = require('debug')('bin:lib:capi');

module.exports = function(){

	return new Promise( (resolve, reject) => {

		resolve('CAPI content');

	});

}