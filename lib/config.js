/**
 * Created by cecheveria on 9/7/2014.
 */

var path = require("path"),
    fileio = require('./fileio')
    ;

/**
 * Loads the app configuration, and set default values on non declared settings
 *
 * @param onError
 * @param onSuccess
 */
function load(onError, onSuccess) {
    fileio.readFile(path.join(process.cwd(), "slot.json".replace(/\//g, path.sep)),
        fileio.FORMATS.binary,
        function(err) {
            onError(err);
        },
        function(buffer) {
            // Slot Server configuration file was found
            var slotJson = JSON.parse(buffer);

            // Validate default values
            slotJson.framework                  || (slotJson.framework                  = {})
            slotJson.framework.metaData         || (slotJson.framework.metaData         = "/design/bind")
            slotJson.framework.fragmentRootDir  || (slotJson.framework.fragmentRootDir  = "/design/fragment")
            slotJson.framework.webRootDir       || (slotJson.framework.webRootDir       = "/www")
            slotJson.framework.mvcRootDir       || (slotJson.framework.mvcRootDir       = "/app/mvc")
            slotJson.framework.restRootDir      || (slotJson.framework.restRootDir      = "/app/rest")
            slotJson.framework.dbRootDir        || (slotJson.framework.dbRootDir        = "/app/db")
            slotJson.framework.restFilter       || (slotJson.framework.restFilter       = "/rest")
            slotJson.framework.mvcFilter        || (slotJson.framework.mvcFilter        = "/mvc")
            slotJson.logger                     || (slotJson.logger                     = {})
            slotJson.logger.logFile             || (slotJson.logger.logFile             = "logs/slot.log")
            slotJson.logger.maxsize             || (slotJson.logger.maxsize             = 1024 * 1024 * 100)   // 100Mb per file
            slotJson.logger.maxFiles            || (slotJson.logger.maxFiles            = 10)
            slotJson.server                     || (slotJson.server                     = {})
            slotJson.server.devMode             || (slotJson.server.devMode             = /*devMode*/ true)
            slotJson.server.compress            || (slotJson.server.compress            = true)
            slotJson.server.caching             || (slotJson.server.caching             = /*devMode*/ true)
            slotJson.server.cacheType           || (slotJson.server.cacheType           = "inMemory")

            //Call back onSuccess and give back the Json Config
            onSuccess(slotJson);
        }
    );
}

// Export public methods
module.exports.load = load;
