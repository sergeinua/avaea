module.exports = function(grunt) {
  grunt.config.set('filerev', {
    options: {
      algorithm: 'md5',
      length: 8
    },
    dev: {
      src: [
        '.tmp/public/js/**/**.js',
        '.tmp/public/styles/**.css'
      ]
    },
    prod: {
      src: [
        '.tmp/public/min/production.min.js',
        '.tmp/public/min/production.min.css'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-filerev');
};