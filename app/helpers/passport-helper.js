var LocalStrategy = require('passport-local').Strategy;
var cryptoHelper = require('../helpers/crypto-helper');
var BaseModel = require('../models/base');
var authUserSchema = require('../schemas/auth-user');

exports.fill = function (passport) {
	passport.use(new LocalStrategy({},
			function (username, password, done) {

			var needUserData = {
				id : 123,
				username : 'Ivan',
				cleanPassword : 'Rave',
				salt : 'qwerty'
			};

			needUserData.hashedPassword = cryptoHelper.encryptSha(needUserData.cleanPassword,
					needUserData.salt);

			// Find some user from db
			var needUser = new BaseModel(needUserData, authUserSchema);

			console.log(JSON.stringify(needUser));

			if (username !== needUser.username) {
				return done(null, false, {
					message : 'WrongUsername'
				});
			}

			var sourceHashedPassword = cryptoHelper.encryptSha(password, needUser.salt);

			if (sourceHashedPassword !== needUser.hashedPassword) {
				return done(null, false, {
					message : 'WrongPassword'
				});
			}

			return done(null, needUser);
		}));

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (userId, done) {
		// remove password from its
		done(null, {
			id : userId
		});
	});
};

module.exports = exports;
