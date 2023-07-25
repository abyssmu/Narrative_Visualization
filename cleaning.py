import os
import pandas as pd

DATA_FOLDER = 'data/'

def get_land_area_per_state():
	land_area = pd.read_html('https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_area')[0]

	keep_cols = [land_area.columns[0], land_area.columns[6]]
	land_area = land_area.drop([col for col in land_area.columns if col not in keep_cols], axis = 1)

	land_area.columns = land_area.columns.droplevel()
	land_area = land_area.rename(columns = {land_area.columns[0] : 'State', land_area.columns[1] : 'km2'})

	land_area = land_area.drop(land_area.tail(9).index)

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

	population = population.drop([population.columns[0], population.columns[3], population.columns[4], population.columns[5]], axis = 1)

	population = population.drop(population.tail(1).index)
	population = population.rename(columns = {population.columns[-1] : 'Population'})

	return population

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

	confirmed = pd.DataFrame(df['Date'].unique(), columns = ['Date']).sort_values(by = 'Date').reset_index(drop = True)
	deaths = pd.DataFrame(df['Date'].unique(), columns = ['Date']).sort_values(by = 'Date').reset_index(drop = True)

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

income = get_median_income_per_state()
population = get_population_per_state()
land_area = get_land_area_per_state()

daily_reports = read_and_output_daily_reports_per_state()

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

	daily_reports[i]['Income'] = state_income
	daily_reports[i]['Population'] = state_pop
	daily_reports[i]['Land Area (km2)'] = state_land

	daily_reports[i] = daily_reports[i].reset_index(drop = True)

	daily_reports[i]['Population Density'] = daily_reports[i].apply(lambda row: int(row['Population'] / row['Land Area (km2)'] * 1e2) / 1e2, axis = 1)

	daily_reports[i].drop('Province_State', axis = 1).to_csv(DATA_FOLDER + state + '.csv', index = False)