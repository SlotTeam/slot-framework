
var slotfw = require('slot-framework'),
    path = require("path"),
    fs = require('fs'),
    mkdirp = require('mkdirp')
    ;

// Build project/folder name relative to user $HOME path
var project = 'CITest',
    working = '~/',
// working = process.cwd(),
    folder = path.join(working, project);
console.log('Build new project on: %s', working);
console.log('Starting  project on: %s', folder);


// describe('Create file system', function() {
//   // slotfw.Processio.nohup('slot', ['start', '-s'], './logs/designer.log');
// });

describe('Create a new Test Project', function() {
    it('must be created a project on '+folder, function(done) {
        slotfw.Processio.run('cd '+working+';' + 'rm -r '+project+'; ' + 'slot create '+project,
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Test Project created result: {err:%s}', error);
                expect(error).toBe(null);
                done();
            }
        );
    }, 20000);

    // it('should be created `logs` dir on '+folder, function(done) {

    //   // Wait for start is completed
    //   mkdirp(path.join(folder, 'logs'), function(err){
    //   // mkdirp(folder+'logs', function(err){
    //     console.log('`Logs` dir creation result: {err:%s}', err);
    //     expect(err).toBe(null);
    //     done();
    //   });
    // }, 3500);

    // console.log('Going to read slot.json file');

    it('slot.json file must be created on '+folder, function(done) {
        fs.readFile(/*path.join(folder, 'slot.json')*/ '/Users/cecheverria/CITest/slot.json', 'binary',
            function(err, buffer) {
                console.log((new Date()).getTime() + ': slot.json file read result: {err:%s, size:%s}', err, buffer.length);
                expect(err).toBe(null);
                done();
            }
        );
    });

    //
    // it('slot.json file must be created on ', function() {
    //   fs.readFile(/*path.join(folder, 'slot.json')*/ '/Users/cecheverria/CITest/slot.json', 'binary',
    //     function(err, buffer) {
    //       console.log('slot.json file read result: %s', err);
    //       expect(1).toBe(1);
    //       asyncSpecDone();
    //     }
    //   );
    //   asyncSpecWait();
    // });

    // it('should pass', function(done){
    //   console.log('should pass...');
    //   expect(1+2).toEqual(3);
    //   done();
    // });

});

describe('Starting Designer Server', function() {
    // slotfw.Processio.nohup('slot', ['start', '-s'], './logs/designer.log');
    it('should be started "Designer Server" on '+folder, function(done) {
        var err;
        // Starting Designer Server
        slotfw.Processio.run('cd '+folder+'; ' + ' slot start -m -s;',
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
        slotfw.Processio.run('cd '+folder+'; ' + ' slot start -w -s;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Automated Build Services started result: {err:%s}', error);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );

        // // Wait for start is completed
        // setTimeout(function(){
        //   expect(err).toBe(null);
        //   done();
        // }, 3000);
    }, 3500);
});


describe('Adding pages to the web app', function() {
    it('should be `dashboard` created on '+folder, function(done) {
        var err;
        // Starting Designer Server
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -p dashboard;',
            function(error, stdout, stderr) {
                console.log((new Date()).getTime() + ': Page `dashboard` creation result: {err:%s},', error);
                console.log('%s', stdout);
                err = error;
                //
                expect(err).toBe(null);
                done();
            }
        );
    }, 3500);

    it('should be `page2` created on '+folder, function(done) {
        var err;
        // Starting Designer Server
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -p page2;',
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
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -p pages/product;',
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
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -p pages/product/list;',
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
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -f ui/cardItem;',
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
        slotfw.Processio.run('cd '+folder+'; ' + ' slot add -f ui/gridItems;',
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
