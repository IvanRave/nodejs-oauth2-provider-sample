/** @module routers/dialog-router */

var oauth2orize = require('oauth2orize');
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var appMdw = require('../mdw/app-mdw');
var authClientHelper = require('../db/auth-client-helper');
var lgr = require('../helpers/lgr-helper');
var validationHelper = require('../helpers/validation-helper');
var authClientReqSchema = require('../schemas/auth-client-req');
var authCodeHelper = require('../db/auth-code-helper');
var accessTokenHelper = require('../db/access-token-helper');

var configHelper = require('../helpers/config-helper');

// At this time only few clients,
// no database
var authClients = configHelper.get('authClients');

var cbkFindByClientId = function (redirectUri, done, err, client) {
	if (err) {
		lgr.error(err);
		return done(err);
	}

	lgr.info({
		'client is finded' : client
	});

	if (!client) {
		return done(null, false);
	}

	if (client.redirectUri !== redirectUri) {
		lgr.info('redirectUrls not equals');
		return done(null, false);
	}

	// Go to oauth2 serialization
	// https://github.com/jaredhanson/oauth2orize#session-serialization
	// TODO: #23! Handle exceptions in normal view
	done(null, client, client.redirectUri);
};

var cbkAutorize = function (clientId, redirectUri, done) {
	lgr.info({
		'clientId' : clientId,
		'redirectUri' : redirectUri
	});

	authClientHelper.findByClientId(authClients, clientId,
		cbkFindByClientId.bind(null, redirectUri, done));
};

var cbkInsertAuthCode = function (done, err, createdAuthCode) {
	if (err) {
		done(err);
		return;
	}

	done(null, createdAuthCode._id);
	return;
};

/**
 * Grant a code to the client
 * @params {Object} user - Serialized user from session, {uid: 12343}
 */
var cbkGrantCode = function (authCodeCln, client, redirectUri, serializedUser, ares, done) {
	// save this code to a database
	//       to validate later (when exchanging to access_token)
	var authCode = authCodeHelper.createAuthCode(client.id, redirectUri, serializedUser.uid);

	authCodeHelper.insertAuthCode(authCodeCln, authCode, cbkInsertAuthCode.bind(null, done));
};

/** Access token inserted */
var cbkInsertAccessToken = function (authCodeCln, authCode, done, err, createdAccessToken) {
	if (err) {
		return done(err);
	}

	// If successfull - remove tmp authorization code
	authCodeHelper.removeAuthCode(authCodeCln, authCode, function (errRemove) {
		if (errRemove) {
			lgr.error(errRemove);
			// Skip error. It is not need for an user (only for an admin)
		}

		done(null, createdAccessToken._id);
	});
};

/** Handle the finded auth code */
var cbkFindAuthCode = function (authCodeCln, accessTokenCln, authClient, done, err, authCode) {
	if (err) {
		return done(err);
	}

	// Auth code is not finded in the database
	if (!authCode) {
		return done(null, false);
	}

	lgr.info({
		'result auth code' : authCode
	});

	if (authClient.id !== authCode.clientId) {
		return done(null, false);
	}

	if (authClient.redirectUri !== authCode.redirectUri) {
		return done(null, false);
	}

	var accessToken = accessTokenHelper.createAccessToken(authCode.clientId, authCode.uid);

	accessTokenHelper.insertAccessToken(accessTokenCln, accessToken,
		cbkInsertAccessToken.bind(null, authCodeCln, authCode, done));
};

/** Echange an authorization code to an access token */
var cbkExchangeCode = function (authCodeCln, accessTokenCln, client, code, redirectURI, done) {
	lgr.info({
		'code exchanging...' : {
			code : code,
			client : client
		}
	});

	authCodeHelper.findAuthCodeByCode(authCodeCln, code,
		cbkFindAuthCode.bind(null, authCodeCln, accessTokenCln, client, done));

	// AuthorizationCode.findOne(code, function(err, code) {
	// if (err) { return done(err); }
	// if (client.id !== code.clientId) { return done(null, false); }
	// if (redirectURI !== code.redirectUri) { return done(null, false); }

	// var token = utils.uid(256);
	// var at = new AccessToken(token, code.userId, code.clientId, code.scope);
	// at.save(function(err) {
	// if (err) { return done(err); }
	// return done(null, token);
	// });
	// });
};

var cbkSerializeClient = function (client, done) {
	return done(null, client.id);
};

var cbkDeserializeClient = function (id, done) {
	authClientHelper.findById(authClients, id, function (err, client) {
		if (err) {
			return done(err);
		}

		return done(null, client);
	});
};

var skipDecisionMdw = function (req, res) {
	res.redirect('/dialog/decision?transaction_id=' + req.oauth2.transactionID);
};

var checkAuthorizeParams = function (req, res, next) {
	var validationErrors = validationHelper.validate(req.query, authClientReqSchema);
	if (validationErrors.length > 0) {
		res.send(400, {
			'validationErrors' : validationErrors
		});

		return;
	}

	next();
};

exports.createRouter = function (express, passport, authDb) {
	lgr.info('Created router');
	passport.use(new ClientPasswordStrategy(
			authClientHelper.validateSecret.bind(null, authClients)));

	var router = express.Router();

	var server = oauth2orize.createServer();

	server.serializeClient(cbkSerializeClient);

	server.deserializeClient(cbkDeserializeClient);

	var authCodeCln = authDb.collection('authCode');
	var accessTokenCln = authDb.collection('accessToken');

	server.grant(oauth2orize.grant.code(cbkGrantCode.bind(null, authCodeCln)));

	server.exchange(oauth2orize.exchange.code(cbkExchangeCode.bind(null, authCodeCln, accessTokenCln)));

	// 1. Check login if needed
	// 2. Generate transaction and send to the decision page
	router.get('/authorize',
		appMdw.ensureAuth,
		checkAuthorizeParams,
		server.authorization(cbkAutorize),
		skipDecisionMdw);

	// 3. Skip decision page
	// 4. Redirect to callback_url
	router.get('/decision',
		appMdw.ensureAuth,
		server.decision());

	// 5. Separate request: change code to token
	router.post('/token',
		function (req, res, next) {
		lgr.info({
			'logging token request' : req.params
		});
		next();
	},
		passport.authenticate('oauth2-client-password', {
			session : false
		}),
		//cbkExchangeCode
		server.token(),
		server.errorHandler());

	return router;
};

module.exports = exports;
