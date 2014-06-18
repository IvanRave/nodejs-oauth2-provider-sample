/** @module routes/email-confirmation */

// test: http POST http://localhost:1337/account/email-confirmation email=ivanrave@yandex.ru
var emailConfirmationHelper = require('../helpers/email-confirmation-helper');
var emailTokenHelper = require('../db/email-token-helper');
var appHelper = require('../helpers/app-helper');
var lgr = require('../helpers/lgr-helper');

var cbkUpsertToken = function (res, err) {
	if (err) {
		lgr.error(err.message);
		res.send(500, 'emailTokenCanNotBeInserted');
		return;
	}

	res.send();
};

var cbkGenerateAndSend = function (email, contactTokenCln, res, err, contactTokenStr) {
	if (err) {
		res.send(422, {
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
		res.send(422, {
			'validationErrors' : validationErrors
		});

		return;
	}

	var emailToken = emailTokenHelper.createEmailToken(emailTokenData);

	emailTokenHelper.upsertEmailToken(contactTokenCln, emailToken,
		cbkUpsertToken.bind(null, res));
};

/**
 * Start point
 * @param {Object} contactTokenCln - collection with contact tokens (email, phone...)
 *        in this case - email token
 */
exports.init = function (contactTokenCln, req, res) {
	var email = req.body.email;
	emailConfirmationHelper.generateAndSendToken(email,
		cbkGenerateAndSend.bind(null, email, contactTokenCln, res));
};

module.exports = exports;
