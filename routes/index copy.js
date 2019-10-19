const express = require('express');
const mongoose = require('mongoose');
const ShuttleData = mongoose.model('ShuttleData');
const os = require('os');
const calendarData = require('../data/calendar.json');
const building_data = require('../data/building_data.json');
const dateFormat = require('dateformat');
const router = express.Router();
const request = require('request');
const moment = require('moment');
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

let tripData = {
  originBuilding: "",
  leaveTime: "",
  walkTime: "",
  originBusStop: "",
  busDepartureTime: "",
  driveDuration: "",
  destinationBusStop: "",
  destinationCampus: "",
  arrivalTime: "",
  rushHourNotice: ""
}

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
        let busStop = req.body.busStop;
        let originBusStopCoordinates;
        let destinationBusStopCoordinates;
        let lowerDateRange = dateFormat(new Date(req.body.yearChosen, getMonthValue(req.body.monthChosen) - 1, req.body.dayChosen), 'yyyy-mm-dd');
        let upperDateRange = dateFormat(new Date(req.body.yearChosen, getMonthValue(req.body.monthChosen) - 1, req.body.dayChosen) + 1, 'yyyy-mm-dd');
        // The user's requested departure time, measured in in seconds after midnight
        let timeChosen = ((Number(req.body.hourChosen)) * 3600) + ((Number(req.body.minuteChosen)) * 60);

        if (busStop == "UTSG") {
          originBusStopCoordinates = "43.663700559989046,-79.3945183686304";
          destinationBusStopCoordinates = "43.55154,-79.66382";
          tripData.destinationCampus = "UTM";
          tripData.destinationBusStop = "Instructional Building";
        } else {
          originBusStopCoordinates = "43.55154,-79.66382";
          destinationBusStopCoordinates = "43.663700559989046,-79.3945183686304";
          tripData.destinationCampus = "UTSG";
          tripData.destinationBusStop = "Hart House";
        }

        // Determine approximately how long the shuttle bus trip between the two campuses will take
        let originBuilding = busStop + " " + req.body.buildingChosen;
        getGoogleDirections(originBusStopCoordinates, destinationBusStopCoordinates, "driving").then(
          (directionsBody) => {
            directionsBody = JSON.parse(directionsBody);
            // console.log(typeof(directionsBody));
            let busTripDurationSeconds = directionsBody.routes[0].legs[0].duration.value;
            tripData.driveDuration = convertToMinutes(busTripDurationSeconds);

            // busTripDuration = directionsBody.routes[0].legs[0].duration.text;
            // console.log(`The bus trip will take approximately ${busTripDuration} minutes`);
          }
        ).then(
          // Determine walking time for the user
          getGoogleDirections(originBuilding, originBusStopCoordinates, "walking").then(
            (directionsBody) => {
              directionsBody = JSON.parse(directionsBody);
              let suggestedStartAddress = directionsBody.routes[0].legs[0].start_address;
              let walkingDistance = directionsBody.routes[0].legs[0].distance.text;
              let walkingDuration = directionsBody.routes[0].legs[0].duration.text;
              let walkingDurationSeconds = directionsBody.routes[0].legs[0].duration.value;
              
              console.log("Starting destination: " + suggestedStartAddress);
              console.log("Starting bus stop: " + busStop)
              console.log("Distance to walk: " + walkingDistance);
              console.log("Time taken to walk: " + walkingDuration);

              tripData.walkTime = convertToMinutes(walkingDurationSeconds);
              tripData.originBuilding = suggestedStartAddress;
              tripData.originBusStop = busStop;
            }
          )
        ).then(
          // Accesses the ShuttleData Mongoose schema defined in models/ShuttleData.js
          ShuttleData.find({'date': {$gte: lowerDateRange, $lte: upperDateRange}})
          .then((shuttleData) => {
            // res.render('shuttleData', { t: tripData});

            // Check if data exists for the provided date
            if (shuttleData === undefined || shuttleData.length == 0) {
              console.log("There is no data for that date!");
            } else {
              res.render('shuttleData', {t: tripData});
            }

            shuttleData = shuttleData[0]._doc;
            let retrievedDate = shuttleData.date;
            console.log(retrievedDate);

            // Calculate possible departure times for the user
            let busTimes;
            if (busStop == "UTM") {
              busTimes = shuttleData.utm_departures;;
            } else {
              busTimes = shuttleData.utsg_departures;
            }
            
            let candidateBusDepartures = [];
            let walkingDurationSeconds = 60; // TODO: need to figure out a way to get this passed from the previous chained function
            let busTripDurationSeconds = 1800; // TODO: Need to figure out a way to get this passed from previous chained function...
            // console.log("Walking duration is " + walkingDurationSeconds);
            for (const key of Object.keys(busTimes)) {
              if (busTimes[key].time > timeChosen + walkingDurationSeconds) {
                candidateBusDepartures.push({time: busTimes[key].time, rush_hour: busTimes[key].rush_hour})
              }
            }

            // Check if the user has any buses they can take
            if (candidateBusDepartures === undefined || candidateBusDepartures.length == 0) {
              console.log("There are no more buses leaving today...")
            } else {
              tripData.leaveTime = getDateString(candidateBusDepartures[0].time - walkingDurationSeconds - 60); // add 1 minute of extra walking time
              tripData.arrivalTime = getDateString(candidateBusDepartures[0].time + busTripDurationSeconds);

              tripData.busDepartureTime = getDateString(candidateBusDepartures[0].time);

              console.log("Leave from building at " + tripData.leaveTime);
              console.log("Arrive at destination at " + tripData.arrivalTime);
              console.log("Bus departs at " + tripData.busDepartureTime);

            }
    
          })
          .catch((error) => { console.log('Something went wrong...  ' + error); 
          })
        );
      
        // TODO: Given all of our information, determine an ideal set of instructions for the user
        // Will require: start date, start origin, destination, shuttle times
        // Will need to calculate which time from the shuttle times the user should aim for
              
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
      console.log("Promise caught " + error)
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

  console.log("bruh");
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

function convertToMinutes(seconds) {
  return Math.floor(seconds/60) + 1; // Round up
}

function getDateString(seconds) {
  return moment("00:00", "HH:mm").add(seconds, "seconds").format("HH:mm A");
}

/**
 * 
 * @param {*} month 
 * @param {*} day 
 * @param {*} year 
 * @param {*} futureDays 
 */
function updateDatabase(month, day, year, futureDays) { 
  var spawn = require("child_process").spawn; 
  
  // Guarantees (?) correct path to the py file we need to run
  let filePath = process.cwd() + "/webscraper/MongoUpdater.py";
  // Spawns a new process, which runs ./python3 MongoUpdater month day year futureDays
  var ls = spawn('python3', [filePath, month, day, year]); 

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