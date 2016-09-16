module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuildProd', [
		'filerev:prod',
		'sails-linker:prodJsRelative',
		'sails-linker:prodStylesRelative',
		'sails-linker:devTpl',
		'sails-linker:prodJsRelativeJade',
		'sails-linker:prodStylesRelativeJade',
		'sails-linker:devTplJade'
	]);
};
