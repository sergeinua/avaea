module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuild', [
		'filerev:prod',
		'sails-linker:devJsRelative',
		'sails-linker:devStylesRelative',
		'sails-linker:devTpl',
		'sails-linker:devJsRelativeJade',
		'sails-linker:devStylesRelativeJade',
		'sails-linker:devTplJade'
	]);
};
