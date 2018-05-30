var current_time = 0;

Array.prototype.sort_like = function(array,p) {
  if (!array || !array.length) return this;

  var it = this;

  return this.sort(function(x,y) {
    if (p)
      return (array.indexOf(p(x)) > -1 ? array.indexOf(p(x)) : it.length) - (array.indexOf(p(y)) > -1 ? array.indexOf(p(y)) : it.length);
    else
      return (array.indexOf(x) > -1 ? array.indexOf(x) : it.length) - (array.indexOf(y) > -1 ? array.indexOf(y) : it.length);
  });
};

Object.defineProperty(Object.prototype, 'similar', {
  enumerable: false,
  value: function(o,e) {
    var ks = Object.keys(this);

    for (var i = 0; i < ks.length; i++) {
      var k = ks[i];

      if (this[k] === o[k]) continue;
      else if (e && k === e) continue;
      else return false;
    }

    return true;
  }
});

function projections_draw(h, sources) {
  var qpo = query_params_options(tada.data);
  var params = Object.keys(qpo);
  var q = sources['query'];
  var scope = 'reference';

  var f, fp, x;
  f = query_generate(tada.data, params);

  ui_clear_graphs(scope, 'bar');

  for (var j = 0; j < params.length; j++) {
    fp = qpo[params[j]];
    args = [];

    for (var k = 0; k < params.length; k++) {
      if (k === j) args[k] = fp;
      else args[k] = (q[params[k]] || selection_graphs_list());
    }

    var _data = f(...args);

    var yp = tada.data.domain[h];

    var dub = null;

    var q_keys = Object.keys(q);

    for (var i = 0; i < q_keys.length; i++) {
      if (q[q_keys[i]].length === 2) {
        dub = q_keys[i];
        break;
      }
    }

    if (dub === null) {
      modal_show('selection');
      return;
    }

    var _base = _data.results.filter((x) => x['query'][dub] === q[dub][0]);

    var data = (dub === params[j]) ?
        _data.results :
        _data.results.filter((x) => x['query'][dub] !== q[dub][0]);

    data.forEach((t) => {
      var b = _base.find((u) => u['query'].similar(t['query'], dub));

      t['dv'] = ((t[yp] - b[yp]) / b[yp]) * 100;
    });

    var max = Math.max.apply(null, data.map((x) => x['dv']));
    var min = Math.min.apply(null, data.map((x) => x['dv']));

    var m = Math.max(Math.abs(max), Math.abs(min));

    data = data.sort_like(fp, (t) => t['query'][dub]);

    var qpj = (q[params[j]] ? (q[params[j]][1] ? q[params[j]][1] : q[params[j]][0]) : selection_graphs_list()[0]);

    var colors = fp.map((i) => 'rgba(0,0,0,0.4)');
    colors[data.map((x) => x['query'][params[j]]).indexOf(qpj)] = 'rgba(31,119,180,0.6)';

    var bg = bar_draw({
      id: params[j],
      scope: scope,
      container: `#${scope}-svgs`,
      domain: fp,
      y: 'dv',
      range: [-m, m],
      sources: data,
      colors: colors,
      y_tick: (d) => d + "%",
      click: (d,id) => {
        var cs = _checkboxes(null, id, d['query'][id], null, () => {});
        cs.forEach((c) => _checkbox_set(c, true));

        sources.query[id] = [d['query'][id]];

        projections_draw(current_time, sources);
      }
    });

    graph_set_title(bg.container, (tada.dict[params[j]] || params[j]));
    graph_add_controls(bg.id, bg.container, sources.results);
  }
};

window.project_callback = (scope, sources, selection) => {
  var lg = line_diff_draw({
    id: 'area-diff',
    scope: scope,
    namespace: 'area-diff',
    container: `#${scope}-svgs`,
    domain: tada.data.domain,
    colors: d3.schemeCategory10,
    x: 'time',
    y: 'value',
    mouse_move: (d,i) => {
      var h = tada.data.domain.indexOf(d['time']);
      if (current_time === h) return;

      projections_draw((current_time = h), sources);
    },
    sources: sources
      .results
      .filter((i) => i.id === selection_graphs_list()[0])
      .map((r) => query_descriptive_objects(r, tada.data.domain)),
  });

  var t = selection_graphs_list()[0];

  if (lg) {
    graph_set_title(lg.container, (tada.dict[t] || t) + ` | diff ${selection[0].join(' - ')}`);
    graph_add_controls(lg.id, lg.container, sources.results);

    projections_draw(current_time, sources);
  }
};

window.mode_init = () => {
  document.querySelector('#sidebar li:nth-of-type(3)').remove();

  var l = document.querySelectorAll('#graphs-list input');
  for (var i = 0; i < l.length; i++)
    l[i].setAttribute('type', 'radio');
};
