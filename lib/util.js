/**
 * Created by cecheveria on 8/21/2014.
 */

var colors = require('colors'),
    S = require('string'),
    path = require('path'),
    pkg = require('../package.json')
    ;

/**
 * List of commands used to work with rest methods
 *
 * @type {{Rest: {list: string, current: string, first: string, last: string, next: string, back: string}}}
 */
const COMMANDS = {
    Rest: {
        list: "list",
        current: "current",
        first: "first",
        last: "last",
        next: "next",
        back: "back"
    }
}

/**
 * Returns the largest/longest key from an array
 *
 * @param theArray
 * @return {string}
 */
function arrayGetLongestKey(theArray) {

    theArray.sort(function(a, b) {
        return a.length > b.length ? -1 : a.length < b.length ? 1 : 0;
    });

    return theArray.length>0 ? theArray[0] : '';
}

function printBlok(title, options, longestKey) {

    var check = "   ";

    console.log((' * ').grey + (title + ':').grey);

    for(x in Object.keys(options)) {
        field = Object.keys(options)[x];
        rpaded = S(field).padRight((longestKey).length, ' ').s;
        console.log(check + rpaded.white + "  %s".grey, options[field]);
    }

}

function startSplash(server, port, options) {

    var leftGap = "   ",
        serverOn = " {@serverOn@} Server on ".replace("{@serverOn@}", server.toUpperCase()),
        serverUrl = " http://localhost:{@port@}/ ".replace("{@port@}", port),
        headLine = S("").pad((serverOn+serverUrl).length, ' ').s,
        check = "   " //" * " //"✓ OK"
        ;
    check = check.yellow;
    headLine = headLine.blue.inverse;

    console.log("\n\n");
    console.log(leftGap + headLine);
    console.log(leftGap + (serverOn + serverUrl).blueBG);
    console.log(leftGap + headLine);
    console.log("\n");
    console.log(('   ').grey + ('v' + pkg.version + '').grey);
    console.log("\n");

    var allKeys = Object.keys(options.framework).concat(Object.keys(options.logger)).concat(Object.keys(options.server)),
        longestKey = arrayGetLongestKey(allKeys);

    printBlok('Deployment', {"PID":process.pid, "Root":appFullPath()}, longestKey);
    printBlok('Framework', options.framework, longestKey);
    printBlok('Logger', options.logger, longestKey);
    printBlok('Server', options.server, longestKey);

    // TODO: Complete this loggin options
    //Compressing:
    //Minify:
    //Scaling Image:

    console.log("\n CTRL + C to shutdown");
}

/**
 * Evaluates and resolves the ../.. in a URL
 *
 * TODO:
 *  1.  Decide if we are going to return process.cwd() or "../..", or if we are going
 *      to evaluate a config parameter to detect if Server has been starte up using
 *      the 'slot start -d' command, or the server/development.js
 *
 * @param uri
 * @return {string}
 */
function appFullPath(uri) {
    return process.cwd() /*"../.."*/;
}

/**
 * Puts a prefix on the beginning of a 'name', and capitalize the rest of the 'name'
 *
 * @param fullFilePath
 * @param prefix
 * @return {string}
 */
function prefixFileName(fullFilePath, prefix) {
    var filename = fullFilePath.split(path.sep).pop();
    fullFilePath = fullFilePath.replace(filename, prefix + upperCaseCharAt0(filename));

    return fullFilePath;
}

/**
 *
 * @param word
 * @return {string}
 */
function upperCaseCharAt0(word) {
    return word.charAt(0).toUpperCase() + word.substr(1, word.length);
}

/**
 * Validate if a URL represents a mvc call
 *
 * @param uri
 * @param mvcFilter
 * @return {boolean}
 */
function isMvcApiCall(uri, mvcFilter) {
    return uri.indexOf(mvcFilter) == 0;
}

/**
 * Validate if a URL represents a rest call
 *
 * @param uri
 * @param restFilter
 * @return {boolean}
 */
function isRestApiCall(uri, restFilter) {
    return uri.indexOf(restFilter) == 0;
}

/**
 * Validate if it's a rest command
 *
 * @param lastCommand
 * @return {boolean}
 */
function isRestCommand(lastCommand) {
    return COMMANDS.Rest[lastCommand] ? true : false;
}

/**
 * Remove Node.js syntax from Render.js module, because it will be
 * injected on client side.
 *
 * TODO:
 *  1.  Move this methods on a future, to a module much relative to rendering functions
 *
 * @param buffer
 * @return {string}
 */
function cleanNodeSyntax(buffer) {
    return buffer
        .replace("module.exports.render = render;", "")
        .replace("module.exports.add = add;", "")
        .replace("module.exports.unscape = unscape;", "")
        //
        .replace(RegExp("add", "g"), "renAdd")
        .replace(RegExp("renderMain", "g"), "renMain")
        .replace(RegExp("renderOne", "g"), "renOne")
        .replace(RegExp("unscape", "g"), "this.unscape")
        //
        .replace(RegExp("render", "g"), "this.render")
        .replace(RegExp("renAdd", "g"), "this.add")
        .replace(RegExp("renMain", "g"), "this.renderMain")
        .replace(RegExp("renOne", "g"), "this.renderOne")
    ;
}

// Export public methods/constants
module.exports = {
    COMMANDS: COMMANDS,
    arrayGetLongestKey: arrayGetLongestKey,
    startSplash: startSplash,
    appFullPath: appFullPath,
    prefixFileName: prefixFileName,
    upperCaseCharAt0: upperCaseCharAt0,
    isMvcApiCall: isMvcApiCall,
    isRestApiCall: isRestApiCall,
    isRestCommand: isRestCommand,
    cleanNodeSyntax: cleanNodeSyntax
};