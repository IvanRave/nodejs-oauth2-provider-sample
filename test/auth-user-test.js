var assert = require('assert');

var authUserStorageHelper = require('../app/db/auth-user-storage-helper');
var cryptoHelper = require('../app/helpers/crypto-helper');

describe('sampletest', function () {
	//this.timeout(10000);

	it('should get access token', function (done) {
		// Our authUser storage,
		// Our demo id for an user
		// Demo user can't be in a real storage

		var demoUserData = {
			id : 12345,
			username : 'SuperUserName',
			passClean : 'SuperPass',
			salt : 'SuperSalt'
		};

		demoUserData.passHash = cryptoHelper.encryptSha(demoUserData.passClean,
				demoUserData.salt);

		// at this time only few clients,
		// no database
		var authUsers = [demoUserData];

		authUserStorageHelper.findByUserName(authUsers, 'SuperUserName', function (err, authUser) {
			if (err) {
				throw err;
			}

			assert.equal(authUser.id, 12345);
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
	});
});
