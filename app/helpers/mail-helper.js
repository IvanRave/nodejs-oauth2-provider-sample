/** @module helpers/mail-helper */

var configHelper = require('./config-helper');

var nodemailer = require('nodemailer');

console.log(configHelper.get('mailTransport'));

var mailTransport = configHelper.get('APP_MAIL_TRANSPORT');

if (!mailTransport) {
	throw new Error('no APP_MAIL_TRANSPORT');
}

mailTransport = mailTransport.toLowerCase();

var mailSettings = {};

if (mailTransport === 'pickup') {
	mailSettings.directory = configHelper.get('APP_MAIL_DIR');
} else if (mailTransport === 'smtp') {
	mailSettings.service = configHelper.get('APP_MAIL_SERVICE');
	mailSettings.auth = {
		"XOAuth2" : {
			"user" : configHelper.get('APP_MAIL_USER'),
			"clientId" : configHelper.get('APP_MAIL_CLIENT_ID'),
			"clientSecret" : configHelper.get('APP_MAIL_CLIENT_SECRET'),
			"refreshToken" : configHelper.get('APP_MAIL_REFRESH_TOKEN')
		}
	};
  
  console.log('mail settings: ' + JSON.stringify(mailSettings));
} else {
	throw new Error('this APP_MAIL_TRANSPORT is not supported');
}

// Creates only once during start a node instance
var transport = nodemailer.createTransport(mailTransport, mailSettings);

/**
 * Send email with default values
 */
exports.sendMail = function (mailOpt, next) {
	transport.sendMail({
		from : mailOpt.from || configHelper.get('adminEmail'),
		to : mailOpt.to || configHelper.get('adminEmail'),
		subject : mailOpt.subject || 'Oil auth',
		text : mailOpt.text || ''
	}, next);
	// Closed during inactivity
	//transport.close();
};

module.exports = exports;
