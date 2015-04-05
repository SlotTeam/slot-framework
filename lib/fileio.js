/**
 * Created by cecheveria on 9/7/2014.
 */

var path = require("path"),
    fs = require('fs'),
    mkdirp = require('mkdirp')
    ;

/**
 * Version of mkdirp ('mkdir -p' on linux/UX) implementing a Promise pattern
 *
 * @param folder
 * @param onError
 * @param onSuccess
 */
function mkdirpYet(folder, onError, onSuccess) {
    fs.exists(folder, function(err) {
        if(!err) {
            mkdirp(folder, function(err) {
                if(err)
                    onError(err);
                else
                    onSuccess(err);
            })
        }
        else
            onSuccess(err);
    });
}

/**
 * Version of readFile implementing a callback function
 *
 * @param filename
 * @param format    binary, utf8, utf16
 * @param callback
 */
function readFile(filename, format, callback) {
    fs.readFile(filename, format, function(err, buffer) {
        callback(err,buffer);
    })
}

/**
 * Version of readFile implementing a Promise pattern like
 *
 * @param filename
 * @param format    binary, utf8, utf16
 * @param onError
 * @param onSuccess
 */
function readFile(filename, format, onError, onSuccess) {
    fs.readFile(filename, format, function(err, buffer) {
        if (err)
            onError(err);
        else
            onSuccess(buffer);
    })
}

/**
 *
 * @type {{binary: string, utf8: string, utf16: string}}
 */
const FORMATS = {
    binary: "binary",
    utf8: "utf8",
    utf16: "utf16"
    // TODO: Add more formats
}

// Export public methods/objects
module.exports = {
    mkdirp: mkdirpYet,
    readFile: readFile,
    FORMATS: FORMATS
};