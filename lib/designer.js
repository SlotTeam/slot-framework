var connect = require('connect'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    config = require('./config'),
    mime = require("mime"),
    Util = require("./util"),
    GruntTasks =    require('./gruntTasks'),
    port = process.argv[2] || 2001;

function Slot() {
    this.key = "";
    this.value = "";
}

var slots = new Object();
var slotModels = new Object();
var templates = new Object();
var fragments,
    slotJson;
//
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};
function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

var manyTabs = 0;
var tabs = "  ";
//
function logmsg(message) {
    var index = 0;

    while (index++ < manyTabs) {
        message = tabs + message;
    }
    console.log(message);
};

function execJsonBinding(nameSpace, slotKey, uriBuildKey, fileContent, filename, binds, callback) {

    // Create a new Object for the Slot, if not exists a "slotModels[slotKey]" instance
    slotModels[uriBuildKey][slotKey] = slotModels[uriBuildKey][slotKey] ? slotModels[uriBuildKey][slotKey] : new Object();

    manyTabs++;

    for(var field in binds) {
        /**
         * Fields are Objects or SimpleText
         */
        if(binds[field] instanceof Object) {

            var uuid = guid();
            var slotKeyNew = binds[field].fragmentID;

            // If 'binds[field].layout' was not assigned, then take layout from fragment.json definition
            var slotUri = binds[field].layout ? binds[field].layout.trim() : "",
                slotUri = slotUri != "" ? slotUri : (fragments[slotKeyNew] ? fragments[slotKeyNew]+".html" : "");

            // If 'binds[field].bind' was not assigned, then take bind from fragment.json definition
            var jsonBindFile = binds[field].bind
                && ( binds[field].bind instanceof Array || binds[field].bind.trim() != "" )
                    ?  binds[field].bind
                    : (fragments[slotKeyNew] ? fragments[slotKeyNew]+".json" : "")
                ;
            var layoutFileName = path.join(process.cwd(), slotJson.framework.fragmentRootDir /*webRootDir*/, slotUri);

            // Save template path on cache
            slots[uriBuildKey][slotKeyNew] = slotUri;

            if(jsonBindFile instanceof Array) {
                logmsg("\n"); pageModel[uriBuildKey].push("\n");

                lineMsg = "// attribute " + nameSpace+"."+field + " is an array of fragment " + slotKeyNew + "";
                pageModel[uriBuildKey].push(lineMsg);
                logmsg(lineMsg);

                lineMsg = nameSpace+"."+field + " = []";
                pageModel[uriBuildKey].push(lineMsg);
                logmsg(lineMsg);
            }
            else {
                logmsg("\n"); pageModel[uriBuildKey].push("\n");

                lineMsg = "// attribute " + nameSpace+"."+field + " is an instance of fragment " + slotKeyNew + "";
                pageModel[uriBuildKey].push(lineMsg);
                logmsg(lineMsg);

                lineMsg = nameSpace+"."+field + " = model.fragments." + slotKeyNew + ".create();";
                pageModel[uriBuildKey].push(lineMsg);
                logmsg(lineMsg);
            }

            var template;

            try {
                template =
                    loadFile(nameSpace+"."+field,     // <<== nameSpace
                        slotKeyNew,         // <<== Slot key
                        slotUri,            // <<== Uri parameter
                        uriBuildKey,
                        layoutFileName,     // <<== Full template path
                        jsonBindFile,       // <<== Full jsonBindFile path (if was declared on slot definition field)
                        function () {
                            return "Slot template not found " + layoutFileName;
                        },
                        function (err) {
                            return "Slot template read error " + layoutFileName;
                        },
                        function (fileX, fileContent) {
                            //logmsg("--");
                            return fileContent;
                        }
                    );

                template = template.replace(RegExp("{@fragmentID@}","g"), slotKeyNew);

            }
            catch (e) {
                logmsg("Exception on " + uuid + " " + e);
            }

            fileContent = fileContent.replace(RegExp("{@" + field + "@}","g"), template);

            logmsg("--x");
            slotModels[uriBuildKey][slotKey][field] = new Object();
            slotModels[uriBuildKey][slotKey][field].slot = slotKeyNew;
        }
        else {
            fileContent = fileContent.replace(RegExp("{@" + field + "@}", "g"), binds[field]);

            lineMsg = "" +nameSpace+ "." +field+ " = '"+binds[field]+"';";

            // Exclude fragmentID from the list, it will be created and asigned directly from
            // the constructor
            if(field != "fragmentID") {
                slotModels[uriBuildKey][slotKey][field] = "";
                pageModel[uriBuildKey].push(lineMsg);
            }

            /**
             * TODO:
             *  1.  Hide fragmentID from pageModel creation.
             *  2.  Add code to allow fragmentID field always be set from create() method.
             */
            logmsg(lineMsg);
        }
    }

    manyTabs--;

    return callback(fileContent);
}

