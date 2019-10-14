import requests
from requests.exceptions import Timeout
from bs4 import BeautifulSoup
from collections import OrderedDict
import re
import time

class ShuttleTimeChecker:
    """
    """

    def __init__(self):
        self.URL = "https://m.utm.utoronto.ca/shuttleByDate.php"

        self.building_ids = {
        'Instructional Centre Layby': '334',
        'Hart House': '002',
        'Deerfield Hall North Layby': '340'
    }


    def writeToJSON(self):
        """ Given data, write to a given JSON file
        """
        pass

    def makeRequest(self, url, param):
        """ Given a hyperlink, send an HTTP request to that website.
        Save the response.
        """
        try:
            res = requests.get(url, params=param, timeout=5)
        except requests.exceptions.Timeout:
            pass
        except requests.exceptions.RequestException as e:
            print(e)
            #sys.exit(1)
        else:
            if (res.status_code == 200):
                #print(res.text)
                #print(res.headers)
                return res.text
            else:
                print(res.status_code)
                return "empty_response"

    def getShuttleSchedule(self, day, month, year):
        """ Given a date and time, get the shuttle times
        """
        utm_times = []
        utsg_times = []

        # for some reason, using the variable doesn't work
        dateParam = {"month": 10, "day": 16, "year": 2019}
        markup = self.makeRequest(self.URL, dateParam)
        #print(markup)
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
                print(_route_id)
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
        
if __name__ == "__main__":
    #URL = "https://m.utm.utoronto.ca/shuttleByDate.php"
    #dateParam = {"month": 10, "day": 16, "year":2019}
    stc = ShuttleTimeChecker()
    #stc.makeRequest(URL, dateParam)
    d = stc.getShuttleSchedule(10, 16, 2019)

    for k, v in d.items():
        #print(k,v) 
        pass