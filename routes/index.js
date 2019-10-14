const express = require('express');
var data = require('../data/calendar.json')

const router = express.Router();

// Renders the 'form.pug' template from views
router.get('/', (req, res) => {
  res.render('form', {
      title: 'UTM Shuttle Bus Scheduler', 
      Months: data['Months'],
      Years: data['Years']
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
router.post("/dateChosen" , function(req, res){
  console.log(req.body)
  res.render('form', {
      title: 'Date Chosen',
      currentDate: 'The current date is ' + req.body.monthChosen,
      locationChosen: 'The location is ' + req.body.busStop,
      Months: data['Months'],
      Years: data['Years']
  })
})


module.exports = router;