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
}

function clear_scatter_chart()
{
	d3.select(state_id).attr('disabled', null);

	d3.select('#circles').remove();
	circles = null;
}

function get_filtered_data(data)
{
	var x_axis = d3.select(x_id).property('value');
	var y_axis = d3.select(data_id).property('value');

	var data_filter;
	if(x_axis == 'Date') data_filter = data.map(function(d) { return {x : d3.timeParse('%Y.%m.%d')(d[x_axis]), y : d[y_axis]}; });
	else data_filter = data.map(function(d) { return {x : d[x_axis], y : d[y_axis]}; });

	return data_filter;
}

function setup_axis(data_filter)
{
	d3.select('#x-axis').remove();
	d3.select('#y-axis').remove();

	var axis_shift = SVG_HEIGHT - MARGIN_TOP * 2;

	var x;
	if(d3.select(x_id).property('value') == 'Date')
	{
		x = d3.scaleTime()
				.domain(d3.extent(data_filter, function(d) { return d.x; }))
				.range([0, SVG_WIDTH])
	}
	else
	{
		x = d3.scaleLinear()
				.domain([0, Math.max(...data_filter.map(({ x }) => x)) * 1.1])
				.range([0, SVG_WIDTH])
	}

	svg.append('g')
		.attr('transform', 'translate(0,' + axis_shift + ')')
		.attr('id', 'x-axis')
		.call(d3.axisBottom(x));

	var y = d3.scaleLinear()
				.domain([0, Math.max(...data_filter.map(({ y }) => y)) * 1.05])
				.range([axis_shift, 0]);
	svg.append('g')
		.attr('id', 'y-axis')
		.call(d3.axisLeft(y));

	return [x, y];
}