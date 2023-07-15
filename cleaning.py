import pandas as pd
import os

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

	temp[['Month', 'Day', 'Year']] = filename[:-4].split('-')

	df = pd.concat([df, temp])

territories = ['American Samoa',
					'Diamond Princess',
					'Grand Princess',
					'Guam',
					'Northern Mariana Islands',
					'Puerto Rico',
					'Virgin Islands']
df = df[~df['Province_State'].isin(territories)]

df = df.sort_values(by = ['Year', 'Month', 'Day', 'Province_State'])

df.to_csv('total_us_daily_compiled.csv', index = False)