var nconf = require('nconf');

nconf.argv()
.env()
.file({
	file : './app/app-config.json'
});

module.exports = nconf;
