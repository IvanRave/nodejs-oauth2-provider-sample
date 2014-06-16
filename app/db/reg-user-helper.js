/**
 * Methods for reg user model
 * @module db/reg-user-helper
 */

var BaseModel = require('../models/base');
var regUserSchema = require('../schemas/reg-user');
var validationHelper = require('../helpers/validation-helper');

exports.isValidPssConfirmation = function (regUser) {
	return regUser.pss === regUser.pssConfirmation;
};

exports.validateSchema = function (regUserData) {
	return validationHelper.validate(regUserData, regUserSchema);
};

exports.createRegUser = function (regUserData) {
	return new BaseModel(regUserData, regUserSchema);
};

module.exports = exports;
