/**
 * Methods for pre user model
 * @module db/pre-user-helper
 */

exports.insertPreUser = function (preUserCln, preUser, next) {
	// may be additional validation or smth else

	preUserCln.insert(preUser, next);
};

module.exports = exports;
