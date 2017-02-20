/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var messages = [];
var requestHandler = function(request, response) {
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
  
  request
  .on('data', function(chunk) {
    console.log('on data');
    body.push(chunk);
    console.log('-------->', method);
  })
  .on('end', function() {
    if (method === 'POST') {
      console.log('on end: post');
      body = Buffer.concat(body).toString();
      response.statusCode = 201;
    } else {
      console.log('on end: get');
      response.statusCode = 200;
      response.results = [];
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
      results: messages
    };

      // Make sure to always call response.end() - Node may not send
      // anything back to the client until you do. The string you pass to
      // response.end() will be the body of the response - i.e. what shows
      // up in the browser.
      
      // Calling .end "flushes" the response's internal buffer, forcing
      // node to actually send all the data over to the client.
    console.log('on end');
    response.end(JSON.stringify(responseBody));
  });

  request.on('error', function(err) {
  // This prints the error message and stack trace to `stderr`.
    response.statusCode = 400;
    console.error(err.stack);
  });


  response.on('error', function(err) {
    console.log(err.stack);
  });

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

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

exports.handleRequest = requestHandler;
