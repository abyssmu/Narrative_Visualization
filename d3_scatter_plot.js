var circles = null;

async function scatter_plot()
{
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

		state_and_max_vals.push({'state' : state, 'x' : max_x, 'y' : max_y });
	}

	init_scatter_plot();
	update_scatter_plot(state_and_max_vals);
}

function init_scatter_plot()
{

}

function update_scatter_plot(data)
{
	var [x, y] = setup_axis(data);

	if(circles == null)
	{
		circles = svg.append('g')
						.attr('id', 'circles')
						.selectAll('circle')
						.data(data)
						.enter()
						.append('circle')
							.attr('r', 5)
							.attr('cx', function(d) { return x(d.x); })
							.attr('cy', function(d) { return y(d.y); })
							.attr('fill', 'blue');
	}

	circles.exit().remove();
}