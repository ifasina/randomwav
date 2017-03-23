var tone   = require('tonegenerator');
var wav    = require('wav');
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var request = require('request');
var promise = require('es6-promise').Promise

//Helper func
var httpGET = function(url){
    return new promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if (!error) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = 8000;

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  // parse URL
  const parsedUrl = url.parse(req.url);
  // extract URL path
  let pathname = `.${parsedUrl.pathname}`;
  // maps file extention to MIME types
  const mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav'
  };
  fs.exists(pathname, function (exist) {
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }
    // if is a directory, then look for index.html
    if (fs.statSync(pathname).isDirectory()) {
      pathname += 'public/views/index.html';
    }
    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // if the file is found, set Content-type and send data

        //Get the random number then use it to generate .wav
        httpGET("https://www.random.org/integers?format=plain&num=1&min=100&max=700&col=1&base=10")
        .then((x) =>{
            console.log(x);
            var writer = new wav.FileWriter('public/sounds/random.wav');
            writer.write(new Buffer(tone(x, 3))); // xHz for 5 seconds
            writer.end();
            res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
            res.end(data);
        })
        .catch((e) =>{
            console.log(e);
            res.end("Error");
        });
      }
    });
  });
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);


