if (location.get_query_param('mode') === '')
  window.location = location.set_query_param('mode', 'projections');

window.mode = 'projections';

window.project_title = "Tax and Fuel Development";

window.project_settings = {
  "ind": {
    "unique": false,
    "iparam": true,
    "preselect": ['gdp'],
  },

  "scn": {
    "unique": false,
    "preselect": ["base", "infr"],
    "max": 2,
  },

  "cnt": {
    "unique": true,
    "preselect": ["uga"],
  },
};

window.project_init = () => {
  console.log("Tax and Fuel Development");
};
