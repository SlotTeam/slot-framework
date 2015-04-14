
var path =      require('path'),
    fs =        require('fs'),
    fileio =    require('../lib/fileio')
    ;

// Build project/folder name relative to user $HOME path
var project = 'FileioTest',
    working = fileio.getUserHome(),
    folder = path.join(working, project);

console.log('Testing lib/fileio.js on: %s', folder);

describe('Create a new Test Project', function() {

    it('folder must be created on '+folder, function(done) {
        fileio.mkdirp(folder,
            function(result) {
                console.log((new Date()).getTime() + ': onError folder creation result: {result:%s}', result);
                expect(result).toBe(false);
                done();
            },
            function(result) {
                console.log((new Date()).getTime() + ': onSuccess folder creation result: {result:%s}', result);
                expect(result).toBe(true);
                done();
            }
        )
    });

    var fileToRead = path.join(process.cwd(), 'spec', 'fileio', 'fileioReadTest.txt'),
        content = null;
    //
    it(fileToRead + ' file must be read ', function(done) {

        fileio.readFile(fileToRead, 'binary',
            function(err, buffer) {
                console.log((new Date()).getTime() + ': fileioReadTest.txt file read result: {err:%s, size:%s}', err, (buffer ? buffer.length : 0));
                content = buffer;
                //
                expect(err).toBe(null);
                done();
            }
        )
    });

    it(fileToRead + ' content must be Ok ', function(done) {

        console.log((new Date()).getTime() + ': fileioReadTest.txt content: %s', content);
        expect(content).toBe("This is a read test for file.io.reaFile() function");
        done();
    });
});
