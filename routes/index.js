exports.index = function(req, res){
  res.render('index.html', { title: 'Express' });
};

exports.login = function(req, res){
	res.render('login.html', { title: 'Please Login'})
}