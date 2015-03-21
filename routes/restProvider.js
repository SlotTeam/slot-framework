/**
 * Created by cecheveria on 2/2/2015.
 */
var url = require("url"),
    path = require("path"),
    Paginate = require("../lib/paginate"),
    Util = require("../lib/util")
    ;

function restProvider(request, filename, options) {
    /**
     * TODO:
     *  1.  Add REST definition strategi, may be a "conf file" or "json file"
     */
    var logger = options.logger,
        devMode = options.devMode,
        onRestful = options.onRestful,
        onInvalidView = options.onInvalidView,
        modelName = filename.split(process.cwd())[1],
        lastCommand = modelName.split(path.sep);

    modelName = path.sep == '/' ? modelName.replace(/\/+$/, '') : modelName.replace(/\\+$/, '');    // Delete last backslash
    lastCommand = lastCommand[lastCommand.length-1].toLowerCase();

    modelName = Util.isRestCommand(lastCommand)
        ? modelName.replace(path.sep+lastCommand, "")
        : modelName;

    var viewFile = modelName + ".js";
    var restModule = Util.appFullPath() + viewFile.replace(/\\/g, "/");     //<<== View on server side

    logger.info('Loading module [%s] on [%s]', restModule, process.cwd());

    /**
     * Just for Development Environment:
     *  1.  We are deleting the module from require.cache, just for development purposes.
     *      it will warranty that each change you do in your restModule will be reflected
     *      without necessity of reload server.
     *  2.  In production environment devMode always will be false, and the cache deletion
     *      will not occurs. If this setting is applied on production environmanet, the
     *      server performance will be afected.
     */
    if(devMode) {
        if(require.cache[path.join(restModule, "")])
            delete require.cache[path.join(restModule, "")];
    }

    /**
     * Dynamic module requiring, the module must implement a valid Slot View
     */
    restModule = require(restModule);

    /**
     * Validate if REST Service have well implemented the "run method"
     */
    if(restModule.run) {
        /**
         * Get paraemters
         */
        var query = (url.parse(request.url, true)).query;
        var ajaxCallback = query.callback,
            format = query.format,
            pageSize = query.pageSize ? parseInt(query.pageSize) : 10 /* Set to defaultPageSize when no pageSize parameter have been passed on query String */;
        //
        var response,
            contentType = (!format ? "json" : format).toLowerCase();
        contentType = ajaxCallback
            ? "text/javascript"
            : format == "json" ? "application/json"
            : format == "xml" ? "xml/text"
            : "application/json";
        //
        var sess = request.session,
            sessionKey = modelName.split("\\").join('-');

        logger.info("sessionKey: " + sessionKey);

        /**
         * TODO:
         *  1.  Implements method on REST Service to generate the key
         */

        if(Util.isRestCommand(lastCommand)) {
            // Get buffer from session
            var buffer = sess[sessionKey],
                pageNum,
                message = "";

            if(buffer) {
                if(lastCommand == "current") {
                    pageNum = buffer.data.pageNumber;
                }
                else if(lastCommand == "first") {
                    pageNum = 1;
                }
                else if(lastCommand == "last") {
                    pageNum = buffer.data.totalPages;
                }
                else if(lastCommand == "next") {
                    pageNum = buffer.data.pageNumber + 1;
                    message = "The cursor is on last page, you can not move forward"
                }
                else if(lastCommand == "back") {
                    pageNum = buffer.data.pageNumber - 1;
                    message = "The cursor is on first page, you can not move backward"
                }

                //Get the page
                response = Paginate.PageHelper.create().getPage(buffer.data.page, buffer.data.pageSize, pageNum);

                // Evaluate if pagination was successful
                if(response.error == 0)
                // Save the new cursor page number
                    sess[sessionKey].data.pageNumber = pageNum;
                else
                // Return pagination fail message
                    response.msg = message;
            }
            else {
                // Controlar si el buffer no se encuentra en la sesion, enviar mensaje de error.
                response = Paginate.PageHelper.create().getPage(undefined, pageSize, 1);
                response.msg = "Buffer not found or have been expired";
            }

            //Stringify content
            var restContent = JSON.stringify(response);
            restContent = ajaxCallback ? ajaxCallback + "(" + restContent + ")" : restContent;

            /**
             * Return rest content to MainController
             */
            onRestful(restContent, contentType);
        }
        else {
            restModule.run(request, function(data, format) {
                var response;
                //
                if(Object.prototype.toString.call( data ) == "[object Array]") {
                    response = Paginate.PageHelper.create().getPage(data, pageSize, 1/*<== first page*/);

                    //Store refreshes data on session
                    sess[sessionKey] = Paginate.PageHelper.create().getPage(data, pageSize, 1);
                    sess[sessionKey].data.page = data;
                    sess[sessionKey].data.pageSize = pageSize;
                }
                else {
                    response = Paginate.ResponseBase.create();
                    response.data = data;
                }
                var restContent = JSON.stringify(response);
                restContent = ajaxCallback ? ajaxCallback + "(" + restContent + ")" : restContent;

                /**
                 * Return rest content to MainController
                 */
                onRestful(restContent, contentType);
            });
        }
    }
    else {
        onInvalidView("Invalid rest service implementation");
    }
}

module.exports = restProvider;