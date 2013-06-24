
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');

function contentTypeFor(path) {
  var ext = path.split('.')[1];
  switch(ext) {
  case 'css':
    return 'text/css';
  case 'js':
    return 'text/javascript';
  case 'html':
    return 'text/html';
  default:
    return 'application/octet-stream';
  }
}

function performSearch(query, callback) {
  http.request({
    hostname: 'localhost',
    port: 9200,
    path: '/docs/_search?size=100&fields=title,summary&q=' + encodeURIComponent(query)
  }, function(res) {
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() { callback(body); });
  }).end();
}

http.createServer(function(req, res) {

  var uri = url.parse(req.url);
  var md;
  if(uri.pathname == '/' || uri.pathname == '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('index.html'));
  } else if((md = uri.pathname.match(/^\/([^\.]+\.(?:js|css))$/))) {
    res.writeHead(200, { 'Content-Type': contentTypeFor(md[1]) });
    res.end(fs.readFileSync(md[1]));
  } else if(uri.pathname == '/search') {
    var params = qs.parse(uri.query);
    if(params && params.q) {

      performSearch(params.q, function(results) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(results);
      });

    } else {
      res.writeHead(400);
      res.end();
    }
  }

}).listen(8000);
