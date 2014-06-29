/** @module db/auth-client-helper */

var appHelper = require('../helpers/app-helper');
var lgr = require('../helpers/lgr-helper').init(module);

/**
 * Find by id
 */
exports.findById = function (authClients, id, done) {
	appHelper.findRec(authClients, {
		id : id
	}, done);
};

var findByClientId = function (authClients, clientId, done) {
	appHelper.findRec(authClients, {
		clientId : clientId
	}, done);
};

exports.findByClientId = findByClientId;

/**
 * Validate client
 *    need for exchange code to access-token
 */
exports.validateSecret = function (authClients, clientId, clientSecret, done) {
  lgr.info('client password validate' + clientId);
	findByClientId(authClients, clientId, function (err, client) {
    lgr.info('client-password exec', err, client);
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

module.exports = exports;
