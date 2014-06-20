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
			fname : 'Ivan',
			lname : 'Rave',
			mname : 'Ivanich',
			uname : 'Ivan Rave',
			email : 'some@some.ru',
			phone : '123435354',
			pwdSalt : 'SuperSalt',
			pwdHash : '',
			pwdClean : 'SuperPwd',
			scrtQstn : 'Favourite book',
			scrtAnwr : 'Moomy',
			created : 123123
		};

		demoUserData.pwdHash = cryptoHelper.encryptSha(demoUserData.pwdClean,
				demoUserData.pwdSalt);

		collection.insert(demoUserData, next);
	});
};

module.exports = exports;
