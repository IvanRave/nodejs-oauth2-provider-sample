/** @module db/auth-client-helper */

// var appHelper = require('../helpers/app-helper');
// var lgr = require('../helpers/lgr-helper').init(module);
var BaseModel = require('../models/base');
var accessTokenSchema = require('../schemas/access-token');
var uidHelper = require('../helpers/uid-helper');
var appHelper = require('../helpers/app-helper');

/** Create an instance */
exports.createAccessToken = function (clientId, uid) {
	return new BaseModel({
		_id : null, // generated when insert to the database (unique)
		clientId: clientId,
		uid : uid,
		scopes : '*',
    created : appHelper.toInt(new Date().getTime() / 1000)
	}, accessTokenSchema);
};

var cbkInsertAccessToken = function (cln, accessToken, next, err) {
	if (err) {
		if (err.name === 'MongoError' && err.code === 11000) {
			// Email
			if (err.err.indexOf('$_id') >= 0) {
				// Retry with new generated id
				exports.insertAccessToken(cln, accessToken, next);
				return;
			}
		}

		next(err);
	}

	// Return access token with generated _id
	next(null, accessToken);
};

/** Insert to the db */
exports.insertAccessToken = function (cln, accessToken, next) {
	accessToken._id = uidHelper.generate(256);
	cln.insert(accessToken, cbkInsertAccessToken.bind(null, cln, accessToken, next));
};

/**
 * Find by token string (_id)
 */
exports.findAccessToken = function (accessTokenCln, accessTokenStr, next) {
	accessTokenCln.findOne({
		_id : accessTokenStr
	}, next);
};

module.exports = exports;
