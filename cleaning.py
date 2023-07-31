import os
import pandas as pd
import re

DATA_FOLDER = 'data/'

def get_land_area_per_state():
	land_area = pd.read_html('https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_area')[0]

	keep_cols = [land_area.columns[0], land_area.columns[6]]
	land_area = land_area.drop([col for col in land_area.columns if col not in keep_cols], axis = 1)

	land_area.columns = land_area.columns.droplevel()
	land_area = land_area.rename(columns = {land_area.columns[0] : 'State', land_area.columns[1] : 'km2'})

	land_area = land_area.drop(land_area.tail(9).index)

	parks = pd.read_html('https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States')[1]

	col = parks.columns
	parks = parks.drop([col[1], col[3], col[5], col[6]], axis = 1)
	parks = parks.rename(columns = {parks.columns[-1] : 'km2'})

	territories = ['American Samoa',
						'Diamond Princess',
						'Grand Princess',
						'Guam',
						'Northern Mariana Islands',
						'Puerto Rico',
						'Recovered',
						'Virgin Islands']

	parks = parks[~parks['Location'].str.contains('|'.join(territories))]

	states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
				'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
				'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
				'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
				'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
				'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

	parks['Name'] = parks['Name'].str.replace('\u0101|\u02bb|\u2020|\u2021|\xa0|\u2013|\*', '', regex = True).str.strip()
	parks['Location'] = parks['Location'].str.replace('\u2032|\ufeff', '', regex = True).apply(lambda x: ','.join(re.findall('|'.join(states), x)))

	parks['km2'] = parks['km2'].str.replace('\xa0', ' ', regex = True)
	parks['km2'] = parks['km2'].str.extract('(\(\d+\,?\d+)')
	parks['km2'] = parks['km2'].str.replace('\(|\,|', '', regex = True).fillna(0).astype(int)

	fixes = {'Name' : ['Death Valley', 'Death Valley', 'Great Smoky Mountains', 'Great Smoky Mountains', 'Yellowstone', 'Yellowstone', 'Yellowstone'],
				'Location' : ['Nevada', 'California', 'Tennessee', 'North Carolina', 'Idaho', 'Montana', 'Wyoming'],
				'km2' : [453, 13793 - 453, int(2114 * .47), int(2114 * (1 - .47)), 151, 531, 8983 - 151 - 531]}

	parks = pd.concat([parks, pd.DataFrame(fixes)])
	parks = parks.drop(parks[parks['Location'].str.contains(',')].index).reset_index(drop = True)

	conservation = pd.read_html('https://en.wikipedia.org/wiki/National_Conservation_Area')[0]
	conservation = conservation.drop(columns = ['Conservation Area'], index = 1).rename(columns = {'BLM Acres' : 'km2'}).reset_index(drop = True)
	conservation['km2'] = (conservation['km2'] * .004).astype(int)

	shores = pd.read_html('https://en.wikipedia.org/wiki/List_of_national_lakeshores_and_seashores_of_the_United_States')[1]

	col = shores.columns
	shores = shores.drop(columns = [col[1], col[3], col[5]], axis = 1).rename(columns = {'Area[1]' : 'km2'})

	shores['Location'] = shores['Location'].str.replace('\u2032|\ufeff', '', regex = True).apply(lambda x: ','.join(re.findall('|'.join(states), x)))

	shores['km2'] = shores['km2'].str.replace('\xa0', ' ', regex = True)
	shores['km2'] = shores['km2'].str.extract('(\(\d+\,?\d+)')
	shores['km2'] = shores['km2'].str.replace('\(|\,|', '', regex = True).fillna(0).astype(int)

	fixes = {'Name' : ['Assateague Island', 'Assateague Island', 'Apostle Islands', 'Pictured Rocks', 'Sleeping Bear Dunes'],
				'Location' : ['Virgina', 'Maryland', 'Wisconsin', 'Michigan', 'Michigan'],
				'km2' : [43, 160 - 43, 281, 296, 288]}

	shores = pd.concat([shores, pd.DataFrame(fixes)])
	shores = shores.drop(shores[shores['Location'].str.contains(',')].index).reset_index(drop = True)

	forests = pd.read_html('https://en.wikipedia.org/wiki/List_of_national_forests_of_the_United_States')[0]

	col = forests.columns
	forests = forests.drop(columns = [col[1], col[3], col[5]], axis = 1).rename(columns = {col[0] : 'Name', col[2] : 'Location', col[4] : 'km2'})

	forests['Location'] = forests['Location'].str.replace('\u2032|\ufeff', '', regex = True).apply(lambda x: ','.join(re.findall('|'.join(states), x)))

	forests['km2'] = forests['km2'].str.replace('\xa0', ' ', regex = True)
	forests['km2'] = forests['km2'].str.extract('(\(\d+\,?\d+)')
	forests['km2'] = forests['km2'].str.replace('\(|\,|', '', regex = True).fillna(0).astype(int)
	forests = forests.drop(forests[forests['Location'] == ''].index).reset_index(drop = True)

	fixes = {'Name' : ['Apache-Sitgreaves', 'Apache-Sitgreaves', 'Ashley', 'Ashley', 'Bitterroot', 'Bitterroot', 'Black Hills', 'Black Hills', 'Caribou Targhee', 'Caribou Targhee', 'Cherokee', 'Coronado', 'Coronado',
						'Custer', 'Custer', 'Washington and Jefferson', 'Humboldt', 'Humboldt', 'St Joe', 'Coeur', 'Kanisku', 'Kanisku', 'Kanisku', 'Inyo', 'Inyo',
						'Klamath', 'Klamath', 'Kootenai', 'Kootenai', 'Lake Taho', 'Lake Tahoe', 'Land Between Lakes', 'Land Between Lakes', 'Manti', 'Medicine', 'Medicine',
						'Ouachita', 'Ouachita', 'Rogue', 'Rogue', 'Sawtooth', 'Sawtooth', 'Uinta', 'Uinta', 'Uinta', 'Umatilla', 'Umatilla',
						'Wallowa', 'Wallowa', 'White Mountain', 'White Mountain'],
				'Location' : ['Arizona', 'New Mexico', 'Utah', 'Wyoming', 'Idaho', 'Montana', 'South Dakota', 'Wyoming', 'Idaho', 'Wyoming', 'Tennessee', 'Arizona', 'New Mexico',
								'Montana', 'South Dakota', 'Virginia', 'Nevada', 'California', 'Idaho', 'Idaho', 'Idaho', 'Montana', 'Washington', 'California', 'Nevada',
								'California', 'Oregon', 'Montana', 'Idaho', 'California', 'Nevada', 'Kentucky', 'Tennessee', 'Utah', 'Colorado', 'Wyoming',
								'Arkansas', 'Oklahoma', 'Oregon', 'California', 'Idaho', 'Utah', 'Utah', 'Wyoming', 'Idaho', 'Oregon', 'Washington',
								'Oregon', 'Idaho', 'New Hampshire', 'Maine'],
				'km2' : [3313, 10628 - 3313, 5212, 5594 - 5212, int(6453 * .7076), int(6453 * .49), int(5062 * .9), int(5062 * .1), int(10621 * .9), int(10621 * .1), 2656, int(6956 * .95), int(6956 * .05),
							int(4813 * .9), int(4813 * .1), 7252, int(25458 * .9), int(25458 * .1), 3512, 2940, int(6587 * .557), int(6587 * .279), int(6587 * .164), int(7920 * .9), int(7920 * .1),
							int(6768 * .985), int(6768 * .015), int(7326 * .971), int(7326 * .029), int(615 * .7), int(615 * .3), int(693 * .6), int(693 * .4), 5139, int(8944 / 2), int(8944 / 2),
							int(7225 * .8), int(7225 * .2), int(6956 * .9), int(6956 * .1), int(7293 * .96), int(7293 * .04), int(10086 * .8123), int(10086 * .1642), int(10086 * .0235), int(5689 * .75), int(5689 * .25),
							int(9151 * .9), int(9151 * .1), int(3082 * .9), int(3082 * .1)]}

	forests = pd.concat([forests, pd.DataFrame(fixes)])
	forests = forests.drop(forests[forests['Location'].str.contains(',')].index).reset_index(drop = True)

	prairie = pd.read_html('https://en.wikipedia.org/wiki/National_grassland')[0]

	col = prairie.columns
	prairie = prairie.drop(columns = [col[1], col[3], col[5]], axis = 1).rename(columns = {col[2] : 'Location', col[4] : 'km2'})

	prairie['Location'] = prairie['Location'].str.replace('\u2032|\ufeff', '', regex = True).apply(lambda x: ','.join(re.findall('|'.join(states), x)))

	prairie['km2'] = prairie['km2'].str.replace('\xa0', ' ', regex = True)
	prairie['km2'] = prairie['km2'].str.extract('(\(\d+\,?\d+)')
	prairie['km2'] = prairie['km2'].str.replace('\(|\,|', '', regex = True).fillna(0).astype(int)

	fixes = {'Name' : ['Black Kettle', 'Black Kettle', 'Rita Blanca', 'Rita Blanca', 'Midewin'],
				'Location' : ['Oklahoma', 'Texas', 'Texas', 'Oklahoma', 'Illinois'],
				'km2' : [int(30710 * .004), int((31286 - 30710) * .004), 314, 64, 74]}

	prairie = pd.concat([prairie, pd.DataFrame(fixes)])
	prairie = prairie.drop(prairie[prairie['Location'].str.contains(',')].index).reset_index(drop = True)

	for state in states:
		if state in land_area['State'].to_list():
			park_sum = parks[parks['Location'] == state]['km2'].sum()
			cons_sum = conservation[conservation['State'] == state]['km2'].sum()
			shor_sum = shores[shores['Location'] == state]['km2'].sum()
			fore_sum = forests[forests['Location'] == state]['km2'].sum()
			prai_sum = prairie[prairie['Location'] == state]['km2'].sum()
			total_sum = park_sum + cons_sum + shor_sum + fore_sum + prai_sum

			land_area.loc[land_area['State'] == state, ['km2']] = land_area[land_area['State'] == state]['km2'] - total_sum

	return land_area

