var assert = require('assert');

var appPath = '../../app';

var emailTokenHandler = require(appPath + '/helpers/email-token-handler');
var registerHandler = require(appPath + '/helpers/register-handler');

var globalEmailToken = '77777';

var emailTokenTest = function (clnScope, done) {
	emailTokenHandler.handleEmailToken(clnScope.cln,
		'some@some.ru',
		globalEmailToken,
		function (resultCode) {
		assert.equal(resultCode, 200);
		done();
	});
};

var cbkSuccessRegister = function (done, resultCode, resultObj) {
	console.log(resultObj);
	assert.equal(resultCode, 200);
	done();
};

var cbkEmailIsAlreadyTaken = function (done, resultCode, resultObj) {
	assert(resultObj.message, 'emailIsAlreadyTaken');
	assert.equal(resultCode, 422);
	done();
};

var registerUserTest = function (authUserClnScope, emailTokenClnScope, cbkResult, done) {
	registerHandler.registerUser(authUserClnScope.cln, emailTokenClnScope.cln, {
		email : 'some@some.ru',
		emailToken : globalEmailToken,
		pwd : 'SuperPwd',
		pwdConfirmation : 'SuperPwd',
		lname : 'Rave',
		fname : 'Ivan',
		mname : 'Ivanich',
		secretQstn : 'Favorite color',
		secretAnswer : 'Lime'
	}, cbkResult.bind(null, done));
};

var cbkBefore = function (authDbScope, authUserClnScope, emailTokenClnScope, done) {
	console.log('start register-user test');

	authUserClnScope.cln = authDbScope.db.collection('authUser');
	emailTokenClnScope.cln = authDbScope.db.collection('emailToken');

	done();
};

var cbkAfter = function (done) {
	console.log('end register-user test');
	done();
};

exports.init = function (authDbScope) {
	// Clean our table, generate some data
	var authUserClnScope = {
		cln : null, // collection
		clnName : 'authUser'
	};

	var emailTokenClnScope = {
		cln : null, // collection
		clnName : 'emailToken'
	};

	// Generate some fake data
	before(cbkBefore.bind(null, authDbScope, authUserClnScope, emailTokenClnScope));

	// First generate emailToken
	it('emailTokenTest', emailTokenTest.bind(null, emailTokenClnScope));

	// Second try to register an user
	it('registerUserTest', registerUserTest.bind(null, authUserClnScope, emailTokenClnScope, cbkSuccessRegister));

	// Try again with the same email and other handler
	it('registerUserTest', registerUserTest.bind(null, authUserClnScope, emailTokenClnScope, cbkEmailIsAlreadyTaken));

	after(cbkAfter);
};

module.exports = exports;
