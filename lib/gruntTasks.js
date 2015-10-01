/**
 * Created by cecheverria on 3/14/15.
 */

var path = require("path"),
    fs = require('fs'),
    sortObj = require('sort-object'),
    async = require('async')
    ;

//Implement constructor
function GruntTasks() {

}
//Offer an easy way to instantiate this object
GruntTasks.create = function () { return new GruntTasks(); }

/**
 * Creates PID file to control start/Stop for the grunt tasks.
 *
 * If an instance is running, we need to stop that previous instance and then start the new
 * instance.
 *
 * Else case, we continue to start the new instance.
 *
 * @param callback
 */
GruntTasks.prototype.handlePIDFile = function(service, serviceName, verbose, callback) {
    var pidFile;

    if(fs.existsSync(path.join(process.cwd(), '.pid.json'))) {
        //PID file already exists
        pidFile = require(path.join(process.cwd(), '.pid.json'));

        //Kill the previous pid listed in the pid.json file
        if(pidFile[service] && pidFile[service].pid != process.pid)
            try {
                process.kill(pidFile[service].pid);
                verbose && console.log('Killing previous `pidFile.%s.pid`: %s success', service, pidFile[service].pid);
            }
            catch(e) {
                verbose && console.log('Problems killing previous `pidFile.%s.pid`: %s', service, pidFile[service].pid);
            }
    }
    else {
        //PID file does not exists
        pidFile = new Object();
    }

    verbose && console.log("Preparing to start '%s'", serviceName);

    pidFile[service] = { "pid" : process.pid, "exitCode" : -1 };
    updatePID(pidFile);


    callback();
    verbose && console.log("'%s' started on process pid %s", serviceName, process.pid);

    //Set event for shutdown hook
    process.on('beforeExit', function(code) {
        /**
         * TODO:
         *  1.  This event is not triggered when whole procces is shutted down. So, it's
         *      pending to fix this issue.
         */
            //console.log("Exit '%s' with code:", serviceName, code);

        pidFile[service] = { "pid" : 0, "exitCode" : exitCode };
        updatePID(pidFile);
    });
}

