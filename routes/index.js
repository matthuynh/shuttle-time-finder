const express = require('express');
const mongoose = require('mongoose');
const ShuttleData = mongoose.model('ShuttleData');
const os = require('os');
let calendarData = require('../data/calendar.json');
const dateFormat = require('dateformat');
const router = express.Router();

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
  let errMsg = "";

  verifyValidDate(req).then(
    (isValidDate) => {
      // Valid Date
      if (isValidDate) {
        console.log("The date is valid");
        //busData = getBusSchedule(req, res);
        res.render('instructions', {
          title: 'Leave Now'
        });
      } 
      // Invalid Date
      else {
        console.log("The date is invalid")
        errMsg = "Please enter a valid month-date-year combination!"
        res.render('form', {
          title: 'Date Chosen',
          errorMessage: errMsg,
          Months: calendarData['Months'],
          Days: calendarData['Days'],
          Years: calendarData['Years'],
          Hours: calendarData['Hours'],
          Minutes: calendarData['Minutes'],
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
      
      console.log('reached');
      //let shuttleJsonData = shuttleData.toObject();
      console.log('here');
      //console.log(shuttleJsonData);
      const fs = require('fs');

      fs.writeFile("test.txt", shuttleData, function(err) {

          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
      }); 

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