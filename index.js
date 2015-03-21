/**
 * Created by cecheveria on 2/2/14.
 */
var connect = require('connect'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),

    Render =        require("./lib/render"),
    Paginate =      require("./lib/paginate"),
    Util =          require("./lib/util"),
    Designer =      require("./lib/designer"),
    Logger =        require('./lib/logger'),
    fileio =        require('./lib/fileio'),
    config =        require('./lib/config'),
    GruntTasks =    require('./lib/gruntTasks'),
    restProvider =  require('./routes/restProvider'),

    resourcesCache = new Object(),
    viewsExistsCache = new Object(),
    devMode = true,
    port = process.argv[2] || 2000
    ;

var clientController,
    slotJson,
    logger
    ;

/**
 *
 * @param request           The Request Object.
 * @param onDontExists      Function executed when a resource don't exists on web server.
 * @param onReadFileError   Function executed when a there is a problem reading a resource.
 * @param onStaticResource  Function executed when the resource is not a Slot component(Model, View, HTML Layout, ect..),
 *                          it's any other content like; HTML files, media content, images, text files, ect. All of them
 *                          will be served as a static content.
 * @param onInvalidView     Function executed when a requested view is no  correctly implemented (views must have 'run' method).
 * @param onBindComplete    Function executed when a requested view is totally merged (Layout+Model).
 * @param onRestful         Function executed when a requested REST Service is correctly executed.
 */
