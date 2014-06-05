var clients = [{
		id : 1,
		name : 'Sampler',
		clientId : 'abc123',
		clientSecret : 'ssh-secret',
		redirectUri : 'http://localhost:22222/auth/oil/callback'
	}
];

exports.findById = function (id, done) {
	for (var i = 0, len = clients.length; i < len; i++) {
		var client = clients[i];
		if (client.id === id) {
			return done(null, client);
		}
	}
	return done(null, null);
};

exports.findByClientId = function (clientId, done) {
	for (var i = 0, len = clients.length; i < len; i += 1) {
		var client = clients[i];
		if (client.clientId === clientId) {
			return done(null, client);
		}
	}
	return done(null, null);
};

module.exports = exports;
