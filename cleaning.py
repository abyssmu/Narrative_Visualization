import pandas as pd
import os

path = './csse_covid_19_daily_reports_us'
files = os.listdir(path)

df = pd.DataFrame()

for filename in files:
	temp = pd.read_csv(os.path.join(path, filename))

	df = pd.concat([df, temp])

df.to_csv('total_us_daily_compiled.cvs', index = False)