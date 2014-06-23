/** @module auth-user/data-generator */

var appRoot = '../../app/';

var cryptoHelper = require(appRoot + 'helpers/crypto-helper');

exports.generate = function () {

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
		secretQstn : 'Favourite book',
		secretAnswer : 'Moomy',
		created : 123123
	};

	demoUserData.pwdHash = cryptoHelper.encryptSha(demoUserData.pwdClean,
			demoUserData.pwdSalt);

  return demoUserData;
};

module.exports = exports;
