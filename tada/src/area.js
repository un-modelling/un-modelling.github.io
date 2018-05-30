function area_diff_draw(o) { return line_diff_draw(o) };

function area_stacked_draw(o) {
  /* o.sources_example = [{
   *   "id": "electricity_coal",
   *   "Thu Jan 01 2015 00:00:00 GMT-0600 (CST)": 1597.1,
   *   "Fri Jan 01 2016 00:00:00 GMT-0600 (CST)": 1840.3,
   *   "query": {
   *     "variable": "electricity_coal",
   *     "eth": 50,
   *     "rps": 50,
   *     "climate": "CC2"
   *   }
   * }, {
   *   "id": "electricity_bagasse",
   *   "Thu Jan 01 2015 00:00:00 GMT-0600 (CST)": 567.4,
   *   "Fri Jan 01 2016 00:00:00 GMT-0600 (CST)": 549.2,
   *   "query": {
   *     "variable": "electricity_bagasse",
   *     "eth": 50,
   *     "rps": 50,
   *     "climate": "CC2"
   *   }
   * }];
   */

  var graph_obj = graph_object(o.container, o.id);

  var svg     = graph_obj.svg;
  var width   = graph_obj.width;
  var height  = graph_obj.height;

  var keys = o.sources.pluck_p('id');

  if (keys.length !== keys.unique().length) {
    graph_sources_message(svg, 'area-stacked-graph',
                          [(tada.dict[o.id] || o.id),
                           'This kind of graph needs exactly 1 single source.']);
    return null;
  }

  var data = o.domain.map((d) => {
    var obj = {};
    o.sources.forEach((r) => obj[r['id']] = r[d]);
    return obj;
  });

  var y_max = Math.max.apply(
    null,
    data.map((o) => keys.reduce((acc, v) => acc + o[v], 0))
  );

  var x = d3.scaleTime()
    .domain([o.domain[0], o.domain[o.domain.length - 1]])
    .range([0, width]);

  var x_invert = (c) => {
    var s = width / o.domain.length;
    return Math.ceil(o.domain.length - Math.abs((c[0] - width) / s)) - 1;
  };

  var y = d3.scaleLinear()
    .domain([0, y_max])
    .range([height, 0]);

  var area = d3.area()
    .x((d,i) => x(o.domain[i]))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  var gph = graph_group(svg, o.id, 'area-stacked-graph');

  graph_xy_axis(gph, x, y, width, height, o.x_tick, o.y_tick);

  var marker = gph.append('line')
    .attr('class', 'area-stacked-marker')
    .attr('x1', -100)
    .attr('y1', -100)
    .attr('x2', -100)
    .attr('y2', -100);

  var pointer = d3.select(graph_obj.container).append('div')
      .attr('class', 'area-stacked-pointer');

  var marker_move = (d,it) => {
    var xi = x_invert(d3.mouse(it));
    var tx = x(o.domain[xi]);

    if (isNaN(xi)) return;

    var data = d[xi]['data'];
    var total = Object.keys(data).reduce((a,b) => { return a + data[b] }, 0);

    var colors_dict = o.sources.map((x) => x.id).reduce((a,x,i) => { a[x] = o.colors[i]; return a; }, {});

    marker
      .attr('x1', tx)
      .attr('y1', height)
      .attr('x2', tx)
      .attr('y2', 0)
      .raise();

    var off = _offset(marker.node());

    var t = {};
    t = t.merge_with(d[xi]['data']);
    t[o.x] = o.domain[xi];
    t['total'] = total.toFixed(4);

    pointer
      .html(_dictionary_html_table(t, colors_dict))
      .style('top', `${ off.top + 10 }px`)
      .style('left', `${ off.left + 15 }px`)
      .style('display','block');

    if (typeof o.mouse_move === 'function') o.mouse_move(this);
  };

  gph.selectAll('path.area')
    .data(d3.stack().keys(keys)(data))
    .enter()
    .append('path')
    .attr('class', 'area')
    .attr('d', area)
    .style('fill', (d,i) => o.colors[i])
    .on('mousemove', function(d,i) { marker_move(d, this) });

  return {
    id: o.id,
    svg: svg,
    graph: gph,
    sources: o.sources,
    container: graph_obj.container,
    width: graph_obj.w,
    height: graph_obj.h
  };
};

function area_stacked_diff_draw(o) {
  // var area = d3.area()
  //   .x((d,i) => x(o.domain[i]))
  //   .y0((d) => y(d.y0))
  //   .y1((d) => y(d.y1));

  // var layer = gph.selectAll('path.area')
  //     .data(data.map((d) => d['components']))
  //     .enter()
  //     .append('path')
  //     .attr('class', (d) => {console.log(d); return `area ${d.cls}`})
  //   // .data((d) => d['components'])
  //   // .enter().append("path")
  //   // .attr("x", (d) => x(d.t) - bar_width)
  //   // .attr("y", (d) => y(d.y0))
  //   .attr('d', area)
  //   // .attr("height", (d) => d.height)
  //   // .attr("width", bar_width)
  //   .style('fill', (d,i) => o.colors(i));
};
