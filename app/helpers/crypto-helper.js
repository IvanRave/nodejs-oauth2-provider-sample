var crypto = require('crypto');

exports.encryptSha = function (password, salt) {
	return crypto.createHmac('sha1', salt).update(password).digest('hex');
	//more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

module.exports = exports;
