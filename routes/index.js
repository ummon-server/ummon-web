var restify = require('restify'),
	moment = require('moment');


function getApi(req){
	var api = restify.createJsonClient({url: req.session.url});
	if (req.session.username && req.session.password) {
	  api.basicAuth(req.session.username, req.session.password);
	}
	return api;
}

exports.status = function(req, res){
	var api = getApi(req);

	api.get('/status', function(err, req, rez, result) {
		res.render('status.html',{ data: result, json: JSON.stringify });
	});
};
exports.tasks = function(req, res){
	var api = getApi(req);

	api.get('/tasks', function(err, req, rez, result) {
		res.render('tasks.html',{ data: JSON.stringify(result) });
	});
};
exports.tasksFilter = function(req, res){
	var api = getApi(req);

	api.get('/tasks?filter='+req.params.filter, function(err, req, rez, result) {
		res.render('tasks.html',{ data: JSON.stringify(result) });
	});
};
exports.log_filter = function(req, res){
	var api = getApi(req);
	// console.log(req);

	var from = moment().subtract(1, 'day').toISOString();

	api.get('/log?filter='+req.params.filter+'&runsOnly=true&from='+from, function(err, req, rez) {
		// rez.body is a newline-separated list of JSON objects, and isn't JSON-parseable directly. Let's parse them ourselves.
		var runs = [];
		rez.body.split('\n').forEach(function(item, n) {
			console.log("Now doing "+n);
			item && runs.push(JSON.parse(item));
		});
		// console.log(runs);


		res.render('log_filter.html',{ data: JSON.stringify(runs) });
	});
};
exports.log_display = function(req, res){
	var api = getApi(req);
	// console.log(req);
	var from = moment().subtract(1, 'day').toISOString();


	api.get('/log?filter='+req.params.runId+'&from='+from, function(err, req, rez) {
		var log_entries = [];
		rez.body.split('\n').forEach(function(item, n) {
			item && log_entries.push(JSON.parse(item));
		});
		res.render('log_display.html',{ data: JSON.stringify(log_entries) });
	});
};

exports.login = function(req, res){
	res.render('login.html')
}
