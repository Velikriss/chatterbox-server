/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');



var messages = [];
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, ',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {

  fs.readFile('../client/scripts/app.js', function(err, fd) {
    if (err) {
      response.writeHead(500); response.end('Server Error!');
      return;
    }
  
    var headers = {'Content-type': 'text/javascript'}; 
    response.writeHead(headers);
    // console.log(fd);
    // response.end(fd);
    response.pipe(request);
  });
    // Request and Response come from node's http module.
    //
    // They include information about both the incoming request, such as
    // headers and URL, and about the outgoing response, such as its status
    // and content.
    //
    // Documentation for both request and response can be found in the HTTP section at
    // http://nodejs.org/documentation/api/

    // Do some basic logging.
    //
    // Adding more logging to your server can be an easy way to get passive
    // debugging help, but you should always be careful about leaving stray
    // console.logs in your code.

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var method = request.method;
  var url = request.url;
  var nodeHeaders = request.headers;

  var body = [];
  
  if (request.method === 'OPTIONS') {
    console.log('!OPTIONS');
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    response.writeHead(200, headers);
    response.end();
  } else {

    request.on('data', function(chunk) {
      console.log(chunk);
      body.push(chunk);
    });
    request.on('end', function() {
      if (url !== '/classes/messages' && url !== '/classes/room') {
        response.statusCode = 404;
      } else if (method === 'POST') {
        //body = Buffer.concat(body).toString();
        var message = JSON.parse(body);
        message.createdAt = new Date();
        message.updatedAt = new Date();
        if (message.roomname === undefined) {
          message.roomname = 'lobby';
        }
        message.objectId = messages.length; 

        messages.push(message);
        response.statusCode = 201;
      } else {
        response.statusCode = 200;
        // at this point, `body` has the entire request body stored in it as a string
      }

       // See the note below about CORS headers.
      var headers = defaultCorsHeaders;

        // Tell the client we are sending them plain text.
        //
        // You will need to change this if you are sending something
        // other than plain text, like JSON or HTML.

      headers['Content-Type'] = 'application/json';

        // .writeHead() writes to the request line and headers of the response,
        // which includes the status and all headers.

      response.writeHead(response.statusCode, headers);

      var responseBody = {
        headers: headers,
        method: method,
        url: url,
        body: body,
        results: messages,
      };

        // Make sure to always call response.end() - Node may not send
        // anything back to the client until you do. The string you pass to
        // response.end() will be the body of the response - i.e. what shows
        // up in the browser.
        
        // Calling .end "flushes" the response's internal buffer, forcing
        // node to actually send all the data over to the client.
      response.end(JSON.stringify(responseBody));
    });
  }

  request.on('error', function(err) {
  // This prints the error message and stack trace to `stderr`.
    response.statusCode = 400;
    console.error(err.stack);
  });


  /*response.on('error', function(err) {
    console.log(err.stack);
  });
*/
};

  // These headers will allow Cross-Origin Resource Sharing (CORS).
  // This code allows this server to talk to websites that
  // are on different domains, for instance, your chat client.
  //
  // Your chat client is running from a url like file://your/chat/client/index.html,
  // which is considered a different domain.
  //
  // Another way to get around this restriction is to serve you chat
  // client from this domain by setting up static file serving.



exports.requestHandler = requestHandler;
