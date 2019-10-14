const express = require('express');
const os = require('os');
var data = require('../data/calendar.json');

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


// Renders the 'form.pug' template from views
router.all('/', (req, res) => {
  res.render('form', {
    title: 'UTM Shuttle Bus Scheduler', 
    Months: data['Months'],
    Days: data['Days'],
    Years: data['Years'],
    Hours: data['Hours'],
    Minutes: data['Minutes'],
    preselectedMonth: preselectedData.preselectedMonth,
    preselectedDay: preselectedData.preselectedDay,
    preselectedYear: preselectedData.preselectedYear,
    preselectedHour: preselectedData.preselectedHour,
    preselectedMinute: preselectedData.preselectedMinute,
    preselectedUTSG: preselectedData.preselectedUTM,
    preselectedUTM: preselectedData.preselectedUTSG
  });
});

// User chooses to Calculate the next shuttle time
router.post("/leaveAt" , function(req, res){

  getBusSchedule(req, res);

  // Save user choices to preselectedData
  updatePreselectedData(req);

  //console.log(req.body)
  res.render('form', {
    title: 'Date Chosen',
    currentDate: 'The current date is ' + req.body.monthChosen + req.body.dayChosen + req.body.yearChosen,
    locationChosen: 'The location is ' + req.body.busStop,
    Months: data['Months'],
    Days: data['Days'],
    Years: data['Years'],
    Hours: data['Hours'],
    Minutes: data['Minutes'],
    preselectedMonth: preselectedData.preselectedMonth,
    preselectedDay: preselectedData.preselectedDay,
    preselectedYear: preselectedData.preselectedYear,
    preselectedHour: preselectedData.preselectedHour,
    preselectedMinute: preselectedData.preselectedMinute,
    preselectedUTSG: preselectedData.preselectedUTM,
    preselectedUTM: preselectedData.preselectedUTSG
  });
});

// Handles the POST route from choosing to leave now
router.post("/leaveNow" , function(req, res){
  //console.log(req.body)
  res.render('instructions', {
      title: 'Leave Now'
  });
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

// router.post("/leaveAt", getShuttleTimes);

// function getShuttleTimes(req, res) {
//   console.log("Getting shuttle times...");

//   let spawn = require("child_process").spawn;
//   let process = spawn('python', ["../webscraper/ShuttleTimeChecker.py", 
//   req.body.monthChosen, req.body.dayChosen, req.body.yearChosen]);

//   process.stdout.on('data', function(data) {
//     res.send(data.toString());
//   })
// }
  
function getBusSchedule(req, res) { 
    var spawn = require("child_process").spawn; 
    
    // Guarantees (?) correct path to the py file we need to run
    // TODO: Ensure that this is correct. Explore alternatives.
    let filePath = process.cwd() + "/webscraper/ShuttleTimeChecker.py";
    // Spawns a new process, which runs ./python3 month_arg day_arg year_arg
    var ls = spawn('python3',
    [filePath, getMonthValue(req.body.monthChosen), req.body.dayChosen, req.body.yearChosen]); 

    // Sends stdout/stderr data to res object
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      res.send(data.to)
    });
    
    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    
    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
} 
  

module.exports = router;