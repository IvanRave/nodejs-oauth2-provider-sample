var assert = require('assert');

var appPath = '../../app';

var registerHandler = require(appPath + '/helpers/register-handler');

var registerUserTest = function (authUserClnScope, emailTokenClnScope, done) {
	registerHandler.registerUser(authUserClnScope.cln, emailTokenClnScope.cln, {
		name : 'Ivan'
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

	it('registerUserTest', registerUserTest.bind(null, authUserClnScope, emailTokenClnScope));

	after(cbkAfter);
};

module.exports = exports;
