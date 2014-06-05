var winston = require('winston');

exports.getLogger = function (moduleFileName) {
	var path = moduleFileName.split('/').slice(-2).join('/');

	return new winston.Logger({
		transports : [
			new winston.transports.Console({
				colorize : true,
				level : 'debug',
				label : path
			})
		]
	});
};

module.exports = exports;
