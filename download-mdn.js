var https = require('https');
var url = require('url');
var sax = require('sax');
var fs = require('fs');

var indexParser = sax.parser();

var inDocuments = false;

indexParser.onopentag = function(node) {
  if(node.name === 'UL' && node.attributes.CLASS && node.attributes.CLASS == "documents cols-3") {
    inDocuments = true;
  } else if(node.name === 'A') {
    if(inDocuments) {
      var pageName = node.attributes.HREF.replace(/\/en-US\/docs\//, '');
      var page;
      https.request(
        url.parse("https://developer.mozilla.org/en-US/docs/" + pageName + "$json"),
        function(res) {
          if(res.statusCode === 200) {
            var metadataBody = '';
            res.on('data', function(chunk) { metadataBody += chunk });
            res.on('end', function() {
              var fname = pageName.replace(/\//g, '__');
              fs.writeFileSync("mdn/" + fname + ".json", metadataBody);
              https.request(
                url.parse("https://developer.mozilla.org/en-US/docs/" + pageName + "?raw&macros"),
                function(rawRes) {
                  if(rawRes.statusCode === 200) {
                    var rawBody = '';
                    rawRes.on('data', function(chunk) { rawBody += chunk; });
                    rawRes.on('end', function() {
                      fs.writeFileSync('mdn/' + fname + '.html', rawBody);
                      console.log("Got page: " + pageName);
                    });
                  } else {
                    console.error("Retrieving raw data for page \"" + pageName + "\" failed (status: " + rawRes.statusCode);
                  }
                }
              ).end();
            });
          } else {
            console.error("Retrieving metadata for page \"" + pageName + "\" failed (status: " + res.statusCode);
          }
        }
      ).end();
    }
  }
};

indexParser.onclosetag = function(name) {
  if(inDocuments && name === 'UL') {
    inDocuments = false;
  }
};

function loadIndexPage(page, callback) {
  console.log('LOAD INDEX PAGE ' + page);
  https.request(
    url.parse("https://developer.mozilla.org/en-US/docs/all?page=" + (page || 1)),
    function(res) {
      if(res.statusCode === 200) {
        res.on('data', function(data) {
          indexParser.write(data.toString());
        });
        res.on('end', function() {
          loadIndexPage(page + 1, callback);
        });
      } else if(res.statusCode === 404) {
        callback();
      } else {
        console.error("Request failed: ", res.statusCode);
      }
    }
  ).end();
}

loadIndexPage(1);
