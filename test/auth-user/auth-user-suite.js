var assert = require('assert');

var appPath = '../../app';

var authUserHelper = require(appPath + '/db/auth-user-helper');
var authUserGenerator = require('./data-generator');

// Our authUser storage
// Our demo id for an user
// Demo user can't be in a real storage

var findByEmailTest = function (authUserClnScope, done) {
	authUserHelper.findByEmail(authUserClnScope.cln, 'some@some.ru', function (err, authUser) {
		if (err) {
			return done(err);
		}

		assert.equal(authUser.fname, 'Ivan');
		done();
	});
};

var findAndCheckTest = function (authUserClnScope, done) {
	authUserHelper.findAndCheck(authUserClnScope.cln, 'some@some.ru', 'SuperPwd', function (err, needUser) {
		if (err) {
			throw err;
		}

		// User can not be null (only false, else error)
		assert.notEqual(needUser, null);

		// User can be false (if not exists),
		//   but in this test he must exists
		assert.notEqual(needUser, false);

		// With id = 123
		assert.equal(needUser.fname, 'Ivan');

		done();
	});
};

var cbkGenerateAuthUser = function (collection, done, errGenerate) {
	done(errGenerate);
};

var cbkBefore = function (authDbScope, authUserClnScope, done) {
	console.log('start auth-user test');
	authUserClnScope.cln = authDbScope.db.collection('authUser');

	authUserGenerator.generate(authUserClnScope.cln,
		cbkGenerateAuthUser.bind(null, authUserClnScope.cln, done));
};

var cbkAfter = function (done) {
	console.log('end auth-user test');
	done();
};

exports.init = function (authDbScope) {
	// Clean our table, generate some data
	var authUserClnScope = {
		cln : null, // collection
		clnName : 'authUser'
	};

	// Generate some fake data
	before(cbkBefore.bind(null, authDbScope, authUserClnScope));

	it('findByEmailTest', findByEmailTest.bind(null, authUserClnScope));
	it('findAndCheckTest', findAndCheckTest.bind(null, authUserClnScope));

	after(cbkAfter);
};

module.exports = exports;
