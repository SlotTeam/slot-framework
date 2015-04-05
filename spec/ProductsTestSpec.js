
var path = require("path"),
    fs = require('fs'),
    processio = require('../lib/processio'),
    request = require('request'),
    minify = require('html-minifier').minify
    ;

// Build project/folder name relative to user $HOME path
var project = 'CITest',
    working = '~/',
    //working = process.cwd(),
    folder = path.join(working, project);
console.log('Build new project on: %s', working);
console.log('Starting  project on: %s', folder);


describe('Create a new Test Project', function() {
    it('must be created a project on '+folder, function(done) {
        processio.run('cd '+working+';' + 'rm -r '+project+'; ' + 'slot create '+project,
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Test Project created result: {err:%s}', error);
                expect(error).toBe(null);
                done();
            }
        );
    }, 20000);

    it('slot.json file must be created on '+folder, function(done) {
        fs.readFile(/*path.join(folder, 'slot.json')*/ '/Users/cecheverria/CITest/slot.json', 'binary',
            function(err, buffer) {
                console.log((new Date()).getTime() + ': slot.json file read result: {err:%s, size:%s}', err, buffer.length);
                expect(err).toBe(null);
                done();
            }
        );
    });
});

describe('Starting Designer Server', function() {
    // processio.nohup('slot', ['start', '-s'], './logs/designer.log');
    it('should be started "Designer Server" on '+folder, function(done) {
        var err;
        // Starting Designer Server
        processio.run('cd '+folder+'; ' + ' slot start -m -s;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Server started result: {err:%s}', error);
                err = error;
            }
        );

        // Wait for start is completed
        setTimeout(function(){
            expect(err).toBe(null);
            done();
        }, 3000);
    }, 3500);
});


describe('Starting Automated Build Services', function() {
    it('should be started "Automated Build Services" on '+folder, function(done) {
        var err;
        // Starting Designer Server
        processio.run('cd '+folder+'; ' + ' slot start -w -s;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Automated Build Services started result: {err:%s}', error);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);
});


describe('Adding pages to the web app', function() {
    it('`dashboard` page should be created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -p dashboard;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': `dashboard` page creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);
    //
    var _body;
    it('`dashboard` page should be served as `http://localhost:2001/dashboard.html`', function(done) {

        request("http://localhost:2001/dashboard.html", function(error, response, body){
            console.log((new Date()).getTime() + ': `dashboard` page request result: {err:%s, response:%s},', error, response.statusCode);
            console.log('%s', body);
            //
            _body = body;

            expect(!error && response.statusCode == 200).toBe(true);
            done();
        });
    }, 3500);
    //
    it('`dashboard` page should be rendered as expected', function(done) {

        var result = minify(_body/*'<p title="blah" id="moo">foo</p>'*/, {
            //removeAttributeQuotes: true
            removeComments: true,
            collapseWhitespace: true,
            removeEmptyElements: true
        });

        console.log('%s', result);
        expect(result).toBe('<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title>dashboard page</title></head><body><div>Welcome to dashboard page</div></body></html>');
        done();

    }, 3500);


    it('should be `page2` created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -p page2;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `page2` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);



    it('should be `pages/product` created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -p pages/product;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `pages/product` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);

    it('should be `pages/product/list` created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -p pages/product/list;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `pages/product/list  ` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);
});


describe('Adding fragments to the web app', function() {
    it('should be `ui/cardItem` created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -f ui/cardItem;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `ui/cardItem` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);

    it('should be `ui/gridItems` created on '+folder, function(done) {
        var err;
        processio.run('cd '+folder+'; ' + ' slot add -f ui/gridItems;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `ui/gridItems` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);
});
