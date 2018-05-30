/*
 * Generate (curry) a querying function from the table. THIS is the
 * cool part of this whole project.
 *
 * The function is self-documenting to the best of it's abilities.
 */

function query_generate(table, args) {
  return function(...fargs) {
    var params = table.params;
    var domain = table.domain;
    var rows   = table.rows;

    var i_param = params.difference(args)[0];

    if (arguments[0] === null) return i_param;
    if (arguments[0] === undefined) return args;

    // Calling with 'Infinity' is only for self-documentation purposes.
    // TODO: consider removing it.
    //
    if (arguments[0] === Infinity) {
      var tvs = query_params_options(table);

      var str = "";
      for (var k in tvs) {
        if (args.includes(k))
          str += `${ k }: [${ tvs[k] }]\n`;
      }

      console.warn(`This functions is called like this: tada.f(${ args }). Where ${ args } can be subarrays of: \n${ str }`);

      return args;
    }

    if (fargs.length !== args.length) {
      console.log("If you want a description on the arguments run tada.f(Infinity)");
      throw RangeError('Wrong number of arguments.');
    }

    var query = {};
    args.forEach((a,i) => query[a] = fargs[i]);

    var ip = params.indexOf(i_param);

    /*
     * This is the magic part:
     *
     * filter -> reduce
     *
     * Whatever curried function this is, it got some arguments
     * 'fargs' which are arrays containing values that have to be
     * matched with a column.
     *
     * r[params.indexOf(c)] is the row value to be matched against
     * each 'fargs' which is an ordered subset of 'args'.
     *
     * the 'map' is, strictly speaking, for aethetics and consumption.
     * TODO: consider delegating map 'ahead'.
     */

    var results = rows
      .filter((r) => args.reduce((p, c, i) => p && fargs[i].includes(r[params.indexOf(c)]), true))

      .map((r) => {
        var o = { id: r[ip] };
        domain.forEach((k) => o[k] = r[params.length + domain.indexOf(k)]);

        o.query = {};
        params.forEach((a,i) => o.query[params[i]] = r[params.indexOf(a)]);

        return o;
      });

    return {
      i_param: i_param,
      query: query,
      results: results
    }
  };
};

/*
 * Fetch an object that shows the parameters and their options in a query
 */

function query_params_options(table) {
  var o = {};
  table.params.forEach((qv) => o[qv] = (table.rows.map((r) => r[table.params.indexOf(qv)])).unique());
  return o;
};

/*
 * Turn an object into a redundant array given an iterator.
 * TODO: we really don't like this one (year is smelly)
 */

function query_descriptive_objects(obj, iter) {
  return iter.map((y) => {
    return {
      id: obj.id,
      query: obj.query,
      time: y,
      value: parseFloat(obj[y])
    }
  });
};

if (typeof global === 'undefined') global = window;

global.query_params_options = query_params_options;
global.query_generate = query_generate;
global.query_descriptive_objects = query_descriptive_objects;
