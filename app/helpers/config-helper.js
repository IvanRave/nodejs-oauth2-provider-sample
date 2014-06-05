var nconf = require('nconf');

nconf.argv()
.env()
.file({
	file : './app/config.json'
});

module.exports = nconf;
