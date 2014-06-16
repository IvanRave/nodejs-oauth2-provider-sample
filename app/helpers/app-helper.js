/** @module helpers/app-helper */

var cbkFilter = function (criteria, tmpRec) {
	// If all props are valid (no invalid props)
	return Object.keys(criteria).filter(function (critKey) {
		return criteria[critKey] !== tmpRec[critKey];
	}).length === 0;
};

/**
 * Find one record from array, using criteria
 */
exports.findRec = function (arr, criteria, next) {
	var needItem = arr.filter(cbkFilter.bind(null, criteria))[0];
	next(null, needItem || null);
};

/**
 * Check an email (registration, change email etc.)
 */
exports.isValidEmail = function (email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
};

/**
 * Convert to integer
 */
exports.toInt = function (val) {
	return parseInt(val);
};

module.exports = exports;
