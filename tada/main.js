(function() {
  requirejs.config({
    'baseUrl': '/tada/src',
    'paths': {
      'd3': "../../lib/d3",
      'jquery': "../../lib/jquery",
      'js-extras': "../../lib/js-extras",
      'location': "../../lib/location",
    }
  });

  var libs = [
    'jquery',
    'd3',
    'js-extras'
  ];

  var project = location.get_query_param('project');
  var mode = location.get_query_param('mode');

  var scripts = [
    'csv',
    'query',
    'sources',
    'utils',
    'views',
    'graph',
    'line',
    'area',
    'bar',
    'ui',
    'selection',
    'simulate',
    (project !== '' ? `/simulations/${project}/project.js` : undefined),
    (mode !== '' ? `/tada/src/modes/${mode}.js` : undefined),
  ];

  require(libs.concat(scripts), function($, d3) {
    window.d3 = d3;

    window.tada      = {};
    window.tada.dict = {};
    window.tada.data = {};

    if (window.project_title) {
      document.querySelector('#title').value = window.project_title;
      document.querySelector('title').innerHTML = window.project_title;
    }

    if (project === '') {
      view_sources();

      document.querySelector('#tables-picker').style.display = 'flex';
      document.querySelector('#parameters-picker').style.display = '';
    };

    simulate_run(project);
  });
}).call(this);