var count = 0,
    lineMsg,
    pageModel = new Object();

function loadFile(nameSpace, slotKey, uri, uriBuildKey, filename, jsonBindFile, onDontExistsCallback, onReadFileError, onBindComplete) {

    var exists = fs.existsSync(filename), uriFileName = uri;

    if (!exists) { // <<== function called if template don't exists
        return onDontExistsCallback();
    }
    //logmsg("Name space: slotKey["+slotKey+"] uri["+uri+"] uriBuildKey["+uriBuildKey+"]");

    if (fs.statSync(filename).isDirectory()) {
        filename += (filename.lastIndexOf(path.sep)+1==filename.length ? 'index.html' :  path.sep+'index.html');
        uriFileName = uriFileName.replace(/\/+$/, '');
        uriFileName += (uri.lastIndexOf(path.sep)+1==uri.length ? 'index.html' :  /*path.sep*/'/'+'index.html');
    }

    try {
        var file = (templates[filename]=fs.readFileSync( filename ,'binary' /*'utf8'*/));

        /**
         * Bind just allowed extentions (html, htm)
         * TODO:
         *  1.  Create allowExt.json to define wich extentions are allowed to be binded
         */
        if((filename.split(".")[filename.split(".").length-1]).toLowerCase() == "html") {

            var binds;
            if(jsonBindFile instanceof Array) {
                binds = jsonBindFile;
            }
            else {
                var bindDir = path.join(process.cwd(), slotJson.framework.metaData /*"/bind"*/);

                /**
                 * Si no hemos pasado el jsonBindFile, pues entonces tomamos bind segun el nombre del html
                 * con el que estamos trabajando.
                 */
                jsonBindFile = (jsonBindFile == undefined ? path.join(bindDir, uriFileName.replace(/.html/gi, ".json")) : path.join(bindDir, jsonBindFile));

                //
                slots[uriBuildKey] = slots[uriBuildKey] ? slots[uriBuildKey] : new Object();
                slots[uriBuildKey][slotKey] = uri /*uriFileName*/;

                // Parse fields and slots defined on JSON File.
                jsonBindFile = fs.readFileSync( jsonBindFile ,'binary' /*'utf8'*/);

                binds = JSON.parse(jsonBindFile);
                binds = binds["binds"];
            }

            if (binds) {
                // Call bindings
                if(binds instanceof Array) {
                    var rows = "";

                    lineMsg = "// attribute " + nameSpace+ " is an array of fragment " + slotKey + "";
                    pageModel[uriBuildKey].push(lineMsg);
                    logmsg(lineMsg);

                    lineMsg = nameSpace + " = []";
                    pageModel[uriBuildKey].push(lineMsg);
                    logmsg(lineMsg);

                    //Iterate over each slot data record
                    for(var row in binds) {
                        logmsg("--y");

                        var currentVar = slotKey +""+ count ;

                        //lineMsg = "var " + slotKey +""+( count )+ " = model.fragments." + slotKey + ".create();";
                        lineMsg = "var " +currentVar+ " = model.fragments." + slotKey + ".create();";
                        pageModel[uriBuildKey].push(lineMsg);
                        logmsg(lineMsg);

                        //Doing binding
                        rows += execJsonBinding(slotKey +""+( count ) /*nameSpace*/, slotKey, uriBuildKey, file, filename, binds[row],
                            function (fileContent) { // <<== function called after binding templates
                                return fileContent;
                            }
                        );

                        count++;
                        //lineMsg = nameSpace + ".push("+slotKey +""+( count++ )+")";
                        lineMsg = nameSpace + ".push("+currentVar+")";
                        pageModel[uriBuildKey].push(lineMsg);
                        logmsg(lineMsg);
                    }

                    return onBindComplete(filename, rows);
                }
                else {
                    //Doing binding
                    return execJsonBinding(nameSpace, slotKey, uriBuildKey, file, filename, binds,
                        function (fileContent) { // <<== function called after binding templates
                            return onBindComplete(filename, fileContent);
                        }
                    );
                }
            }

            manyTabs--;
        }

        return onBindComplete(filename, file);
    }
    catch (e) {
        logmsg("loading exception: " + filename);
        console.log(e);
        return onReadFileError(e);
    }
}

