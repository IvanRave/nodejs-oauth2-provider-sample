/**
 * Methods for reg user model
 * @module db/reg-user-helper
 */

exports.isValidPssConfirmation = function (regUser) {
	return regUser.pss === regUser.pssConfirmation;
};

module.exports = exports;
