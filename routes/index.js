const express = require('express');

const router = express.Router();

// Renders the 'form.pug' template from views
router.get('/', (req, res) => {
  res.render('form', {title: 'UTM Shuttle Bus Scheduler'});
});

// Handles the POST route from clicking on 'Submit'
router.post('/', (req, res) => {
    res.render('form', { title: 'Time Submission' });
});

module.exports = router;