GruntTasks.prototype.buildPage = function(url, callbackEnd) {
    var http = require('http');
    var options = {
        host: '127.0.0.1',
        path: url,
        port :2001
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

GruntTasks.prototype.buildPageFromHtml = function (slot, usageMap, filePath) {

    var _this = this,
        url = path.join('/', filePath).replace(slot.framework.webRootDir, ''),
        fragments = [], index = 0;

    console.log('url: ' + url);

    //Loop over each attribute and take only the fragment kind.
    onEachAttribute(filePath,
        function(attributeName) {
            // Add only declared fragments
            if (slot.fragments[attributeName]) {
                fragments[index++] = attributeName;

                // Create fragment reference if does not exist
                !usageMap.fragment[attributeName] && (usageMap.fragment[attributeName] = {page: [], fragment: []});

                // Add relation beteewn fragment and page if it does not exists
                usageMap.fragment[attributeName].page.indexOf(url) < 0 && (usageMap.fragment[attributeName].page.push(url));
            }
        },
        function() {
            // Update used fragments on .usageMap.json file
            usageMap.page[url] = fragments.sort();
            usageMap.page = sortObj(usageMap.page);

            // Update the .usageMap file
            fs.writeFile('./.usageMap.json', JSON.stringify(usageMap, null, 4), function (err) {

                console.log('usageMap updated: ' + (err ? ' failed ' : 'success') + ' for ' + url);

                if (!err)
                    _this.buildPage(url, function(content) {
                        console.log('received content: ' + content.length + 'Kb');
                    });
            });
        }
    );
}

GruntTasks.prototype.buildPageFromMetaData = function (slot, usageMap, filePath) {

    var _this = this,
        url = path.join('/', filePath).replace(slot.framework.metaData, ''),
        fragments = [], index = 0;

    url = url.replace(".json", ".html");

    console.log('url: ' + url);

    //Loop over each attribute and take only the fragment kind.
    onEachAttribute(filePath,
        function(attributeName) {
            // Add only declared fragments
            if (slot.fragments[attributeName]) {
                fragments[index++] = attributeName;

                // Create fragment reference if does not exist
                !usageMap.fragment[attributeName] && (usageMap.fragment[attributeName] = {page: [], fragment: []});

                // Add relation beteewn fragment and page if it does not exists
                usageMap.fragment[attributeName].page.indexOf(url) < 0 && (usageMap.fragment[attributeName].page.push(url));
            }
        },
        function() {
            // Update used fragments on .usageMap.json file
            usageMap.page[url] = fragments.sort();
            usageMap.page = sortObj(usageMap.page);

            // Update the .usageMap file
            fs.writeFile('./.usageMap.json', JSON.stringify(usageMap, null, 4), function (err) {

                console.log('usageMap updated: ' + (err ? ' failed ' : 'success') + ' for ' + url);

                if (!err)
                    _this.buildPage(url, function(content) {
                        console.log('received content: ' + content.length + 'Kb');
                    });
            });
        }
    );
}

GruntTasks.prototype.buildFragmentFromHtml = function (slot, usageMap, filePath) {

    var _this = this,
        url = path.join('/', filePath).replace(slot.framework.fragmentRootDir, ''),
        fragmentName = url.split("/").pop().split(".")[0];

    console.log('fragment html: ' + fragmentName);

    // Add only declared fragments
    if (slot.fragments[fragmentName] && usageMap.fragment[fragmentName]) {

        async.eachSeries(usageMap.fragment[fragmentName].page, function( page, callback) {
            console.log('fragment: ' + fragmentName + ' - related page:' + page);

            setTimeout(function() {
                _this.buildPage(page, function(content) {
                    console.log('received content: ' + content.length + 'Kb - ' + (new Date()).getTime() );

                    callback();
                });
            }, 1000);

        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error, the processing will now stop.
                console.log('Building pages has failed');
            } else {
                console.log('All pages have been built successfully');
            }
        });
    }
}

GruntTasks.prototype.buildFromMetaData = function (slot, usageMap, filePath) {

    var _this = this,
        url = path.join('/', filePath).replace(slot.framework.fragmentRootDir, ''),
        fragmentName = url.split("/").pop().split(".")[0];

    console.log('fragment metaData: ' + fragmentName);

    // Add only declared fragments
    if (slot.fragments[fragmentName] && usageMap.fragment[fragmentName]) {

        async.eachSeries(usageMap.fragment[fragmentName].page, function( page, callback) {
            console.log('fragment: ' + fragmentName + ' - related page:' + page);

            setTimeout(function() {
                _this.buildPage(page, function(content) {
                    console.log('received content: ' + content.length + 'Kb - ' + (new Date()).getTime() );

                    callback();
                });
            }, 1000);

        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error, the processing will now stop.
                console.log('Building pages has failed');
            } else {
                console.log('All pages have been successfully built');
            }
        });
    }
    else {
        //It's not a fragment metaData, it's a web page metaData file
        /**
         * TODO:
         *  1.  Implement code to build pages from this point
         */
        _this.buildPageFromMetaData(slot, usageMap, filePath);
    }
}

GruntTasks.prototype.createUsageMap = function () {

    var usageMapPath = path.join(process.cwd(), './.usageMap.json');

    if(!fs.existsSync(usageMapPath)) {
        fs.writeFileSync(usageMapPath, JSON.stringify({page: {}, fragment: {}}, null, 4));
    }

    console.log('Creating UsageMap file completed..');
}

function updatePID(pidFile) {

    var err = fs.writeFileSync(path.join(process.cwd(), '.pid.json'), JSON.stringify(pidFile, null, 4));

    //console.log('PID File updated: ' + (err ? ' failed ' : 'success'));
}

function onEachAttribute(filePath, callback, afterLoop) {
    // Extract all fragment type attributes, using the regex ({@)[^\s]*(@})
    fs.readFile(filePath, 'binary', function(err, data) {

        var re = /({@)[^\s]*(@})/g; // Regex to find fragments used on this page
        var str = data;
        var m, attributeName, index = 0;

        while ((m = re.exec(str)) != null) {

            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            attributeName = m[0].replace("{@","").replace("@}","");
            console.log(attributeName);

            callback(attributeName);
        }

        afterLoop();
    });
}

module.exports = GruntTasks;
