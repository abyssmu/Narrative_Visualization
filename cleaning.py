import json
import os
import pandas as pd

confirmed_file = 'total_us_daily_confirmed.csv'
deaths_file = 'total_us_daily_deaths.csv'

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
df = df[~df['Province_State'].isin(territories)].reset_index(inplace = False)
df = df.drop(['index'], axis = 1)

confirmed = pd.DataFrame(df['Date'].unique(), columns = ['Date']).sort_values(by = 'Date').reset_index().drop('index', axis = 1)
deaths = pd.DataFrame(df['Date'].unique(), columns = ['Date']).sort_values(by = 'Date').reset_index().drop('index', axis = 1)

df = df.sort_values(by = ['Date', 'Province_State'])
df = df.groupby(by = 'Province_State')

for state in df.groups.keys():
	temp = df.get_group(state)

	confirmed[state] = temp['Confirmed'].to_list()
	deaths[state] = temp['Deaths'].to_list()

confirmed.to_csv(confirmed_file, index = False)
deaths.to_csv(deaths_file, index = False)