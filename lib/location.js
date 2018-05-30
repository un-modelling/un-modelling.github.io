location.get_query_param = function(param) {
  var p, regex, results;
  p = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  regex = new RegExp("[\\?&]" + p + "=([^&#]*)");
  results = regex.exec(location.search);
  if (results === null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
};

location.set_query_param = function(key, value) {
  var re, separator, uri;
  uri = location.search;
  re = new RegExp("([?&])" + key + "=.*?(&|$)", 'i');
  separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    if (value === null) {
      return uri.replace(re, '$2');
    } else {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
  } else {
    return ("" + uri) + (value != null ? "" + separator + key + "=" + value : "");
  }
};
