/**
 * Methods for reg user model
 * @module db/reg-user-helper
 */

var BaseModel = require('../models/base');
var regUserSchema = require('../schemas/reg-user');
var validationHelper = require('../helpers/validation-helper');

exports.validateSchema = function (regUserData) {
	return validationHelper.validate(regUserData, regUserSchema);
};

exports.createRegUser = function (regUserData) {
	return new BaseModel(regUserData, regUserSchema);
};

exports.isValidPwdConfirmation = function (regUser) {
	return regUser.pwd === regUser.pwdConfirmation;
};

/**
 * Whether email token is valid in registration user and in db table
 */
exports.isEmailTokenValid = function (regUser, emailTokenStr) {
	return regUser.emailToken === emailTokenStr;

	// Fetch emailToken from emailToken table
	//var validEmailToken = emailTokenHelper.findByEmail

};

module.exports = exports;
