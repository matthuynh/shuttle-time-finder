import requests
import re
import time
import logging
from logging.handlers import RotatingFileHandler
#import sys
#import json
from requests.exceptions import Timeout
from bs4 import BeautifulSoup
from collections import OrderedDict


class ShuttleTimeChecker:
    """ Gets shuttle data from a UTM website.
    """

    def __init__(self):
        self.URL = "https://m.utm.utoronto.ca/shuttleByDate.php"
        self.building_ids = {
            'Instructional Centre Layby': '334',
            'Hart House': '002',
            'Deerfield Hall North Layby': '340'
        }

        # Setup logging
        LOG_FILENAME = 'ShuttleTimeChecker.log'
        self.stcLogger = logging.getLogger("stcLogger")
        logFormat = logging.Formatter("[%(asctime)s] %(message)s")
        self.stcLogger.setLevel(logging.WARNING)
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, \
            mode='a', maxBytes=4194304, backupCount = 5)
        handler.setFormatter(logFormat)
        self.stcLogger.addHandler(handler)

    def makeRequest(self, url, param):
        """ Given a hyperlink, send an HTTP request to that website.
        Return the response.

        Args:
            url (str): The URL to send a GET request to.
            param (dict): The year, month, and date params for the GET request.
        
        Returns:
            return_str (str): The result of the request.
        """
        return_str = "invalid_request"

        # Verify that the request was successful
        try:
            res = requests.get(url, params=param, timeout=5)
        except requests.exceptions.Timeout as e:
            print(e)
            self.stcLogger.warning(e)
        except requests.exceptions.RequestException as e:
            print(e)
            self.stcLogger.warning(e)
        except Exception as e:
            print(e)
            self.stcLogger.warning(e)
        else:
            if (res.status_code == 200):
                return_str = res.text
            else:
                print("Status code: " + str(res.status_code))
                return_str = "empty_response"
                self.stcLogger.warning(res.status_code)
        finally:
            return return_str


    def getShuttleSchedule(self, day, month, year):
        """ Given a date and time, get the shuttle times.

        Note: The webscraping and regex functionality from this function is from
        https://github.com/cobalt-uoft/uoft-scrapers/blob/master/uoftscrapers/scrapers/shuttles/__init__.py

        Args: 
            day (int)
            month (int)
            year (int)
        
        Returns: An OrderedDict of the requested shuttle schedule data.
            This object can be converted into JSON. If webscraping was 
            unsuccessful, returns an empty OrderedDict
        """
        # Attempt to get the HTML
        dateParam = {"month": str(day), "day": str(month), "year": str(year)}
        markup = self.makeRequest(self.URL, dateParam)
        if (markup == "invalid_request" or markup == "empty_response"):
            return OrderedDict()
        soup = BeautifulSoup(markup, 'html.parser')

        # Get date
        date = time.strftime(
            '%Y-%m-%d', time.strptime(soup.find('h2').get_text().strip(), '%b %d %Y'))

        # Get route data
        routes = {}
        _routes = soup.find(id='chooseRoute')
        if _routes:
            for _route in _routes.find_all('option'):
                _route_id = _route.get('value')
                # print(_route_id)
                _route_times = soup.find(id=_route_id).find_all('li')

                route_name, route_location = _route.get_text().strip().split(' @ ')
                route_id = re.sub('\.|ROUTE| ', '', route_name.upper())

                times = []
                for _route_time in _route_times:
                    _route_time_text = _route_time.get_text().strip().lower()
                    _route_time_clean = re.sub(
                        '\*.*\*', '', _route_time_text).strip()

                    time_rush_hour = 'rush hour' in _route_time_text
                    time_no_overload = 'no overload' in _route_time_text

                    military_time = time.strftime('%H:%M %p',
                        time.strptime(_route_time_clean, '%I:%M %p'))[:-3]
                    military_time = [int(x) for x in military_time.split(':')]

                    seconds = military_time[0] * 3600 + military_time[1] * 60

                    times.append(OrderedDict([
                        ('time', seconds),
                        ('rush_hour', time_rush_hour),
                        ('no_overload', time_no_overload)
                    ]))

                # TODO: fetch this dynamically
                route_building_id = self.building_ids[route_location] if route_location in self.building_ids else ''

                route_stops = OrderedDict([
                    ('location', route_location),
                    ('building_id', route_building_id),
                    ('times', times)
                ])

                if route_id in routes.keys():
                    routes[route_id]['stops'].append(route_stops)
                else:
                    routes[route_id] = OrderedDict([
                        ('id', route_id),
                        ('name', route_name),
                        ('stops', [route_stops])
                    ])

        return OrderedDict([
            ('date', date),
            ('routes', [v for k, v in routes.items()])
        ])

    
    # def writeToJSON(self, data):
    #     """ Given OrderedDict data, write to a given JSON file

    #     TODO: Error checking.
    #     """
    #     with open('data.json', 'w+') as outfile:
    #         json.dump(data, outfile, ensure_ascii=True, indent=4)

     
if __name__ == "__main__":
    stc = ShuttleTimeChecker()
    result = stc.getShuttleSchedule(11, 11, 2019)

    # Code below used for spawning a child process from node and running python3 on this file
    # month = int(sys.argv[1])
    # day = int(sys.argv[2])
    # year = int(sys.argv[3])
    # print("Date returned from Python is {0}, {1}, {2}".format(month, day, year))
    # sys.stdout.flush()