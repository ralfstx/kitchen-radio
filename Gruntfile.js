module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jshint: {
      options: {
        jshintrc: true
      },
      all: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"]
    },
    rsync: {
      options: {
        args: ["-v"],
        exclude: [".git*", "node_modules"],
        recursive: true
      },
      dist: {
        options: {
          src: "./src/",
          dest: "/var/lib/node/",
          host: "pi@radio",
          delete: true // Careful this option could cause data loss, read the docs!
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-rsync");

  grunt.registerTask("default", ["jshint", "rsync"]);

};
