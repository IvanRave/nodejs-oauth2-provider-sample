/** @module routers/dialog-router */

var oauth2orize = require('oauth2orize');
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var appMdw = require('../mdw/app-mdw');
var authClientHelper = require('../db/auth-client-helper');
var uidHelper = require('../helpers/uid-helper');
var lgr = require('../helpers/lgr-helper').init(module);
var validationHelper = require('../helpers/validation-helper');
var authClientReqSchema = require('../schemas/auth-client-req');

var configHelper = require('../helpers/config-helper');

// At this time only few clients,
// no database
var authClients = configHelper.get('authClients');

var cbkFindByClientId = function (redirectUri, done, err, client) {
	if (err) {
		lgr.error(err);
		return done(err);
	}

	lgr.info('client is finded', client);

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
	lgr.info('clientId: %s, redirectUri: %s', clientId, redirectUri);

	authClientHelper.findByClientId(authClients, clientId,
		cbkFindByClientId.bind(null, redirectUri, done));
};

var cbkGrantCode = function (client, redirectUri, user, ares, done) {
	var code = uidHelper.generate(16);
	// TODO: save this code to database
	//       to validate later
	done(null, code);

	// var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
	// ac.save(function (err) {
	// if (err) {
	// return done(err);
	// }
	// return done(null, code);
	// });
};

var cbkExchangeCode = function (client, code, redirectURI, done) {
	lgr.info('code exchanging...', code);
	var asdf = uidHelper.generate(256);
	lgr.info('generated uid', asdf);
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

exports.createRouter = function (express, passport) {
	lgr.info('Created router');
	passport.use(new ClientPasswordStrategy(
			authClientHelper.validateSecret.bind(null, authClients)));

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
		lgr.info('logging token request');
		next();
	},
		passport.authenticate('oauth2-client-password', {
			session : false
		}),
		server.token(),
		server.errorHandler());

	return router;
};

module.exports = exports;
