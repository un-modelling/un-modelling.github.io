window.project_title = "CLEWS Mauritius";

window.project_settings = {
  "variable": {
    "unique": false,
    "iparam": true,
    "preselect": [
      "electricity_generation_diff",
      "electricity_generation",
      "emissions",
      "coal",
      "water",
      "land_use_sugarcane"
    ]
  },

  "eth": {
    "unique": true,
    "preselect": ["p50"]
  },

  "rps": {
    "unique": true,
    "preselect": ["p50"]
  },

  "climate": {
    "unique": true,
    "preselect": ["CC2"]
  },
};

window.project_extra_graphs = ['electricity_generation', 'electricity_generation_diff'];

window.project_callback = (scope, sources, selection) => {
  var ref = selection_selection('reference');
  var alt = selection_selection('alternative');

  var rs = tada.f(...ref);
  var as = tada.f(...alt);

  var pair = [
    rs.results.group_p('id'),
    as.results.group_p('id')
  ];

  if (!Object.keys(pair[1]).length) return;

  ui_clear_graphs('reference', 'area-stacked');
  var eid = 'electricity_generation';

  var elect_regex = /^electricity_(?!renewables|price)/;

  if (selection_graphs_list().includes(eid)) {
    var rg = area_stacked_draw({
      id: eid,
      scope: 'reference',
      container: '#reference-svgs',
      domain: tada.data.domain,
      x: 'time',
      y: 'value',
      sources: rs.results.filter((e) => e.query[tada.f(null)].match(elect_regex)),
      colors: d3.schemeCategory10,
    });

    graph_set_title(rg.container, (tada.dict[eid] + " - Reference" || eid));
    graph_add_controls(rg.id, rg.container, sources);

    var ag = area_stacked_draw({
      id: eid + '-alternative',
      scope: 'reference',
      container: '#reference-svgs',
      domain: tada.data.domain,
      x: 'time',
      y: 'value',
      sources: as.results.filter((e) => e.query[tada.f(null)].match(elect_regex)),
      colors: d3.schemeCategory10,
    });

    graph_set_title(ag.container, (tada.dict[eid] + " - Alternative" || eid));
    graph_add_controls(ag.id, ag.container, sources);
  }

  ui_clear_graphs('reference', 'bar-stacked');
  var sid = 'electricity_generation_diff';

  if (selection_graphs_list().includes(sid)) {
    var both = ref.map((x,i) => ref[i].concat(alt[i]).unique());

    var b = tada.f(...both).results
      .filter((i) => i.id.match(elect_regex));

    var sg = bar_stacked_diff_draw({
      id: sid,
      scope: 'reference',
      container: '#reference-svgs',
      domain: tada.data.domain,
      range: [-3000, 3000],
      sources: b,
      colors: d3.schemeCategory10,
      x_tick: (d,i) => ((i%2) ? d3.timeFormat('%Y')(d) : ''),
    });

    if (sg) {
      graph_set_title(sg.container, (tada.dict[sid] || sid));
      graph_add_controls(sg.id, sg.container, sources);
    }
  }

  ui_clear_graphs('reference', 'line');
  Object.keys(pair[0]).intersection(selection_graphs_list()).forEach((k,i) => {
    var sources = pair.map((r) => query_descriptive_objects(r[k][0], tada.data.domain));

    var ld = line_draw({
      id:    k,
      scope: 'reference',
      container: '#reference-svgs',
      domain: tada.data.domain,
      colors: d3.schemeCategory10,
      x:     'time',
      y:     'value',

      mode: { type: 'percent' },

      sources: sources_format(
        sources,
        '--',
        { y: 'value' }
      )
    });

    graph_set_title(ld.container, (tada.dict[k] || k));
    graph_add_controls(ld.id, ld.container, sources.results);
  });

  var ps = tada.f();
  var ss = ['reference', 'alternative'];

  var c = document.querySelector('#currents');
  if (!c) return;

  [ref,alt].forEach((p,j) => {
    p.forEach((s,i) => {
      var t = ps[i];
      var v = c.querySelector(`td[bind="${ss[j]}-${t}"]`);
      if (v) v.innerHTML = tada.dict[s[0]];
    });
  });
};

window.project_init = () => {
  ui_compare_mode();

  var p = document.querySelector('#panes-container');
  var c = document.createElement('div');
  c.id = 'currents';

  c.innerHTML = `<table>
<thead>
<tr>
  <td></td>
  <td>Renewable Ethanol</td>
  <td>Renewable Electricity</td>
  <td>Rainfall</td>
</tr>
</thead>

<tbody>
<tr>
  <td>Reference</td>
  <td bind="reference-eth"></td>
  <td bind="reference-rps"></td>
  <td bind="reference-climate"></td>
</tr>

<tr>
  <td>Alternative</td>
  <td bind="alternative-eth"></td>
  <td bind="alternative-rps"></td>
  <td bind="alternative-climate"></td>
</tr>
</tbody>
</table>`;

  c.style = `
flex: 1 100%;
max-width: calc(100% - 4em);
display: flex;
text-align: center;
margin: 1em auto;`;

  p.insertBefore(c, p.firstChild);

  document.querySelector('.column-title').remove();
  document.querySelector('#alternative-column').remove();
  document.querySelector('#sidebar li:nth-of-type(3)').remove();

  _checkbox_set(document.querySelector('input#rps-reference-p20'), true);
};
