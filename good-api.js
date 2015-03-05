var
  path = require('path'),
  express = require('express'),
  Datastore = require('nedb'),
  logger = require('morgan'),
  bodyParser = require('body-parser');

var
  wrapper = require('./lib/wrapper');

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
    res.locals.wrap = wrapper.create({
      start: new Date()
    });
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
    db.movies.find({}, function (err, results) {
      if (err) {
        res.status(500).json(err);
        return;
      }

      res.json(
        res.locals.wrap(
          results.map(function (item) {
            item.links = {
              self: root + '/movies/' + item._id
            };

            return item;
          }), {
            next: root + '/movies/?page=2'
          })
      );
    });
  })
  .post('/movies', function (req, res) {
    if (!req.body.title) {
      res.status(400).json({
        message: "A title is required."
      });
      return;
    }

    db.movies.insert({
      title: req.body.title
    }, function (err, created) {
      if (err) {
        res.status(500).json(err);
        return;
      }

      res.set('Location', root + '/movies/' + created._id);
      res.status(201).json(created);
    });
  })
  .get('/movies/:id', function (req, res) {
    db.movies.findOne({
      _id: req.params.id
    }, function (err, result) {
      if (err) {
        res.status(500).json(err);
        return;
      }

      if (!result) {
        res.status(404).json({
          message: 'Nothing found with the id: ' + req.params.id
        });
        return;
      }

      res.json(res.locals.wrap(result, {
        self: root + '/movies/' + req.params.id
      }));
    });
  })
  .put('/movies/:id', function (req, res) {
    db.movies.update({
        _id: req.params.id
      },
      req.body,
      function (err, num) {
        if (err) {
          res.status(500).json(err);
          return;
        }

        if (num === 0) {
          res.status(404).json({
            message: 'Nothing found with the id: ' + req.params.id
          });
          return;
        }

        res.json({
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
          res.status(500).json(err);
          return;
        }

        if (num === 0) {
          res.status(404).json({
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

