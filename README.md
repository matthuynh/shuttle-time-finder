# shuttle-time-finder
Given your current location, this web app will determine the next UTSG-UTM shuttle bus you can take. The app takes into account your distance from the bus stop and provides you with a time that indicates when you should start walking from your current location to get to the bus (on time!).You can also schedule when you would like to leave. 

## Screenshots
<img src="https://user-images.githubusercontent.com/19757152/67150292-c1f1d600-f283-11e9-9e66-7ee140a86b2f.PNG" width="500">
<img src="https://user-images.githubusercontent.com/19757152/67150291-c1f1d600-f283-11e9-8fc6-de08aad2120a.PNG" width="500">
<img src="https://user-images.githubusercontent.com/19757152/67150290-c1f1d600-f283-11e9-8732-9e0598d22362.PNG" width="500">


## Technologies Used
More explanations coming _soon_
- Node
- Express, Pug (front-end templating)
- Mongo
    - Why Mongo?
- Python 

----------
# Requirements and Dependencies
## Python
- `pip install bs4`
    - version 0.01
- `pip install requests`
    - version 2.19.1

## JavaScript
- node 10.16.0
- npm 6.10.3

## Mongo
- MongoDB 4.0.10

## Google Directions API
- You will need an API key from Google Maps Platform (you will need to have a Google Cloud Platform billing account) for the Directions API
- This is "free" (You get $200 in credits for use each month. To exceed this, you would need to make millions of requests with your key)
- https://developers.google.com/maps/gmp-get-started

# Install
## To install and run an instance on your local machine, do

#### Step 1: Ensure that you have fulfilled all the requirements from above

  

#### Step 2: Clone this repo:

+ `$ git clone https://github.com/matthuynh/shuttle-time-finder.git`

  

#### Step 3: Install node module dependencies

- `$ cd shuttle-time-finder`

- `$ npm install`

  

#### Step 4: Initialize the Mongo server

- Start up an instance of Mongo on localhost:27017. Be sure to leave this server up.

- `$ mongod`

- Create a shuttle_db db and inside this db, create a shuttle_data collection

```

$ mongo

<Inside  Mongo  shell>

$ use shuttle_db

$ db.createCollection("shuttle_data")

```

  

#### Step 5: Create shuttle-time-finder/.env

```

$ pwd

/Documents/shuttle-time-finder

$ vi .env

```

Inside your .env file, be sure to set these variables:

```

DATABASE=mongodb://localhost:27017/shuttle_db

COLLECTION_PATH=db.shuttle_data

GOOGLE_KEY=<Your_API_Key_Here>

```

  

#### Step 6: Populate the Mongo server

- You will need to run the Python script found at shuttle-time-finder/webscraper/MongoUpdater.py

- `$ pwd` should output `/Documents/shuttle-time-finder/webscraper`

- `$ python3 MongoUpdater.py 10 17 2019 10`
This will webscrape shuttle bus data for the days starting from Oct 17, 2019 until Oct 27, 2019.

- To learn more about the script options, do `$ python3 MongoUpdater.py -h`

- Note that this script is meant to run periodically as a cron job in order to maintain accurate shuttle data.

#### Step 7: You can (finally) run the server now!

- `$ npm run watch`
- The project should start on your localhost on port 3000. To view on your browser, navigate to `localhost:3000`.

----------
# Sources
- Webscraping code adapted from: https://github.com/cobalt-uoft/uoft-scrapers/blob/master/uoftscrapers/scrapers/shuttles/__init__.py
- UofT Building Data adapted from: https://github.com/cobalt-uoft/datasets/blob/master/buildings.json


# Known Issues
- Input validation does not exist for months of varying days (and leap years). For example, Feburary 2020 (a leap year) should have 29 days, but the form will show that it has 31 days.
    - All months have 31 days
    - Proposed solution: update the dropdown for Day depending on the Month and Year chosen

# Future Roadmap
- [ ] JEST tests
- [ ] Updated front end using React
- [ ] More functionality and customizability for the user (eg. the ability to view various shuttle schedule times, the ability to choose when to arrive)
- [ ] Leverage the Directions API to provide more functionality (eg. traffic data, the ability to choose between walking, biking, transit, and driving)
- [ ] Improved search functionality and redundancy for UofT buildings
- [ ] The ability to get the user's current location (will require React to be implemented first)
- [ ] https://github.com/timoxley/best-practices
- [ ] https://gist.github.com/sidorares/c49750ed8f7750afd5ad
