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
  root = 'http://127.0.0.1:' + port,
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

// Connect to an NeDB database
db.movies = new Datastore({
  filename: path.join(__dirname, 'db', 'movies'),
  autoload: true
});
// Add an Index
db.movies.ensureIndex({
  fieldName: 'title',
  unique: true
});

// Routes
app
  .get('/', function (req, res) {
    res.send('The API is working');
  })
  .get('/movies', function (req, res) {
    db.movies.find({}, res.locals.respond);
  })
  .post('/movies', function (req, res) {
    if (!req.body.title) {
      res.json(400, {
        message: "A title is required."
      });
      return;
    }

    db.movies.insert({
      title: req.body.title
    }, function (err, created) {
      if (err) {
        res.json(500, err);
        return;
      }

      res.set('Location', root + '/movies/' + created._id);
      res.json(201, created);
    });
  })
  .get('/movies/:id', function (req, res) {
    db.movies.findOne({
      _id: req.params.id
    }, function (err, result) {
      if (err) {
        res.json(500, err);
        return;
      }

      if (!result) {
        res.json(404, {
          message: 'Nothing found with the id: ' + req.params.id
        });
        return;
      }

      res.json(200, result);
    });
  })
  .put('/movies/:id', function (req, res) {
    db.movies.update({
        _id: req.params.id
      },
      req.body,
      function (err, num) {
        res.locals.respond(err, {
          message: num + ' record(s) updated'
        });
      });
  })
  .delete('/movies/:id', function (req, res) {
    db.movies.remove({
        _id: req.params.id
      },
      function (err, num) {
        if (err) {
          res.json(500, err);
          return;
        }

        if (num === 0) {
          res.json(404, {
            message: 'Nothing found with the id: ' + req.params.id
          });
          return;
        }

        res.set('Link', root + '/movies; rel="collection"');
        res.send(204);
      });
  });

// Start the server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

