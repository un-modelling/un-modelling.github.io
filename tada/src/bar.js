function bar_stacked_diff_draw(o) {
  /*
   * o.sources_example = [{
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

  var svg    = graph_obj.svg;
  var width  = graph_obj.width;
  var height = graph_obj.height;

  var s = o.sources.group_p('id');

  var data = Object.keys(s).map((e,i) => s[e]);

  var x = d3.scalePoint()
    .domain(o.domain)
    .range([0, width]);

  var x_invert = (c) => {
    var s = width / o.domain.length;
    return Math.ceil(o.domain.length - Math.abs((c[0] - width) / s)) - 1;
  };

  var y = d3.scaleLinear()
    .domain(o.range)
    .range([height, 0]);

  var lengths = data.map((x) => x.length);

  if (lengths.unique().length !== 1) {
    graph_sources_message(svg, 'bar-stacked-graph',
                          [(tada.dict[o.id] || o.id),
                           'This kind of graph needs exactly 2 comparable sources.']);

    return null;
  }

  var bar_width = (width/o.domain.length) - 2;

  var data = o.domain.map((t) => {
    var obj = {};
    var pos_base = 0;
    var neg_base = 0;

    obj['components'] = Object.keys(s).map((e,i) => {
      var y0 = 0;
      var y1 = 0;

      obj['id'] = s[e][0]['id'];
      var d = s[e][0][t] - s[e][1][t];

      if (d >= 0) {
        y1 = pos_base;
        pos_base += d;
        y0 = y1 + d;
      }

      else {
        y0 = neg_base;
        neg_base += d;
        y1 = y0 + d;
      }

      return {
        id: obj['id'],
        y0: y0,
        y1: y1,
        v: d,
        height: Math.abs(y(y1) - y(y0)),
        t: t,
      };
    });

    return obj;
  });

  var gph = graph_group(svg, o.id, 'bar-stacked-graph');

  graph_xy_axis(gph, x, y, width, height, o.x_tick, o.y_tick);

  var marker = gph.append('line')
    .attr('class', 'bar-stacked-marker')
    .attr('x1', -100)
    .attr('y1', -100)
    .attr('x2', -100)
    .attr('y2', -100);

  var pointer = d3.select(graph_obj.container).append('div')
    .attr('class', 'bar-stacked-pointer');

  var marker_move = (d,it,opts) => {
    var xi = x_invert(d3.mouse(it));
    var tx = x(opts.domain[xi]);

    if (isNaN(xi)) return;

    var colors_dict = d['components'].map((x) => x.id).reduce((a,x,i) => { a[x] = opts.colors[i]; return a; }, {});

    var total_up   = Object.keys(d['components']).reduce((a,b) => {
      var c = d['components'];
      var t = c[b];

      return (t && t.y0 > 0 && t.y0 > a) ? t.y0 : a;
    }, 0);

    var total_down = Object.keys(d['components']).reduce((a,b) => {
      var c = d['components'];
      var t = c[b];

      return (t && t.y1 < 0 && t.y1 < a) ? t.y1 : a;
    }, 0);

    marker
      .attr('x1', tx)
      .attr('y1', height)
      .attr('x2', tx)
      .attr('y2', 0)
      .raise();

    var off = _offset(marker.node());

    var u = {};

    d['components'].forEach((t) => u[t.id] = t.v);

    u['time'] = opts.domain[xi];

    u = u.merge_with({
      "- total": total_down,
      "+ total": total_up,
    });

    pointer
      .html(_dictionary_html_table(u, colors_dict))
      .style('top', `${ off.top + 10 }px`)
      .style('left', `${ off.left + 15 }px`)
      .style('display', 'block');
  };

  var layer = gph.selectAll('.layer')
    .data(data)
    .enter().append('g')
    .attr('class', 'layer')
    .on('mousemove', function(d,i) { marker_move(d, this, o) });

  layer.selectAll('rect.bar')
    .data((d) => d['components'])
    .enter().append("rect")
    .attr('class', (d) => `bar ${d.id}`)
    .attr('x', (d) => x(d.t) - bar_width + 1)
    .attr('y', (d) => y(d.y0))
    .attr('height', (d) => d.height)
    .attr('width', bar_width)
    .style('fill', (d,i) => o.colors[i]);

  svg.attr('width', parseInt(svg.attr('width')));

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

function bar_draw(o) {
  var graph_obj = graph_object(o.container, o.id);

  var svg    = graph_obj.svg;
  var width  = graph_obj.width;
  var height = graph_obj.height;

  var x = d3.scalePoint()
    .padding(0.5)
    .domain(o.domain)
    .range([0, width]);

  var y = d3.scaleLinear()
    .domain(o.range)
    .range([height, 0]);

  var bar_width = (width/o.domain.length) - 2;

  var gph = graph_group(svg, o.id, 'bar-graph');

  graph_xy_axis(gph, x, y, width, y(0), o.x_tick, o.y_tick);

  var bar;
  bar = gph.selectAll('rect.bar')
    .data(o.sources).enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d,i) => ((bar_width + 2) * i) + 1)
    .attr('y', (d) => {
      var v = d[o.y];
      return (v > 0) ? y(v) : y(0);
    })
    .attr('width', bar_width)
    .attr('height', (d) => Math.abs(y(d[o.y]) - y(0)))
    .style('fill', (d,i) => o.colors[i])
    .on('click', (d,i) => o.click(d, o.id));

  gph.selectAll('.axis.x-axis').raise();

  return {
    id: o.id,
    svg: svg,
    graph: gph,
    container: graph_obj.container,
    sources: o.sources,
    width: graph_obj.w,
    height: graph_obj.h
  };
}
