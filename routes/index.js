const express = require('express');
const mongoose = require('mongoose');
const ShuttleData = mongoose.model('ShuttleData');
const os = require('os');
const calendarData = require('../data/calendar.json');
const building_data = require('../data/building_data.json');
const dateFormat = require('dateformat');
const router = express.Router();
const request = require('request');
require('dotenv').config();

let buildings = building_data.Buildings;

let today = new Date();
// This data initially shows the current time and default settings. It saves the user's last choice.
let preselectedData = {
  preselectedMonth: getMonthString(today.getMonth()),
  preselectedDay: today.getDate(),
  preselectedYear: today.getFullYear(),
  preselectedHour: today.getHours(),
  preselectedMinute: ceilRoundToInteger(today.getMinutes(), 5),
  preselectedUTSG: true,
  preselectedUTM: false
}

let busData;

// Renders the 'form.pug' template from views
router.all('/', (req, res) => {
  res.render('form', {
    title: 'UTM Shuttle Bus Scheduler', 
    Months: calendarData['Months'],
    Days: calendarData['Days'],
    Years: calendarData['Years'],
    Hours: calendarData['Hours'],
    Minutes: calendarData['Minutes'],
    Buildings: buildings,
    preselectedMonth: preselectedData.preselectedMonth,
    preselectedDay: preselectedData.preselectedDay,
    preselectedYear: preselectedData.preselectedYear,
    preselectedHour: preselectedData.preselectedHour,
    preselectedMinute: preselectedData.preselectedMinute,
    preselectedUTSG: preselectedData.preselectedUTM,
    preselectedUTM: preselectedData.preselectedUTSG
  });

  
});

// User chooses to calculate the next shuttle time
router.post("/leaveAt" , function(req, res){

  // Verifies if the user has entered a correct date
  //let validDate = verifyValidDate(req);
  let errMsg = "Default Error Message";
  verifyValidDate(req).then(
    (isValidDate) => {
      // Valid Date
      if (isValidDate) {
        console.log("The date is valid");
        //busData = getBusSchedule(req, res);

        // Verify if the user has entered a correct building name
        verifyValidBuilding(req).then(
          (isValidBuilding) => {
            // Valid Building
            if (isValidBuilding) {
              console.log("The building is valid");

              // Determine how long the shuttle will take to travel between campuses
              // This information is not wrapped in a Promise because it will simply
              // just be displayed on the front end
              let busStop = req.body.busStop;
              let originBusStopCoordinates;
              let destinationBusStopCoordinates
              if (busStop == "UTSG") {
                originBusStopCoordinates = "43.663700559989046,-79.3945183686304";
                destinationBusStopCoordinates = "43.55154,-79.66382";
              } else {
                originBusStopCoordinates = "43.55154,-79.66382";
                destinationBusStopCoordinates = "43.663700559989046,-79.3945183686304";
              }
              let busTripInformation = getGoogleDirections(originBusStopCoordinates, destinationBusStopCoordinates, "driving");
              let busTripDuration = busTripInformation.routes[0].legs.duration.text;

              // Get coordinates of origin building (building to start walking from)
              let originBuilding = req.body.buildingChosen;
              
              //let originBuildingCoordinates = `${building_data.originBuilding.lat},${building_data.originBuilding.long}`; // This gets the actual coordinates from the building_data.json file

              // TODO: Literally just pass in the user's search query, prepended with either "UTM" or "UOFT" into the API

              // TODO: Display the "start_address" to ensure the user put in a correct start building
              

              // Determine walking time for the user
              getGoogleDirections(originBuilding, originBusStopCoordinates, "walking").then(
                (directionsBody) => {
                  // console.log(directionsBody);

                  let suggestedStartAddress = directionsBody.routes[0].legs[0].start_address;
                  let walkingDistance = directionsBody.routes[0].legs.distance.text;
                  let walkingDuration = directionsBody.routes[0].legs.duration.text;
                  let walkingDurationSeconds = directionsBody.routes[0].legs.duration.value;
                  
                  console.log("Starting destination: " + suggestedStartAddress);
                  console.log("Starting bus stop: " + busStop)
                  console.log("Distance to walk: " + walkingDistance);
                  console.log("Time taken to walk: " + walkingDuration);
                }
              );
            
              // TODO: Given all of our information, determine an ideal set of instructions for the user
              // Will require: start date, start origin, destination, shuttle times
              // Will need to calculate which time from the shuttle times the user should aim for
              


              // Render the instructions for the user
              res.render('instructions', {
                title: 'Leave Now'
              });
            }
            // Invalid building -- ask user to enter a valid building
            else {
              console.log("The building is invalid");
              errMsg = "Please enter a valid building name!";
              res.render('form', {
                title: 'Date Chosen',
                errorMessage: errMsg,
                Months: calendarData['Months'],
                Days: calendarData['Days'],
                Years: calendarData['Years'],
                Hours: calendarData['Hours'],
                Minutes: calendarData['Minutes'],
                Buildings: buildings,
                preselectedMonth: preselectedData.preselectedMonth,
                preselectedDay: preselectedData.preselectedDay,
                preselectedYear: preselectedData.preselectedYear,
                preselectedHour: preselectedData.preselectedHour,
                preselectedMinute: preselectedData.preselectedMinute,
                preselectedUTSG: preselectedData.preselectedUTSG,
                preselectedUTM: preselectedData.preselectedUTM
              });
            }
          }
        )
      } 
      // Invalid Date -- ask user to enter a valid date
      else {
        console.log("The date is invalid");
        errMsg = "Please enter a valid month-date-year combination!";
        res.render('form', {
          title: 'Date Chosen',
          errorMessage: errMsg,
          Months: calendarData['Months'],
          Days: calendarData['Days'],
          Years: calendarData['Years'],
          Hours: calendarData['Hours'],
          Minutes: calendarData['Minutes'],
          Buildings: buildings,
          preselectedMonth: preselectedData.preselectedMonth,
          preselectedDay: preselectedData.preselectedDay,
          preselectedYear: preselectedData.preselectedYear,
          preselectedHour: preselectedData.preselectedHour,
          preselectedMinute: preselectedData.preselectedMinute,
          preselectedUTSG: preselectedData.preselectedUTSG,
          preselectedUTM: preselectedData.preselectedUTM
        });
      }
    }).catch((error) => {
      console.log("Promise caught error")
    });

    // Save user choices to preselectedData
    updatePreselectedData(req);
});

