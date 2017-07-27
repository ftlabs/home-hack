const debug = require('debug')('routes:index');
const express = require('express');
const router = express.Router();

const webApp = require('../bin/lib/content-interface');

/* GET home page. */
router.get('/', function(req, res, next) {
	debug('Request received');
	res.end();
});

router.get('/topics', (req, res) => {

	webApp.listTopics()
		.then(data => {
			res.json(data);
		})
	;

});

router.get('/topic/:topic', (req, res) => {

	webApp.getForTopic(req.params.topic)
		.then(data => {
			res.json(data);
		})
		.catch(err => {
			res.json({
				status : 'err',
				message : err
			})
		})
	;

});

module.exports = router;
