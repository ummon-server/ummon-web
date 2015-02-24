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
	var apiCall = '/tasks';
	if (typeof req.params.filter == 'string') {
		apiCall += '/'+req.params.filter;
	}
	req.apiClient.get(apiCall, function(err, req, rez, result) {
		if (err) {
			res.render('error.html', { message: 'You requested task info for an invalid collection or task' });
			return;
		}
		// console.log(rez.body);
		var collectionSuccessRates = new Map();
		var taskSuccessRates = new Map();
		result.collections.forEach(function(collection, n) {
			var numTaskRunsInCollection = 0;
			var numSuccessfulTaskRunsInCollection = 0;
			for(var taskName in collection.tasks) { 
				if (collection.tasks.hasOwnProperty(taskName)) {
					var task = collection.tasks[taskName];
					var numTaskRuns = 0;
					var numSuccessfulTaskRuns = 0;
					for (i = 0; i < task.recentExitCodes.length; i++) {
						numTaskRunsInCollection++;
						numTaskRuns++;
						if (task.recentExitCodes[i] == 0) {
							numSuccessfulTaskRunsInCollection++;
							numSuccessfulTaskRuns++;
						}
					}
					if (numTaskRuns != 0) {
						taskSuccessRates.set(task.id, Math.round(numSuccessfulTaskRuns / numTaskRuns * 100));
					}
					else {
						taskSuccessRates.set(task.id, -1);
					}
				}
			}
			if (numTaskRunsInCollection != 0) {
				collectionSuccessRates.set(collection.collection, 
						Math.round(numSuccessfulTaskRunsInCollection / numTaskRunsInCollection * 100));
			}
			else {
				collectionSuccessRates.set(collection.collection, 0);
			}
		});
		
		res.render('tasks.html',{ data: result, json: JSON.stringify, prettycron: prettycron, moment: moment,
			taskSuccessRates: taskSuccessRates, collectionSuccessRates: collectionSuccessRates});
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


		res.render('runs.html',{ data: runs, json: JSON.stringify, moment: moment });
	});
};
exports.log = function(req, res){
	var from = moment().subtract(1, 'day').toISOString();


	req.apiClient.get('/log?filter='+req.params.filter+'&from='+from, function(err, req, rez) {
		var log_entries = [];
		rez.body.split('\n').forEach(function(item, n) {
			item && log_entries.push(JSON.parse(item));
		});
		// console.log(log_entries);
		res.render('log.html',{ data: log_entries, json: JSON.stringify, moment: moment });
	});
};

exports.login = function(req, res){
	res.render('login.html')
}