// Handles the POST route from choosing to leave now
router.post("/leaveNow" , function(req, res){
  //console.log(req.body)
  res.render('instructions', {
      title: 'Leave Now'
  });
});

router.get('/shuttleData', (req, res) => {
  // TOOD: Actually link this route to the front end somehow
  // TODO: Get user requested date, pass into the following anonymous function
  let lowerRange = dateFormat(new Date(2019, 10-1, 24), 'yyyy-mm-dd');
  let upperRange = dateFormat(new Date(2019, 10-1, 24+1), 'yyyy-mm-dd');

  // Accesses the ShuttleData Mongoose schema defined in models/ShuttleData.js
  ShuttleData.find({'date': {$gte: lowerRange, $lte: upperRange}})
    .then((shuttleData) => {
      res.render('shuttleData', { dataDump: shuttleData});
      //console.log(shuttleData[0].utm_departures[0]);
      //console.log(shuttleData.keys());

      shuttleData = shuttleData[0]._doc;
      //console.log(shuttleData);

      let retrievedDate = shuttleData.date;
      console.log(retrievedDate);

      let utmTimes = shuttleData.utm_departures;
      //console.log(utmTimes);

      let utsgTimes = shuttleData.utsg_departures;
      //console.log(utsgTimes);

      for (const key of Object.keys(utmTimes)) {
          console.log(utmTimes[key].time);
          console.log(utmTimes[key].rush_hour);
          console.log(utmTimes[key].no_overload);
      }

    })
    .catch(() => { res.send('Sorry! Something went wrong.'); });

  // res.render('shuttleData', { title: 'Listing registrations' });
});


// Handles the case where a user tries to go to a non-existent route
router.get('*', function(req, res){
  res.status(404).send('404. Please go home');
});

