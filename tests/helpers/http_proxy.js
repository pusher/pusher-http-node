var http = require('http');
var url = require('url');

function start(callback) {
  var proxy = {}

  proxy.requests = 0;
  proxy.server = http.createServer(function(request, response) {
    proxy.requests += 1;

    var requestUrl = url.parse(request.url);
    var proxyRequest = http.request({
      hostname: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.path,
      method: request.method,
      headers: request.headers,
    });
    proxyRequest.addListener('response', function (proxyResponse) {
      proxyResponse.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxyResponse.addListener('end', function() {
        response.end();
      });
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    });
    request.addListener('data', function(chunk) {
      proxyRequest.write(chunk, 'binary');
    });
    request.addListener('end', function() {
      proxyRequest.end();
    });
  });

  proxy.server.listen(8321, callback);

  return proxy;
}

function stop(proxy, callback) {
  proxy.server.close();
  proxy.server.addListener("close", callback);
}

exports.start = start;
exports.stop = stop;
