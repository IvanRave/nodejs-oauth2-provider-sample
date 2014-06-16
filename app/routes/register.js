/** @module routes/register */

var lgr = require('../helpers/lgr-helper');
var regUserHelper = require('../db/reg-user-helper');

exports.init = function (req, res) {
	lgr.info(req.body);

	var validationErrors = regUserHelper.validateSchema(req.body);
	if (validationErrors.length > 0) {
		res.send(400, {
			'validationErrors' : validationErrors
		});

		return;
	}

	var regUser = regUserHelper.createRegUser(req.body);

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

module.exports = exports;
