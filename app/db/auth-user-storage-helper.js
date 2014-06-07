/** @module db/auth-user-storage-helper */

var BaseModel = require('../models/base');
var authUserSchema = require('../schemas/auth-user');
var cryptoHelper = require('../helpers/crypto-helper');

var appHelper = require('../helpers/app-helper');

/*
 * Find an authUser
 *     this method may be executed from different parts of a program
 *     like admin part, auth part etc.
 *     If we create a class with an authClients prop
 *     this class needs to be created for every method executing
 *     We need to send db (or storage array) in every method
 *     db needs to be opened before executing
 */
var findByUserName = function (authUsers, username, next) {
	appHelper.findRec(authUsers, {
		username : username
	}, next);
};

exports.findByUserName = findByUserName;

exports.findById = function (authUserColl, id, next) {
	authUserColl.findOne({
		id : id
	}, next); // next(err, item)
};

// exports.insertAuthUser = function(authUserColl, authUserItem, next){
// authUserColl.insert(authUserItem, function(
// };

exports.findAndCheck = function (authUsers, username, password, next) {
	// Find by user name
	findByUserName(authUsers, username, function (err, needUserData) {
		// Find some user from db
		var needUser = new BaseModel(needUserData, authUserSchema);
		console.log(JSON.stringify(needUser));

		if (username !== needUser.username) {
			return next(null, false, {
				message : 'WrongUsername'
			});
		}

		var sourcePassHash = cryptoHelper.encryptSha(password, needUser.salt);

		if (sourcePassHash !== needUser.passHash) {
			return next(null, false, {
				message : 'WrongPassword'
			});
		}

		return next(null, needUser);
	});
};

module.exports = exports;
