var restify = require('restify');

function getApi(req){
	var api = restify.createJsonClient({url: req.session.url});
	if (req.session.username && req.session.password) {
	  api.basicAuth(req.session.username, req.session.password);
	}
	return api;
}

exports.dashboard = function(req, res){
	var api = getApi(req);

	api.get('/tasks', function(err, req, rez, result) {
		res.render('dashboard.html',{ data: result });
	});
};

exports.login = function(req, res){
	req.session.url = 'http://localhost:8888';
	res.render('login.html')
}
