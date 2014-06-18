var assert = require('assert');

var appPath = '../../app';

var emailTokenHandler = require(appPath + '/helpers/email-token-handler');

var emailTokenTest = function (clnScope, done) {
	emailTokenHandler.handleEmailToken(clnScope.cln, 'ivanrave@yandex.ru', function (resultCode, resultMsg) {
		console.log('resultMsg', resultMsg);
		assert.equal(resultCode, 200);
		done();
	});
};

var cbkBefore = function (authDbScope, clnScope, done) {
	console.log('start email-token test');
	clnScope.cln = authDbScope.db.collection('emailToken');

	done();
};

var cbkAfter = function (done) {
	console.log('end auth-user test');
	done();
};

exports.init = function (authDbScope) {
	// Clean our table, generate some data
	var emailTokenClnScope = {
		cln : null, // collection
		clnName : 'emailToken'
	};

	// Generate some fake data
	before(cbkBefore.bind(null, authDbScope, emailTokenClnScope));

	it('emailTokenTest', emailTokenTest.bind(null, emailTokenClnScope));

	after(cbkAfter);
};

module.exports = exports;
