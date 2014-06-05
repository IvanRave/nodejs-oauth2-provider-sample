/** @module routers/dialog-router */

var oauth2orize = require('oauth2orize');
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var appMdw = require('../mdw/app-mdw');
var authClientStorage = require('../db/auth-client-storage');
var uidHelper = require('../helpers/uid-helper');
var lgr = require('../helpers/lgr-helper').init(module);

var cbkAutorize = function (clientId, redirectUri, done) {
	lgr.info('clientId: %s, redirectUri: %s', clientId, redirectUri);

	authClientStorage.findByClientId(clientId, function (err, client) {
		if (err) {
			console.log('find error');
			return done(err);
		}

		console.log('client is finded', client);

		if (!client) {
			return done(null, false);
		}

		if (client.redirectUri !== redirectUri) {
			return done(null, false);
		}

		// Go to oauth2 serialization
		// https://github.com/jaredhanson/oauth2orize#session-serialization
		done(null, client, client.redirectUri);
	});
};

var cbkGrantCode = function (client, redirectUri, user, ares, done) {
	done(null, '1234567890123456');
	// var code = utils.uid(16);

	// var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
	// ac.save(function (err) {
	// if (err) {
	// return done(err);
	// }
	// return done(null, code);
	// });
};

var cbkExchangeCode = function (client, code, redirectURI, done) {
	console.log('code exchanging...', code);
	var asdf = uidHelper.generate(256);
	console.log('generated uid', asdf);
	done(null, asdf);
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
	authClientStorage.findById(id, function (err, client) {
		if (err) {
			return done(err);
		}

		return done(null, client);
	});
};

var cbkClientPasswordStrategy = function (clientId, clientSecret, done) {
	console.log('client-password exec clientId', clientId);
	authClientStorage.findByClientId(clientId, function (err, client) {
		console.log('client-password exec', err, client);
		if (err) {
			return done(err);
		}
		if (!client) {
			return done(null, false);
		}
		if (client.clientSecret !== clientSecret) {
			return done(null, false);
		}
		return done(null, client);
	});
};

var skipDecisionMdw = function (req, res) {
	res.redirect('/dialog/decision?transaction_id=' + req.oauth2.transactionID);
};

exports.createRouter = function (express, passport) {
	lgr.info('Created router');
	passport.use(new ClientPasswordStrategy(cbkClientPasswordStrategy));

	var router = express.Router();

	var server = oauth2orize.createServer();

	server.serializeClient(cbkSerializeClient);

	server.deserializeClient(cbkDeserializeClient);

	server.grant(oauth2orize.grant.code(cbkGrantCode));

	server.exchange(oauth2orize.exchange.code(cbkExchangeCode));

	// 1. Check login if needed
	// 2. Generate transaction and send to the decision page
	router.get('/authorize',
		appMdw.ensureAuth,
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
		lgr.info('logging token request');
		next();
	}, passport.authenticate('oauth2-client-password', {
			session : false
		}),
		server.token(),
		server.errorHandler());

	return router;
};

module.exports = exports;
