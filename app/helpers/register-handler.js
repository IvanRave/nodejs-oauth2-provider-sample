/** @module helpers/register-handler */

//var lgr = require('../helpers/lgr-helper');
var regUserHelper = require('../db/reg-user-helper');
var emailTokenHelper = require('../db/email-token-helper');

var cbkRemoveEmailToken = function (cbk, err) {
	if (err) {
		// TODO: #22! log error
		cbk(500, {
			message : err.message
		});

		return;
	}

	// Generate some code
	// Send by email to the @email field
	// If successfull - save regUser to the regUser table
	// ConfirmationToken = c.String(maxLength: 128) - overflow field in authUser table
	// email
	// confirmation-code

	cbk(200, 'register successfull');
};

/**
 * Callback for finded emailToken
 */
var cbkFindEmailToken = function (emailTokenCln, regUser, cbk, err, emailTokenResult) {
	if (err) {
		// TODO: #22! log error
		cbk(500, {
			message : err.message
		});

		return;
	}

	if (!emailTokenResult) {
		cbk(422, {
			message : 'emailTokenIsNotExists'
		});

		return;
	}

	// Check email token
	if (!regUserHelper.isEmailTokenValid(regUser, emailTokenResult.token)) {
		cbk(422, {
			message : 'emailTokenIsNotValid'
		});

		return;
	}

  // TODO: #23! Insert auth user
  
	// Then: remove emailtoken
	emailTokenHelper.removeById(emailTokenCln, emailTokenResult._id,
		cbkRemoveEmailToken.bind(null, cbk));
};

exports.registerUser = function (authUserCln, emailTokenCln, regUserData, cbk) {
	console.log(regUserData);

	var validationErrors = regUserHelper.validateSchema(regUserData);
	if (validationErrors.length > 0) {
		cbk(400, {
			'validationErrors' : validationErrors
		});

		return;
	}

	var regUser = regUserHelper.createRegUser(regUserData);

	if (!regUserHelper.isValidPwdConfirmation(regUser)) {
		cbk(422, {
			message : 'passwordConfirmationIsFailed'
		});

		return;
	}

	// Find real token from database
	emailTokenHelper.findByEmail(emailTokenCln, regUser.email,
		cbkFindEmailToken.bind(null, emailTokenCln, regUser, cbk));
};

module.exports = exports;
