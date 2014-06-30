/**
 * @module main
 * @todo #23! Register user
 */

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;

var srzHelper = require('./helpers/srz-helper');
var configHelper = require('./helpers/config-helper');
var lgr = require('./helpers/lgr-helper').init(module);
var authUserHelper = require('./db/auth-user-helper');
var accountRouter = require('./routers/account-router');
var dialogRouter = require('./routers/dialog-router');
//var cryptoHelper = require('./helpers/crypto-helper');

var cbkPageWelcome = function (req, res) {
	res.send('Welcome to the OAuth2 provider');
};

var cbkPageNonExists = function (req, res) {
	res.status(404);
	lgr.debug('Not found URL: %s', req.url);
	res.send({
		error : 'Not found'
	});
	return;
};

var cbkListen = function () {
	lgr.info('Express server listening on port: %s', configHelper.get('port'));
};

var startApiService = function (authDb) {
	var app = express();
	app.use(express.static(process.cwd() + '/app/public'));
	app.set('view engine', 'ejs');
	// views The view directory path, defaulting to "process.cwd() + '/views'"
	app.set('views', process.cwd() + '/app/views');
	//app.use(favicon(process.cwd() + '/app/public/favicon.ico'));
	app.use(bodyParser());
	app.use(cookieParser()); // required before session.
  
  // todo: #44! https://github.com/visionmedia/connect-redis
	app.use(expressSession({
			name : 'oauth.sid',
			secret : configHelper.get('security').secret,
			resave : false,
			saveUninitialized : false
			// set max age for persistent cookies
			// // cookie : {
			// // maxAge : 60000
			// // }
		}));

	passport.serializeUser(srzHelper.serialize);
	passport.deserializeUser(srzHelper.deserialize);

	// at this time only few clients,
	// no database
	// var authUsers = [demoUserData];

	var authUserCln = authDb.collection('authUser');

	passport.use(new LocalStrategy({
			usernameField : 'email',
			passwordField : 'pwd'
		}, authUserHelper.findAndCheck.bind(null, authUserCln)));

	app.use(passport.initialize());
	app.use(passport.session());

	app.use('/account', accountRouter.createRouter(express, passport, authDb));
	app.use('/dialog', dialogRouter.createRouter(express, passport, authDb));
	// For other pages
	app.use('/', cbkPageWelcome);

	// For non-existing pages
	app.use(cbkPageNonExists);

	app.listen(configHelper.get('port'), cbkListen);
};

var cbkEnsureIndexAuthUserEmail = function (authDb, err) {
	// err, status - name of index
	if (err) {
		lgr.error(err.message);
		throw err;
	}

	startApiService(authDb);
};

var cbkAuthDbConnect = function (errConn, authDb) {
	if (errConn) {
		lgr.error(errConn.message);
		throw errConn;
	}

	lgr.info('auth db is connected');

	var authUserCln = authDb.collection('authUser');

	// Init database indexes
	authUserCln.ensureIndex({
		'email' : 1
	}, {
		unique : true,
		name : 'email_uq' // default value
	}, cbkEnsureIndexAuthUserEmail.bind(null, authDb));
};

exports.init = function () {
	MongoClient.connect(configHelper.get('authConn').uri,
		cbkAuthDbConnect);
};

module.exports = exports;
