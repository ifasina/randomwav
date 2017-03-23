//Libs to generate .wav file
var tone   = require('tonegenerator');
var wav    = require('wav');

//Libs to create http server and help with parsing
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

//Lib to help with POST/GET requests
var request = require('request');

//Lib to allow async functionality
var promise = require('es6-promise').Promise

//Helper function. Pass in url that you want to GET data from. 
//The thenable will contain the result of the GET
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

//HTTP Server port
var port = 8000;

http.createServer(function (req, res) {
  console.log(req.method, req.url);

  // parse URL
  var parsedUrl = url.parse(req.url);

  // extract URL path
  var pathname = `.${parsedUrl.pathname}`;

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

        //Because I'm using the simple http library I have to handle a lot of case manually.
        //This just makes it so that the GET isn't done twice when you're not requesting the
        //homepage. Not pretty...
        if (pathname != "./"){
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
        } else {
          res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
          res.end(data);
        }
      }
    });
  });
}).listen(parseInt(port));

console.log(`Server is running at http://localhost:${port} !`);


