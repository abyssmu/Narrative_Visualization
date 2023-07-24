// The portion of this code that handles the chart transitions was adapted from here:
// https://d3-graph-gallery.com/graph/line_select.html

// The portion that is responsible for projecting the cursor coordinates onto the line was adapted from:
// https://d3-graph-gallery.com/graph/line_cursor.html

var bisect;
var focus;
var focus_text;
var line;
var select_div;
var state_names;
var svg;

const CONFIRMED_FILE = 'total_us_daily_confirmed.csv';
const DEATHS_FILE = 'total_us_daily_deaths.csv';

const CONFIRMED_TEXT = 'Confirmed';
const DEATHS_TEXT = 'Deaths';
var chart_switch = CONFIRMED_TEXT;

const GRAPH_MARGIN_HEIGHT = 0.05;
const GRAPH_MARGIN_WIDTH = 0.01;

const SVG_PERC_HEIGHT = 1.00 - GRAPH_MARGIN_HEIGHT;
const SVG_PERC_WIDTH = 1.00 - GRAPH_MARGIN_WIDTH;
const SVG_HEIGHT = window.innerHeight * SVG_PERC_HEIGHT;
const SVG_WIDTH = window.innerWidth * SVG_PERC_WIDTH ;

const MARGIN_LEFT = SVG_WIDTH * GRAPH_MARGIN_WIDTH * 5;
const MARGIN_TOP = SVG_HEIGHT * GRAPH_MARGIN_HEIGHT;

const TRANSITION_DURATION = 1000;

function chart(filename)
{
	const confirmed = d3.csv(filename)
		.then(function(data)
		{
			if(state_names == null) init_select_div(data);

			update(data, 'Alabama');

			d3.select('#state_select')
				.on('change', function(event, d)
				{
					const selected_option = d3.select(this).property('value');
					update(data, selected_option);
				});
		});
}

function init()
{
	select_div = d3.select('body')
					.append('div')
						.attr('id', 'select_div');

	svg = d3.select('body')
			.append('svg')
				.attr('width', SVG_WIDTH)
				.attr('height', SVG_HEIGHT)
			.append('g')
				.attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');

	select_div.append('select')
				.attr('id', 'chart_select')
				.append('option')
					.text(CONFIRMED_TEXT)
					.attr('value', CONFIRMED_TEXT);
	d3.select('#chart_select')
		.append('option')
			.text(DEATHS_TEXT)
			.attr('value', DEATHS_TEXT);

	d3.select('#chart_select')
		.on('change', function(event, d)
		{
			chart_switch = d3.select(this).property('value');

			if(chart_switch == CONFIRMED_TEXT) chart(CONFIRMED_FILE);
			else if(chart_switch == DEATHS_TEXT) chart(DEATHS_FILE);
		});

	bisect = d3.bisector(function(d) { return d.Date; }).right;

	focus = svg.append('g')
					.append('circle')
						.style('fill', 'none')
						.attr('stroke', 'black')
						.attr('r', 8.5)
						.style('opacity', 0);

	focus_text = svg.append('g')
						.append('text')
							.style('opacity', 0)
							.attr('text-anchor', 'left')
							.attr('alignment-baseline', 'middle');

	chart(CONFIRMED_FILE);
}

function init_select_div(data)
{
	state_names = Object.keys(data[0]).slice(1);

	select_div.append('select')
				.attr('id', 'state_select')
				.selectAll('option')
				.data(state_names)
				.enter()
				.append('option')
					.text(function(d) { return d; })
					.attr('value', function(d) { return d; });
}

function update(data, selected_group)
{
	d3.select('#x-axis').remove();
	d3.select('#y-axis').remove();

	const data_filter = data.map(function(d) { return {Date : d3.timeParse('%Y.%m.%d')(d.Date), value : d[selected_group]}; });
	const max_value = Math.max(...data_filter.map(({ value }) => value)) * 1.05;

	var axis_shift = SVG_HEIGHT - MARGIN_TOP * 2;

	var x = d3.scaleTime()
				.domain(d3.extent(data_filter, function(d) { return d.Date; }))
				.range([0, SVG_WIDTH]);
	svg.append('g')
		.attr('transform', 'translate(0,' + axis_shift + ')')
		.attr('id', 'x-axis')
		.call(d3.axisBottom(x));

	var y = d3.scaleLinear()
				.domain([0, max_value])
				.range([axis_shift, 0]);
	svg.append('g')
		.attr('id', 'y-axis')
		.call(d3.axisLeft(y));

	if(line == null) line = svg.append('g').append('path');

	line.datum(data_filter)
		.transition()
		.duration(TRANSITION_DURATION)
		.attr('fill', 'none')
		.attr('stroke', 'blue')
		.attr('stroke-width', 1.5)
		.attr('d', d3.line()
						.x(function(d) { return x(d.Date); })
						.y(function(d) { return y(d.value); }));

	svg.append('rect')
		.style('fill', 'none')
		.style('pointer-events', 'all')
		.attr('width', SVG_WIDTH)
		.attr('height', axis_shift)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	function mouseover()
	{
		focus.style('opacity', 1);
		focus_text.style('opacity', 1);
	};
	
	function mousemove()
	{
		var x_0 = x.invert(d3.mouse(this)[0]);
		var i = bisect(data_filter, x_0, 1);
		var selected_data = data_filter[i];

		focus.attr('cx', x(selected_data.Date)).attr('cy', y(selected_data.value))
		focus_text.html('Day: ' + d3.timeFormat('%d.%b.%y')(selected_data.Date) + ': ' + selected_data.value)
					.attr('x', x(selected_data.Date) + 15)
					.attr('y', y(selected_data.value) + 25);
	};
	
	function mouseout()
	{
		focus.style('opacity', 0);
		focus_text.style('opacity', 0);
	};
}