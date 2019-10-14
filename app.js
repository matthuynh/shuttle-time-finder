const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser');

const app = express();

// We use Pug as our JS templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use('/', routes); // We will define all our routes in index.js

// We'll be using the same Express app from start.js, index.js,.. to access our endpoints
module.exports = app;