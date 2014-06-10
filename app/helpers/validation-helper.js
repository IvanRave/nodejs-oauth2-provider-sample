/** @module helpers/validation-helper */

// var createItem = function (data, columns, skey) {
// this[skey] = data[skey];
// }

// exports.create = function (data, schema) {
// Object.keys(schema.columns).forEach(createItem.bind(null, data, schema.columns));
// };

var validateProp = function (data, columns, errArr, propName) {
	var propOpts = columns[propName];
  
	if (!propOpts) {
		errArr.push({
			prop : propName,
			err : 'noSchemaForThisProperty'
		});
		return;
	}

	if (typeof data[propName] !== propOpts.dataType) {
		if (!propOpts.isNullable) {
			console.log('check property %s: typeof %s !== %s',
				propName,
				data[propName],
				propOpts.dataType);

			errArr.push({
				prop : propName,
				err : 'typeOfValueIsWrong',
				requiredType : propOpts.dataType,
				valueType : typeof data[propName]
			});
			return;
		}
	}

	// Check max length
	if (propOpts.maxLength) { // if isNumber - todo #42 change
		if (data[propName]) {
			if (data[propName].length > propOpts.maxLength) {
				errArr.push({
					prop : propName,
					err : 'maxLengthOverflow',
					requiredMaxLength : propOpts.maxLength,
					valueLength : data[propName].length
				});
				return;
			}
		}
	}

	// no error
	return;
	// Check other props
};

exports.validate = function (data, schema) {
	var errArr = [];
	Object.keys(schema.columns).forEach(validateProp.bind(null, data, schema.columns, errArr));
	return errArr;
};

module.exports = exports;