function route(request, onDontExists, onReadFileError, onStaticResource, onInvalidView, onBindComplete, onRestful) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), slotJson.framework.webRootDir + uri),
        uriFileName = uri;

    fs.exists(filename, function(err) {
        var isRest = false,
            isMvcCall = false;
        //
        if (!err) { // <<== function called if template don't exists
            isRest = Util.isRestApiCall(uri, slotJson.framework.restFilter);
            //
            if(isRest)
                filename = path.join(process.cwd(), slotJson.framework.restRootDir, uri.replace(slotJson.framework.restFilter, ""));
            else {
                isMvcCall = Util.isMvcApiCall(uri, slotJson.framework.mvcFilter);
                if(isMvcCall)
                    filename = path.join(process.cwd(), slotJson.framework.mvcRootDir, uri.replace(slotJson.framework.mvcFilter, ""));
                else
                    return onDontExists();
            }
        }

        if (!isRest && !isMvcCall && fs.statSync(filename).isDirectory()) {
            filename += (filename.lastIndexOf(path.sep)+1==filename.length ? 'index.html' :  path.sep+'index.html');
            uriFileName += (uri.lastIndexOf(path.sep)+1==uri.length ? 'index.html' :  path.sep+'index.html');
        }

        try {
            /**
             * Bind just allowed extentions (html, htm)
             * TODO:
             *  1.  Create allowExt.json to define wich extentions are allowed to be routed
             */
            if((filename.split(".")[filename.split(".").length-1]).toLowerCase() == "html") {

                var modelName       = filename.split(process.cwd())[1];
                modelName       = path.join(slotJson.framework.mvcRootDir, modelName.replace(/^\\www|^\/www/g, ""));
                //"\\www Rolling \\www Stones /www pie /ww".replace(/^\\www/g, "")
                var modelSFile      = Util.prefixFileName(modelName, "m").replace(".html", "Srv.js");
                var viewFile        = Util.prefixFileName(modelName, "v").replace(".html", ".js");
                var pageModelFile   = Util.prefixFileName(modelName, "pageModel").replace(".html", ".js");
                var mvcInjectorUrl  = slotJson.framework.mvcFilter + modelName.replace(".html", "").replace(/\\/g, "/").replace(slotJson.framework.mvcRootDir, "");

                var modelS      = Util.appFullPath() + modelSFile.replace(/\\/g, "/"),      //<<== Model on server side
                    view        = Util.appFullPath() + viewFile.replace(/\\/g, "/"),        //<<== View on server side
                    view        = Util.appFullPath() + viewFile.replace(/\\/g, "/"),        //<<== View on server side
                    pageModel   = Util.appFullPath() + pageModelFile.replace(/\\/g, "/");   //<<== Page model populated wit meta-date used on design time.

                var localViewFile = path.join(process.cwd(), viewFile); //process.cwd() + path.sep + viewFile;
                //
                /**
                 * TODO: Highly important
                 *  1.  Change line for Synchronous call: "viewsExistsCache[localViewFile] = fs.existsSync(localViewFile);"
                 *      Change line for Asynchronous call: "viewsExistsCache[localViewFile] = fs.exists(localViewFile);"
                 */
                if(viewsExistsCache[localViewFile] == undefined)
                    viewsExistsCache[localViewFile] = fs.existsSync(localViewFile);

                if(viewsExistsCache[localViewFile]) {
                    /**
                     * Just for Development Environment:
                     *  1.  We are deleting the module from require.cache, just for development purposes.
                     *      it will warranty that each change you do in your pageModule will be reflected
                     *      without necessity of reload server.
                     *  2.  In production environment devMode always will be false, and the cache deletion
                     *      will not occurs. If this setting is applied on production environmanet, the
                     *      server performance will be afected.
                     */
                    if(devMode) {
                        if(require.cache[path.join(view, "")])
                            delete require.cache[path.join(view, "")];
                        if(require.cache[path.join(modelS, "")])
                            delete require.cache[path.join(modelS, "")];
                        if(require.cache[path.join(pageModel, "")])
                            delete require.cache[path.join(pageModel, "")];
                    }

                    /**
                     * Dynamic module requiring, the module must be a valid Slot View
                     */
                    view = new require(view);
                    modelS = require(modelS).model.create();
                    pageModel = require(pageModel);

                    /**
                     * Validate if Slot View has well implemented the "run method"
                     */
                    if (view.run) {
                        view.run(pageModel /*modelS*/, request, function (modelFilled) {
                            logger.info("executing server side %s", viewFile);

                            var htmlContent = Render.render(modelFilled);

                            /**
                             * Inject client side model and client controller
                             */
                            htmlContent = htmlContent.replace("</body>", "<script src='" + mvcInjectorUrl.replace(/\\/g, "/") + "'></script></body>");

                            /**
                             * Inject client side controller
                             * function Slot() {" + clientController + "};
                             */
                            htmlContent = htmlContent.replace("</body>",
                                "<script>" +
                                "function slotF() {" +
                                clientController +
                                "};" +
                                "var Slot = new slotF();" +
                                "</script></body>");

                            /**
                             * Return html content to MainController
                             */
                            onBindComplete(htmlContent);
                        });
                    }
                    else {
                        onInvalidView("Invalid view implementation");
                    }
                }
                else {
                    // Resolve No Routable html file, and execute as a static resource/content
                    resolveStaticResource(filename, onStaticResource);
                }
            }
            else if(isRest) {

                restProvider(
                    request ,
                    filename,
                    {
                        "logger" : logger,
                        "devMode" : devMode,
                        "onRestful" : onRestful,
                        "onInvalidView" : onInvalidView
                    });
            }
            else if(isMvcCall) {

                var modelName   = filename.split(process.cwd())[1];
                modelName   = modelName.replace(/\\+$/, '');    // Delete last backslash

                var lastCommand = modelName.split("\\");
                lastCommand = lastCommand[lastCommand.length-1].toLowerCase();

                modelName = Util.isRestCommand(lastCommand)
                    ? modelName.replace("\\"+lastCommand, "")
                    : modelName;

                var localViewFile = path.join(process.cwd(), Util.prefixFileName(modelName, "m") + ".js");
                //
                if(viewsExistsCache[localViewFile] == undefined)
                    viewsExistsCache[localViewFile] = fs.existsSync(localViewFile);

                if(viewsExistsCache[localViewFile]) {
                    /**
                     * Return javascript content to web client
                     */
                    resolveStaticResource(localViewFile, function(filename, buffer) {
                        onRestful(buffer, "text/javascript");
                    });
                }
                else
                    onInvalidView("Invalid mvc implementation, model not found ");
            }
            else {
                // Resolve No Routable resource file
                resolveStaticResource(filename, onStaticResource);
            }
        }
        catch (e) {
            logger.error("loading exception: %s %j", filename, {exception:e+""}, {});
            return onReadFileError(e);
        }
    });
}

function resolveStaticResource(filename, onStaticResource) {
    if(devMode && resourcesCache[filename]) {
        logger.info("Taking cache %s", filename);

        //Take resource from cache
        onStaticResource(filename, resourcesCache[filename]);
    }
    else {
        fs.readFile(filename, 'binary', function (err, buffer) {
            logger.info("Caching resource %s", filename);

            //Save on Resource Cache
            resourcesCache[filename] = buffer;
            //Serve the resource
            onStaticResource(filename, buffer);
        });
    }
}

