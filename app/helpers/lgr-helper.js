/** @module helpers/lgr */

var winston = require('winston');

exports.init = function (module) {
	var path = module.filename.split('/').slice(-2).join('/');

	return new winston.Logger({
		transports : [
			new winston.transports.Console({
				colorize : true,
				level : 'debug',
				label : path
			}),
			new(winston.transports.File)({
				filename : 'log/app.log',
				maxsize : 204800, // in bytes: 200Kb
        handleExceptions: true
			})
		]
	});
};

module.exports = exports;
