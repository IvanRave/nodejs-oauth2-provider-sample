/** @module main */

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportHelper = require('./helpers/passport-helper');
////var connectFlash = require('connect-flash');
var configHelper = require('./helpers/config-helper');
var loggerHelper = require('./helpers/logger-helper').getLogger(module.filename);
var accountRouter = require('./routers/account-router');
var dialogRouter = require('./routers/dialog-router');

var cbkPageWelcome = function (req, res) {
	res.send('This is a sample app with local authentication');
};

var cbkPageNonExists = function (req, res) {
	res.status(404);
	loggerHelper.debug('Not found URL: %s', req.url);
	res.send({
		error : 'Not found'
	});
	return;
};

var cbkListen = function () {
	loggerHelper.info('Express server listening on port ' + configHelper.get('port'));
};

exports.init = function () {
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

	passportHelper.fill(passport);
	app.use(passport.initialize());
	app.use(passport.session());

	////app.use(connectFlash());
	app.use('/account', accountRouter.createRouter(express, passport));
	app.use('/dialog', dialogRouter.createRouter(express, passport));
	// For other pages
	app.use('/', cbkPageWelcome);

	// For non-existing pages
	app.use(cbkPageNonExists);

	app.listen(configHelper.get('port'), cbkListen);
};

module.exports = exports;
