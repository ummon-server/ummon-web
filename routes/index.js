var moment = require('moment'),
	assert = require('assert'),
	prettycron = require('prettycron')

	// All of these routes assume (and implicitly require) that req.apiClient has already been set by either userLoginRequired or userLoginOptional
exports.status = function(req, res){
	req.apiClient.get('/status', function(err, req, rez, result) {
		res.render('status.html',{ data: result, json: JSON.stringify });
	});
};

exports.tasks = function(req, res){
	req.apiClient.get('/tasks'+(req.params.filter ? '/'+req.params.filter : ''), function(err, req, rez, result) {
		assert.ifError(err);
		// console.log(rez.body);
		res.render('tasks.html',{ data: result, json: JSON.stringify, prettycron: prettycron, moment: moment });
	});
};
exports.runs = function(req, res){
	var from = moment().subtract(1, 'day').toISOString();

	req.apiClient.get('/log?filter='+req.params.filter+'&runsOnly=true&from='+from, function(err, req, rez) {
		// rez.body is a newline-separated list of JSON objects, and isn't JSON-parseable directly. Let's parse them ourselves.
		var runs = [];
		rez.body.split('\n').forEach(function(item, n) {
			// console.log("Now doing "+n);
			item && runs.push(JSON.parse(item));
		});
		// console.log(runs);


		res.render('runs.html',{ data: JSON.stringify(runs) });
	});
};
exports.log = function(req, res){
	var from = moment().subtract(1, 'day').toISOString();


	req.apiClient.get('/log?filter='+req.params.runId+'&from='+from, function(err, req, rez) {
		var log_entries = [];
		rez.body.split('\n').forEach(function(item, n) {
			item && log_entries.push(JSON.parse(item));
		});
		res.render('log.html',{ data: JSON.stringify(log_entries) });
	});
};

exports.login = function(req, res){
	res.render('login.html')
}
