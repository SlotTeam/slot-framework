var path = require("path"),
    slot = require('./slot.json');

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        watch: {
            configFiles: {
                files: [ 'Gruntfile.js' ],
                options: {
                    reload: true
                }
            },
            html: {
                files: ['www/**/*.html']
            }
        }
    });
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);

        if (target != 'configFiles') {
            var url = path.join('/', filepath);
            url = url.replace(slot.framework.webRootDir, '');

            grunt.log.writeln('url: ' + url);

            buildPage(url, function() {
                grunt.log.writeln('url: done - ' + url);
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

        grunt.task.run('watch');
    });
};


function buildPage(url, callbackEnd) {
    var http = require('http');

    //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
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
            console.log(str);

            callbackEnd(str);
        });
    }

    http.request(options, callback).end();
}

//function buildPage(callback) {
//    var http = require('http');
//
//    //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
//    var options = {
//        host: 'www.random.org',
//        path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
//    };
//
//    callback = function(response) {
//        var str = '';
//
//        //another chunk of data has been recieved, so append it to `str`
//        response.on('data', function (chunk) {
//            str += chunk;
//        });
//
//        //the whole response has been recieved, so we just print it out here
//        response.on('end', function () {
//            console.log(str);
//        });
//    }
//
//    http.request(options, callback).end();
//}