var
  path = require('path'),
  express = require('express'),
  Datastore = require('nedb'),
  logger = require('morgan'),
  bodyParser = require('body-parser');

var
  responder = require('./http-responder');

var
  app = express(),
  port = process.env.PORT || 3000,
  app = express(),
  db = {};

app
  .use(logger('dev'))
  .use(bodyParser.json())
  // define response type for all reaquest and setup a common function responser
  .use(function (req, res, next) {
    res.type('application/json');
    res.locals.respond = responder.setup(res);
    next();
  });

db.movies = new Datastore({
  filename: path.join(__dirname, 'db', 'movies'),
  autoload: true
});

app
  .get('/', function (req, res) {
    res.send('The API is working');
  })
  .get('/movies', function (req, res) {
    db.movies.find({}, res.locals.respond);
  })
  .post('/movies', function (req, res) {
    db.movies.insert({
      title: req.body.title
    }, res.locals.respond);
  })
  .get('/movies/:id', function (req, res) {
    db.movies.findOne({
      _id: req.params.id
    }, res.locals.respond);
  })
  .put('/movies/:id', function (req, res) {
    db.movies.update({
        _id: req.params.id
      },
      req.body,
      function (err, num) {
        res.locals.respond(err, {
          success: num + ' record(s) updated'
        });
      });
  })
  .delete('/movies/:id', function (req, res) {
    db.movies.remove({
        _id: req.params.id
      },
      function (err, num) {
        res.locals.respond(err, {
          success: num + ' record(s) deleted'
        });
      });
  });

// Start the server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

