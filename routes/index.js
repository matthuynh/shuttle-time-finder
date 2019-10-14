const express = require('express');
var data = require('../data/calendar.json')

const router = express.Router();

// Renders the 'form.pug' template from views
router.get('/', (req, res) => {
  let today = getCurrentDate();
  let currentMonth = getCurrentMonth(today.getMonth());
  let currentDate = today.getDate();
  let currentYear = today.getFullYear();
  let currentHour = today.getHours();
  let currentMinute = ceilRoundToInteger(today.getMinutes(), 5);
  
  res.render('form', {
    title: 'UTM Shuttle Bus Scheduler', 
    Months: data['Months'],
    Days: data['Days'],
    Years: data['Years'],
    Hours: data['Hours'],
    Minutes: data['Minutes'],
    preselectedMonth: currentMonth,
    preselectedDay: currentDate,
    preselectedYear: currentYear,
    preselectedHour: currentHour,
    preselectedMinute: currentMinute,
    preselectedUTSG: true,
    preselectedUTM: false
  });
});

// Handles the POST route from clicking on 'Submit'
// router.post('/', (req, res) => {
//     console.log(req.body);
//     res.render('form', { 
//         title: 'Time Submission', 
//         Months: data['Months']
//     });
// });


//Handles the POST route from selecting a date from dropdown
router.post("/leaveAt" , function(req, res){
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
    preselectedMonth: req.body.monthChosen,
    preselectedDay: req.body.dayChosen,
    preselectedYear: req.body.yearChosen,
    preselectedHour: req.body.hourChosen,
    preselectedMinute: req.body.minuteChosen,
    preselectedUTSG: req.body.busStop == "UTSG",
    preselectedUTM: req.body.busStop == "UTM"
  })
})

//Handles the POST route from choosing to leave now
router.post("/leaveNow" , function(req, res){
  console.log(req.body)
  res.render('instructions', {
      title: 'Leave Now'
  })
})


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

module.exports = router;