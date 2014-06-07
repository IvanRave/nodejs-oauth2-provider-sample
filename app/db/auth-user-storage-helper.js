/** @module db/auth-user-storage-helper */

var BaseModel = require('../models/base');
var authUserSchema = require('../schemas/auth-user');
var cryptoHelper = require('../helpers/crypto-helper');

var appHelper = require('../helpers/app-helper');

var findByUserName = function (authUsers, username, next) {
	appHelper.findRec(authUsers, {
		username : username
	}, next);
};

exports.findByUserName = findByUserName;

exports.handleLocalStrategy = function (authUsers, username, password, done) {
	// Find by user name
	findByUserName(authUsers, username, function (err, needUserData) {
		// Find some user from db
		var needUser = new BaseModel(needUserData, authUserSchema);
		console.log(JSON.stringify(needUser));

		if (username !== needUser.username) {
			return done(null, false, {
				message : 'WrongUsername'
			});
		}

		var sourcePassHash = cryptoHelper.encryptSha(password, needUser.salt);

		if (sourcePassHash !== needUser.passHash) {
			return done(null, false, {
				message : 'WrongPassword'
			});
		}

		return done(null, needUser);
	});
};

module.exports = exports;
