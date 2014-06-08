/**
 * Methods to manage the storage
 *     properties from the auth user model only in this file!!!
 * @module db/auth-user-storage-helper
 * @todo #23! Add methods to register auth users
 *       check find methods after
 */

var BaseModel = require('../models/base');
var authUserSchema = require('../schemas/auth-user');
var cryptoHelper = require('../helpers/crypto-helper');

/*
 * Find an authUser
 *     this method may be executed from different parts of a program
 *     like admin part, auth part etc.
 *     If we create a class with an authClients prop
 *     this class needs to be created for every method executing
 *     We need to send db (or storage array) in every method
 *     db needs to be opened before executing
 */
var findByUserName = function (authUserCln, username, next) {
	authUserCln.findOne({
		username : username
	}, next);
};

exports.findByUserName = findByUserName;

exports.findById = function (authUserCln, id, next) {
	authUserCln.findOne({
		id : id
	}, next); // next(err, item)
};

// exports.insertAuthUser = function(authUserColl, authUserItem, next){
// authUserColl.insert(authUserItem, function(
// };

var cbkFindByUserName = function (username, password, next, err, needUserData) {
	if (err) {
		return next(err);
	}

	if (!needUserData) {
		return next(null, false, {
			message : 'NoSuchUser'
		});
	}

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
};

exports.findAndCheck = function (authUserCln, username, password, next) {
	// Find by user name
	findByUserName(authUserCln, username,
		cbkFindByUserName.bind(null, username, password, next));
};

module.exports = exports;
