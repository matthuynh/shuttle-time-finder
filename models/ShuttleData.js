const mongoose = require('mongoose');
require('dotenv').config();

// Schema that matches the format of the data in our collection
const shuttleDataSchema = new mongoose.Schema({
  date: Date,
  utm_departures: [{
    time: Number,
    rush_hour: Boolean,
    no_overload: Boolean
  }],
  utsg_departures: [{
    time: Number,
    rush_hour: Boolean,
    no_overload: Boolean
  }],
});

// We build up the model by specifying a name, the schema, and collection name
module.exports = mongoose.model('ShuttleData', shuttleDataSchema, process.env.COLLECTION_NAME);