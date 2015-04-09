/**
 * Created by cecheverria on 3/28/15.
 */
var exec = require('child_process').exec;


function nohup(command, arguments, logFile) {

    var fs = require('fs'),
        spawn = require('child_process').spawn,
        out = fs.openSync(logFile, 'a'),
        err = fs.openSync(logFile, 'a');

    spawn(command, arguments, {
        stdio: [ 'ignore', out, err ], // piping stdout and stderr to out.log
        detached: true
    }).unref();
}

/*function nohup2(command, arguments, logFile) {

    var fs = require('fs'),
        spawn = require('child_process').spawn,
        out = fs.openSync(logFile, 'a'),
        err = fs.openSync(logFile, 'a');

    var ls = spawn(command, arguments, {
        stdio: [ 'ignore', out, err ], // piping stdout and stderr to out.log
        detached: true
    });
    
    ls.on('close', function (code) {
	  console.log('child process exited with code ' + code);
	});
}*/

function run (cmd, callback) {
    var child = exec(cmd, function (error, stdout, stderr) {

        /**
         * TODO:
         *  1.  Pass a parameter to know if we are going to show the stdout/stderr/error
         */
        /*if (stderr !== null) {
            console.log('' + stderr);
        }
        if (stdout !== null) {
            console.log('' + stdout);
        }
        if (error !== null) {
            console.log('' + error);
        }*/
        callback(error, stdout, stderr);
    });
};

module.exports.nohup = nohup;
//module.exports.nohup2 = nohup2;
module.exports.run = run;