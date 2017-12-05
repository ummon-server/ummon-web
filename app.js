var express = require('express')
  , routes = require('./routes')
  , nunjucks = require('nunjucks')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , restify = require('restify')


var app = express();
var config = {}

try {
  config = require('./local');
  console.log('Loaded config OK');
}
catch (ex) {
  // That's OK, we don't need any local config
}

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

app.get('/login',                            routes.login);

app.get('/',              userLoginOptional, routes.status);
app.get('/status',        userLoginOptional, routes.status);

app.get('/tasks',         userLoginOptional, routes.tasks);
app.get('/tasks/:filter', userLoginOptional, routes.tasks);
app.get('/runs/:filter',  userLoginOptional, routes.runs);

app.get('/log/:filter',   userLoginRequired, routes.log);

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function userLoginRequired(req, res, next) {
  if (!req.session.username) {
    res.redirect('/login');
  } else {
    req.apiClient = getApiClient(req.session.url, req.session.username, req.session.password);
    next();
  }
}

function userLoginOptional(req, res, next) {
  if (req.session.username) {
    req.apiClient = getApiClient(req.session.url, req.session.username, req.session.password);
  } else {
    req.apiClient = getApiClient(config.api.url, config.api.username, config.api.password);
  }
  next();

}


function getApiClient(url, username, password){
  var api = restify.createJsonClient({url: url});
  api.basicAuth(username, password);
  return api;
}

