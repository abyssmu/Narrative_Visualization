// The portion of this code that handles the tooltip was adapted from:
// https://d3-graph-gallery.com/graph/scatter_tooltip.html

var circles = null;
var tooltip = null;

async function scatter_plot()
{
	d3.select('#legend').remove();
	d3.select('#circles').remove();
	circles = null;

	var state_and_max_vals = [];

	for(state of state_names)
	{
		var filename = DATA_FOLDER + state + '.csv';
		var data = await d3.csv(filename);
		var filtered_data = get_filtered_data(data);

		var max_x = Math.max(...filtered_data.map(({ x }) => x));
		var max_y = Math.max(...filtered_data.map(({ y }) => y));

		state_and_max_vals.push({'state' : state, 'x' : max_x, 'y' : max_y, 'color' : filtered_data[0]['color']});
	}

	init_scatter_plot();
	update_scatter_plot(state_and_max_vals);
}

function init_scatter_plot()
{
	if(tooltip == null)
	{
		tooltip = d3.select('body')
					.append('div')
						.attr('id', 'tooltip')
						.style('opacity', 0)
						.style('background-color', TOOLTIP_COLOR)
						.style('border', 'solid')
						.style('border-width', '1px')
						.style('border-radius', '5px')
						.style('padding', '10px')
						.style('position', 'absolute')
						.style('left', 0)
						.style('top', 0);
	}
}

function update_scatter_plot(data)
{
	var [x, y] = setup_axis(data);

	var mouseover = function(d)
					{
						tooltip.style('opacity', 1)
								.style('z-index', '1');
					}

	var mousemove = function(d)
					{
						var x_axis = d3.select(x_id).property('value');
						var y_axis = d3.select(y_id).property('value');

						var text = 'State: ' + d.state + '<br>' +
									x_axis + ': ' + d.x + '<br>' +
									y_axis + ': ' + d.y + '<br>';

						var start_x = d3.mouse(this)[0] + 90;
						var start_y = d3.mouse(this)[1] - 20;
						var end_x = start_x + d3.select('#tooltip').node().getBoundingClientRect().width;

						if(end_x > SVG_WIDTH)
						{
							start_x += SVG_WIDTH - end_x;
							start_y += 120;
						}

						tooltip.html(text)
								.style('left', start_x + 'px')
								.style('top', start_y + 'px');
					}

	var mouseout = function(d)
					{
						tooltip.transition()
								.duration(200)
								.style('opacity', 0)
								.style('z-index', '-1');
					};

	// The color scale code was adapted from:
	// https://d3-graph-gallery.com/graph/custom_color.html

	var color_master = ['Republican', 'Democratic', 'District of Columbia', 'Split']
	var color_map = {'Republican' : 'red', 'Democratic' : 'blue', 'District of Columbia' : 'grey', 'Split' : 'purple'};
	var color_data = Array.from(new Set(data.map(({ color }) => color))).sort();
	var color_range = []

	for(d of color_data) { if(color_master.includes(d)) color_range.push(color_map[d]); }

	var color_scale = d3.scaleOrdinal()
						.domain(color_data)
						.range(color_range);

	var r = 6;

	if(circles == null)
	{
		circles = svg.append('g')
						.attr('id', 'circles')
						.selectAll('circle')
						.data(data)
						.enter()
						.append('circle')
							.attr('r', r)
							.attr('cx', function(d) { return x(d.x); })
							.attr('cy', function(d) { return y(d.y); })
							.attr('fill', function(d) { return color_scale(d.color); })
							.on('mouseover', mouseover)
							.on('mousemove', mousemove)
							.on('mouseout', mouseout);
	}

	var x_pos = 5;
	var x_margin = 10;
	var y_pos = -50;
	var y_margin = 20;
	var w = 160;

	svg.append('g')
		.attr('id', 'legend')
		.append('rect')
			.attr('x', x_pos)
			.attr('y', y_pos)
			.attr('width', w)
			.attr('height', y_margin * (color_data.length + 1))
			.style('stroke', 'black')
			.style('fill', 'none')
			.style('stroke-width', '1px');

	d3.select('#legend')
		.selectAll('circles')
		.data(color_data)
		.enter()
		.append('circle')
			.attr('r', r)
			.attr('cx', x_pos + x_margin)
			.attr('cy', function(d, i) { return y_pos + y_margin + i * y_margin; })
			.attr('fill', function(d) { return color_scale(d); })

	d3.select('#legend')
		.selectAll('text')
		.data(color_data)
		.enter()
		.append('text')
			.attr('x', x_pos + x_margin + r * 2)
			.attr('y', function(d, i) { return y_pos + y_margin + i * y_margin + r; })
			.text(function(d) { return d; });
}