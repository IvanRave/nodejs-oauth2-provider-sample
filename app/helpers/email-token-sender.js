/** @module helpers/email-token-sender */

var appHelper = require('../helpers/app-helper');
var lgr = require('../helpers/lgr-helper').init(module);
var mailHelper = require('../helpers/mail-helper');

var cbkSendMail = function (confirmationToken, next, err) {
	if (err) {
		lgr.error(err.message);
		next(new Error('emailIsNotSended'));
		return;
	}

	next(null, confirmationToken);
};

/**
 * Send email to approve
 */
exports.sendTokenToEmail = function (email, confirmationToken, next) {
	if (!email) {
		next(new Error('emailIsRequired'));
		return;
	}

	if (!appHelper.isValidEmail(email)) {
		next(new Error('emailIsNotValid'));
		return;
	}

	mailHelper.sendMail({
		to : email,
		subject : 'Oil authentication',
		text : 'To confirm your email please use this verification code: ' + confirmationToken
	}, cbkSendMail.bind(null, confirmationToken, next));
};

module.exports = exports;
