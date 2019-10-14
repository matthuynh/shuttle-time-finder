const express = require('express');
const path = require('path');
const routes = require('./routes/index');

const app = express();

// We use Pug as our JS templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', routes);

// We'll be using the same Express app from start.js, index.js,.. to access our endpoints
module.exports = app;