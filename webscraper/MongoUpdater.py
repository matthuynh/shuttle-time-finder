# https://stackoverflow.com/questions/37038874/can-i-use-the-same-mongodb-database-from-python-and-nodejs
# https://stackoverflow.com/questions/23001156/how-to-get-ordered-dictionaries-in-pymongo/30787769
# https://stackoverflow.com/questions/50047790/python-json-from-ordered-dict
# https://api.mongodb.com/python/current/tutorial.html
# https://stackoverflow.com/questions/41999094/how-to-insert-datetime-string-into-mongodb-as-isodate-using-pymongo/41999637

from collections import OrderedDict
from json import loads, dumps
import json
import collections
from pymongo import MongoClient
import datetime
from ShuttleTimeChecker import ShuttleTimeChecker

# TODO: Figure out if the import statements in ShuttleTimeChecker.py need to be moved here as well
stc = ShuttleTimeChecker()
# TODO: CHANGE THE DATE PARAMS. This file will likely be called as part of a cron job
raw_data = stc.getShuttleSchedule(10, 16, 2019)

# Connect to Mongo
client = MongoClient('mongodb://localhost:27017/')
db = client['learning_mongo']

# Clean data, saving only the date and shuttle departure times (with status updates)
#raw_data = OrderedDict([('date', '2019-10-16'), ('routes', [OrderedDict([('id', 'STGEORGE'), ('name', 'St. George Route'), ('stops', [OrderedDict([('location', 'Instructional Centre Layby'), ('building_id', '334'), ('times', [OrderedDict([('time', 21300), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 22500), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 23700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 24900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 26100), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 27300), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 30900), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 33300), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 36900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 41700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 44100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 45300), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 48900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 52500), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 54900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 56100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 58500), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 59700), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 62100), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 63300), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 65700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 69300), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 72900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 74100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 77700), ('rush_hour', False), ('no_overload', True)])])]), OrderedDict([('location', 'Hart House'), ('building_id', '002'), ('times', [OrderedDict([('time', 24900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 26100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 27300), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 28500), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 30900), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 32100), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 35700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 38100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 41700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 45300), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 47700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 48900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 52500), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 56100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 58500), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 59700), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 63300), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 64500), ('rush_hour', True), ('no_overload', False)]), OrderedDict([('time', 66900), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 68100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 70500), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 74100), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 76500), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 77700), ('rush_hour', False), ('no_overload', True)]), OrderedDict([('time', 81300), ('rush_hour', False), ('no_overload', True)])])])])])])])
json_data = json.dumps(raw_data)
json_object = json.loads(json_data, object_pairs_hook=collections.OrderedDict)
date = json_object['date']
dateObject = datetime.datetime.strptime(date, "%Y-%m-%d")
utmDepartureTimes = json_object['routes'][0]['stops'][0]['times']
utsgDepartureTimes = json_object['routes'][0]['stops'][1]['times']

# Insert data into Mongo
dataToInsert = {
    "date": dateObject,
    "utm_departures": utmDepartureTimes,
    "utsg_departures": utsgDepartureTimes
}
collection = db.cars
insertResult = collection.insert_one(dataToInsert)

# Verify data has been written
if (insertResult.acknowledged):
    print("Insert success")
else:
    print("Insert fail")

# The _id of the document that was just inserted
# documentId = insertResult.inserted_id