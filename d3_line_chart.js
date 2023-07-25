// The portion of this code that handles the chart transitions was adapted from here:
// https://d3-graph-gallery.com/graph/line_select.html

// The portion that is responsible for projecting the cursor coordinates onto the line was adapted from:
// https://d3-graph-gallery.com/graph/line_cursor.html

var bisect;
var focus;
var focus_text;
var line;

const GRAPH_MARGIN_HEIGHT = 0.05;
const GRAPH_MARGIN_WIDTH = 0.01;

const SVG_PERC_HEIGHT = 1.00 - GRAPH_MARGIN_HEIGHT;
const SVG_PERC_WIDTH = 1.00 - GRAPH_MARGIN_WIDTH;
const SVG_HEIGHT = window.innerHeight * SVG_PERC_HEIGHT;
const SVG_WIDTH = window.innerWidth * SVG_PERC_WIDTH ;

const MARGIN_LEFT = SVG_WIDTH * GRAPH_MARGIN_WIDTH * 5;
const MARGIN_TOP = SVG_HEIGHT * GRAPH_MARGIN_HEIGHT;

const TRANSITION_DURATION = 1000;

async function line_chart(filename)
{
	d3.csv(filename).then(function(data){ update(data); });
}

function init_line_chart()
{
	bisect = d3.bisector(function(d) { return d.data; }).right;

	focus = svg.append('g')
				.append('circle')
					.style('fill', 'none')
					.attr('stroke', 'black')
					.attr('r', 8.5)
					.style('opacity', 0);

	focus_text = svg.append('g')
					.append('text')
						.style('opacity', 0)
						.attr('text-anchor', 'left')
						.attr('alignment-baseline', 'middle');
}

function update(data)
{
	var y_axis = d3.select(data_id).property('value');
	var x_axis = d3.select(x_id).property('value');

	d3.select('#x-axis').remove();
	d3.select('#y-axis').remove();

	var data_filter;
	if(x_axis == 'Date') data_filter = data.map(function(d) { return {data : d3.timeParse('%Y.%m.%d')(d[x_axis]), value : d[y_axis]}; });
	else x_axis = data.map(function(d) { return {data : d[x_axis], value : d[y_axis]}; });

	const max_value = Math.max(...data_filter.map(({ value }) => value)) * 1.05;

	var axis_shift = SVG_HEIGHT - MARGIN_TOP * 2;

	var x = d3.scaleTime()
				.domain(d3.extent(data_filter, function(d) { return d.data; }))
				.range([0, SVG_WIDTH]);
	svg.append('g')
		.attr('transform', 'translate(0,' + axis_shift + ')')
		.attr('id', 'x-axis')
		.call(d3.axisBottom(x));

	var y = d3.scaleLinear()
				.domain([0, max_value])
				.range([axis_shift, 0]);
	svg.append('g')
		.attr('id', 'y-axis')
		.call(d3.axisLeft(y));

	if(line == null) line = svg.append('g').append('path');

	line.datum(data_filter)
		.transition()
		.duration(TRANSITION_DURATION)
		.attr('fill', 'none')
		.attr('stroke', 'blue')
		.attr('stroke-width', 1.5)
		.attr('d', d3.line()
						.x(function(d) { return x(d.data); })
						.y(function(d) { return y(d.value); }));

	svg.append('rect')
		.style('fill', 'none')
		.style('pointer-events', 'all')
		.attr('width', SVG_WIDTH - MARGIN_LEFT)
		.attr('height', axis_shift)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	function mouseover()
	{
		focus.style('opacity', 1);
		focus_text.style('opacity', 1);
	};

	function mousemove()
	{
		var x_0 = x.invert(d3.mouse(this)[0]);
		var i = bisect(data_filter, x_0, 1);
		var selected_data = data_filter[i];

		focus.attr('cx', x(selected_data.data)).attr('cy', y(selected_data.value))

		if(x_axis == 'Date') focus_text.html('Day: ' + d3.timeFormat('%d.%b.%y')(selected_data.data) + ': ' + selected_data.value);
		else focus_text.html('Day: ' + selected_data.data + ': ' + selected_data.value);

		var w = focus_text.node().getBBox().width;
		var end_x = x(selected_data.data) + w;
		var start_x = x(selected_data.data) + 15;
		var start_y = y(selected_data.value) + 25;
		var edge = SVG_WIDTH - MARGIN_LEFT - 20;

		if(end_x >=	edge)
		{
			start_x += edge - end_x;
			start_y += 20;
		}

		focus_text.attr('x', start_x)
					.attr('y', start_y);
	};

	function mouseout()
	{
		focus.style('opacity', 0);
		focus_text.style('opacity', 0);
	};

	line.exit().remove();
}