window.project_title = "CLEWS Uganda";

window.project_settings = {
  "indicator": {
    "unique": false,
    "iparam": true,
    "preselect": ["_IRR_Sugarcane", "Area_IRR"]
  },

  "gw": {
    "unique": true,
    "preselect": [100]
  },

  "sw": {
    "unique": true,
    "preselect": [20]
  },

  "climate": {
    "unique": false,
    "preselect": [0]
  },

  "demand": {
    "unique": false,
    "preselect": ["HIGH"]
  },
};

window.project_extra_graphs = ['Area_IRR', '_IRR_Sugarcane'];

window.project_callback = (scope, sources, selection) => {
  var rs = ['^Area_IRR', '(Sugar|BAGG)_IRR_Sugarcane$'];

  ui_clear_graphs(scope, 'area-diff');

  project_extra_graphs.forEach((bid, i) => {
    var regexp, s, dg;

    regexp = new RegExp(rs[i]);

    if (!selection_graphs_list().includes(bid)) return;

    s = sources.results
      .filter((i) => i.id.match(regexp))
      .map((r) => query_descriptive_objects(r, tada.data.domain));

    dg = line_diff_draw({
      id: bid,
      namespace: `${scope}-${bid}`,
      container: `#${scope}-svgs`,
      domain: tada.data.domain,
      colors: d3.schemeCategory10,
      x: 'time',
      y: 'value',
      sources: s,
      x_tick: null,
      y_tick: d3.formatPrefix(",.0", 1e3)
    });

    graph_set_title(dg.container, tada.dict[bid]);
    graph_add_controls(dg.id, dg.container, s);
  });

  ui_load_line_graphs(
    sources,
    tada.f(null),
    { type: "normal" },
    scope
  );
};
