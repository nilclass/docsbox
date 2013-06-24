
var $ = document.getElementById.bind(document);

var TYPE_LABEL = {
  wp: "WIKIPEDIA",
  mdn: "MDN"
};

function renderResults(result) {
  var target = $('results');
  target.innerHTML = '';
  console.log('res', result);
  result.hits.hits.forEach(function(result) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.textContent = '[' + TYPE_LABEL[result._type] + '] ' + result.fields.title;
    li.appendChild(link);
    if(result.fields.summary) {
      var p = document.createElement('p');
      p.innerHTML = result.fields.summary;
      li.appendChild(p);
    }
    target.appendChild(li);
  });
}

function doSearch(query) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/search?q=' + encodeURIComponent(query || '*'));
  xhr.onload = function() {
    renderResults(JSON.parse(xhr.responseText));
  };
  xhr.send();
}

function setupSearchbox() {
  var searchbox = $('searchbox');
  var input = searchbox.children[0]
  var button = searchbox.children[1];
  input.onkeyup = function(evt) {
    if(evt.which == 13) {
      button.click();
    }
  }
  button.onclick = function(evt) {
    doSearch(input.value);
  };
}

window.onload = function() {
  setupSearchbox();
}

window.onkeyup = function(evt) {
  if(evt.which == 191 && evt.target.tagName != 'INPUT') {
    $('searchbox').children[0].select();
  }
}