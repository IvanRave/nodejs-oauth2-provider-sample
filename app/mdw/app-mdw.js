/** @module mdw/app-mdw */

exports.ensureAuth = function (req, res, next) {
	if (!req.isAuthenticated()) {
		// req.url - only router part without app part

		var redirectUrl = req.originalUrl;
		// todo: check url: allow only this domain (or without domain);

		res.redirect('/account/login?redirect_url=' + encodeURIComponent(redirectUrl));
		return;
	}

	next();
};

module.exports = exports;
