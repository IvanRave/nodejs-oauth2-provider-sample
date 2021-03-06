/** @module routers/account-router */

//var url = require('url');
var qs = require('qs');
var appMdw = require('../mdw/app-mdw');
var emailTokenHandler = require('../helpers/email-token-handler');
var registerHandler = require('../helpers/register-handler');
var uidHelper = require('../helpers/uid-helper');
var lgr = require('../helpers/lgr-helper');
var dict = require('../dict');

/** Render a login page */
var renderPageLogin = function (req, res) {
	console.log('session', req.session);

	// extract message from a query params
	var failureMsg = req.query.message;

	if (failureMsg) {
		delete req.query.message;
	}

	// show ejs template from the views folder
	res.render('login', {
		dict : dict,
		// get all query params and put to register link
		registerLink : 'register?' + qs.stringify(req.query),
		failureMsg : failureMsg || ''
	});
};

/**
 * Whether the url is outer or local
 * @type {Boolean}
 */
var isOuterUrl = function (urlStr, currentHost) {
	// or https
	if (urlStr.indexOf('http') === 0) {
		var secondPart = urlStr.split('://')[1];
		// it is a port or host. port - not used
		// if wfm.com/asdf/asdf is not starts with wfm.com - is outer
		if (secondPart.indexOf(currentHost) !== 0) {
			return true;
		}
	}

	return false;
};

var cbkLogIn = function (req, res, next, err) {
	if (err) {
		lgr.error(err);
		next(err);
		return;
	}

	console.log('successfull login');

	var encodedRdu = req.query.redirect_url;
	if (encodedRdu) {
		var rdu = decodeURIComponent(encodedRdu);
		console.log('successfull login and redirect to redirect url', rdu);
		// If an url is absolute, check the domain

		if (isOuterUrl(rdu, req.get('host'))) {
			res.redirect('/'); // redirect to the root
		} else {
			// else - redirect to local url
			res.redirect(rdu);
		}
		// Only local urls
		//var localRedirectUrl = '//' + req.get('host') + rdu;

		// In other case redirect will be wrong
		//     and user stay in the login page

		return;
	} else {
		console.log('successfull login and redirect');

		// If no redirectUrl (or wrong) - to the main page
		res.redirect('/');
		return;
	}
};

var cbkPauth = function (req, res, next, err, user, info) {
	if (err) {
		return next(err);
	}

	// Auth errors or info
	lgr.info({
		'pauth' : {
			user : user,
			info : info
		}
	});

	if (!user) {
		// get all query params
		// add a message
		// put to the query
		var curParams = req.query;
		curParams.message = info.message;

		return res.redirect('/account/login?' + qs.stringify(curParams));
	}

	req.logIn(user, cbkLogIn.bind(null, req, res, next));
};

var cbkPostLogin = function (passport, req, res, next) {
	passport.authenticate('local', cbkPauth.bind(null, req, res, next))(req, res, next);
};

var cbkPageInfo = function (req, res) {
	console.log('session', req.session);

	res.send(req.user);
};

var cbkPageLogout = function (req, res) {
	var redirectUri = req.query['redirect_uri'];
	req.logout();
	res.redirect(redirectUri || '/');
};

// TODO: #43! get from global dictionary
var regDict = {
	fname : 'First name',
	lname : 'Last name',
	mname : 'Middle name',
	email : 'Email',
	emailToken : 'Email confirmation code',
	pwd : 'Password',
	pwdConfirmation : 'Password again',
	secretQstn : 'Secret question',
	secretAnswer : 'Secret answer'
};

var secretQstnArr = [
	'Favorite book',
	'Name of your first pet',
	'Your secret keyword'
];

/**
 * Render page register
 */
var renderPageRegister = function (req, res) {
	res.render('register', {
		dict : dict,
		usr : {},
		validationErrors : [],
		otherErr : '',
		regDict : regDict,
		secretQstnArr : secretQstnArr,
		// get all query params and put to register link
		loginLink : 'login?' + qs.stringify(req.query)
	});
};

var cbkRegisterUser = function (req, res, resCode, resMsg) {
	if (resCode === 200) {
		// get all params from request
		// var urlParts = url.parse(req.url, true);
		// var query = urlParts.query;
		// TODO: #32! send 'Successfull registration')
		var queryParams = req.query;
		queryParams.msg = 'successfulRegistration';

		console.log(queryParams);

		res.redirect(303, '/account/login?' + qs.stringify(queryParams));
		return;
	}

	res.render('register', {
		dict : dict,
		usr : req.body,
		validationErrors : resMsg.validationErrors || [],
		otherErr : (!resMsg.validationErrors) ? resMsg.message : '',
		regDict : regDict,
		secretQstnArr : secretQstnArr
	});

	//res.send(303);

	//console.log(resMsg);
	//res.redirect('/account/register');
};

/**
 * Handle post request to register
 */
var cbkPostRegister = function (authDb, req, res) {
	var authUserCln = authDb.collection('authUser');
	var emailTokenCln = authDb.collection('emailToken');
	registerHandler.registerUser(authUserCln, emailTokenCln, req.body,
		cbkRegisterUser.bind(null, req, res));
};

var cbkPostEmailConfirmation = function (authDb, req, res) {
	var emailTokenCln = authDb.collection('emailToken');

	// Generate a confirmation code
	var confirmationToken = uidHelper.generateNumberStr(5);

	emailTokenHandler.handleEmailToken(emailTokenCln,
		req.body.email,
		confirmationToken,
		function (resCode, resMsg) {
		res.send(resCode, resMsg);
	});
};

exports.createRouter = function (express, passport, authDb) {
	var accountRouter = express.Router();

	accountRouter.get('/login', renderPageLogin);
	accountRouter.get('/register', renderPageRegister);

	accountRouter.post('/login', cbkPostLogin.bind(null, passport));
	accountRouter.get('/logout', cbkPageLogout);
	accountRouter.get('/info', appMdw.ensureAuth, cbkPageInfo);

	// send email for approving
	// if an user in the authUser table already ->
	//        send this error - an email is already taken
	accountRouter.post('/email-confirmation', cbkPostEmailConfirmation.bind(null, authDb));

	// send email, confirmationToken, password, passwordConfirmation
	accountRouter.post('/register', cbkPostRegister.bind(null, authDb));

	// check in the preRegUser table
	// if success, move to the authUser table
	// login to the cabinet (password and email be inputed by the user)

	// If an user firsly approve his email (by confirmation code) and
	//       then enter his password -> vulnerability between this moments
	//       someone else may links user's email and some password

	// In our first scenario (password in first window)
	//     1. an user sends password, email to the server
	//        we send a confirmation code to this email
	//     2. an user sends CC
	//        BUT: betweend these two steps - vulnerability
	//        someone can send user's email and other password
	//        an user receives second CC (may think as a bug)
	//        and confirm another password instead own

	return accountRouter;
};

module.exports = exports;
