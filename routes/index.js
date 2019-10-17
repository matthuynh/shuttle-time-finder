const express = require('express');
const mongoose = require('mongoose');
const ShuttleData = mongoose.model('ShuttleData');
const os = require('os');
let calendarData = require('../data/calendar.json');
const dateFormat = require('dateformat');
const router = express.Router();
const request = require('request');
require('dotenv').config();

// let buildings = ['University College', 'Hart House', 'Gerstein Science Information Centre in the Sigmund Samuel Library Bldg', 'McMurrich Building', 'Medical Sciences Building', 'John P. Robarts Library Building', 'Claude T. Bissell Building', 'Thomas Fisher Rare Book Library Building', 'Lassonde Mining Building', 'Wallberg Building', 'D.L. Pratt Building', 'Sandford Fleming Building', 'Simcoe Hall', 'Convocation Hall', 'C. David Naylor Building', 'Munk School of Global Affairs at Trinity', 'Munk School of Global Affairs - Graham Library', 'Whitney Hall', 'Bloor Street West-371', 'Banting Institute', "Queen's Park-90", 'Central Steam Plant', 'J. Robert S. Prichard Alumni House', 'Rosebrugh Building', 'Engineering Annex', 'Mechanical Engineering Building', 'University College Union', 'Haultain Building', 'FitzGerald Building', 'Cumberland House', 'St. George Street-45', '230 College Street', 'Sir Daniel Wilson Residence', 'Varsity Centre', 'Wetmore Hall-New College', 'Wilson Hall-New College', 'Sidney Smith Hall', 'Massey College', 'Astronomy & Astrophysics Building', 'Woodsworth College', 'St. George Street-49', 'Faculty of Law', 'Varsity Pavilion', 'Goldring Centre for High Performance Sport', 'School of Graduate Studies', 'Canadiana Gallery', 'Falconer Hall', 'Edward Johnson Building', 'Best Institute', 'Leighton Goldie McCarthy House (Child Study)', 'Daniels Building', "Graduate Students' Union", 'Bancroft Building', 'Borden Building South', 'Borden Building North', 'Earth Sciences Centre', 'Graduate House', 'Dentistry Building', 'Spadina Avenue-665', 'Huron Street-215', 'Clara Benson Building', 'Warren Stevens Building', 'Galbraith Building', 'College Street-92', 'Ramsay Wright Laboratories', 'Lash Miller Chemical Laboratories', 'Faculty Club', 'Sussex Court', 'McLennan Physical Laboratories', 'Anthropology Building', 'Bahen Centre for Information Technology', 'Gage Building', 'McCaul Street-254/256', 'College Street - 245', 'Centre for Engineering Innovation and Entrepreneurship (Under Construction)', 'St. George Street123', 'Munk School of Global Affairs at the Observatory', 'College Street-88', 'Luella Massey Studio Theatre', 'Communication House', 'Electrometallurgy Lab', 'Back Campus Fields', "Queen's Park Crescent East-39", "Queen's Park Crsc. E.-39A", 'Wellesley Street West -90', 'Morrison Hall', "Soldiers' Tower", 'School of Continuing Studies', 'Max Gluskin House', 'Fields Inst for Research in Math Science', 'St. George Street-162', 'St. George Street-121', 'Factor-Inwentash Faculty of Social Work', 'Louis B. Stewart Observatory (UTSU)', 'Ontario Institute for Studies in Education', 'Spadina Avenue-703', 'Enrolment Services', 'Jackman Humanities Building', 'Early Learning Centre', 'Woodsworth College Residence', 'New College III', 'Innis College', 'Innis College Student Residence', 'Rotman School of Management', 'Huron Street-370', 'Devonshire Place-100 (Demolished Feb, 2012)', 'Spadina Ave-713', 'Koffler Student Services Centre', 'Koffler House', 'Sussex Avenue-40', 'Fasken Martineau Building', 'Rehabilitation Sciences Building', 'Spadina Road-56', 'Health Sciences Building', 'Exam Centre', 'Old Admin Bldg (Board of Ed)', 'Chestnut Residence and Conference Centre', 'Terrence Donnelly Ctr for Cellular & Biomolecular Res', 'Leslie L. Dan Pharmacy Building', 'Spadina Ave-455', 'Macdonald-Mowat House', 'College Street-229', 'Spadina Avenue-720', 'Stewart Building', 'Edward Street-123', 'TWH-Krembil Discovery Tower', 'MARS 2', 'Bladen Wing (B-Wing)', 'Humanities Wing (H-Wing)', 'Portable 101', 'Portable 102', 'Portable 103', 'Social Sciences Building', 'Portable 104', 'Portable 105', 'Portable 106', 'Highland Hall (Under Construction)', 'Science Wing (S-Wing)', 'Academic Resource Centre', 'UTSC Student Centre', 'Arts & Admin Building', 'Science Research Building', 'Instructional Centre (UTSC)', 'Environmental Science & Chemistry', 'Toronto Pan Am Sports Centre', 'Block A (Student Townhouse Res-Phase I)', 'Block B (Student Townhouse Res-Phase I)', 'Block C (Student Townhouse Res-Phase I)', 'Block D (Student Townhouse Res-Phase I)', 'Block E (Student Townhouse Res-Phase I)', 'Block F (Student Townhouse Res-Phase II)', 'Block G (Student Townhouse Res-Phase II)', 'Block H (Student Townhouse Res-Phase II)', 'Block I (Student Townhouse Res-Phase II)', 'Block J(Student Townhouse Res-Phase III)', 'Block K(Student Townhouse Res-Phase III)', 'Block L(Student Townhouse Res-Phase III)', 'Block M(Student Townhouse Res-Phase III)', 'Joan Foley Hall (Student Res-Phase IV)', 'Student Residence Centre', "N'sheemaehn Child Care Centre", 'Harbutt House (Vacant)', 'Coach House - Old Kingston Rd', 'Miller Lash House', "Lislehurst (Principal's Residence)", 'Forensic Anthropology Field School', 'North Building', 'Central Utilities Plant', 'William G. Davis Building', 'Kaneff Centre', 'Innovation Complex', 'Erindale Studio Theatre', 'Paleomagnetism Laboratory', 'Schreiberwood Res - Block A (Phase I)', 'Schreiberwood Res - Block B (Phase I)', 'Schreiberwood Res - Block C (Phase I)', 'Schreiberwood Res - Block D (Phase I)', 'Schreiberwood Res - Block E (Phase I)', 'Schreiberwood Res - Block F (Phase I)', 'Schreiberwood Res - Block G (Phase I)', 'McLuhan Court Res - Block H (Phase II)', 'McLuhan Court Res - Block I (Phase II)', 'McLuhan Court Res - Block J (Phase II)', 'McLuhan Court Res - Block K (Phase II)', 'Putnam Place Res - Block L  (Phase III)', 'Putnam Place Res - Block M (Phase III)', 'Putnam Place Res - Block N (Phase III)', 'Putnam Place Res - Block O (Phase III)', 'Leacock Lane Res - Block P (Phase IV)', 'Leacock Lane Res - Block Q (Phase IV)', 'Leacock Lane Res - Block R (Phase IV)', 'Leacock Lane Res - Block S (Phase IV)', 'MaGrath Valley Res - Block T (Phase V)', 'MaGrath Valley Res - Block U (Phase V)', 'MaGrath Valley Res - Block V (Phase V)', 'MaGrath Valley Res - Block W (Phase V)', 'MaGrath Valley Res - Block X (Phase V)', 'MaGrath Valley Res - Block Y (Phase V)', 'Roy Ivor Hall Res - House A (Phase VI)', 'Roy Ivor Hall Res - House B (Phase VI)', 'Roy Ivor Hall Res - House C (Phase VI)', 'Roy Ivor Hall Res - House D (Phase VI)', 'Erindale Hall Residence (Phase VII)', 'Oscar Peterson Hall (Phase VIII)', 'UTM Student Centre', 'Communication, Culture & Technology', 'UTM Alumni House', 'Hazel McCallion Academic Learning Centre', 'Recreation, Athletics & Wellness Centre', 'Terrence Donnelly Health Sciences Complex', 'Instructional Centre (UTM)', 'Academic Annex', 'Grounds Storage Facility', 'Biology Research Greenhouse', 'Deerfield Hall', 'North Building Reconstruction  (Under Construction)', 'Loretto College', 'Elmsley Hall', 'Muzzo Family Alumni Hall', 'Brennan Hall', "St. Basil's Church", 'Odette (Louis) Hall', 'Windle House', 'Phelan House', "Queen's Park Crescent East-59", 'More House', 'Fisher House', 'Teefy Hall', 'Gilson House', 'Maritain House', 'Sullivan House', 'Carr Hall', 'McCorkell House', 'Founders House', 'J. M. Kelly Library', 'Cardinal Flahiff Building', "Queen's Park Crescent East-43", 'Toronto School of Theology', 'Sam Sorbara Hall Student Residence', 'Regis College', 'Victoria College', 'Emmanuel College', 'Birge-Carnegie Library', 'Burwash Hall', 'Burwash Residence (Lower Houses)', 'Burwash Residence (Upper Houses)', 'Annesley Hall', 'Goldring Student Centre', 'Margaret Addison Hall', 'Isabel Bader Theatre', 'Stephenson House', 'E.J. Pratt Library', 'Northrop Frye Hall', 'Charles Street West-65', 'Rowell Jackman Hall', 'Lillian Massey Building', 'Knox College', 'Nona Macdonald Visitors Centre', 'Trinity College', 'Gerald Larkin Building', 'George Ignatieff Theatre', "St. Hilda's College", 'Wycliffe College', 'Charles St. West-30', 'Charles St. West-35'];
let building_data = require('../data/building_data.json');
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

              // TODO: Get coordinates of building, pass into getGoogleDirections()
              // TODO: Get origin campus, pass into getGoogleDirections()

              // Call the Google Directions API
              getGoogleDirections().then(
                (directionsBody) => {
                  // console.log(directionsBody);
                  let walkingDistance = directionsBody.routes[0].legs.distance.text;
                  let walkingDuration = directionsBody.routes[0].legs.duration.text;

                  let walkingDurationSeconds = directionsBody.routes[0].legs.duration.value

                  console.log("Distance to walk: " + walkingDistance)
                  console.log("Time taken to walk: " + walkingDuration)
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

async function getGoogleDirections() {
  // https://developers.google.com/maps/documentation/directions/intro#DirectionsRequests

  // TODO: Get coordinates of destinate. Get if origin is UTSG or UTM

  // Build up parameters
  let originCoordinates="43.55154,-79.66382"; // get from building chosen
  let hartHouseCoordinates="43.663700559989046,-79.3945183686304";
  let instructionalBuildingCoordinates="43.55154,-79.66382";

  let destinationCoordinates = hartHouseCoordinates;
  parameters = {
    origin: originCoordinates, 
    destination: destinationCoordinates, 
    mode: "walking", 
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