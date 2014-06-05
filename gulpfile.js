var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintReporter = require('jshint-stylish');

var filePath = {
	jshintBase : {
		src : './*.js'
	},
	jshintApp : {
		src : 'app/**/*.js'
	}
};

gulp.task('default', function () {
	gulp.src(filePath.jshintBase.src)
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter(jshintReporter));

	gulp.src(filePath.jshintApp.src)
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter(jshintReporter));
});
