let mongoose = require('mongoose');

let urlSchema = new mongoose.Schema({
  url: String,
  short_url: {
    type: Number
  },
});

module.exports = mongoose.model('urls', urlSchema);