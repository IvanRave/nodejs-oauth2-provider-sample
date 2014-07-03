/** @module helpers/register-handler */

var lgr = require('../helpers/lgr-helper');
var regUserHelper = require('../db/reg-user-helper');
var authUserHelper = require('../db/auth-user-helper');
var emailTokenHelper = require('../db/email-token-helper');

var cbkRemoveEmailToken = function (cbk, err) {
	if (err) {
		lgr.error(err);

		cbk(500, {
			message : err.message
		});

		return;
	}

	cbk(200, 'register successfull');
};

var cbkInsertAuthRegUser = function (emailTokenCln, emailTokenResult, cbk, err) {
	if (err) {

		lgr.error(err);

		cbk(500, {
			message : err.message
		});

		return;
	}

	// Then: remove emailtoken
	emailTokenHelper.removeById(emailTokenCln, emailTokenResult._id,
		cbkRemoveEmailToken.bind(null, cbk));
};

/**
 * Callback for finded emailToken
 */
var cbkFindEmailToken = function (authUserCln, emailTokenCln, regUser, cbk, err, emailTokenResult) {
	if (err) {
    lgr.error(err);
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

	// Auth user from reg user
	var createdAuthUser = authUserHelper.createFromRegUser(regUser);

	authUserHelper.insertAuthUser(authUserCln, createdAuthUser,
		cbkInsertAuthRegUser.bind(null, emailTokenCln, emailTokenResult, cbk));
};

exports.registerUser = function (authUserCln, emailTokenCln, regUserData, cbk) {
  
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
		cbkFindEmailToken.bind(null, authUserCln, emailTokenCln, regUser, cbk));
};

module.exports = exports;
