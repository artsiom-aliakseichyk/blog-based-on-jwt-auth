// ============
// Requirements
// ============
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var port = process.env.PORT || 5000;

// ============
// Custom Requirements
// ============
var config = require('./components/config');
var User   = require('./components/model/user');

app.set('secret', config.secret);
// ============
// View Engine and Path setup
// ============
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

mongoose.connect(config.database);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
// ============
// Routes
// ============
app.get('/', function(req, res) {
	User.findOne({}, function(err, user) {
		res.render('index', {login: user.login, password: user.password});
	});
});

app.get('/signup', function(req, res) {
	res.render('signup');
});

// ============
// API Routes
// ============
var api = express.Router();
//http://localhost:8000/api/
api.post('/auth', function(req, res) {
	console.log(req.body);
	var uname = req.body.login;
	var pass = req.body.password;
	User.findOne({
		login: uname,
		password: pass
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({message: 'Invalid login or password!'});
		} 
		else {
			var userToken = {
				login: user.login,
				exp: Date.now()
			}

			var token = jwt.sign(userToken, app.get('secret'), {
          		expiresIn: 60*15
        	});

			res.json({token: token});
		}
	});
});

api.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, app.get('secret'), function(err, decoded) {
			if (err) {
				return res.json({success: false, message: error.name})
			}
			else {
				var decodedToken = jwt.decode(token, app.get('secret'));
				console.log(decodedToken);
				next();
			}
		})
	}
	else {
		return res.status(403).send({ 
        	success: false, 
        	message: 'No token provided.' 
    	});
	}
});

api.get('/', function(req, res) {
	res.json({message: 'Welcome to API'});
});

api.get('/users', function(req, res) {
	//find all users from mongo DB
	User.find({}, function(err, users) {
		res.json(users);
	});
});

app.use('/api', api);
// ============
// 404 Error Handler
// ============
app.get('*', function(req, res, next) {
  	var err = new Error();
  	err.status = 404;
 	next(err);
});

app.use(function(err, req, res, next) {
 	if(err.status !== 404) {
    	return next();
  	}
  	res.status(404);
  	res.render("error", {message: err});
});

// ============
// Start server
// ============
app.listen(port);
console.log('Started at http://localhost:' + port);