/*
 * Take a CSV file and check that it's "healthy"
 */

function csv_healthy_dictionary(stream) {
  var rows = stream.split("\n").map((r) => r.trim().split(","));

  if (rows.last()[0] === "") rows.pop();

  var left_column  = rows.map((r) => r[0]);
  var right_column = rows.map((r) => r[1]);
  var other_column = rows.map((r) => r[2]);

  var diagnostics = [];

  if (left_column.length !== right_column.length)
    return [{ row: -1, problems: [`The columns do not have the same length! <br>Left column has '${ left_column.length }' rows and the right one has '${ right_column.length } rows.`], healthy: false }];

  var lengths = rows.map((r) => r.length).unique();

  if (lengths.length !== 1 || ![2,3].includes(lengths[0]))
    return [{ row: -1, problems: [`A dictionary file should have two or three columns, but these are the different row lengths: ${ lengths.join(',') }. <br>Maybe you gave the wrong file?`], healthy: false }];

  var r0 = {
    row: 1,
    problems: [],
    healthy: true
  }

  if (left_column[0] !== "variable") {
    r0.problems.push(`'${ left_column[0] }' should be renamed to 'variable'.`);
    r0.healty = false;
  }

  if (right_column[0] !== "expanded") {
    r0.problems.push(`'${ right_column[0] }' should be renamed to 'expanded'.`);
    r0.healty = false;
  }

  if (other_column[0] && other_column[0] !== "category") {
    r0.problems.push(`'${ other_column[0] }' should be renamed to 'category'.`);
    r0.healty = false;
  }

  diagnostics.push(r0);

  for (var i = 1; i < left_column.length; i++) {
    var target = left_column[i];
    var counterpart = right_column[i];
    var category = other_column[i];

    var rn = {
      row: i + 1,
      problems: [],
      value: target,
      healthy: true
    };

    if (target.match(/\s/) !== null)
      rn.problems.push(`Variable '${ target }' name has spaces in it.`)

    if (rn.problems.length > 0) rn.healthy = false;

    diagnostics.push(rn);
  };

  return diagnostics;
};

function csv_healthy_data(stream) {
  var rows = stream.split("\n").map((r) => r.trim().split(","));
  var headers = rows.shift();
  var params = [];
  var domain = [];

  var diagnostics = [];

  if (rows.last()[0] === "") rows.pop();

  var count = 0;
  rows.forEach((r) => {r.contains("") && count++});
  if (count) diagnostics.push(["Trailing spaces:", `${ count } rows have trailing empty entries.`]);

  if (headers.unique().length !== headers.length) {
    var d = ["The headers of the data file are NOT unique!"]

    var counts = {};
    headers.forEach((x) => { counts[x] = (counts[x] || 0) + 1 });

    for (var k of Object.keys(counts))
      if (counts[k] > 1) d.push(`The header '${ k }' is repeated ${ counts[k] } times.`);

    diagnostics.push(d);
  }

  if (rows.map((r) => r.count()).unique().length !== 1) {
    var d = ["Uneven table! Some rows have different lengths."];

    var counts = {};
    rows.forEach((r) => counts[r.length] = (counts[r.length] || 0) + 1);

    for (var k of Object.keys(counts))
      if (counts[k] > 0) d.push(`${ counts[k] } column(s) have length ${ k }.`);

    diagnostics.push(d);
  }

  return diagnostics;
};

/*
 * Take a CSV data file and output a Table:
 *   domain:
 *   params:
 *   rows:
 *   headers:
 */

function csv_to_table(stream) {
  if (!stream) throw TypeError("No stream to parse!");

  var rows = stream.split("\n").map((r) => r.trim().split(","));
  var params = [];
  var domain = [];

  var headers = rows.shift().map((e) => {
    var d;
    var m;

    if (m = e.match(/^[0-9]{4}$/))
      d = new Date(e, 0, 1);
    else if (m = e.match(/^([0-9]{1,4}).([0-9]{2}).([0-9]{2})$/))
      d = new Date(m[0], m[1], m[2]);
    else if (m = e.match(/^([0-9]{2}).([0-9]{2}).([0-9]{1-4})$/))
      d = new Date(m[2], m[1], m[0]);

    var i = parseInt(e);

    if (!d && isNaN(i)) {
      params.push(e);
      return e;
    }

    else if (!d && !isNaN(i)) {
      domain.push(i);
      return i;
    }

    else {
      domain.push(d);
      return d;
    }
  });

  rows = rows.map((r) => {
    return r.map((e) => {
      var i = parseFloat(e);

      if (isNaN(i)) return e;
      else return i;
    });
  });

  if (rows.last()[0] === "") rows.pop();
  if (rows.map((r) => r.count()).unique().length !== 1) throw Error("Uneven table!");

  return {
    rows:   rows,
    params: params,
    headers: headers,
    domain: domain
  };
};

/*
 * Take two CSV files: a data file and a dictionary file.
 *
 * Check that the dictionary has all the values from the data file
 * have "human translation".
 */

function csv_sane_dictionary(dict, data) {
  var keys = dict.rows.map((r) => r[0]);

  var diagnostics = [];

  data.params.forEach((v) => {
    if (typeof v === 'string' && keys.indexOf(v) < 0)
      diagnostics.push([v + " is not in the dictionary."]);
  });

  var values = ([].concat.apply([], data.rows.map((r) => r.slice(0, data.params.length)))).unique();
  values.forEach((v) => {
    if (typeof v === 'string' && keys.indexOf(v) < 0)
      diagnostics.push([v, "is not in the dictionary."]);
  });

  if (diagnostics.length === 0) return true;

  return diagnostics;
};

if (typeof global === 'undefined') global = window;

global.csv_to_table = csv_to_table;
global.csv_sane_dictionary = csv_sane_dictionary;
global.csv_healthy_dictionary = csv_healthy_dictionary;
global.csv_healthy_data = csv_healthy_data;