function start(port) {

    /**
     * TODO: Many domains - Proxy Server
     *  1.  Evaluate the use of Vhost from Connect Middleware, to implement a proxy support
     *      for many domains on same Node.js server.
     *
     *  http://www.senchalabs.org/connect/vhost.html
     *
     Vhost:

     Setup vhost for the given hostname and server.

     connect()
     .use(connect.vhost('foo.com', fooApp))
     .use(connect.vhost('bar.com', barApp))
     .use(connect.vhost('*.com', mainApp))
     The server may be a Connect server or
     a regular Node http.Server.

     String hostname
     Server server
     returns Function
     */

    var app = connect()
        .use(connect.favicon())
        .use(connect.cookieParser())
        .use(connect.cookieParser())
        .use(connect.session({ secret: 'secretSessionWordGoesHere', cookie: { maxAge: /*60000*/ 600000 }}))
        .use(function (request, response, next) {

            var uri = url.parse(request.url).pathname;

            logger.info("serving %s", uri);

            route(request,
                // Function called if template don't exists
                function onDontExists() {
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.write("404 Not Found\n");
                    response.end();
                },
                // Function called if and error reading template occurs
                function onReadFileError(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write("500 Not Found\n" + uri + "\n");
                    response.write(err + "\n");
                    response.end();
                },
                // Function called after loading a  non routable file, it means we need to serve the resource
                // as a static content, and set the necessaries headers on response object: 304, and others.
                // Static content will be served for the new StaticRouter.js
                function onStaticResource(filename, fileContent) {
                    /**
                     * TODO: This features are part of Roadmap..
                     *
                     *  1.  Serving static content will be served for the new StaticRouter.js
                     *
                     *  1.  Evaluate the return code 304, when a static content has not been modified,
                     *      we need to return the correct headers to tell the browser that caches the
                     *      content localy on client side:
                     *      https://developers.google.com/speed/docs/best-practices/caching#LeverageBrowserCaching
                     *
                     *  2.  Serve scaled images:
                     *      Analize how to implement the autoscaling feature on Slot Web Server:
                     *      https://developers.google.com/speed/docs/best-practices/payload#ScaleImages
                     *
                     *  3.  Enable compression:
                     *      https://developers.google.com/speed/docs/best-practices/payload#GzipCompression
                     *
                     *  4.  Minify HTML/CSS:
                     *      https://developers.google.com/speed/docs/best-practices/payload#MinifyHTML
                     */
                    response.writeHead(200, {"Content-Type": mime.lookup(filename)});
                    response.write(fileContent, "binary");
                    response.end();

                    //logger.info("serving " + uri + " -  end:" + (new Date()));
                },
                // Function called if and error reading template occurs
                function onInvalidView(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    //response.write("500 Invalid View\n" + uri);
                    response.write("500 " + err + "\n" + uri);
                    response.end();
                },
                // Function called after binding templates
                function onBindComplete(fileContent) {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(fileContent, "binary");
                    response.end();

                    //logger.info("serving " + uri + " -  end:" + (new Date()));
                },
                // Function called to serve RestFul Web Services
                function onRestful(fileContent, contentType) {
                    response.writeHead(200, {"Content-Type": contentType});
                    response.write(fileContent);
                    response.end();
                }
            );
        });

    /**
     * Load javaScript client controller
     */
    clientController = path.join(__dirname, "/lib/render.js".replace(/\//g, path.sep));

    fileio.readFile(clientController,
        fileio.FORMATS.binary,
        function(err) {
            console.log('Problems loading client side controller, you must have this file: %s', err);
        },
        function(buffer) {
            // Remove Node.js nomenclature, this content will be injected on client side
            clientController = Util.cleanNodeSyntax(buffer);

            // Load slot.json config file
            config.load(
                function(err) {
                    console.log('Problems loading slot.json file, you must have this file: %s', err);
                },
                function(buffer) {
                    slotJson = buffer;

                    // Instance logger
                    logger = new Logger(slotJson.logger);

                    // Ensure logs folder is totally created
                    fileio.mkdirp(path.dirname(path.join(process.cwd(), slotJson.logger.logFile)),
                        function(err) {
                            logger.error('Error creating logs folder [%s] %j', logs, err, {});
                        },
                        function(err) {
                            // Start server
                            port || (port = 2000)
                            http.createServer(app).listen(parseInt(port, 10));

                            Util.startSplash("Development", port, slotJson);
                        }
                    );
                }
            )
        }
    );
}

function load() {
    /**
     * TODO:
     *  1.  Agregar logica para verificar si se han cargado o no los templates que
     *      se utilizan en la pagina que se va a servir
     */
}


/**
 * Export functions
 */
module.exports.setDevMode = function (flag) {
    devMode = flag;
};
module.exports.getDevMode = function (flag) {
    return devMode;
};

module.exports.start = start;
module.exports.render = Render.render;
module.exports.responseBase = Paginate.ResponseBase;
module.exports.responsePage = Paginate.ResponsePage;
module.exports.pageHelper = Paginate.PageHelper;
module.exports.Util = function () {
    this.prefixFileName = Util.prefixFileName;
    this.upperCaseCharAt0 = Util.upperCaseCharAt0;
};
module.exports.logger = logger;

/**
 * Serve API modules
 */
module.exports.Designer = Designer;
module.exports.GruntTasks = GruntTasks;