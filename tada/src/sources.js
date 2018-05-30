function sources_format(sources, mode, opts) {
  switch (mode.type) {
  case "percent":
    var t = mode.target;
    var y = opts.y;

    return sources.map((s) => {
      return s.map((p,j) => {
        var o = Object.assign({}, p);

        if (p[y] === 0) v = 0;
        else v = 100 - (sources[t][j][y] / p[y] * 100);

        o[y] = v;

        return o;
      });
    });

  default:
    return sources;
  }
};

if (typeof global === 'undefined') global = window;

global.sources_format = sources_format;
