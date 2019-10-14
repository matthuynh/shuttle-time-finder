import requests
from requests.exceptions import Timeout
import bs4

class ShuttleTimeChecker:
    """
    """

    #URL = "https://m.utm.utoronto.ca/shuttleByDate.php?month=10&day=16&year=2019"

    def getShuttleSchedule(self, building, roomNumber, year, month, date):
        """ Given a date and time, get
        """
        pass

    def writeToJSON(self):
        """ Given data, write to a given JSON file
        """
        pass

    def makeRequest(self, url):
        """ Given a hyperlink, send an HTTP request to that website.
        Save the response.
        """
        try:
            res = requests.get(url, timeout=5)
        except requests.exceptions.Timeout:
            pass
        except requests.exceptions.RequestException as e:
            print(e)
            #sys.exit(1)
            return "empty_response"
        else:
            if (res.status_code == 200):
                print(res.text)
                #print(res.headers)
            else:
                print(res.status_code)
                return "empty_response"

        


if __name__ == "__main__":
    URL = "https://m.utm.utoronto.ca/shuttleByDate.php?month=10&day=16&year=2019"
    stc = ShuttleTimeChecker()
    stc.makeRequest(URL)