/** @module routers/account-router */

var appMdw = require('../mdw/app-mdw');
var validationHelper = require('../helpers/validation-helper');
var regUserSchema = require('../schemas/reg-user');
var preUserSchema = require('../schemas/pre-user');
var BaseModel = require('../models/base');
var regUserHelper = require('../db/reg-user-helper');
var preUserHelper = require('../db/pre-user-helper');
var emailConfirmationHelper = require('../helpers/email-confirmation-helper');
var lgr = require('../helpers/lgr-helper');

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

var cbkRegister = function (req, res) {
	console.log(req.body);
	var validationErrors = validationHelper.validate(req.body, regUserSchema);
	if (validationErrors.length > 0) {
		res.send(400, {
			'validationErrors' : validationErrors
		});

		return;
	}

	var regUser = new BaseModel(req.body, regUserSchema);

	if (!regUserHelper.isValidPssConfirmation(regUser)) {
		res.send(422, {
			message : 'passwordConfirmationIsFailed'
		});

		return;
	}

	// Generate some code
	// Send by email to the @email field
	// If successfull - save regUser to the regUser table
	// ConfirmationToken = c.String(maxLength: 128) - overflow field in authUser table
	// email
	// confirmation-code

	res.send('register page' + JSON.stringify(regUser));
};

var cbkInsertPreUser = function (res, err) {
  if (err){
    lgr.error(err.message);
    res.send(500, 'preUserCanNotBeInserted');
    return;
  }
  
  res.send();
};

var cbkGenerateAndSend = function (email, preUserCln, res, err, token) {
	if (err) {
		res.send(422, {
			message : err.message
		});
		return;
	}

	var preUserData = {
		email : email,
		token : token,
		attemptCount : 0 // try default
	};

	var validationErrors = validationHelper.validate(preUserData, preUserSchema);

	if (validationErrors.length > 0) {
		// Show one by one errors
		res.send(422, {
			'validationErrors' : validationErrors
		});
		return;
	}

	var preUser = new BaseModel(preUserData, preUserSchema);

	preUserHelper.insertPreUser(preUserCln, preUser,
		cbkInsertPreUser.bind(null, res));
};

var cbkEmailConfirmation = function (preUserCln, req, res) {
	var email = req.body.email;
	emailConfirmationHelper.generateAndSendToken(email,
		cbkGenerateAndSend.bind(null, email, preUserCln, res));
};

exports.createRouter = function (express, passport, authDb) {
	var accountRouter = express.Router();
	accountRouter.get('/login', cbkPageLogin);
	accountRouter.post('/login', cbkPostLogin.bind(null, passport));
	accountRouter.get('/logout', cbkPageLogout);
	accountRouter.get('/info',
		appMdw.ensureAuth,
		cbkPageInfo);

	var preUserCln = authDb.collection('preUser');

	// send email for approving
	// if an user in the authUser table already ->
	//        send this error - an email is already taken
	accountRouter.post('/register/email-confirmation', cbkEmailConfirmation.bind(null, preUserCln));

	// send email, confirmationToken, password, passwordConfirmation
	accountRouter.post('/register', cbkRegister);
	// check in the preRegUser table
	// if success, move to the authUser table
	// login to the cabinet (password and email be inputed by the user)

	return accountRouter;
};

module.exports = exports;
