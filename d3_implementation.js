const CONFIRMED_FILE = 'total_us_daily_confirmed.csv';
const DEATHS_FILE = 'total_us_daily_deaths.csv';

const DATA_FOLDER = 'data/';

const GRAPH_MARGIN_HEIGHT = 0.07;
const GRAPH_MARGIN_WIDTH = 0.013;

const SVG_PERC_HEIGHT = 1.00 - GRAPH_MARGIN_HEIGHT;
const SVG_PERC_WIDTH = 1.00 - GRAPH_MARGIN_WIDTH;
const SVG_HEIGHT = window.innerHeight * SVG_PERC_HEIGHT;
const SVG_WIDTH = window.innerWidth * SVG_PERC_WIDTH ;

const MARGIN_LEFT = SVG_WIDTH * GRAPH_MARGIN_WIDTH * 5;
const MARGIN_TOP = SVG_HEIGHT * GRAPH_MARGIN_HEIGHT;

const TRANSITION_DURATION = 1000;

const TOOLTIP_COLOR = 'white'

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

var x_axis_variables = ['Median Income', 'Population', 'Population Density', 'Functional Land Area (km2)', 'Date'];
var y_axis_variables = ['Confirmed Cumulative', 'Confirmed Cumulative / Capita',
						'Deaths Cumulative', 'Deaths Cumulative / Capita',
						'Confirmed Daily', 'Confirmed Daily / Capita',
						'Deaths Daily', 'Deaths Daily / Capita'];

var color_variables = ['Governor', 'Electoral', 'Senate', 'House']

var state_id = '#state_select';
var x_id = '#x_select';
var y_id = '#data_select';
var color_id = '#color_select';

var data = {'state' : [], 'data' : []}

function init()
{
	select_div = d3.select('body')
					.append('div')
						.attr('id', 'select_div');

	init_select_menu(state_id, state_names);
	init_select_menu(y_id, y_axis_variables);
	init_select_menu(x_id, x_axis_variables);
	init_select_menu(color_id, color_variables);

	select_menu_add_on(state_id);
	select_menu_add_on(y_id);
	select_menu_add_on(x_id);
	select_menu_add_on(color_id);

	svg = d3.select('body')
			.append('svg')
				.attr('width', SVG_WIDTH)
				.attr('height', SVG_HEIGHT)
			.append('g')
				.attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');

	load_chart();
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

function load_chart()
{
	var state = d3.select(state_id).property('value');
	var filename = DATA_FOLDER + state + '.csv';
	var x_value = d3.select(x_id).property('value');

	if(x_value == 'Date')
	{
		clear_scatter_chart();
		line_chart(filename);
	}
	else
	{
		clear_line_chart();
		scatter_plot();
	}
}

function select_menu_add_on(id)
{
	d3.select(id)
		.on('change', function(event, d)
		{
			load_chart();
		});	
}