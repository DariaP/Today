function start() {

  var express = require('express'),
      github = require('./github.js'),
      parser = require('./parser.js');

  var cors = require('cors'),
      bodyParser = require('body-parser'),
      app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  app.set('port', (process.env.PORT || 8000));
  app.use('/', express.static(__dirname + '/public'));

  app.get('/days', function (req, res) {
    github.getData(
      req.query.code, 
      req.headers.host,
      function(content) {
        parser.parseRecords(content, function(records) {
          res.send(records);
        });
      }
    );
  });

  app.post('/days', function (req, res) {
    github.appendData(
      req.query.code,
      req.headers.host,
      parser.makeRecord(req.body)
    );
  });

  app.listen(app.get('port'));
}

start();
