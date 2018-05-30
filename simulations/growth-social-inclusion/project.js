window.project_title = "Growth and Social Inclusion";

window.project_settings = {
  "ind": {
    "unique": false,
    "iparam": true,
    "preselect": ["gdp", "u5m", "water", "emp-tot", "une-tot", "wag-base"]
  },

  "scn": {
    "unique": false,
    "preselect": ["base", "dx", "dxdt"]
  },

  "pol": {
    "unique": true,
    "preselect": ["pa"]
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
