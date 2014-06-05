/** @module db/auth-client-storage */

var configHelper = require('../helpers/config-helper');

// at this time only few clients,
// no database
var authClients = configHelper.get('authClients');

var cbkFilter = function (criteria, tmpUser) {
	// If all props are valid (no invalid props)
	return Object.keys(criteria).filter(function (critKey) {
		return criteria[critKey] !== tmpUser[critKey];
	}).length === 0;
};

var find = function (criteria, next) {
	var needUserData = authClients.filter(cbkFilter.bind(null, criteria))[0];
	next(null, needUserData || null);
};

exports.findById = function (id, done) {
	find({
		id : id
	}, done);
};

exports.findByClientId = function (clientId, done) {
	find({
		clientId : clientId
	}, done);
};

module.exports = exports;
