var assert = require('assert');

var authUserStorageHelper = require('../app/db/auth-user-storage-helper');
var cryptoHelper = require('../app/helpers/crypto-helper');
var authUserGenerator = require('./test-helpers/auth-user-generator');

// Retrieve
var MongoClient = require('mongodb').MongoClient;
var mngConnStr = 'mongodb://localhost:27017/oil-auth-test';
var authUserCollectionName = 'authUser';

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

var findByUserNameTest = function (done) {
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
};

var findAndCheckTest = function (done) {
	authUserStorageHelper.findAndCheck(authUsers, 'SuperUserName', 'SuperPass', function (err, needUser) {
		if (err) {
			throw err;
		}

		assert.notEqual(needUser, null);

		assert.equal(needUser.id, 12345);

		done();
	});
};

var cbkConnectTest = function (done, err, db) {
	if (err) {
		throw err;
	}

	// Clean our table, generate some data
	var collection = db.collection(authUserCollectionName);

	console.log('We are connected');

	authUserGenerator.generate(collection, function (errGenerate) {
		if (errGenerate) {
			throw errGenerate;
		}

		authUserStorageHelper.findById(collection, 123, function (errFind, item) {
			if (errFind) {
				throw errFind;
			}

			console.log('items', item);
			db.close();
			assert.notEqual(item, null);
			done();
		});
	});
};

var connectTest = function (done) {
	// Connect to the db
	MongoClient.connect(mngConnStr, cbkConnectTest.bind(null, done));
};

describe('auth-user-test', function () {
	this.timeout(10000);

	it('findByUserNameTest', findByUserNameTest);
	it('findAndCheckTest', findAndCheckTest);

	it('connectTest', connectTest);
});
