const CONFIRMED_FILE = 'total_us_daily_confirmed.csv';
const DEATHS_FILE = 'total_us_daily_deaths.csv';

const DATA_FOLDER = 'data/';

var select_div;
var svg;

var state_names = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
					'Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho',
					'Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
					'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana',
					'Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
					'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
					'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
					'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

var x_axis_variables = ['Date', 'Median Income', 'Population', 'Population Density', 'Land Area (km^2)'];
var y_axis_variables = ['Confirmed Cumulative', 'Deaths Cumulative', 'Confirmed Daily', 'Deaths Daily'];

var state_id = '#state_select';
var data_id = '#data_select';
var x_id = '#x_select';

function init()
{
	select_div = d3.select('body')
					.append('div')
						.attr('id', 'select_div');

	init_select_menu(state_id, state_names);
	init_select_menu(data_id, y_axis_variables);
	init_select_menu(x_id, x_axis_variables);

	select_menu_add_on(state_id);
	select_menu_add_on(data_id);
	select_menu_add_on(x_id);

	svg = d3.select('body')
			.append('svg')
				.attr('width', SVG_WIDTH)
				.attr('height', SVG_HEIGHT)
			.append('g')
				.attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');

	init_line_chart();

	line_chart(DATA_FOLDER + d3.select(state_id).property('value') + '.csv');
}

function init_select_menu(id, data)
{
	select_div.append('select')
				.attr('id', id.slice(1))
				.selectAll('option')
				.data(data)
				.enter()
				.append('option')
					.text(function(d) { return d; })
					.attr('value', function(d) { return d; });
}

function select_menu_add_on(id)
{
	d3.select(id)
		.on('change', function(event, d)
		{
			var state = d3.select(state_id).property('value');
			var filename = DATA_FOLDER + state + '.csv';

			line_chart(filename);
		});	
}