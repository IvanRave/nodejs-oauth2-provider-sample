/** @module routers/api-router */

var BearerStrategy = require('passport-http-bearer');
var accessTokenHelper = require('../db/access-token-helper');
var authUserHelper = require('../db/auth-user-helper');

var getCurrentProfile = function (authUserCln, req, res) {

	// req.user contains only uid (from the accessToken table)
	// We may store uname and other fields in the accessToken table, but
	// it neet to store these params in authCode table too

	// This data (like uname, email...)  may be changed during a session
	// Need only fresh data
	// --> make addt request to get required authUser data
	console.log('requser', req.user);
	authUserHelper.findAuthUserByFields(authUserCln, req.user.uid, {
		'uname' : 1
    // _id - by default - true
		// other fields, like 'lname', 'email'..
	}, function (err, data) {
		// change _id to uid - No underscores in results
		data.uid = data._id;
    delete data._id;
		res.send(200, data);
	});
};

var cbkFindAccessToken = function (done, err, accessToken) {
	if (err) {
		// TODO: #22! log this error
		return done(err);
	}

	if (!accessToken) {
		return done(null, false);
	}

	console.log('finded access token', accessToken);

	// Return user data
	return done(null, {
		uid : accessToken.uid
	}, {
		scope : accessToken.scopes
	});
};

var cbkBearerStrategy = function (accessTokenCln, token, done) {
	accessTokenHelper.findAccessToken(accessTokenCln, token,
		cbkFindAccessToken.bind(null, done));
};

/** Init an api router */
exports.init = function (router, passport, authDb) {
	var accessTokenCln = authDb.collection('accessToken');
	var authUserCln = authDb.collection('authUser');
	// http://passportjs.org/guide/oauth2-api/
	passport.use(new BearerStrategy(cbkBearerStrategy.bind(null, accessTokenCln)));

	router.get('/people/me',
		passport.authenticate('bearer', {
			// no session required for bearer auth
			session : false
		}),
		getCurrentProfile.bind(null, authUserCln));

	return router;
};

module.exports = exports;
