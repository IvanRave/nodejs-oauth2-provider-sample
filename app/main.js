/** @module main */

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
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
	app.set('view engine', 'ejs');
	// views The view directory path, defaulting to "process.cwd() + '/views'"
	app.set('views', process.cwd() + '/app/views');
	app.use(favicon(process.cwd() + '/app/public/favicon.ico'));
	app.use(bodyParser());
	app.use(cookieParser()); // required before session.
	app.use(expressSession({
			name : 'oauth.sid',
			secret : configHelper.get('security').secret
			// set max age for persistent cookies
			// // cookie : {
			// // maxAge : 60000
			// // }
		}));

	passport.serializeUser(srzHelper.serialize);
	passport.deserializeUser(srzHelper.deserialize);

	// var demoUserData = {
	// id : 123,
	// username : 'Ivan',
	// passClean : 'Rave',
	// salt : 'qwerty'
	// };

	// demoUserData.passHash = cryptoHelper.encryptSha(demoUserData.passClean,
	// demoUserData.salt);

	// at this time only few clients,
	// no database
	//var authUsers = [demoUserData];

	var authUserCln = authDb.collection('authUser');

	passport.use(new LocalStrategy({},
			authUserHelper.findAndCheck.bind(null, authUserCln)));

	app.use(passport.initialize());
	app.use(passport.session());

	app.use('/account', accountRouter.createRouter(express, passport, authDb));
	app.use('/dialog', dialogRouter.createRouter(express, passport));
	// For other pages
	app.use('/', cbkPageWelcome);

	// For non-existing pages
	app.use(cbkPageNonExists);

	app.listen(configHelper.get('port'), cbkListen);
};

var cbkAuthDbConnect = function (errConn, authDb) {
	if (errConn) {
		lgr.error(errConn.message);
		throw errConn;
	}

	lgr.info('auth db is connected');
	startApiService(authDb);
};

exports.init = function () {
	MongoClient.connect(configHelper.get('authConn').uri,
		cbkAuthDbConnect);
};

module.exports = exports;
