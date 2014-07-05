/** @module db/auth-client-helper */

// var appHelper = require('../helpers/app-helper');
var BaseModel = require('../models/base');
var authCodeSchema = require('../schemas/auth-code');
var uidHelper = require('../helpers/uid-helper');

/** Create an instance */
exports.createAuthCode = function (clientId, redirectUri, uid) {
	return new BaseModel({
		_id : null, // generated when insert to the database (unique)
		clientId : clientId,
		redirectUri : redirectUri,
		uid : uid,
		scopes : '*'
	}, authCodeSchema);
};

var cbkInsertAuthCode = function (authCodeCln, authCode, next, err) {
	if (err) {
		if (err.name === 'MongoError' && err.code === 11000) {
			// Email
			if (err.err.indexOf('$_id') >= 0) {
				// Retry with new generated id
				exports.insertAuthCode(authCodeCln, authCode, next);
				return;
			}
		}

		next(err);
	}

	// Return auth code with generated _id
	next(null, authCode);
};

/** Insert to the db */
exports.insertAuthCode = function (authCodeCln, authCode, next) {
	authCode['_id'] = uidHelper.generate(16);
	authCodeCln.insert(authCode, cbkInsertAuthCode.bind(null, authCodeCln, authCode, next));
};

/**
 * Find by code (_id)
 */
exports.findAuthCodeByCode = function (authCodeCln, code, next) {
	authCodeCln.findOne({
		_id : code
	}, next);
};

/** Remove temp code from a table (after exchanging to an access token) */
exports.removeAuthCode = function (authCodeCln, authCode, next) {
	authCodeCln.remove({
		_id : authCode._id
	}, next);
};

module.exports = exports;