/**
 * Given a month value between 0 and 11, inclusive, returns the 
 * string equivalent.
 * 
 * @param {Number} monthValue 
 */
function getMonthString(monthValue) {
  let monthNames = 
    ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames[monthValue];
}

/**
 * Given a month string (eg. January, February, ..., December),
 * return the value equivalent (eg. 1, 2, ..., 12)
 * 
 * @param {String} monthString 
 */
function getMonthValue(monthString) {
  let monthNames = 
    ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames.indexOf(monthString) + 1
}

/**
 * Given a value, round up to the nearest interval specified by interval
 * 
 * @param {Number} value    The value you would like round
 * @param {Number} interval The interval you would like to round up to
 */
function ceilRoundToInteger(value, interval) {
  return Math.ceil(value/interval) * interval;
}


/**
 * Updates preselected data based on the user's choices
 * Req stores the request data, information coming IN from the user
 * 
 * @param {*} req 
 */
function updatePreselectedData(req) {
  preselectedData.preselectedMonth = req.body.monthChosen;
  preselectedData.preselectedDay = req.body.dayChosen;
  preselectedData.preselectedYear = req.body.yearChosen;
  preselectedData.preselectedHour = req.body.hourChosen;
  preselectedData.preselectedMinute = req.body.minuteChosen;
  preselectedData.preselectedUTSG = req.body.busStop == "UTSG";
  preselectedData.preselectedUTM = req.body.busStop == "UTM";
}

/**
 * Determines if the given month-day-year combination is valid.
 * 
 * @param {*} req 
 */
async function verifyValidDate(req) {
  let thirtyDays = ["April", "June", "September", "November"];
  let chosenMonth = req.body.monthChosen;
  let chosenDay = req.body.dayChosen;
  let chosenYear = req.body.yearChosen;

  if (thirtyDays.includes(chosenMonth) && chosenDay == 31) {
    return false;
  } else if (chosenMonth == "February" && chosenDay > 29) {
    return false;
  } 
  // Check if leap year
  else if (chosenMonth == "February" && chosenDay == 29) {
    const date = new Date(chosenYear, 1, 29);
    return date.getMonth() === 1;
  }
  return true;
}

/**
 * Determines if the provided building is valid.
 * 
 * @param {*} req 
 */
async function verifyValidBuilding(req) {

  let chosenBuilding = req.body.buildingChosen;
  console.log(chosenBuilding);
  if (buildings.includes(chosenBuilding)) {
    return true;
  }
  return false;
}

async function getGoogleDirections(originCoordinates, destinationCoordinates, transportationMethod) {
  // https://developers.google.com/maps/documentation/directions/intro#DirectionsRequests

  // Build up parameters
  parameters = {
    origin: originCoordinates, 
    destination: destinationCoordinates, 
    mode: transportationMethod, 
    key: process.env.GOOGLE_KEY
  };
  let url = "https://maps.googleapis.com/maps/api/directions/json?";

  // Send request to the Google Directions API
  return new Promise(function(resolve,reject) {
    request({url:url, qs:parameters}, function(err, response, body) {
      if(err) { 
        console.log(err); 
        return; 
      }
      // check for 200 status code
      console.log("Get response: " + response.statusCode);
      // console.log(body);
      resolve(body);
    })
  })
}


function getBusSchedule(req, res) { 
  var spawn = require("child_process").spawn; 
  
  // Guarantees (?) correct path to the py file we need to run
  // TODO: Ensure that this is correct. Explore alternatives.
  let filePath = process.cwd() + "/webscraper/ShuttleTimeChecker.py";
  // Spawns a new process, which runs ./python3 month_arg day_arg year_arg
  var ls = spawn('python3',
  [filePath, getMonthValue(req.body.monthChosen), req.body.dayChosen, req.body.yearChosen]); 

  // Saves stdout/stderr data
  ls.stdout.on('data', (data) => {
    //console.log(`stdout: ${data}`);
    // res.send(data.toString())
    return data;
  });
  
  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  
  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
} 

module.exports = router;