/** @module helpers/srz-helper */

exports.serialize = function (user, done) {
  console.log('serializing user', user);
	done(null, user._id);
};

exports.deserialize = function (uid, done) {
  console.log('deserializing user', uid);
	done(null, {
		_id: uid
	});
};

module.exports = exports;
