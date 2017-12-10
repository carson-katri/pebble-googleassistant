var ajax = require('ajax');

var exports = module.exports = {};

exports.ask = function(query, callback) {
  // Make request to carsonkatri.com/ask
  var url = "http://YOURIPADDRESS/ask?query=" + encodeURIComponent(query);
  
  console.log(url);
  
  ajax({ url: url, type: 'jsonp' },
    function(response) {
      console.log(response);
      callback(response);
    }
  );
};
