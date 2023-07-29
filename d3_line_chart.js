// The portion of this code that handles the chart transitions was adapted from here:
// https://d3-graph-gallery.com/graph/line_select.html

// The portion that is responsible for projecting the cursor coordinates onto the line was adapted from:
// https://d3-graph-gallery.com/graph/line_cursor.html

var bisect = null;
var focus = null;
var focus_text = null;
var line = null;
var focus_rect = null;

function line_chart(filename)
{
	init_line_chart();
	d3.csv(filename).then(function(data){ update_line(data); });
}

function init_line_chart()
{
	bisect = d3.bisector(function(d) { return d.x; }).right;

	if(focus == null)
	{
		focus = svg.append('g')
					.attr('id', 'focus')
					.append('circle')
						.style('fill', 'black')
						.attr('stroke', 'black')
						.attr('r', 4)
						.style('opacity', 0);
	}

	if(focus_text == null)
	{
		focus_text = svg.append('g')
						.attr('id', 'focus_text')
						.append('text')
							.style('opacity', 0)
							.attr('text-anchor', 'left')
							.attr('alignment-baseline', 'middle');
	}
}

function update_line(data)
{
	d3.select('#focus_rect').remove();

	var data_filter = get_filtered_data(data);
	var [x, y] = setup_axis(data_filter);

	if(line == null) line = svg.append('g').attr('id', 'line').append('path');

	line.datum(data_filter)
		.transition()
		.duration(TRANSITION_DURATION)
		.attr('fill', 'none')
		.attr('stroke', 'blue')
		.attr('stroke-width', 1.5)
		.attr('d', d3.line()
						.x(function(d) { return x(d.x); })
						.y(function(d) { return y(d.y); }));

	svg.append('rect')
		.attr('id', 'focus_rect')
		.style('fill', 'none')
		.style('pointer-events', 'all')
		.attr('width', SVG_WIDTH - MARGIN_LEFT)
		.attr('height', SVG_HEIGHT - MARGIN_TOP * 2)
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

		focus.attr('cx', x(selected_data.x)).attr('cy', y(selected_data.y))

		if(d3.select(x_id).property('value') == 'Date') focus_text.html('Day: ' + d3.timeFormat('%d.%b.%y')(selected_data.x) + ': ' + selected_data.y);
		else focus_text.html('Day: ' + selected_data.x + ': ' + selected_data.y);

		var w = focus_text.node().getBBox().width;
		var end_x = x(selected_data.x) + w;
		var start_x = x(selected_data.x) + 15;
		var start_y = y(selected_data.y) + 25;
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