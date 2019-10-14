# shuttle-time-finder
Given your current location, calculates when the next UTM-UTSG shuttle bus is

# what dis
## link to GAE site
## brief description
## screenshots

# Installing and Dependencies
## To install on your local machine, do
- a
- b
- c

## Python
- `pip install bs4`
    - version 0.01
- `pip install requests`
    - version 2.19.1

## JavaScript
- node 10.16.0
- npm 6.10.3
    - do `npm install`

# Sources
- https://developers.google.com/web/fundamentals/native-hardware/user-location

- Followed this guide: https://www.sitepoint.com/build-simple-beginner-app-node-bootstrap-mongodb/
- Used information from here: https://closebrace.com/tutorials/2017-03-02/creating-a-simple-restful-web-app-with-nodejs-express-and-mongodb
- Webscraping code from: https://github.com/cobalt-uoft/uoft-scrapers/blob/master/uoftscrapers/scrapers/shuttles/__init__.py




# Known Issues
- Input validation does not exist for months of varying days (and leap years). For example, Feburary 2020 (a leap year) should have 29 days, but the form will show that it has 31 days.
    - All months have 31 days
    - Proposed solution: update the dropdown for Day depending on the Month and Year chosen

# To Add/To Do
- JEST tests
- https://github.com/timoxley/best-practices
- https://gist.github.com/sidorares/c49750ed8f7750afd5ad