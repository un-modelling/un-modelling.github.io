if (location.get_query_param('mode') === '')
  window.location = location.set_query_param('mode', 'projections');

window.mode = 'projections';

window.project_title = "Tumarin 3G";

window.project_settings = {
  "ind": {
    "unique": false,
    "iparam": true,
    "preselect": ["GDPMP"]
  },

  "sim": {
    "unique": false,
    "preselect": ["base", "TumPriv-Dext"]
  },
};

window.project_callback = (scope, sources, selection) => {
  ui_load_line_graphs(
    sources,
    tada.f(null),
    { type: "normal" },
    scope
  );
};
