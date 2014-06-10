/** @module models/base */

var applyItem = function (data, columns, skey) {
	this[skey] = data[skey];

	// Correct some types
	// Check type, max length, required attr
	var propOpts = columns[skey];
	if (this[skey] && propOpts.isGuid) {
		// Guid in the db stored in Caps case
		//    but in C# converted to Lower case
		this[skey] = this[skey].toLowerCase();
	}

	// TODO: #53! if needed Replace undefined values to default values (if exists in schema)
};

/**
 * Base model, created from a schema
 */
exports = function (data, schema) {
	// this.schema = schema; - it is overflow for a big array of objects
	//     but it needs for validate props
	//  Need two steps:
	// 1. validation of data for an object
	// 2. creation of an object
	//   move to the helper

	// Remove extra data
	// PS: for knockout models - separate base class (add ko.observable to all props)
	Object.keys(schema.columns).forEach(applyItem.bind(this, data, schema.columns));
};

module.exports = exports;
