/**
 * Created by cecheveria on 9/6/2014.
 */

var winston = require('winston');

module.exports = function(options) {
    // Activating colors just on winston instance
    // winston.transports.Console.colorize = true;

    // Instantiating our own Logger
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({
                filename: options.logFile || 'slot.log',
                maxsize: options.maxsize || (1024 * 1024 * 100), // 100Mb per file
                maxFiles: options.maxFiles || 10,
                timestamp: options.timestamp || null
            })
        ]
    });

    // Activating colors on custom logger
    logger.transports.console.colorize = true

    // Logging
    /*logger.info('info', 'Slot logger initialized (based on Winston)');*/

    // Tracing colors
    /*logger.log('info', "log test color");
    logger.info("info test color");
    logger.warn("warn test color");
    logger.error("error test color");*/

    return logger;
}
