/**
 * Methods for pre user model
 * @module db/pre-user-helper
 */

var BaseModel = require('../models/base');
var preUserSchema = require('../schemas/pre-user');
var validationHelper = require('../helpers/validation-helper');

/**
 * Update or insert preuser
 */
exports.upsertPreUser = function (preUserCln, preUser, next) {
	// may be additional validation or smth else
	// Insert or update (by email)
	preUserCln.update({
		email : preUser.email
	}, {
		'$set' : {
			emailToken : preUser.emailToken,
			created : preUser.created
		}
		// '$inc' : {
		// attemptCount : 1
		// }
	}, {
		upsert : true
	}, next);
};

exports.validateSchema = function (preUserData) {
	return validationHelper.validate(preUserData, preUserSchema);
};

exports.createPreUser = function (preUserData) {
	return new BaseModel(preUserData, preUserSchema);
};

module.exports = exports;
