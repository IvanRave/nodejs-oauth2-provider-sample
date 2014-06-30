/**
 * Store uid in session store (now in RAM)
 * @module helpers/srz-helper
 */

exports.serialize = function (user, done) {
	console.log('serializing user', user);
	done(null, {
		uid : user._id
	});
};

exports.deserialize = function (user, done) {
	console.log('deserializing user', user);
	done(null, user);
};

module.exports = exports;
