var path = require("path"),
    fs = require('fs'),
    slot = require('./slot.json'),
    usageMap = require('./.usageMap');

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
                files: ['www/**/*.html']
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

            if (target == 'html') {
                url = url.replace(slot.framework.webRootDir, '');

                // Extract all attributes fragment types, using the regex ({@)[^\s]*(@})
                fs.readFile( filepath ,'binary' /*'utf8'*/, function(err, data) {

                    var re = /({@)[^\s]*(@})/g; // Regex to find fragments used on this page
                    var str = data; //'hi {@welcomeMsg@}    </div>    <br>    {@comboBox@} goodby\nhi {@welcome Msg@}    </div>    <br>    {@comb-oBox@} goodby\nhi {@welcome!Msg@}    </div>    <br>    {@combo_Box@} goodby\nhi {@welcomeM~sg@}    </div>    <br>    {@com$boBox@} goodby\nhi {@welcomeMsg@}    </div>    <br>    {@combo\nBox@} goodby';
                    var m, fragments = [], index;

                    while ((m = re.exec(str)) != null) {
                        console.log(m[0]);

                        if (m.index === re.lastIndex) {
                            re.lastIndex++;
                        }

                        fragments[index++] = m[0];
                    }

                    // TODO: update the .usageMap file
                    // fs.writeFile(slotJsonFile, JSON.stringify(slotJson, null, 4), function (err) {
                    //     //if (err) {
                    //     //    pretty.failed("Fail creating '%s'", fragment);
                    //     //    throw err;
                    //     //}
                    //     //pretty.done("Fragment '%s' created on '%s'", fragment, 'todo_path');
                    //     callback(err)
                    // });
                });
            }
            else if (target == 'fragmentRootDir') {
                url = url.replace(slot.framework.fragmentRootDir, '');
            }
            else {
                url = url.replace(slot.framework.metaData, '');
            };

            grunt.log.writeln('url: ' + url);

            if (target == 'html')
                buildPage(url, function(content) {
                    // grunt.log.writeln('url: done - ' + url);
                    grunt.log.writeln('received content: ' + content.length + 'Kb');
                })
        };
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
