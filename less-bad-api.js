var
  path = require('path'),
  express = require('express'),
  Datastore = require('nedb'),
  logger = require('morgan'),
  bodyParser = require('body-parser');

var
  responder = require('./lib/http-responder');

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
  .post('/movies', function (req, res) {

    switch (req.body.action) {
      case 'viewList':
        db.movies.find({}, res.locals.respond);
        break;
      case 'addNew':
        db.movies.insert({
          title: body.title
        }, res.locals.respond);
        break;
      default:
        res.locals.respond('No action given');
        break;
    }
  })
  .post('/movies/:id', function (req, res) {

    switch (req.body.action) {
    case 'rate':
      db.movies.update({
          _id: req.params.id
        }, {
          $set: {
            rating: body.rating
          }
        },
        function (err, num) {
          res.locals.respond(err, {
            success: num + ' record(s) updated'
          });
        });
      break;
    case 'view':
      db.movies.findOne({
        _id: req.params.id
      }, res.locals.respond);
      break;
    default:
      res.locals.respond('No action given');
      break;
    }
  });

// Start the server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

