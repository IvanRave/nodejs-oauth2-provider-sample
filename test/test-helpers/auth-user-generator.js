/** @module test-helpers/auth-user-generator */

exports.generate = function (collection, next) {
	collection.remove({}, function (errClear) {
		if (errClear) {
			next(errClear);
		}

		collection.insert({
			id : 123,
			username : 'Ivan'
		}, function (errInsert) {
			if (errInsert) {
				next(errInsert);
			}

			next(null);
		});
	});
};

module.exports = exports;
