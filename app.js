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
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: 'secretsiwillnevertell'}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/login', routes.login);
app.get('/', requireLogin, routes.dashboard);

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function requireLogin(req, res, next){
	if (!req.session.url){
		res.redirect('/login');
	} else {
		next();
	}
}