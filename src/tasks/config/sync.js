/**
 * A grunt task to keep directories in sync. It is very similar to grunt-contrib-copy
 * but tries to copy only those files that has actually changed.
 *
 * ---------------------------------------------------------------
 *
 * Synchronize files from the `assets` folder to `.tmp/public`,
 * smashing anything that's already there.
 *
 * For usage docs see:
 * 		https://github.com/tomusdrw/grunt-sync
 *
 */
function getFileMasks(env) {
  if (env == 'prod' || env == 'production') {
    console.log('!**/dependencies/react.js', env);
    return [
      '**/*.!(coffee|less)',
      '!**/*.jsx',
      '!**/dependencies/react.js',
      '!**/dependencies/react-dom.js',
      '!**/dependencies/redux.js',
      '!**/dependencies/react-redux.js',
      '!**/dependencies/immutable.js'
    ]
  } else {
    console.log('!**/js/dependencies/react.min.js', env);
    return [
      '**/*.!(coffee|less)',
      '!**/*.jsx',
      '!**/dependencies/react.min.js',
      '!**/dependencies/react-dom.min.js',
      '!**/dependencies/redux.min.js',
      '!**/dependencies/react-redux.min.js',
      '!**/dependencies/immutable.min.js'
    ]
  }
}


module.exports = function(grunt) {

	grunt.config.set('sync', {
		dev: {
			files: [{
				cwd: './assets',
				src: getFileMasks(process.env.NODE_ENV),
				dest: '.tmp/public'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-sync');
};