var app = connect()
    .use(connect.favicon())
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
    .use(function (request, response, next) {

        var uri = url.parse(request.url).pathname,
            uriBuildKey = url.parse(request.url).pathname.replace(/\//g, "-"),
            filename = path.join(process.cwd(), slotJson.framework.webRootDir, uri);

        // Create a new Object for the current uriBuildKey
        !slotModels[uriBuildKey] && (slotModels[uriBuildKey] = new Object());

        // Create a new Array for the current uriBuildKey
        !pageModel[uriBuildKey] && (pageModel[uriBuildKey] = []);
        pageModel[uriBuildKey] = [];

        // Load requested file
        loadFile("model",   // <<== nameSpace
            "main",         // <<== slotKey
            uri,
            uriBuildKey,
            filename,
            undefined,      // <<== Pass jsonBindFile as undefined to force to use default named jsonBinder
            function () {   // <<== onDontExistsCallback: function called if template don't exists
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("404 Not Found\n");
                response.end();
            },
            function (err) { // <<== onReadFileError: function called if and error reading template occurs
                response.writeHead(500, {"Content-Type": "text/plain"});
                //response.write(err + "\n");
                response.write("500 Not Found\n" + uri);
                response.end();
            },
            function (filename, fileContent) { // <<== onBindComplete: function called after binding templates
                response.writeHead(200, {"Content-Type": mime.lookup(filename)});
                response.write(fileContent, "binary");
                response.end();

                /**
                 * If valid URL path whit allowed Slot rendering, we are going to generate
                 * Slot Models.
                 */
                if((filename.split(".")[filename.split(".").length-1]).toLowerCase() == "html") {
                    if(slots[uriBuildKey] && Object.keys(slots[uriBuildKey]).length) {
                        var os = require("os"),
                            nowTimeStamp = (new Date()).toDateString() + " " + (new Date()).toLocaleTimeString();
                        var uri = url.parse(request.url).pathname,
                            modelName       = filename.split(process.cwd())[1];
                        //modelName       = path.join(slotJson.framework.mvcRootDir, modelName.replace(/[\\www][/www]/g, ""));
                        modelName       = path.join(slotJson.framework.mvcRootDir, modelName.replace(/^\\www|^\/www/g, ""));
                        modelName       = modelName.replace(/^\\/, ''); //Remove first backslash
                        var modelFile       = Util.prefixFileName(modelName, "m").replace(".html", ".js");
                        var modelFileSrv    = Util.prefixFileName(modelName, "m").replace(".html", "Srv.js");
                        var viewFile        = Util.prefixFileName(modelName, "v").replace(".html", ".js");
                        var pageModelFile   = Util.prefixFileName(modelName, "pageModel").replace(".html", ".js");

                        var mkdirp = require('mkdirp'),
                            mcvFolder = ( modelName),
                            mcvFile = mcvFolder.split(path.sep).pop(),
                            mcvFolder = mcvFolder.replace(mcvFile, "");
                        //
                        //Add code to enssure directory is fullpath created
                        //
                        console.log('MVC mcvFolder %s \r\n' +
                            'MVC mcvFile %s \r\n' +
                            'MVC modelName %s \r\n' +
                            'MVC __dirname %s \r\n' +
                            'MVC process.cwd %s \r\n \r\n' +
                            'MVC modelFile %s \r\n' +
                            'MVC modelFileSrv %s \r\n' +
                            'MVC viewFile %s \r\n'
                            , mcvFolder, mcvFile, modelName, __dirname, process.cwd(), modelFile, modelFileSrv, viewFile);

                        mkdirp(path.join(process.cwd(), mcvFolder), function (err) {
                            if (err) console.error(err)
                            else {
                                console.log('creating MVC for %s', modelName)

                                /**
                                 * TODO:
                                 *  1.  Recorrer cada property del slotModels[slotKeyNew] para construir el Object
                                 *      segun el slotObjectDefinitionTemplate.txt
                                 *  2.  Tomar el path del template usando slots[uriBuildKey][slotKeyNew]
                                 */
                                var tempTemplate = fs.readFileSync(path.join(__dirname, '/../templates/slotObjectDefinitionTemplate.txt'),'binary' /*'utf8'*/),
                                    attrs = "",
                                    obj = "",
                                    objs = "",
                                    val = "",
                                    layouts = "";
                                for(var sl in slots[uriBuildKey]) {
                                    obj = tempTemplate.replace(RegExp("{@slotName@}","g"),   sl);
                                    attrs = "\r\n\tthis.fragmentID = \"" +sl+ "\";";

                                    for (var fl in slotModels[uriBuildKey][sl]) {
                                        val =  typeof slotModels[uriBuildKey][sl][fl] == "object"    // There is a Model, represented as an Object
                                        &&
                                        slotModels[uriBuildKey][sl][fl]["slot"]               // Validate if this model have defined a Slot yet
                                            ?  slotModels[uriBuildKey][sl][fl]["slot"]               // Take the Slot name
                                            :  "\"\"";                                  // Don't assign a Slot name

                                        attrs += "\r\n\tthis." + fl + " = " + val + ";";
                                    }

                                    obj = obj.replace("{@slotAttributes@}",   attrs);
                                    objs += obj;

                                    /**
                                     * Take the html template
                                     */
                                    var tempLayout = slots[uriBuildKey][sl] == '/' ? "index.html" : slots[uriBuildKey][sl],
                                        resourceFolder = sl == "main" ? slotJson.framework.webRootDir : slotJson.framework.fragmentRootDir;
                                    tempLayout = templates[path.join(path.join(process.cwd(), resourceFolder), tempLayout)];
                                    tempLayout = tempLayout
                                        .replace(RegExp("\r","g"), "@@SLR@@")
                                        .replace(RegExp("\n","g"), "@@SLN@@")
                                        .replace(RegExp("\t","g"), "@@SLT@@")
                                        .replace(RegExp("'","g"), "@@SQUOTE@@")
                                        .replace(RegExp("\"","g"), "@@DQUOTE@@")
                                        .replace(RegExp("<","g"), "@@LT@@")
                                        .replace(RegExp(">","g"), "@@GT@@")
                                        //.replace(RegExp("*","g"), "@@ASTE@@")
                                        .replace(/\*/g, "@@ASTE@@")
                                        .replace(RegExp("/","g"), "@@BSLASH@@")
                                    ;
                                    layouts += "\r\n\t\tthis." + sl + " = \"" + tempLayout + "\";";

                                    /**
                                     * TODO:
                                     *  1.  Fix this bug that occurs when creating the MVC for index.html on any folder
                                     *      into, by example 'http://localhost:801/store/' generated the next error

                                     creating MVC for app\mvc\store\index.html

                                     C:\datadrive\workspaces\Webstorm\gCloud\slot-cli\node_modules\slot-framework\designer.js:379
                                     .replace(RegExp("\r","g"), "@@SLR@
                                     ^
                                     TypeError: Cannot call method 'replace' of undefined
                                     at C:\datadrive\workspaces\Webstorm\gCloud\slot-cli\node_modules\slot-framework\designer.js:379:46
                                     at C:\datadrive\workspaces\Webstorm\gCloud\slot-cli\node_modules\mkdirp\index.js:38:26
                                     at Object.oncomplete (fs.js:107:15)
                                     */

                                }

                                tempTemplate = fs.readFileSync(path.join(__dirname, '/../templates/modelTemplate.txt'),'binary' /*'utf8'*/);
                                tempTemplate = tempTemplate
                                    //.replace("{@jsonModel@}",   JSON.stringify(slotModels, null, 4))
                                    .replace("{@objectsDef@}",  objs)
                                    .replace("{@layouts@}",     layouts)
                                ;
                                fs.writeFile(path.join(process.cwd(), modelFile), tempTemplate, function (err) {
                                    if (err) throw err;
                                    console.log('It\'s saved model for client side!');
                                });

                                tempTemplate = fs.readFileSync(path.join(__dirname, '/../templates/modelTemplateSrv.txt'),'binary' /*'utf8'*/);
                                tempTemplate = tempTemplate
                                    .replace("{@pc-machine@}",  os.hostname())
                                    .replace("{@date@}",        nowTimeStamp)
                                    .replace("{@message@}",     modelFileSrv.split(path.sep).pop() + ", this model holds the data structure for the web page")
                                    .replace("{@page@}",        uri)
                                    //.replace("{@jsonModel@}",   JSON.stringify(slotModels, null, 4))
                                    .replace("{@objectsDef@}",  objs)
                                    .replace("{@layouts@}",     layouts)
                                ;
                                fs.writeFile(path.join(process.cwd(), modelFileSrv), tempTemplate, function (err) {
                                    if (err) throw err;
                                    console.log('It\'s saved model for server side!');
                                });

                                console.log('Verifying pageView! %s', path.join(process.cwd(), viewFile));
                                //fs.exists(viewFile, function(flag) {
                                fs.exists(path.join(process.cwd(), viewFile), function(flag) {
                                    if(!flag){
                                        tempTemplate = fs.readFileSync(path.join(__dirname, '/../templates/viewTemplate.txt'),'binary' /*'utf8'*/);
                                        tempTemplate = tempTemplate
                                            .replace("{@pc-machine@}",  os.hostname())
                                            .replace("{@date@}",        nowTimeStamp)
                                            .replace("{@message@}",     viewFile.split(path.sep).pop() + ", this view was built to serve web page")
                                            .replace("{@page@}",        uri)
                                            .replace(RegExp("{@modulePath@}", "g"),  "./" + modelFileSrv.split(path.sep).pop())
                                        ;

                                        fs.writeFile(path.join(process.cwd(), viewFile), tempTemplate, function (err) {
                                            if (err) throw err;
                                            console.log('It\'s saved view file!');
                                        });
                                    }


                                    tempTemplate = fs.readFileSync(path.join(__dirname, '/../templates/pageModelTemplate.txt'),'binary' /*'utf8'*/);
                                    tempTemplate = tempTemplate
                                        .replace("{@pc-machine@}",  os.hostname())
                                        .replace("{@date@}",        nowTimeStamp)
                                        .replace(RegExp("{@modelFile@}", "g"),   modelFileSrv.split('\\').pop())
                                        .replace(RegExp("{@modelFileName@}", "g"),   modelFileSrv.split(path.sep).pop())
                                        .replace("{@content@}",     pageModel[uriBuildKey].join('\r'));
                                    ;
                                    fs.writeFile(path.join(process.cwd(), pageModelFile), tempTemplate, function (err) {
                                        if (err) throw err;
                                        console.log('It\'s saved page model file!');

                                        //console.log(tempTemplate);
                                    });
                                });
                            }
                        });
                    }
                    else {
                        console.log("Resource %s does not have a slot definition, no MVC objects will be created", filename)
                    }
                }
            }
        );
    }
);

function start(port) {
    // Load slot.json config file
    config.load(
        function(err) {
            console.log('Problems loading slot.json file, you must have this file: %s', err);
        },
        function(buffer) {
            //Save current process ID to pid.json file
            GruntTasks.create().handlePIDFile('designer', 'Designer Server', false/*verbose*/, function () {
                //port = port ? port : 2001;
                port || (port = 2001)
                http.createServer(app).listen(parseInt(port, 10));

                slotJson = buffer;
                fragments = slotJson.fragments;

                Util.startSplash("Designer", port, slotJson);
            })
        }
    )
}
/**
 * Export functions
 */
module.exports.start = start;