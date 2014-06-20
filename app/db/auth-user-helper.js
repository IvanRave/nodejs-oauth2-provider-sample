/**
 * Methods to manage the storage
 *     properties from the auth user model only in this file!!!
 * @module db/auth-user-helper
 * @todo #23! Add methods to register auth users
 *       check find methods after
 */

var BaseModel = require('../models/base');
var authUserSchema = require('../schemas/auth-user');
var cryptoHelper = require('../helpers/crypto-helper');
var validationHelper = require('../helpers/validation-helper');

/*
 * Find an authUser
 *     this method may be executed from different parts of a program
 *     like admin part, auth part etc.
 *     If we create a class with an authClients prop
 *     this class needs to be created for every method executing
 *     We need to send db (or storage array) in every method
 *     db needs to be opened before executing
 */
var findByUname = function (authUserCln, uname, next) {
	authUserCln.findOne({
		uname : uname
	}, next);
};

var findByEmail = function (authUserCln, email, next) {
	authUserCln.findOne({
		email : email
	}, next);
};

exports.findByUname = findByUname;

exports.findByEmail = findByEmail;

/**
 * Insert an auth user
 */
exports.insertAuthUser = function (authUserCln, authUserItem, next) {
	// Set some default values
	// ...

	// Insert a record
	authUserCln.insert(authUserItem, next);
};

var checkResultUser = function (password, next, err, needUserData) {
	if (err) {
		return next(err);
	}

	if (!needUserData) {
		return next(null, false, {
			message : 'noSuchUser'
		});
	}

	// Find some user from db
	var validationErrors = validationHelper.validate(needUserData, authUserSchema);
	if (validationErrors.length > 0) {
		return next(null, false, {
			message : {
				'validationErrors' : validationErrors
			}
		});
	}

	var needUser = new BaseModel(needUserData, authUserSchema);
	console.log(JSON.stringify(needUser));

	var sourcePwdHash = cryptoHelper.encryptSha(password, needUser.pwdSalt);

	if (sourcePwdHash !== needUser.pwdHash) {
		return next(null, false, {
			message : 'wrongPassword'
		});
	}

	return next(null, needUser);
};

/**
 * Find an user by email and check password
 */
exports.findAndCheck = function (authUserCln, email, password, next) {
	findByEmail(authUserCln, email,
		checkResultUser.bind(null, password, next));
};

module.exports = exports;
