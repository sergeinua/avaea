module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'clean:dev',
		'jst:dev',
		'less:dev',
		'sync:dev',
		'babel:dev',
		'filerev:dev'
	]);
};
