var MongoClient = require('mongodb').MongoClient;

var cbkAuthDbConnect = function (authDbScope, done, err, db) {
	if (err) {
		return done(err);
	}

	authDbScope.db = db;
	console.log('Connected to the Auth db');

	// Set indexes
	var authUserCln = authDbScope.db.collection('authUser');

	// Init database indexes
	authUserCln.ensureIndex({
		'email' : 1
	}, {
		unique : true,
    name: 'email_uq'
	}, done);
};

var cbkBefore = function (authDbScope, done) {
	console.log('Start testing...');
	// open all db connections
	MongoClient.connect(authDbScope.connStr,
		cbkAuthDbConnect.bind(null, authDbScope, done));
};

var cbkAfter = function (authDbScope, done) {
	console.log('End testing.');
	// close db connections
	authDbScope.db.close(done);

	authDbScope = null;
};

describe('main enter', function () {
	this.timeout(10000);

	var authDbScope = {
		db : null,
		connStr : 'mongodb://localhost:27017/oil-auth-test'
	};

	before(cbkBefore.bind(null, authDbScope));

	// decribe all suites with test-cases
	describe('authUserSuite',
		require('./auth-user/auth-user-suite').init.bind(null, authDbScope));

	describe('authClientSuite',
		require('./auth-client/auth-client-suite').init);

	describe('emailTokenSuite',
		require('./email-token/email-token-suite').init.bind(null, authDbScope));

	after(cbkAfter.bind(null, authDbScope));
});
