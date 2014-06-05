/** @module helpers/srz-helper */

exports.serialize = function (user, done) {
	done(null, user.id);
};

exports.deserialize = function (userId, done) {
	// remove password from its
	done(null, {
		id : userId
	});
};

module.exports = exports;
