/** @module helpers/mail-helper */

var config = require('./config-helper');

var nodemailer = require('nodemailer');

console.log(config.get('mailTransport'));

// Creates only once during start a node instance
var transport = nodemailer.createTransport(config.get('mailTransport'),
		config.get('mailSettings'));

/**
 * Send email with default values
 */
exports.sendMail = function (mailOpt, next) {
	transport.sendMail({
		from : mailOpt.from || config.get('adminEmail'),
		to : mailOpt.to || config.get('adminEmail'),
		subject : mailOpt.subject || 'Oil auth',
		text : mailOpt.text || ''
	}, next);
	// Closed during inactivity
	//transport.close();
};

module.exports = exports;
