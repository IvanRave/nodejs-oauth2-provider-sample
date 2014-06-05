/** @module routers/account-router */

var appMdw = require('../mdw/app-mdw');

var cbkPageLogin = function (req, res) {
	// show ejs template from the views folder
	res.render('login');
};

var cbkLogIn = function (req, res, next, err) {
	if (err) {
		next(err);
		return;
	}

	var redirectUrl = decodeURIComponent(req.query.redirect_url);
	if (redirectUrl) {
		// Only local urls
		redirectUrl = req.protocol + '://' + req.get('host') + redirectUrl;

		// In other case redirect will be wrong
		//     and user stay in the login page
		res.redirect(redirectUrl);
		return;
	}

	// If no redirectUrl (or wrong) - to the main page
	res.redirect('/');
	return;
};

var cbkPauth = function (req, res, next, err, user, info) {
	if (err) {
		return next(err);
	}

	// Auth errors or info
	console.log('info', info);

	if (!user) {
		return res.redirect('/account/login?message=' + info.message);
	}

	req.logIn(user, cbkLogIn.bind(null, req, res, next));
};

var cbkPostLogin = function (passport, req, res, next) {
	passport.authenticate('local', cbkPauth.bind(null, req, res, next))(req, res, next);
};

var cbkPageInfo = function (req, res) {
	res.send(req.user);
};

var cbkPageLogout = function (req, res) {
	req.logout();
	res.redirect('/');
};

exports.createRouter = function (express, passport) {
	var accountRouter = express.Router();
	accountRouter.get('/login', cbkPageLogin);
	accountRouter.post('/login', cbkPostLogin.bind(null, passport));
	accountRouter.get('/logout', cbkPageLogout);
	accountRouter.get('/info',
		appMdw.ensureAuth,
		cbkPageInfo);

	return accountRouter;
};

module.exports = exports;
