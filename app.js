var express = require('express')
  , routes = require('./routes')
  , nunjucks = require('nunjucks')
  , http = require('http')
  , path = require('path');

var app = express();

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname + '/views'), { 
    dev: true, 
    autoescape: true 
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//feed app to nunjucks environment
env.express(app);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('less-middleware')(__dirname + '/public' ));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: 'secretsiwillnevertell'}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/login', routes.login);
app.get('/', requireLogin, routes.status);
app.get('/tasks', requireLogin, routes.tasks);
app.get('/tasks/:filter', requireLogin, routes.tasks);
app.get('/status', requireLogin, routes.status);
app.get('/log/collection/:filter', requireLogin, routes.log_filter);
app.get('/log/task/:filter', requireLogin, routes.log_filter);
app.get('/log/run/:runId', requireLogin, routes.log_display);

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function requireLogin(req, res, next){
  req.session.username='w2h';
  req.session.password='cudozax!wa975394';
  req.session.url='http://128.91.129.236:8080/';
  
  // req.session.username='w2h';
  // req.session.password='science';
  // req.session.url='http://localhost:8888/';

	// if (!req.session.url){
	// 	res.redirect('/login');
	// } else {
		next();
	// }
}