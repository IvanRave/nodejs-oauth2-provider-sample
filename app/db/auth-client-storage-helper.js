/** @module db/auth-client-storage-helper */

var appHelper = require('../helpers/app-helper');

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
	console.log('client-password exec clientId', clientId);
	findByClientId(authClients, clientId, function (err, client) {
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

module.exports = exports;
