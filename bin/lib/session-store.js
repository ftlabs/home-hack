const debug = require('debug')('bin:lib:session-store');

const SESSIONS = {};

function setSession(id, data){

	SESSIONS[id] = data;
	return SESSIONS[id];
	
}

function getSession(id){
	return Object.assign({}, SESSIONS[id]);
}

function checkSession(id){
	return SESSIONS[id] !== undefined;
}

module.exports = {
	set : setSession,
	get : getSession,
	check : checkSession
};