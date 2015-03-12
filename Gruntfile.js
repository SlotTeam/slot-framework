var path = require("path"),
    fs = require('fs'),
    sortObj = require('sort-object'),
    async = require('async'),
    slot = require('./slot.json'),
    usageMap = require('./.usageMap.json');

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
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);

        if (target != 'configFiles') {

            var url = path.join('/', filepath);

            grunt.log.writeln('url: ' + url);


            if (target == 'html') {
                url = url.replace(slot.framework.webRootDir, '');

                // Extract all fragment type attributes, using the regex ({@)[^\s]*(@})
                fs.readFile(filepath, 'binary', function(err, data) {

                    var re = /({@)[^\s]*(@})/g; // Regex to find fragments used on this page
                    var str = data;
                    var m, fragments = [], fragmentName, index = 0;

                    while ((m = re.exec(str)) != null) {
                        // console.log(m[0]);

                        if (m.index === re.lastIndex) {
                            re.lastIndex++;
                        }

                        fragmentName = m[0].replace("{@","").replace("@}","");
                        console.log(fragmentName);

                        // Add only declared fragments
                        if (slot.fragments[fragmentName]) {
                            fragments[index++] = fragmentName;

                            // Create fragment reference if does not exist
                            !usageMap.fragment[fragmentName] && (usageMap.fragment[fragmentName] = []);

                            // Add relation beteewn fragment and page if it does not exists
                            usageMap.fragment[fragmentName].indexOf(url) < 0 && (usageMap.fragment[fragmentName].push(url));
                        };
                    }

                    // Update used fragments on .usageMap.json file
                    usageMap.page[url] = fragments.sort();
                    usageMap.page = sortObj(usageMap.page);

                    // Update the .usageMap file
                    fs.writeFile('./.usageMap.json', JSON.stringify(usageMap, null, 4), function (err) {

                        grunt.log.writeln('usageMap updated: ' + (err ? ' failed ' : 'success') + ' for ' + url);

                        if (!err)
                            buildPage(url, function(content) {
                                // grunt.log.writeln('url: done - ' + url);
                                grunt.log.writeln('received content: ' + content.length + 'Kb');
                            });
                    });
                });
            }
            else if (target == 'fragmentRootDir') {
                url = url.replace(slot.framework.fragmentRootDir, '');

                var page,
                    fragmentName = url.split("/").pop().split(".")[0];

                grunt.log.writeln('fragment: ' + fragmentName);

                // Add only declared fragments
                if (slot.fragments[fragmentName] && usageMap.fragment[fragmentName]) {

                    async.eachSeries(usageMap.fragment[fragmentName], function( page, callback) {

                        grunt.log.writeln('fragment: ' + fragmentName + ' - page:' + page);

                        setTimeout(function() {
                            buildPage(page, function(content) {
                                grunt.log.writeln('received content: ' + content.length + 'Kb - ' + (new Date()).getTime() );

                                callback();
                            });
                        }, 1000);

                    }, function(err){
                        // if any of the file processing produced an error, err would equal that error
                        if( err ) {
                            // One of the iterations produced an error, the processing will now stop.
                            console.log('Building pages has failed');
                        } else {
                            console.log('All pages have been built successfully');
                        }
                    });
                }
            }
            else {
                url = url.replace(slot.framework.metaData, '');
            }
        }
    });

    grunt.registerTask('default', 'Initiate services for Slot Framework', function() {

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

        grunt.task.run('watch');
    });

    function buildPage(url, callbackEnd) {
        var http = require('http');
        var options = {
            host: '127.0.0.1',
            path: url,
            port :2000
        };

        callback = function(response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                // console.log(str);
                callbackEnd(str);
            });
        }

        http.request(options, callback).end();
    }
};
