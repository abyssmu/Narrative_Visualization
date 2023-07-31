function clear_line_chart()
{
	d3.select('#focus').remove();
	d3.select('#focus_text').remove();
	d3.select('#line').remove();
	d3.select('#focus_rect').remove();

	line = null;
	focus = null;
	focus_text = null;

	d3.select(state_id).attr('disabled', '');
	d3.select(color_id).attr('disabled', null)
}

function clear_scatter_chart()
{
	d3.select('#tooltip').remove();

	d3.select('#circles').remove();
	d3.select('#legend').remove();

	circles = null;
	tooltip = null;

	d3.select(state_id).attr('disabled', null);
	d3.select(color_id).attr('disabled', '');
}

function get_filtered_data(data)
{
	var x_axis = d3.select(x_id).property('value');
	var y_axis = d3.select(y_id).property('value');
	var color_axis = d3.select(color_id).property('value');

	var data_filter;
	if(x_axis == 'Date') data_filter = data.map(function(d) { return {x : d3.timeParse('%Y.%m.%d')(d[x_axis]), y : d[y_axis]}; });
	else data_filter = data.map(function(d) { return {x : d[x_axis], y : d[y_axis], color : d[color_axis]}; });

	return data_filter;
}

function setup_axis(data_filter)
{
	d3.select('#x-axis').remove();
	d3.select('#y-axis').remove();
	d3.select('#x_label').remove();
	d3.select('#y_label').remove();
	d3.select('#title').remove();

	var axis_height = SVG_HEIGHT - MARGIN_TOP * 2;
	var axis_width = SVG_WIDTH - MARGIN_TOP * 2;

	var x_axis_value = d3.select(x_id).property('value');
	var y_axis_value = d3.select(y_id).property('value');

	var x;
	var y;
	var x_axis;
	var y_axis;
	if(x_axis_value == 'Date')
	{
		x = d3.scaleTime()
				.domain(d3.extent(data_filter, function(d) { return d.x; }))
				.range([0, axis_width]);
		
		x_axis = d3.axisBottom(x);

		y = d3.scaleLinear()
				.domain([0, Math.max(...data_filter.map(({ y }) => y)) * 1.05])
				.range([axis_height, 0]);

		y_axis = d3.axisLeft(y);

		svg.append('text')
			.attr('id', 'title')
			.attr('text-anchor', 'end')
			.attr('x', SVG_WIDTH / 2 + 20)
			.attr('y', 0)
			.attr('font-size', '24px')
			.text(d3.select(state_id).property('value'));
	}
	else
	{
		x = d3.scaleLog()
				.domain([Math.min(...data_filter.map(({ x }) => x)), Math.max(...data_filter.map(({ x }) => x)) * 1.15])
				.range([0, axis_width]);

		x_axis = d3.axisBottom(x)
					.ticks(10, '~s');

		y = d3.scaleLog()
				.domain([Math.min(...data_filter.map(({ y }) => y)), Math.max(...data_filter.map(({ y }) => y)) * 1.05])
				.range([axis_height, 0]);

		y_axis = d3.axisLeft(y)
					.ticks(10, '~s');
	}

	svg.append('g')
		.attr('transform', 'translate(0,' + axis_height + ')')
		.attr('id', 'x-axis')
		.call(x_axis);

	svg.append('g')
		.attr('id', 'y-axis')
		.call(y_axis);

	// The axis labels are adapted from:
	// https://stackoverflow.com/questions/11189284/d3-axis-labeling

	svg.append('text')
		.attr('id', 'x_label')
		.attr('text-anchor', 'end')
		.attr('x', SVG_WIDTH / 2)
		.attr('y', SVG_HEIGHT - 70)
		.text(x_axis_value);

	svg.append('text')
		.attr('id', 'y_label')
		.attr('text-anchor', 'end')
		.attr('x', -SVG_HEIGHT / 3)
		.attr('y', -80)
		.attr('dy', '.75em')
		.attr('transform', 'rotate(-90)')
		.text(y_axis_value);

	return [x, y];
}