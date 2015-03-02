var path = require("path"),
    slot = require('./slot.json');

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        watch: {
            html: {
                files: ['www/**/*.html']
            }
        }
    });
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('default', 'build a theme', function() {

        grunt.config('watch.html.files',
            path.join( '.'
                , slot.framework.webRootDir
                , '/**/**/**/**/**/**/**/**/**/'
                , '*.html'
            )
        );

        grunt.task.run('watch');
    });
};