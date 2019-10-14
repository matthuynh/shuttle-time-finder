const express = require('express');
var data = require('../data/calendar.json')

const router = express.Router();

let today = getCurrentDate();
// This data initially shows the current time and default settings. It saves the user's last choice.
let preselectedData = {
  preselectedMonth: getCurrentMonth(today.getMonth()),
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

//Handles the POST route from selecting a date from dropdown
router.post("/leaveAt" , function(req, res){
  // Save user choices to preselectedData
  updatePreselectedData(req);

  console.log(req.body)
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

//Handles the POST route from choosing to leave now
router.post("/leaveNow" , function(req, res){
  console.log(req.body)
  res.render('instructions', {
      title: 'Leave Now'
  });
});


function getCurrentDate() {
  let today = new Date();
  return today;
}

function getCurrentMonth(monthValue) {
  let monthNames = 
    ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames[monthValue];
}

function ceilRoundToInteger(value, interval) {
  return Math.ceil(value/interval) * interval;
}


// Remember that request stores information coming IN from the user
function updatePreselectedData(req) {
  preselectedData.preselectedMonth = req.body.monthChosen;
  preselectedData.preselectedDay = req.body.dayChosen;
  preselectedData.preselectedYear = req.body.yearChosen;
  preselectedData.preselectedHour = req.body.hourChosen;
  preselectedData.preselectedMinute = req.body.minuteChosen;
  preselectedData.preselectedUTSG = req.body.busStop == "UTSG";
  preselectedData.preselectedUTM = req.body.busStop == "UTM";
}

module.exports = router;