require('dotenv').config();
require('./models/ShuttleData');
const mongoose = require('mongoose');

// Connect to Mongo server
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });



  
// Start the Express server
const app = require('./app'); // This is the Express app from app.js
const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
