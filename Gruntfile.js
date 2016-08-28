module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    copy: {
      source: {
        expand: true,
        cwd: 'src/',
        src: ['**/*'],
        dest: 'build/'
      }
    },
    rsync: {
      options: {
        args: ['-v'],
        exclude: ['.git*', 'node_modules'],
        recursive: true
      },
      dist: {
        options: {
          src: 'build/',
          dest: '/var/lib/node/',
          host: 'pi@radio',
          delete: true // Careful this option could cause data loss, read the docs!
        }
      }
    }
  });

  grunt.registerTask('package', 'create package.json', function() {
    let pkg = grunt.file.readJSON('package.json');
    delete pkg.devDependencies;
    grunt.file.write('build/package.json', JSON.stringify(pkg));
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.registerTask('build', ['clean', 'copy:source',  'package']);
  grunt.registerTask('deploy', ['build', 'rsync']);

  grunt.registerTask('default', ['build']);

};
