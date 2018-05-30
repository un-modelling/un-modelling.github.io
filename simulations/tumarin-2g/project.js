window.project_title = "Tumarin 2G";

window.project_settings = {
  "ind": {
    "unique": false,
    "iparam": true,
    "preselect": []
  },

  "sim": {
    "unique": false,
    "preselect": []
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
