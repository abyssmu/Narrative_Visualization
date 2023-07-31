const CONFIRMED_FILE = 'total_us_daily_confirmed.csv';
const DEATHS_FILE = 'total_us_daily_deaths.csv';

const DATA_FOLDER = 'data/';
const PAGES_FOLDER = 'pages/';

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
var slideshow_div;
var page_section;
var top_div;
var left_div;
var right_div;
var page_position = 0;
const PAGE_COUNT = 5;
var pages = [];

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
	init_slideshow();
	init_select_menu();

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

function init_select_menu()
{
	select_div = d3.select('body')
					.append('section')
						.attr('id', 'select_div');

	select_div.append('div')
					.attr('id', 'state_div')
				.append('text')
					.text('State:');

	d3.select('#state_div')
		.append('select')
			.attr('id', state_id.slice(1))
			.selectAll('option')
			.data(state_names)
			.enter()
			.append('option')
				.text(function(d) { return d; })
				.attr('value', function(d) { return d; });

	select_div.append('div')
					.attr('id', 'y_axis_div')
				.append('text')
					.text('y-axis:');

	d3.select('#y_axis_div')
		.append('select')
			.attr('id', y_id.slice(1))
			.selectAll('option')
			.data(y_axis_variables)
			.enter()
			.append('option')
				.text(function(d) { return d; })
				.attr('value', function(d) { return d; });

	select_div.append('div')
					.attr('id', 'x_axis_div')
				.append('text')
					.text('x-axis:');

	d3.select('#x_axis_div')
		.append('select')
			.attr('id', x_id.slice(1))
			.selectAll('option')
			.data(x_axis_variables)
			.enter()
			.append('option')
				.text(function(d) { return d; })
				.attr('value', function(d) { return d; });

	select_div.append('div')
					.attr('id', 'color_axis_div')
				.append('text')
					.text('color-axis:');

	d3.select('#color_axis_div')
		.append('select')
			.attr('id', color_id.slice(1))
			.selectAll('option')
			.data(color_variables)
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

function init_slideshow()
{
	slideshow_div = d3.select('body')
						.append('div')
							.attr('id', 'slideshow');

	var w_margin = .01;
	var h_margin = .04;
	var w = window.innerWidth * (1 - w_margin * 2);
	var h = window.innerHeight * (1 - h_margin * 2);

	page_section = slideshow_div.append('section').attr('id', 'page');
	top_div = page_section.append('div')
							.attr('id', 'top')
							.style('display', 'flex');
	left_div = page_section.append('div').attr('id', 'left');
	right_div = page_section.append('div').attr('id', 'right');

	setup_top_div();
	load_pages();
}

function setup_top_div()
{
	top_div.append('div')
			.attr('id', 'button_container')
			.append('button')
				.attr('id', 'prev')
				.attr('disabled', '')
				.text('Prev')
				.on('click', function()
				{
					if(page_position > 0)
					{
						--page_position;
						d3.select('#next').attr('disabled', null);
						load_page_html(page_position);
					}

					if(page_position <= 0) d3.select('#prev').attr('disabled', '');
				});
	top_div.append('div')
			.attr('id', 'button_container')
				.append('button')
				.attr('id', 'next')
				.text('Next')
				.on('click', function()
				{
					if(page_position < PAGE_COUNT - 1)
					{
						++page_position;
						d3.select('#prev').attr('disabled', null);
						load_page_html(page_position);
					}

					if(page_position >= PAGE_COUNT - 1) d3.select(this).attr('disabled', '');
				});

	top_div.append('div')
						.attr('id', 'exit')
						.on('click', function() { d3.select('#slideshow').remove(); });
}

async function load_pages()
{
	var xml = new XMLHttpRequest();

	for(let i = 0; i < PAGE_COUNT; ++i)
	{
		filename = PAGES_FOLDER + 'page' + (i + 1) + '.html';
		xml.open('GET', filename, false);
		xml.send();

		pages.push(split_pages(xml.responseText));
	}

	load_page_html(0);
}

function split_pages(html)
{
	delim = '<!--split-->'
	left = html.split(delim)[0];
	right = html.split(delim)[1];

	return {'left' : left, 'right' : right};
}

function load_page_html(i)
{
	d3.select('#left').html(pages[i]['left']);
	d3.select('#right').html(pages[i]['right']);
}