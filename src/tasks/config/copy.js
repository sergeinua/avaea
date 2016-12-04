/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 * https://github.com/gruntjs/grunt-contrib-copy
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

  grunt.config.set('copy', {
    dev: {
      files: [{
        expand: true,
        cwd: './assets',
        src:  getFileMasks(process.env.NODE_ENV),
        dest: '.tmp/public'
      }]
    },
    build: {
      files: [{
        expand: true,
        cwd: '.tmp/public',
        src: ['**/*'],
        dest: 'www'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
