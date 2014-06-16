var assert = require('assert');
var authClientHelper = require('../../app/db/auth-client-helper');

var clientPassTest = function (tmpStorage, done) {
	var checkedAuthClient = tmpStorage[0];

	authClientHelper.validateSecret(tmpStorage,
		checkedAuthClient.clientId,
		checkedAuthClient.clientSecret, function (err, client) {
		if (err) {
			throw err;
		}

		assert.notEqual(client, null);

		assert.equal(client.id, checkedAuthClient.id);
		done();
	});
};

exports.init = function () {
	var tmpStorage = [{
			"id" : 432,
			"name" : "demo-client",
			"clientId" : "qwerty",
			"clientSecret" : "supersecret",
			"redirectUri" : "http://somesitetocall.back"
		}
	];

	it('clientPassTest', clientPassTest.bind(null, tmpStorage));
};

module.exports = exports;
