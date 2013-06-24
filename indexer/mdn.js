
var fs = require('fs');
var http = require('http');

function indexPage(pageName) {
  var content = fs.readFileSync("mdn/" + pageName + ".html", 'UTF-8');
  var rawMetadata = fs.readFileSync("mdn/" + pageName + ".json", 'UTF-8');
  var metadata = JSON.parse(rawMetadata);
  metadata.content = content;

  var req = http.request({
    hostname: 'localhost',
    port: 9200,
    method: 'PUT',
    path: '/docs/mdn/' + pageName
  }, function(res) {
    console.log("PUT " + pageName + " -> " + res.statusCode);
  })

  req.write(JSON.stringify(metadata));
  req.end();
}

function indexMDN() {
  fs.readdirSync('mdn/').forEach(function(fname) {
    var md = fname.match(/^(.+)\.html$/)
    if(md) {
      indexPage(md[1]);
    }
  });
}

indexMDN();