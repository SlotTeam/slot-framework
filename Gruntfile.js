var path = require("path"),
    fs = require('fs'),
    slot = require('./slot.json'),
    slotApi = require('slot-framework'),
    gruntTasks = slotApi.GruntTasks.create(),
    usageMap = null
    ;

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            configFiles: {
                files: [ 'Gruntfile.js' ],
                options: {
                    reload: true
                }
            },
            html: {
                files: ['www/**/*.html'],
                options: {
                    interrupt: true,
                    debounceDelay: 1000
                }
            },
            fragmentRootDir: {
                files: ['design/fragment/**/*.html']
            },
            metaData: {
                files: ['design/bind/**/*.json']
            }
        }
    });
    grunt.event.on('watch', function(action, filePath, target) {
        console.log(target + ': ' + filePath + ' has ' + action);

        if (target != 'configFiles') {
            if (target == 'html') {
                gruntTasks.buildPageFromHtml(slot, usageMap, filePath);
            }
            else if (target == 'fragmentRootDir') {
                gruntTasks.buildFragmentFromHtml(slot, usageMap, filePath);
            }
            else {
                //We are on slot.framework.metaData
                gruntTasks.buildFromMetaData(slot, usageMap, filePath);
            }
        }
    });

    grunt.registerTask('default', 'Initiate services for Slot Framework', function() {

        //Load usageMap.json file
        usageMap = fs.readFileSync(path.join(__dirname, './.usageMap.json'),'binary');
        usageMap = JSON.parse(usageMap);

        grunt.config('watch.html.files',
            path.join( '.'
                , slot.framework.webRootDir
                , '/**/**/**/**/**/**/**/**/**/'
                , '*.html'
            )
        );

        grunt.config('watch.fragmentRootDir.files',
            path.join( '.'
                , slot.framework.fragmentRootDir
                , '/**/**/**/**/**/**/**/**/**/'
                , '*.html'
            )
        );

        grunt.config('watch.metaData.files',
            path.join( '.'
                , slot.framework.metaData
                , '/**/**/**/**/**/**/**/**/**/'
                , '*.json'
            )
        );

        //Prepare to run main task
        gruntTasks.handlePIDFile(function () {
            grunt.task.run('watch');
        });
    });
};
