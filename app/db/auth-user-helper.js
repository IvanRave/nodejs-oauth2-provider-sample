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
var appHelper = require('../helpers/app-helper');
var uidHelper = require('../helpers/uid-helper');
var lgr = require('../helpers/lgr-helper').init(module);

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

var createAuthUser = function (authUserData) {
	return new BaseModel(authUserData, authUserSchema);
};

exports.createFromRegUser = function (regUser) {
	var authUserData = {
		uname : regUser.lname + ' ' + regUser.fname + (regUser.mname ? (' ' + regUser.mname) : ''),
		lname : regUser.lname,
		fname : regUser.fname,
		mname : regUser.mname,
		email : regUser.email,
		phone : regUser.phone,
		secretQstn : regUser.secretQstn,
		secretAnswer : regUser.secretAnswer,
		pwdClean : regUser.pwd,
		pwdSalt : 'SuperSalt', // TODO: #32! generate
		created : appHelper.toInt(new Date().getTime() / 1000)
	};

	authUserData.pwdHash = cryptoHelper.encryptSha(authUserData.pwdClean, authUserData.pwdSalt);

	return createAuthUser(authUserData);
};

exports.findByUname = findByUname;

exports.findByEmail = findByEmail;

function cbkInsertAuthUser(authUserCln, authUserItem, retryCount, next, err) {
	if (err) {
		// if (err.msg ==' duplicate')
		if (err.name === 'MongoError' && err.code === 11000) {
			// Email
			if (err.err.indexOf('$email_uq') >= 0) {
        lgr.error('supererror', 'emailIsAlreadyTaken');
				next(new Error('emailIsAlreadyTaken'));
				return;
			}

      // Reply req for id field
			if (err.err.indexOf('$_id') >= 0) {
				lgr.error(err);
				// retry again
				exports.insertAuthUser(authUserCln, authUserItem, next, retryCount, true);
				return;
			}
      
      lgr.error(err);
      next(err); // some other duplicate error
      return;
		}
	}

  // Some other err
	next(err);
}

/**
 * Insert an auth user
 */
function insertAuthUser(authUserCln, authUserItem, next, retryCount) {
	if (!retryCount) {
		retryCount = 1;
	} else {
		retryCount += 1;
	}

	// authUserItem._id = 329342034; // testing duplicate

	if (retryCount > 10) {
		lgr.error('maxRetriesDuplicateId');
		next(new Error('maxRetriesDuplicateId')); // Please try again
		return;
	}

	authUserItem._id = uidHelper.generateDbId();
	lgr.info('authUser_id', authUserItem._id);

	// Insert a record
	authUserCln.insert(authUserItem, cbkInsertAuthUser.bind(null, authUserCln, authUserItem, retryCount, next));
}

exports.insertAuthUser = insertAuthUser;

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

	var needUser = createAuthUser(needUserData);
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
exports.findAndCheck = function (authUserCln, email, pwd, next) {
  lgr.info('find user and check', email, pwd);
	findByEmail(authUserCln, email,
		checkResultUser.bind(null, pwd, next));
};

module.exports = exports;
