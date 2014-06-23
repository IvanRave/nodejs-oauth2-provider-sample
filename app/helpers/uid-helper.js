/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateByAlphabet(alphabet, len) {
	var buf = [],
	charlen = alphabet.length;

	for (var i = 0; i < len; ++i) {
		buf.push(alphabet[getRandomInt(0, charlen - 1)]);
	}

	return buf.join('');
}

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.generate(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.generate = function (len) {
	// exclude 0Ool1
	return generateByAlphabet('ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', len);
};

/**
 * Return a random string with numbers
 *
 *     utils.generateNumberStr(5);
 *     // => "32452"
 * @param {Number} len
 * @return {String}
 */
exports.generateNumberStr = function (len) {
	return generateByAlphabet('0123456789', len);
};

/**
 * Random integer, 32-bit with constant length, and no-zero first
 * @return {Number}
 */
exports.generateDbId = function () {
	return getRandomInt(100000000, 999999999);
};

module.exports = exports;
