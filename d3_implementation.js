function init()
{
	const confirmed = d3.csv('total_us_daily_confirmed.csv')
		.then(function(data)
		{
			const graph_margin_height = 0.05;
			const graph_margin_width = 0.01;
		
			const svg_perc_height = 1.00 - graph_margin_height;
			const svg_perc_width = 1.00 - graph_margin_width;
			const svg_height = window.innerHeight * svg_perc_height;
			const svg_width = window.innerWidth * svg_perc_width;
		
			var state_names = Object.keys(data[0]).slice(1);
		
			var body = d3.select('body');
			body.append('select')
				.selectAll('option')
				.data(state_names)
				.enter()
				.append('option')
					.text(function(d) { return d; })
					.attr('value', function(d) { return d; });
			var svg = body.append('svg')
							.attr('width', svg_width)
							.attr('height', svg_height);

			const data_filter = data.map(function(d) { return {Date : d.Date, confirmed : d['Alabama']}; });
			const max_value = Math.max(...data_filter.map(({ confirmed }) => confirmed)) * 1.05;

			var x = d3.scaleTime()
						.domain(d3.extent(data, function(d) { return d3.timeParse('%Y.%m.%d')(d.Date); }))
						.range([0, svg_width]);
		
			var y = d3.scaleLinear()
						.domain([0, max_value])
						.range([svg_height, 0]);

			var line = svg.append('path')
							.datum(data)
							.attr('fill', 'none')
							.attr('stroke', 'blue')
							.attr('stroke-width', 1.5)
							.attr('d', d3.line()
											.x(function(d) { return x(d3.timeParse('%Y.%m.%d')(d.Date)); })
											.y(function(d) { return y(d.Alabama); }));
		
			function update(selected_group)
			{
				const data_filter = data.map(function(d) { return {Date : d.Date, confirmed : d[selected_group]}; });
				const max_value = Math.max(...data_filter.map(({ confirmed }) => confirmed)) * 1.05;

				var y = d3.scaleLinear()
							.domain([0, max_value])
							.range([svg_height, 0]);

				line.datum(data_filter)
					.transition()
					.duration(1000)
					.attr('stroke', 'blue')
					.attr('d', d3.line()
									.x(function(d) { return x(d3.timeParse('%Y.%m.%d')(d.Date)); })
									.y(function(d) { return y(d.confirmed); }));
			}
		
			d3.select('select')
				.on('change', function(event, d)
				{
					const selected_option = d3.select(this).property('value');
					update(selected_option);
				});
		});
	//const deaths = await d3.csv('total_us_daily_deaths.csv');
}