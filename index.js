function start() {

  var express = require('express'),
      github = require('./github.js'),
      parser = require('./parser.js'),
      cors = require('cors'),
      bodyParser = require('body-parser');

  var app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.set('port', (process.env.PORT || 8000));
  app.use('/', express.static(__dirname + '/public'));

  app.get('/days', function (req, res) {
    github.getData(
      req.query.code, 
      req.headers.host,
      function(content, err) {
        if (content) {
          parser.parseRecords(content, function(records) {
            res.send(records);
          });
        } else {
          if (err && err.badCode) {
            res.send({
              done: "",
              diff: "",
              date: "",
              badCode: true
            });
          } else {
            res.send([]);
          }
        }
      }
    );
  });

  app.post('/days', function (req, res) {
    github.appendData(
      req.query.code,
      parser.makeRecord(req.body),
      req.headers.host,
      function() {
        res.status(200);
      }
    );
  });

  app.listen(app.get('port'));
}

start();
