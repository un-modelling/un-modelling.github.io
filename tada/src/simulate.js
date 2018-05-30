function simulate_upload(target, callback) {
  var d1, d2;

  var data, dict;

  var dict_file = `/simulations/${ target }/dictionary.csv`;
  var data_file = `/simulations/${ target }/data.csv`;

  d1 = $.get(data_file, (r) => data = csv_to_table(r));
  d2 = $.get(dict_file, (r) => dict = csv_to_table(r));

  $.when(d1, d2).done(() => {
    tada.data = data;
    dict.rows.forEach((r) => tada.dict[r[0]] = r[1]);

    var categories = {};

    dict.rows.forEach((r) => {
      var c = r[2];

      if (!c || c === "") return;

      var oc = categories[c];
      if (!oc) categories[c] = [];

      categories[c].push(r[0]);
    });

    tada.dict['_categories'] = categories;

    if (csv_sane_dictionary(dict, data))
      view_iparams(dict, data);

    callback();
  });
};

function simulate_submit(callback) {
  var args, sources;

  var $pp = $('#parameters-picker');

  var iparam = null;
  Object.keys(project_settings).forEach((t) => (project_settings[t]['iparam']) ? iparam = t : null);

  if (iparam) {
    $pp.find(`input[value="${iparam}"]`).prop('checked', true);
    $pp.find('form').submit();
  }

  callback();
};

function simulate_select() {
  Object.keys(project_settings).forEach((e) => {
    project_settings[e]['preselect'].forEach((i) => {
      var c = document.querySelector(`input.value-selector[bind="${e}"][value="${i}"]`)
      c.checked = true;
    });
  });

  selection_submit("reference");
  selection_submit("alternative");
};

function simulate_run(project) {
  if (project === '') return;

  simulate_upload(project, (x) => {
    simulate_submit(() => {
      simulate_select();
      if (typeof project_init === "function") project_init();
      if (typeof mode_init === "function") mode_init();
    });
  });
};
