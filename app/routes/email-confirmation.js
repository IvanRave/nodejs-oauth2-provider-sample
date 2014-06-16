/** @module routes/email-confirmation */

// test: http POST http://localhost:1337/account/email-confirmation email=ivanrave@yandex.ru
var emailConfirmationHelper = require('../helpers/email-confirmation-helper');
var preUserHelper = require('../db/pre-user-helper');
var appHelper = require('../helpers/app-helper');
var lgr = require('../helpers/lgr-helper');

var cbkUpsertPreUser = function (res, err) {
	if (err) {
		lgr.error(err.message);
		res.send(500, 'preUserCanNotBeInserted');
		return;
	}

	res.send();
};

var cbkGenerateAndSend = function (email, preUserCln, res, err, emailToken) {
	if (err) {
		res.send(422, {
			message : err.message
		});
		return;
	}

	var preUserData = {
		"email" : email,
		"emailToken" : emailToken,
    "created": appHelper.toInt(new Date().getTime() / 1000)
		//"attemptCount" : 0 // try default
	};

	var validationErrors = preUserHelper.validateSchema(preUserData);

	if (validationErrors.length > 0) {
		// Show one by one errors
		res.send(422, {
			'validationErrors' : validationErrors
		});
		return;
	}

	var preUser = preUserHelper.createPreUser(preUserData);

	preUserHelper.upsertPreUser(preUserCln, preUser,
		cbkUpsertPreUser.bind(null, res));
};

exports.init = function (preUserCln, req, res) {
	var email = req.body.email;
	emailConfirmationHelper.generateAndSendToken(email,
		cbkGenerateAndSend.bind(null, email, preUserCln, res));
};

module.exports = exports;