def get_median_income_per_state():
	median_income = pd.read_html('https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_income')[1]
	median_income = median_income.drop(['State Rank', '2021', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'], axis = 1)
	median_income = median_income.drop(median_income.columns[-1], axis = 1).drop(0)

	li = median_income[median_income.columns[0]].to_list()
	li[0] = 'District of Columbia'
	median_income[median_income.columns[0]] = li

	return median_income

def get_population_per_state():
	population = pd.read_html('https://en.wikipedia.org/wiki/2020_United_States_census')[2]

	col = population.columns
	population = population.drop([col[0], col[3], col[4], col[5]], axis = 1)

	population = population.drop(population.tail(1).index)
	population = population.rename(columns = {population.columns[-1] : 'Population'})

	return population

def get_politics():
	states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
			'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
			'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
			'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
			'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
			'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

	governor = pd.read_html('https://ballotpedia.org/Partisan_composition_of_governors')[1].drop(columns = ['Name', 'Date assumed office'], axis = 1)
	governor['Office'] = governor['Office'].apply(lambda x: ''.join(re.findall('|'.join(states), x)))
	governor = governor.drop(governor[governor['Office'] == ''].index)

	governor.loc[-1] = ['District of Columbia', 'District of Columbia']

	governor.loc[governor['Office'] == 'Montana', 'Party'] = 'Democratic'
	governor.loc[governor['Office'] == 'Virginia', 'Party'] = 'Democratic'
	governor.loc[governor['Office'] == 'Arizona', 'Party'] = 'Republican'
	governor.loc[governor['Office'] == 'Maryland', 'Party'] = 'Republican'
	governor.loc[governor['Office'] == 'Massachusetts', 'Party'] = 'Republican'
	governor.loc[governor['Office'] == 'Nevada', 'Party'] = 'Democratic'

	governor = governor.rename(columns = {'Office' : 'State', 'Party' : 'Governor'}).reset_index(drop = True)

	electoral = pd.read_html('https://www.archives.gov/electoral-college/2020')[1]

	col = electoral.columns
	electoral = electoral.drop(electoral.tail(2).index).drop(electoral.head(1).index).drop(columns = col[-2:], axis = 1).drop(columns = [col[1]], axis = 1)

	electoral.columns = electoral.columns.droplevel()

	col = electoral.columns
	electoral = electoral.rename(columns = { col[0] : 'State', col[1] : 'D', col[2] : 'R'})

	def electoral_map(x):
		if x['D'] != '-' and x['R'] != '-': return 'Split'
		elif x['D'] != '-': return 'Democratic'
		elif x['R'] != '-': return 'Republican'

	electoral['Electoral'] = electoral.apply(lambda x: electoral_map(x), axis = 1)
	electoral['State'] = electoral['State'].str.strip('*')

	politics = governor.merge(electoral, how = 'inner', on = ['State']).drop(columns = ['D', 'R'], axis = 1)

	congress = pd.read_html('https://ballotpedia.org/State_legislative_elections,_2020')[4]
	congress.columns = congress.columns.droplevel()

	col = congress.columns
	congress = congress.drop(columns = col[-6:], axis = 1)

	congress.columns = congress.columns.droplevel()

	col = congress.columns
	congress = congress.rename(columns = {col[0] : 'State', col[1] : 'Senate', col[2] : 'House'})

	congress.loc[-1] = ['District of Columbia', 'District of Columbia', 'District of Columbia']
	congress = congress.reset_index(drop = True)

	politics = politics.merge(congress, how = 'inner', on = ['State'])

	return politics

def read_and_output_daily_reports_per_state():
	# COVID data pulled from:
	# https://github.com/CSSEGISandData/COVID-19
	path = './csse_covid_19_daily_reports_us'
	files = os.listdir(path)

	df = pd.DataFrame()

	for filename in files:
		temp = pd.read_csv(os.path.join(path, filename))

		try:
			temp = temp.drop(['Country_Region',
								'Last_Update',
								'Lat',
								'Long_',
								'Recovered',
								'Active',
								'FIPS',
								'Incident_Rate',
								'Total_Test_Results',
								'People_Hospitalized',
								'Case_Fatality_Ratio',
								'UID',
								'ISO3',
								'Testing_Rate',
								'Hospitalization_Rate',
								'Date',
								'People_Tested',
								'Mortality_Rate'], axis = 1)
		except:
			temp = temp.drop(['Country_Region',
								'Last_Update',
								'Lat',
								'Long_',
								'Recovered',
								'Active',
								'FIPS',
								'Incident_Rate',
								'Total_Test_Results',
								'People_Hospitalized',
								'Case_Fatality_Ratio',
								'UID',
								'ISO3',
								'Testing_Rate',
								'Hospitalization_Rate'], axis = 1)

		date = filename[:-4].split('-')
		temp['Date'] = '.'.join([date[2], date[0], date[1]])

		df = pd.concat([df, temp])

	territories = ['American Samoa',
						'Diamond Princess',
						'Grand Princess',
						'Guam',
						'Northern Mariana Islands',
						'Puerto Rico',
						'Recovered',
						'Virgin Islands']
	df = df[~df['Province_State'].isin(territories)].reset_index(drop = True, inplace = False)

	df = df.sort_values(by = ['Date', 'Province_State'])
	df = df.groupby(by = 'Province_State')

	output = []

	for state in df.groups.keys():
		temp = df.get_group(state)
		temp = temp.rename(columns = {'Confirmed': 'Confirmed Cumulative', 'Deaths' : 'Deaths Cumulative'})

		li_conf = temp['Confirmed Cumulative'].to_list()
		li_deat = temp['Deaths Cumulative'].to_list()
		conf_diff = []
		deat_diff = []

		for i in range(len(li_conf)):
			if i == 0:
				conf_diff.append(li_conf[i])
				deat_diff.append(li_deat[i])
				continue

			conf_diff.append(li_conf[i] - li_conf[i - 1])
			deat_diff.append(li_deat[i] - li_deat[i - 1])

		temp['Confirmed Daily'] = conf_diff
		temp['Deaths Daily'] = deat_diff

		output.append(temp)

	return output

def generate_state_files(daily_reports, income, population, land_area, politics):
	for i in range(len(daily_reports)):
		state = daily_reports[i]['Province_State'].to_list()[0]

		mask = income['States and Washington, D.C.'] == state
		if mask.sum() != 1: print('median_income', state)

		state_income = int(income[mask].iloc[0]['2019'][1:].replace(',', ''))

		mask = population['State'] == state
		if mask.sum() != 1: print('population', state)

		state_pop = population[mask].iloc[0]['Population']

		mask = land_area['State'] == state
		if mask.sum() != 1: print('land_area', state)

		state_land = land_area[mask].iloc[0]['km2']

		mask = politics['State'] == state
		if mask.sum() != 1: print('politics', state)

		governor = politics[mask].iloc[0]['Governor']
		electoral = politics[mask].iloc[0]['Electoral']
		senate = politics[mask].iloc[0]['Senate']
		house = politics[mask].iloc[0]['House']

		daily_reports[i]['Confirmed Cumulative / Capita'] = (daily_reports[i]['Confirmed Cumulative'] / state_pop).round(5)
		daily_reports[i]['Deaths Cumulative / Capita'] = (daily_reports[i]['Deaths Cumulative'] / state_pop).round(6)
		daily_reports[i]['Confirmed Daily / Capita'] = (daily_reports[i]['Confirmed Daily'] / state_pop).round(7)
		daily_reports[i]['Deaths Daily / Capita'] = (daily_reports[i]['Deaths Daily'] / state_pop).round(7)

		daily_reports[i]['Median Income'] = state_income
		daily_reports[i]['Population'] = state_pop
		daily_reports[i]['Functional Land Area (km2)'] = state_land

		daily_reports[i]['Governor'] = governor
		daily_reports[i]['Electoral'] = electoral
		daily_reports[i]['Senate'] = senate
		daily_reports[i]['House'] = house

		daily_reports[i] = daily_reports[i].reset_index(drop = True)

		daily_reports[i]['Population Density'] = daily_reports[i].apply(lambda row: int(row['Population'] / row['Functional Land Area (km2)'] * 1e2) / 1e2, axis = 1)

		daily_reports[i].drop('Province_State', axis = 1).to_csv(DATA_FOLDER + state + '.csv', index = False)

generate_state_files(read_and_output_daily_reports_per_state(),
						get_median_income_per_state(),
						get_population_per_state(),
						get_land_area_per_state(),
						get_politics())