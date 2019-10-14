const express = require('express');
const routes = require('./routes/index');

const app = express();
app.use('/', routes);

// We'll be using the same Express app from start.js, index.js,.. to access our endpoints
module.exports = app;