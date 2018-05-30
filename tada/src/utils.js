function _read_file(event, callback) {
  var file = event.target.files[0];

  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (e) => callback(e.target.result);
    reader.onerror = (e) => alert("Error reading file");
  }
};

function _fake_download(string, filename, datatype) {
  var a = document.createElement('a');
  document.body.appendChild(a);

  a.style = "display:none;";

  var blob = new Blob([string], {
    type: datatype
  });

  var url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
};

function _dictionary_html_table(dict, colors) {
  var str = "<table>";

  Object.keys(dict).reverse().forEach((k,i) => {
    var color_td = '';
    if (colors)
      color_td = `<td class="color_td" style="background-color: ${colors[k]}"></td>`

    if (dict[k] instanceof Date) dict[k] = dict[k].getFullYear();

    str += `
<tr>
  ${color_td}
  <td>${ k }</td>
  <td><b>${ dict[k] }</b></td>
</tr>
    `;
  });

  str += "</table>";

  return str;
}

function _objects_compare(a,b) {
  var o = {};

  Object.keys(a).forEach((k) => {
    if (a[k] !== b[k])
      o[k] = `${ a[k] } - ${ b[k] }`;
  });

  return o;
};

function _tmpl(source, destination, ...args) {
  var s = document.querySelector(`template[bind="${ source }"]`);
  var d;

  if (destination instanceof HTMLElement)
    d = destination;

  else if (typeof destination === 'string')
    d = document.getElementById(destination);

  if (!s) throw(`TMPL: source '${ source }' element nowhere to be found.`);
  if (!d) throw(`TMPL: destination '${ destination }' element nowhere to be found.`);

  var r = String.prototype.format.call(s.innerHTML, ...args);

  var x = document.createElement('span');
  x.innerHTML = r;

  if (x.childNodes.length > 3) {
    console.error(x.childNodes);
    throw `childNodes length should be 1 (3).`;
  }

  var t = x.childNodes[1];

  if (typeof destination === 'string' ||
      destination instanceof HTMLElement) {
    d.appendChild(t);
  }

  return t;
};

function _truthy(v) {
  return !_falsy(v);
};

function _falsy(v) {
  return (v === null || v === undefined || v === false);
};

function _checkboxes(scope, bind, value, checked) {
  var query_str = `.value-selector`;

  if (_truthy(scope))   query_str  = `#${ scope } ${ query_str }`;
  if (_truthy(bind))    query_str += `[bind="${ bind }"]`;
  if (_truthy(value))   query_str += `[value="${ value }"]`;
  if (_truthy(checked)) query_str += `:checked`;

  return document.querySelectorAll(query_str);
};

function _checkboxes_loop(scope, bind, value, checked, callback) {
  return [].map.call(_checkboxes(...arguments), callback);
};

function _checkbox_set(c, state) {
  c.checked = state;
  c.dispatchEvent(new Event('change'));
};

function _offset(el) {
	var rect = el.getBoundingClientRect(),
	    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
	    scrollTop = window.pageYOffset || document.documentElement.scrollTop;

	return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}
