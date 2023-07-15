async function init()
{
	const data = await d3.csv('total_us_daily_compiled.csv');

	d3.select('body')
		.selectAll('p')
		.data(data)
		.enter()
		.append('p')
			.html(function(d)
				{
					return 'State: ' + d.Province_State + ', ' +
							'Confirmed: ' + d.Confirmed + ', ' +
							'Deaths: ' + d.Deaths + ', ' +
							'Day: ' + d.Day + ', ' +
							'Month: ' + d.Month + ', ' +
							'Year: ' + d.Year;
				});
}