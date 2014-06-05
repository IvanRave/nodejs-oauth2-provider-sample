/** @module db/auth-user-storage */

var cryptoHelper = require('../helpers/crypto-helper');
//var configHelper = require('../helpers/config-helper');

var demoUserData = {
	id : 123,
	username : 'Ivan',
	passClean : 'Rave',
	salt : 'qwerty'
};

demoUserData.passHash = cryptoHelper.encryptSha(demoUserData.passClean,
		demoUserData.salt);

// at this time only few clients,
// no database
var authUsers = [demoUserData];

var cbkFilter = function (criteria, tmpUser) {
	// If all props are valid (no invalid props)
	return Object.keys(criteria).filter(function (critKey) {
		return criteria[critKey] !== tmpUser[critKey];
	}).length === 0;
};

var find = function (criteria, next) {
	var needUserData = authUsers.filter(cbkFilter.bind(null, criteria))[0];
	next(null, needUserData || null);
};

exports.findByUserName = function (username, next) {
	var criteria = {
		username : username
	};
	find(criteria, next);
};

module.exports = exports;
