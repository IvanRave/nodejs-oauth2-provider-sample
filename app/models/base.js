/** @module models/base */

/**
 * Base model, created from a schema
 */
exports = function (data, schema) {
	this.schema = schema;

	for (var skey in this.schema.columns) {
		if (this.schema.columns.hasOwnProperty(skey)) {
			this[skey] = data[skey];

			// Check type, max length, required attr
			var propOpts = this.schema.columns[skey];
			if (this[skey] && propOpts.isGuid) {
				// Guid in the db stored in Caps case
				//    but in C# converted to Lower case
				this[skey] = this[skey].toLowerCase();
			}

			this.validateProp(skey);
		}
	}
};

exports.prototype.validateProp = function (propName) {
	var propOpts = this.schema.columns[propName];
	if (!propOpts) {
		throw new Error('No opt ', propName);
	}

	if (typeof this[propName] !== propOpts.dataType) {
		if (!propOpts.isNullable) {
			console.log('check property %s: typeof %s !== %s',
				propName,
				this[propName],
				propOpts.dataType);

			throw new Error('typeOfValueIsWrong');
		}
	}

	// Check max length
	if (propOpts.maxLength) { // if isNumber - todo #42 change
		if (this[propName]) {
			if (this[propName].length > propOpts.maxLength) {
				throw new Error('maxLengthIs ', propOpts.maxLength);
			}
		}
	}

	// Check other props
};

module.exports = exports;
