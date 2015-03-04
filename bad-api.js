var
  path = require('path'),
  express = require('express'),
  Datastore = require('nedb'),
  logger = require('morgan'),
  bodyParser = require('body-parser');

var
  app = express(),
  port = process.env.PORT || 3000,
  app = express(),
  db = {};

app
  .use(logger('dev'))
  .use(bodyParser.json());

db.movies = new Datastore({
  filename: path.join(__dirname, 'db', 'movies'),
  autoload: true
});

app
  .get('/', function (req, res) {
    res.send('The API is working');
  })
  .post('/rpc', function (req, res) {
    var body = req.body;
    var respond = function (err, results) {
      if (err) {
        res.send(JSON.stringify(err));
      } else {
        res.send(JSON.stringify(results));
      }
    };
    res.set('Content-type', 'application/json');

    switch (body.action) {
    case 'getMovies':
      db.movies.find({}, respond);
      break;
    case 'addMovie':
      db.movies.insert({
        title: body.title
      }, respond);
      break;
    case 'rateMovie':
      db.movies.update({
          title: body.title
        }, {
          $set: {
            rating: body.rating
          }
        },
        function (err, num) {
          respond(err, {
            success: num + ' record(s) updated'
          });
        });
      break;
    default:
      respond('No action given');
      break;
    }
  });

// Start the server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});
