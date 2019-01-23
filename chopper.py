import pandas as pd

data = pd.read_csv("data/jul14.csv")

start_date = pd.to_datetime('2014-07-04 00:00:00')

end_date = pd.to_datetime('2014-07-05 00:00:00')

set1 = (pd.to_datetime(data.starttime) > start_date)

subset1 = data[set1]

set2 = (pd.to_datetime(data.starttime) < end_date)

subset2 = subset1[set2]

subset2.to_csv("data/4thOfJuly14.csv")
