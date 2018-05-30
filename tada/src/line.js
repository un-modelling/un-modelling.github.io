line_draw = (o) => {
  /*
   * o.sources_example = [[{
   *   "id": "coal",
   *   "query": {
   *     "variable": "coal",
   *     "eth": 20,
   *     "rps": 50,
   *     "climate": "CC2"
   *   },
   *   "time": "2015-01-01T06:00:00.000Z",
   *   "value": 22651.2
   * }, {
   *   "id": "coal",
   *   "query": {
   *     "variable": "coal",
   *     "eth": 20,
   *     "rps": 50,
   *     "climate": "CC2"
   *   },
   *   "time": "2016-01-01T06:00:00.000Z",
   *   "value": 24272.4
   * }], [{
   *   "id": "coal",
   *   "query": {
   *     "variable": "coal",
   *     "eth": 50,
   *     "rps": 50,
   *     "climate": "CC2"
   *   },
   *   "time": "2015-01-01T06:00:00.000Z",
   *   "value": 22651.2
   * }, {
   *   "id": "coal",
   *   "query": {
   *     "variable": "coal",
   *     "eth": 50,
   *     "rps": 50,
   *     "climate": "CC2"
   *   },
   *   "time": "2016-01-01T06:00:00.000Z",
   *   "value": 24299
   * }]];
   */

  var graph_obj = graph_object(o.container, o.id);

  var svg    = graph_obj.svg;
  var width  = graph_obj.width;
  var height = graph_obj.height;

  var y_min = Math.min.apply(
    null,
    o.sources.map((s) => Math.min.apply(null, s.map((d) => d[o.y])))
  );

  var y_max = Math.max.apply(
    null,
    o.sources.map((s) => Math.max.apply(null, s.map((d) => d[o.y])))
  );

  if (y_min === 0 && y_max === 0) y_max = 0.001;

  var x = d3.scaleTime()
    .domain([o.domain[0], o.domain[o.domain.length-1]])
    .range([0, width]);

  var x_invert = (c) => {
    var s = width / o.domain.length;
    return Math.ceil(o.domain.length - Math.abs((c[0] - width) / s)) - 1;
  };

  var y = d3.scaleLinear()
    .domain([y_min, y_max])
    .range([height, 0]);

  var line = d3.line()
    .x((d) => x(d[o.x]))
    .y((d) => y(d[o.y]));

  var gph = graph_group(svg, o.id, 'line-graph');

  graph_xy_axis(gph, x, y, width, height, o.x_tick, o.y_tick);

  var marker = gph.append('circle')
    .attr('class', 'line-marker')
    .attr('r', 4)
    .attr('stroke-width', 1.5)
    .attr('transform', 'translate(-100, -100)');

  var pointer = d3.select(graph_obj.container).append('div')
    .attr('class', 'line-pointer');

  gph.selectAll('path.line')
    .data(o.sources)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', line)
    .attr('stroke-width', 1.5)
    .attr('stroke', (d,i) => o.colors[i])
    .on('mouseleave', function(d,i) {
      d3.select(this)
        .attr('stroke-width', 1.5);
    })
    .on('mouseenter', function() {
      d3.select(this)
        .attr('stroke-width', 4)
        .raise();
    })
    .on('mousemove', function(d) {
      var t = d[x_invert(d3.mouse(this))];

      if (!t) return;

      var tx = x(t[o.x]);
      var ty = y(t[o.y]);

      marker
        .attr('transform', `translate(${ tx }, ${ ty })`)
        .raise();

      var off = _offset(marker.node());

      var u = {};
      u[o.y] = t[o.y];
      u[o.x] = t[o.x];

      pointer
        .html(_dictionary_html_table(u.merge_with(t.query)))
        .style('top', `${ off.top - 20 }px`)
        .style('left', `${ off.left + 15 }px`)
        .style('display', 'block');

      if (typeof o.mouse_move === 'function') o.mouse_move(this);
    })
    .on('dblclick', (d,i) => o.dblclick(d,i));

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

line_diff_draw = (o) => {
  /*
   * o.sources_example = [
   *   [{
   *     "id": "Sugar_IRR_Sugarcane",
   *     "query": {
   *       "demand": "HIGH",
   *       "sw": 20,
   *       "gw": 100,
   *       "climate": 0,
   *       "indicator": "Sugar_IRR_Sugarcane"
   *     },
   *     "time": "2016-01-01T06:00:00.000Z",
   *     "value": 16459.82345
   *   }, {
   *     "id": "Sugar_IRR_Sugarcane",
   *     "query": {
   *       "demand": "HIGH",
   *       "sw": 20,
   *       "gw": 100,
   *       "climate": 0,
   *       "indicator": "Sugar_IRR_Sugarcane"
   *     },
   *     "time": "2017-01-01T06:00:00.000Z",
   *     "value": 18664.45525
   *   }], [{
   *     "id": "BAGG_IRR_Sugarcane",
   *     "query": {
   *       "demand": "HIGH",
   *       "sw": 20,
   *       "gw": 100,
   *       "climate": 0,
   *       "indicator": "BAGG_IRR_Sugarcane"
   *     },
   *     "time": "2016-01-01T06:00:00.000Z",
   *     "value": 47941.23335
   *   }, {
   *     "id": "BAGG_IRR_Sugarcane",
   *     "query": {
   *       "demand": "HIGH",
   *       "sw": 20,
   *       "gw": 100,
   *       "climate": 0,
   *       "indicator": "BAGG_IRR_Sugarcane"
   *     },
   *     "time": "2017-01-01T06:00:00.000Z",
   *     "value": 54362.49103
   *   }]
   * ];
   */

  var graph_obj = graph_object(o.container, o.id);

  var svg    = graph_obj.svg;
  var width  = graph_obj.width;
  var height = graph_obj.height;

  if (o.sources.length !== 2) {
    graph_sources_message(svg, 'line-diff-graph',
                          [(tada.dict[o.id] || o.id),
                           `This kind of graph needs exactly 2 comparable sources, but got ${ o.sources.length }.`]);
    return null;
  }

  var query_diff = _objects_compare(o.sources[0][0]['query'], o.sources[1][0]['query']);

  var y_min = Math.min.apply(
    null,
    o.sources.map((s) => Math.min.apply(null, s.map((d) => d[o.y])))
  );

  var y_max = Math.max.apply(
    null,
    o.sources.map((s) => Math.max.apply(null, s.map((d) => d[o.y])))
  );

  if (y_min === 0 && y_max === 0) y_max = 0.001;

  var x = d3.scaleTime()
    .domain([o.domain[0], o.domain[o.domain.length-1]])
    .range([0, width]);

  var x_invert = (c) => {
    var s = width / o.domain.length;
    return Math.ceil(o.domain.length - Math.abs((c[0] - width) / s)) - 1;
  };

  var y = d3.scaleLinear()
    .domain([y_min, y_max])
    .range([height, 0]);

  var line = d3.line()
    .x((d) => x(d[o.x]))
    .y((d) => y(d[o.y]));

  var area = d3.area()
    .x((d,i)  => x(o.sources[0][i][o.x]))
    .y1((d,i) => y(o.sources[0][i][o.y]));

  var gph = graph_group(svg, o.id, 'line-diff-graph');

  graph_xy_axis(gph, x, y, width, height, o.x_tick, o.y_tick);

  var marker = gph.append('line')
    .attr('class', 'area-diff-marker')
    .attr('x1', -100)
    .attr('y1', -100)
    .attr('x2', -100)
    .attr('y2', -100);

  var pointer = d3.select(graph_obj.container).append('div')
      .attr('class', 'area-diff-pointer');

  var marker_move = function(d,it) {
    var t = d[x_invert(d3.mouse(it))];

    if (!t) return;

    var tx = x(t[o.x]);
    var i = o.domain.indexOf(t[o.x]);

    marker
      .attr('x1', tx)
      .attr('y1', y(o.sources[0][i][o.y]))
      .attr('x2', tx)
      .attr('y2', y(o.sources[1][i][o.y]))
      .raise();

    var off = _offset(marker.node());

    var u = {};
    u = u.merge_with(t.query).merge_with(query_diff);
    u['diff']  = (o.sources[0][i][o.y] - o.sources[1][i][o.y]).toFixed(4);

    pointer
      .html(_dictionary_html_table(u))
      .style('top', `${ off.top - 20 }px`)
      .style('left', `${ off.left + 15 }px`)
      .style('display','block');

    if (typeof o.mouse_move === 'function') o.mouse_move(t,i);
  };

  gph.data(o.sources);

  gph.append('clipPath')
    .attr('id', `clip-below-${o.namespace}`)
    .append('path')
    .attr('d', area.y0(height));

  gph.append('clipPath')
    .attr('id', `clip-above-${o.namespace}`)
    .append('path')
    .attr('d', area.y0(0));

  gph.append('path')
    .attr('d', area.y0((d,i) => y(o.sources[1][i][o.y])))
    .attr('fill', o.colors[1])
    .attr('class', 'clip')
    .attr('clip-path', `url(#clip-above-${o.namespace})`)
    .on('mousemove', function(d) { marker_move(d, this) });

  gph.append('path')
    .attr('d', area)
    .attr('fill', o.colors[0])
    .attr('class', 'clip')
    .attr('clip-path', `url(#clip-below-${o.namespace})`)
    .on('mousemove', function(d) { marker_move(d, this) });

  gph.selectAll('.line')
    .data(o.sources)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', line)
    .attr('stroke', (d,i) => o.colors[i])
    .on('mousemove', function(d) { marker_move(d, this) });

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
