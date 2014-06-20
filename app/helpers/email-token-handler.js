/** @module helpers/email-token-handler */

// test: http POST http://localhost:1337/account/email-confirmation email=ivanrave@yandex.ru
var emailTokenSender = require('../helpers/email-token-sender');
var emailTokenHelper = require('../db/email-token-helper');
var appHelper = require('../helpers/app-helper');
var lgr = require('../helpers/lgr-helper');

// TODO: #14! remove contact token str in release version
var cbkUpsertToken = function (cbkRoute, contactTokenStr, err) {
	if (err) {
		lgr.error(err.message);
		cbkRoute(500, 'emailTokenCanNotBeInserted');
		return;
	}

  // TODO: remove message from release version. (only send to email)
	cbkRoute(200, {
		message : contactTokenStr
	});
};

var cbkGenerateAndSend = function (email, contactTokenCln, cbkRoute, err, contactTokenStr) {
	if (err) {
		cbkRoute(422, {
			message : err.message
		});

		return;
	}

	var emailTokenData = {
		"email" : email,
		"token" : contactTokenStr,
		"created" : appHelper.toInt(new Date().getTime() / 1000),
		"tokenType" : "reg",
		"attempt" : 1 // redefine during upserting
	};

	var validationErrors = emailTokenHelper.validateSchema(emailTokenData);

	if (validationErrors.length > 0) {
		// Show one by one errors
		cbkRoute(422, {
			'validationErrors' : validationErrors
		});

		return;
	}

	var emailToken = emailTokenHelper.createEmailToken(emailTokenData);

	emailTokenHelper.upsertEmailToken(contactTokenCln, emailToken,
		cbkUpsertToken.bind(null, cbkRoute, contactTokenStr));
};

/**
 * Start point - entire process for email token
 * @param {Object} contactTokenCln - collection with contact tokens (email, phone...)
 *        in this case - email token
 */
exports.handleEmailToken = function (contactTokenCln, email, cbkRoute) {
	emailTokenSender.generateAndSendToken(email,
		cbkGenerateAndSend.bind(null, email, contactTokenCln, cbkRoute));
};

module.exports = exports;