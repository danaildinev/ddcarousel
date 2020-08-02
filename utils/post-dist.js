// Example Node.js program to append data to file
const fs = require('fs'),
    readJson = require('read-package-json');

var license;

const targetFiles = [
    './dist/ddcarousel.js',
    './dist/ddcarousel.min.js',
    './dist/ddcarousel.min.css',
];

//read some values from package.json
readJson('./package.json', console.error, false, function (er, data) {
    if (er) {
        console.error("There was an error reading " + data)
        return
    }
    license = "/* " + data["name"] + " " + data["version"] + " | " + data["author"]["name"] + " | License: " + data["license"]["url"] + " */\r\n";

    //write license info on the top of target files
    targetFiles.forEach(file => {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) throw err;
            fs.writeFile(file, license + data, 'utf8', function (err) {
                if (err) throw err;
                // if no error
                console.log("\x1b[32m", "License is appended to " + file + " successfully 😊")
            });
        });
    });
});

