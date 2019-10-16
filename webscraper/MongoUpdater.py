import datetime
import json
import collections
import sys
import argparse
import calendar
import logging
from logging.handlers import RotatingFileHandler
from collections import OrderedDict
from json import loads, dumps
from pymongo import MongoClient, UpdateMany
from datetime import timedelta
from ShuttleTimeChecker import ShuttleTimeChecker

# Ensure that the command line arguments are being provided correctly
parser = argparse.ArgumentParser(description="Update Mongo server with shuttle data for a particular date or date range. Be sure to use Python3")
parser.add_argument("month", metavar="mm", type=int, help='The month in numerical form (eg. 1, 2, ..., 12)')
parser.add_argument("day", metavar="dd", type=int, help='The day in numerical form (eg. 1, 2, ..., 31)')
parser.add_argument("year", metavar="yyyy", type=int, help='The year in numerical form (eg. 2017, 2018, ...)')
parser.add_argument("range", metavar="n", type=int, default=0, nargs='?', help='Optional. Get data for n days into the future from the provided day (inclusive).')
args = parser.parse_args()

month = args.month
day = args.day
year = args.year
futureDays = args.range


# Error checking user inputted date
# TODO: find a better way to do this
if (month < 1 or month > 12):
    raise argparse.ArgumentTypeError("Enter a month value between 1 and 12, inclusive.")
if (day < 1 or day > 31):
    raise argparse.ArgumentTypeError("Enter a day value between 1 and 31, inclusive.")
if (year < 2018):
        raise argparse.ArgumentTypeError("Enter a year after 2017 please.")
if (month in [4, 6, 9, 11] and day == 31):
    raise argparse.ArgumentTypeError("Your selected month does not have 31 day.")
if (month == 2 and day > 29):
    raise argparse.ArgumentTypeError("Your selected month cannot have this many day")
# Leap year
if (not calendar.isleap(year) and day == 29):
    raise argparse.ArgumentTypeError("February does not have 29 day for the given year.")
if (futureDays < 0):
    raise argparse.ArgumentTypeError("Your value for range must be 0 or greater")

# Create datetime object
date = datetime.datetime(year, month, day)

# Set up logging structures
LOG_FILENAME = 'MongoUpdater.log'
muLogger = logging.getLogger("muLogger")
logFormat = logging.Formatter("[%(asctime)s] %(message)s")
muLogger.setLevel(logging.WARNING)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, \
    mode='a', maxBytes=4194304, backupCount = 5)
handler.setFormatter(logFormat)
muLogger.addHandler(handler)

# Connect to Mongo
client = MongoClient('mongodb://localhost:27017/')
db = client['shuttle_db']


# Build up data to insert to Mongo
dataToInsert = []
stc = ShuttleTimeChecker()
for i in range(futureDays + 1):
    # Get data from ShuttleTimeChecker
    raw_data = stc.getShuttleSchedule(date.month, date.day, date.year)
    if (len(raw_data) == 0):
        print("Cannot get data from ShuttleTimeChecker. Check the logs")
        date = date + timedelta(days=1)
    else:
        # Clean data, saving only the date and shuttle departure times (with status updates)
        json_data = json.dumps(raw_data)
        json_object = json.loads(json_data, object_pairs_hook=collections.OrderedDict)
        #dateToCheck = json_object['date']
        #dateObject = datetime.datetime.strptime(dateToCheck, "%Y-%m-%d")
        # TODO: We need to guarantee that the date in the JSON is correct
        utmDepartureTimes = json_object['routes'][0]['stops'][0]['times']
        utsgDepartureTimes = json_object['routes'][0]['stops'][1]['times']

        dataToInsert.append({
            "date": date,
            "utm_departures": utmDepartureTimes,
            "utsg_departures": utsgDepartureTimes
        })
        date = date + timedelta(days=1)

# Insert data into Mongo
insertResult = db.shuttle_data.insert_many(dataToInsert)

# Verify data has been written
if (insertResult.acknowledged):
    print("Insert success")
else:
    print("Insert fail")
    muLogger.warning("Insert Fail, could not insert the following data:\n" + dataToInsert + "\n\n\n")