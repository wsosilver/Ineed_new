#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var inputFolder = path.join(__dirname, '../', 'resources/android/push_icon/');
var outputFolder = path.join(__dirname, '../', '/platforms/android/res/');

console.log('------------------------------------------------------------------------------------------');
console.log("Running cordova hook");
console.log('------------------------------------------------------------------------------------------');

fs.readdir(inputFolder, '', function(err, list) {
    list.forEach(function(file){
        if (file.indexOf('drawable') === 0) {            
            var destFolder = file.replace('-push-icon.png','');
            
            if(!fs.existsSync(outputFolder + destFolder))
                fs.mkdirSync(outputFolder + destFolder);

            fs.createReadStream(inputFolder+file)
                .pipe(fs.createWriteStream(outputFolder + destFolder + '/notification.png'));

            console.log('# ' + file + ' --> ' + destFolder);
        }
    });

    console.log('-----------------------------------------------------------------------------------------');
});