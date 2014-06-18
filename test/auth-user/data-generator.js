/** @module auth-user/data-generator */

var cryptoHelper = require('../../app/helpers/crypto-helper');

exports.generate = function (collection, next) {
	// Clean before generating
	// If clean after this test, may be not cleaned (if some error occurs during the test)
	collection.remove({}, function (errClear) {
		if (errClear) {
			next(errClear);
		}

		var demoUserData = {
			id : 123,
			username : 'Ivan',
			salt : 'SuperSalt',
			pwdHash : '',
			pwdClean : 'SuperPwd'
		};

		demoUserData.pwdHash = cryptoHelper.encryptSha(demoUserData.pwdClean,
				demoUserData.salt);

		collection.insert(demoUserData, next);
	});
};

module.exports = exports;
