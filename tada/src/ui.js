ui_scopes = ['reference'];

current_percent = false;

function ui_toggle_compare_mode() {
  if (ui_scopes.length > 1) ui_normal_mode();
  else ui_compare_mode();
};

function ui_normal_mode() {
  document.querySelectorAll('.alternative-scope')
    .forEach((x) => x.remove());

  document.querySelector(`#alternative-selectors-list`)
    .innerHTML = "";

  document.querySelectorAll('.in-compare-mode')
    .forEach((x) => x.style.display = 'none');

  ui_scopes.pop();
};

function ui_load_mode(name) {
  var q = query_params_options(tada.data);
  for (var v in q)
    if (v !== tada.f(null))
      selection_add_menu(name, v, q[v]);

  selection_setup_interactions(name);
};

function ui_compare_mode() {
  var scope = 'alternative';

  _tmpl('scope-column', 'panes-container', scope, scope.capitalise());

  ui_load_mode(scope);

  selection_clone('reference', scope);

  document.querySelectorAll('.in-compare-mode')
    .forEach((x) => x.style.display = 'block');

  ui_scopes.push(scope);
};

function ui_load_line_graphs(sources, i_param, mode, scope) {
  // TODO: too messy. cleanup!
  //
  var groups = sources.results.group_p('id');

  Object.keys(groups).intersection(selection_graphs_list()).forEach((k,i) => {
    var ld = line_draw({
      id: `${scope}-${k}`,
      container: `#${scope}-svgs`,

      domain: tada.data.domain,
      colors: d3.schemeCategory10,

      x: 'time',
      y: 'value',

      mode: mode,

      sources: sources_format(
        groups[k].map((r) => query_descriptive_objects(r, tada.data.domain)),
        mode,
        { y: 'value' }
      ),

      dblclick: (d,i) => {
        ui_clear_graphs(scope, 'line');

        ui_load_line_graphs(
          tada.f(...selection_selection(scope)),
          tada.f(null),
          {
            type: ((current_percent = !current_percent) ? "percent" : "normal"),
            target: i
          },
          scope
        );
      }
    });

    graph_set_title(ld.container, (tada.dict[k] || k));
    graph_add_controls(ld.id, ld.container, sources.results.filter((r) => r.id === k));
  });
};

function ui_clear_graphs(scope, cls) {
  if (!cls) throw "I need a class"

  document.querySelectorAll(`#${ scope }-column .${ cls }-graph`)
    .forEach((x) => x.closest('.graph-object').remove())
};

function ui_load_all(scope) {
  var selection = selection_selection(scope);
  var sources = tada.f(...selection);

  ui_clear_graphs(scope, 'line');
  ui_clear_graphs(scope, 'area-diff');
  ui_clear_graphs(scope, 'line-diff');
  ui_clear_graphs(scope, 'area-stacked');
  ui_clear_graphs(scope, 'bar');
  ui_clear_graphs(scope, 'bar-stacked');

  (typeof project_callback === 'function') &&
    project_callback(scope, sources, selection);

  if (location.get_query_param('mode') === '' &&
      location.get_query_param('project') === '')
    ui_load_line_graphs(
      sources,
      tada.f(null),
      { type: "normal" },
      scope
    );
};

function ui_close_modal(it) {
  it.closest('.modal').style.display = 'none';
};

function modal_show(modal) {
  var m = document.getElementById(`${modal}-modal`);

  m.style.display = "block";

  var body = document.body,
      html = document.documentElement;

  var h = Math.max(body.scrollHeight, body.offsetHeight,
                   html.clientHeight, html.scrollHeight, html.offsetHeight);

  m.style.height = `${h}px`;
};
