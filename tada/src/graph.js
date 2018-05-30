graph_margin = {
  top: 10,
  bottom: 40,
  left: 40,
  right: 5
};

function graph_set_title(parent, title) {
  var div = document.createElement('div');

  div.classList.add('graph-title');
  div.innerText = title;

  parent.prepend(div);
};

function graph_add_controls(id, parent, rows) {
  var c = document.createElement('div');
  c.classList.add('controls');

  var ct = document.createElement('div');
  ct.classList.add('controls-toggler');

  graph_hide_button(id, c);
  graph_export_data_button(id, rows, c);

  ct.appendChild(c);
  parent.appendChild(ct);
};

function graph_export_data_button(id, rows, controls) {
  var div = document.createElement('div');
  _tmpl('download-icon', div);

  div.addEventListener('click', () => _fake_download(JSON.stringify(rows), `${id}.json`, 'application/json'));

  controls.appendChild(div);
};

function graph_menu_button(opts, controls) {
  return;

  var div = document.createElement('div');
  div.innerHTML = '☰';
  div.addEventListener('click', () => console.log(opts.sources));

  controls.appendChild(div);
};

function graph_hide_button(id, controls) {
  var div = document.createElement('div');
  _tmpl('close-icon', div);

  div.addEventListener('click', function() {
    var t = this.closest('.graph-object');
    if (t) t.remove();
    selection_uncheck_selector(id);
  });

  controls.appendChild(div);
};

function graph_object(container, id) {
  var margin = graph_margin;

  var w = 500;
  var h = 250;

  var width =  w - margin.left - margin.right;
  var height = h - margin.top  - margin.bottom;

  var div = d3.select(container).append('div')
      .attr('class', 'graph-object');

  var svg = div.append('svg')
    .attr('id', id)
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom);

  return {
    svg: svg,
    container: div.node(),
    width: width,
    height: height,
    w: w,
    h: h
  };
};

function graph_group(svg, id, cls) {
  var margin = graph_margin;

  return svg.append('g')
    .attr('class', cls)
    .attr('transform', `translate(${ margin.left }, ${ margin.top })`);
};

function graph_xy_axis(gph, x, y, x_shift, y_shift, x_tick_format, y_tick_format, x_tick_count) {
  var x_tick_count = (x_tick_count ? x_tick_count : 20);

  gph.append('g')
    .attr('class', 'axis grid')
    .call(d3.axisBottom()
          .scale(x)
          .ticks(x_tick_count)
          .tickSize(y_shift, 0, 0)
          .tickFormat(''));

  gph.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0, ${ y_shift })`)
    .call(d3.axisBottom()
          .scale(x)
          .ticks(x_tick_count)
          .tickFormat(x_tick_format || null));

  gph.append('g')
    .attr('class', 'axis grid')
    .call(d3.axisRight()
          .scale(y)
          .ticks(20)
          .tickSize(x_shift, 0, 0)
          .tickFormat(''));

  var dytf;
  if (!y_tick_format && y.domain()[1] > 1000)
    dytf = d3.format(".2s");

  gph.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft()
          .scale(y)
          .ticks(6)
          .tickFormat(y_tick_format || dytf));

  gph.selectAll('.x-axis .tick text')
    .attr('transform', 'rotate(-65)translate(-22,-10)');
};

function graph_sources_message(svg, cls, messages) {
  graph_set_title(svg.node().parentElement, "Oops");

  svg.selectAll("g").remove();

  if (!Array.isArray(messages)) messages = [messages];

  messages.forEach((m,i) => {
    svg.append('g')
      .attr('class', cls)
      .append('text')
      .attr("x", 20)
      .attr("y", 50 + (25*i))
      .text(m);
  });
};
