function view_sources() {
  var $tp = $('#tables-picker');

  var dict, data;

  $('#dict-input-file').on("change", (e) => _read_file(e, (r) => {
    dict = r;
    var diagnostics = csv_healthy_dictionary(dict);

    $('#diagnostics').html("");

    if (diagnostics.map((x) => x.healthy).unique().contains(false)) {
      diagnostics.filter((x) => x.problems.length).forEach((p) => {
        _tmpl('li-dictionary-diagnostic', 'diagnostics', p.row, p.problems.join('<br>'));
      });

      $('#data-input-file').prop('disabled', true);
    }

    else
      $('#data-input-file').prop('disabled', false);
  }));

  $('#data-input-file').on("change", (e) => _read_file(e, (r) => {
    data = r;
    var diagnostics = csv_healthy_data(data);

    $('#diagnostics').html("");

    if (diagnostics.length > 0) {
      diagnostics.forEach((p) => {
        _tmpl('li-data-diagnostic', 'diagnostics', p.head(), p.tail().join('\n'));
      });
    }
  }));

  $tp.show();

  $tp.find('form').on("submit", (e) => {
    e.preventDefault();
    tada.data = csv_to_table(data);

    var tmp_dict = {};
    var dt = csv_to_table(dict);

    dt.rows.map((r) => tmp_dict[r[0]] = r[1]);

    var categories = {};

    dt.rows.forEach((r) => {
      var c = r[2];

      if (!c || c === "") return;

      var oc = categories[c];
      if (!oc) categories[c] = [];

      categories[c].push(r[0]);
    });

    tada.dict = tmp_dict;
    tada.dict['_categories'] = categories;

    var diagnostics = csv_sane_dictionary(dt, tada.data);

    if (diagnostics.length > 0)
      diagnostics.forEach((p) => {
        console.log(p);
        _tmpl('li-data-diagnostic', 'diagnostics', p.head(), p.tail().join('\n'));
      });
    else
      view_iparams(dt, tada.data);
  });
};

function view_iparams(dict, data) {
  var $pp = $('#parameters-picker');

  $('.screen').hide();
  $pp.show();

  var $ppf = $pp.find('form');
  $ppf.append("Select the parameters that are NOT mixable (different units): <br>");

  var rb = "";
  data.params.forEach((qv) => {
    var v = (dict.rows.find((r) => r[0] === qv))[1];
    rb += `<input name='independent' type='radio' value='${ qv }'> ${ v } <br>`;
  });

  $ppf.append(rb);
  $ppf.append("<input type='submit' value='Submit'>");

  $ppf.on('submit', (e) => {
    e.preventDefault();

    var not_checked = Array.prototype.slice.call($ppf.find("input:radio:not(:checked)").map((i,t) => $(t).val()));

    tada.f = query_generate(data, not_checked);

    ui_load_mode('reference');

    selection_add_graphs_menu(tada.f(null), query_params_options(tada.data)[tada.f(null)]);

    $('.screen').hide();
    $('#graphs').show();

  if (location.get_query_param('mode') !== '' &&
      location.get_query_param('project') === '') mode_init();
  });
};
