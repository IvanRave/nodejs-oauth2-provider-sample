/** @module helpers/email-confirmation-helper */

var appHelper = require('../helpers/app-helper');
var uidHelper = require('../helpers/uid-helper');
var lgr = require('../helpers/lgr-helper');
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
exports.generateAndSendToken = function (email, next) {
	if (!email) {
		next(new Error('emailIsRequired'));
		return;
	}

	if (!appHelper.isValidEmail(email)) {
		next(new Error('emailIsNotValid'));
		return;
	}

	// Generate a confirmation code
	var confirmationToken = uidHelper.generateNumber(5);
	mailHelper.sendMail({
		to : email,
		subject : 'Oil authentication',
		text : 'To confirm your email please use this verification code: ' + confirmationToken
	}, cbkSendMail.bind(null, confirmationToken, next));
};

module.exports = exports;
