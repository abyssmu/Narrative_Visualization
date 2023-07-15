async function init()
{
	const data = await d3.csv('total_us_daily_compiled.csv');

	console.log(data);

	d3.select('body')
		.append('p')
			.html(data[0].Date);
}