/** @module helpers/lgr-helper */

var mailHelper = require('../helpers/mail-helper');
// var winston = require('winston');

// exports.init = function (module) {
// var path = module.filename.split('/').slice(-2).join('/');

// return new winston.Logger({
// transports : [
// new winston.transports.Console({
// colorize : true,
// level : 'debug',
// label : path
// })
// // new(winston.transports.File)({
// // filename : 'log/app.log',
// // maxsize : 204800 // in bytes: 200Kb
// // // TODO: #11! Turn on on production
// // //handleExceptions : true
// // })
// ]
// });
// };

exports.info = function (msgObj) {
	console.log(JSON.stringify(msgObj));
};

/**
 * Log error
 * @param {Object} err - Error
 * @param {Object} addt - Additional message
 */
exports.error = function (err, addt) {
	var mailSubject = 'Petrohelp Auth error: ' + err.message;
	var mailText = err.message;

	if (addt) {
		mailText += ' Addt: ' + JSON.stringify(addt);
	}

	if (err.stack) {
		mailText += ' Stack: ' + err.stack;
	}

	console.log(mailSubject + ': ' + mailText);
	// Send to admin
	mailHelper.sendMail({
		subject : mailSubject,
		text : mailText
	});
};

module.exports = exports;
