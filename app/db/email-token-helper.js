/**
 * Methods for pre user model
 * @module db/email-token-helper
 */

var BaseModel = require('../models/base');
var emailTokenSchema = require('../schemas/email-token');
var validationHelper = require('../helpers/validation-helper');

/**
 * Update or insert preuser
 */
exports.upsertEmailToken = function (contactTokenCln, emailToken, next) {
	// may be additional validation or smth else
	// Insert or update (by email)
	contactTokenCln.update({
		email : emailToken.email
	}, {
		'$set' : {
			token : emailToken.token,
			created : emailToken.created
		},
		'$inc' : {
			attempt : 1
		}
	}, {
		upsert : true
	}, next);
};

exports.validateSchema = function (emailTokenData) {
	return validationHelper.validate(emailTokenData, emailTokenSchema);
};

exports.createEmailToken = function (emailTokenData) {
	return new BaseModel(emailTokenData, emailTokenSchema);
};

module.exports = exports;
