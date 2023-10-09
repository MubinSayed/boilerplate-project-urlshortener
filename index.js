require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const mongoose = require('mongoose');

mongoose.connect(
  process.env['DB_URI'], 
  { useNewUrlParser: true, useUnifiedTopology: true }
);

let Url = require('./models/url.js');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  // get url from req.body
  console.log(req.body)
  const url = req.body.url;
  console.log(url);

  // check if url is valid dns
  const dnslookup = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {

      // count document
      const count = await Url.countDocuments();

      // create new url
      let newUrl = new Url({
        url: url,
        short_url: count + 1
      });
      
      newUrl
        .save()
        .then((data) => {
          console.log(data);
          res.json({
            original_url: data.url,
            short_url: data.short_url
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {

  // get short_url from req.params
  const short_url = req.params.short_url;
  // find url by short_url
  Url.findOne({ short_url: short_url })
    .then((data) => {
      if (data) {
        res.redirect(data.url);
      } else {
        res.json({ error: 'invalid url' });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
