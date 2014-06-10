var nconf = require('nconf');

nconf.argv()
.env()
.file({
	file : './app/config-debug.json'
});

module.exports = nconf;
