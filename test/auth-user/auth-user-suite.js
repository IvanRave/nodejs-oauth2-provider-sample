var assert = require('assert');

var appPath = '../../app';

var authUserHelper = require(appPath + '/db/auth-user-helper');
var authUserGenerator = require('./data-generator');

// Our authUser storage
// Our demo id for an user
// Demo user can't be in a real storage

var findByUserNameTest = function (authUserClnScope, done) {
	authUserHelper.findByUserName(authUserClnScope.cln, 'Ivan', function (err, authUser) {
		if (err) {
			return done(err);
		}

		assert.equal(authUser.id, 123);
		done();
	});

	// var demoUserData = {
	// id : 123,
	// username : 'Ivan',
	// passClean : 'Rave',
	// salt : 'qwerty'
	// };

	// reportGenerator.startGenerate(demoDta, function (msg, statusCode) {
	// console.log(msg);
	// assert.equal(statusCode, 200);
	// done();
	// });
};

var findAndCheckTest = function (authUserClnScope, done) {
	authUserHelper.findAndCheck(authUserClnScope.cln, 'Ivan', 'SuperPass', function (err, needUser) {
		if (err) {
			throw err;
		}

		// User can not be null (only false, else error)
		assert.notEqual(needUser, null);

		// User can be false (if not exists),
		//   but in this test he must exists
		assert.notEqual(needUser, false);

		// With id = 123
		assert.equal(needUser.id, 123);

		done();
	});
};

var cbkFindByIdTest = function (done, errFind, item) {
	if (errFind) {
		throw errFind;
	}

	console.log('items', item);
	assert.notEqual(item, null);
	done();
};

var findByIdTest = function (authUserClnScope, done) {
	authUserHelper.findById(authUserClnScope.cln, 123,
		cbkFindByIdTest.bind(null, done));
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

	it('findByUserNameTest', findByUserNameTest.bind(null, authUserClnScope));
	it('findAndCheckTest', findAndCheckTest.bind(null, authUserClnScope));
	it('findByIdTest', findByIdTest.bind(null, authUserClnScope));

	after(cbkAfter);
};

module.exports = exports;
