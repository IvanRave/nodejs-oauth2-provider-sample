/** @module db/auth-client-helper */

var lgr = require('../helpers/lgr-helper');

var findAuthClient = function (authClientCln, clientId, done) {
	authClientCln.findOne({
		'_id' : clientId
	}, done);
};

exports.findAuthClient = findAuthClient;

var cbkFindAuthClientToValidateSecret = function (clientSecret, done, err, client) {
	if (err) {
		lgr.error(err);
		return done(err);
	}

	lgr.info({
		'findAuthClient in ValidateSecret' : client
	});

	if (!client) {
		return done(null, false);
	}

	if (client.clientSecret !== clientSecret) {
		return done(null, false);
	}

	return done(null, client);
};

/**
 * Validate client
 *    need for exchange code to access-token
 */
exports.validateSecret = function (authClientCln, clientId, clientSecret, done) {
	lgr.info('client password validate' + clientId);

	findAuthClient(authClientCln, clientId,
		cbkFindAuthClientToValidateSecret.bind(null, clientSecret, done));
};

module.exports = exports;
