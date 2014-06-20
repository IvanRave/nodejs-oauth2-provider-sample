var assert = require('assert');

var appPath = '../../app';

var emailTokenHandler = require(appPath + '/helpers/email-token-handler');
var registerHandler = require(appPath + '/helpers/register-handler');

var globalEmailToken;

var emailTokenTest = function (clnScope, done) {
	emailTokenHandler.handleEmailToken(clnScope.cln, 'some@some.ru', function (resultCode, resultMsg) {
		console.log('resultMsg', resultMsg.message);
		assert.equal(resultCode, 200);
    globalEmailToken = resultMsg.message;
		done();
	});
};

var registerUserTest = function (authUserClnScope, emailTokenClnScope, done) {
	registerHandler.registerUser(authUserClnScope.cln, emailTokenClnScope.cln, {
		email: 'some@some.ru',
    emailToken: globalEmailToken,
    pwd: 'SuperPwd',
    pwdConfirmation: 'SuperPwd'
	}, function (resultCode, resultMsg) {
		console.log('resultMsg', resultMsg);
		assert.equal(resultCode, 200);
		done();
	});
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
	it('registerUserTest', registerUserTest.bind(null, authUserClnScope, emailTokenClnScope));  

	after(cbkAfter);
};

module.exports = exports;