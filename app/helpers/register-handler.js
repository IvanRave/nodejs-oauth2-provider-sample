/** @module helpers/register-handler */

//var lgr = require('../helpers/lgr-helper');
var regUserHelper = require('../db/reg-user-helper');

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

	if (!regUserHelper.isValidPssConfirmation(regUser)) {
		cbk(422, {
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

	cbk(200, 'register page' + JSON.stringify(regUser));
};

module.exports = exports;
