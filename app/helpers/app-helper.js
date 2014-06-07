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

module.exports = exports;
