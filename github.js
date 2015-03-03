
var filename = "todayAppTest.txt"
var secret = process.env.GITHUB_CLIENT_SECRET;

var simpleOauth2 = require('simple-oauth2'),
    GitHubApi = require("github");

var github = new GitHubApi({
  version: "3.0.0",
});

var gistIds = {}, tokens = {};

function getData(code, host, callback) {
  getGist(code, host, callback);
}

function appendData(code, record, host, callback) {
  getGist(code, host, function(content) {
    var newContent = content + record;
    editGist(code, host, newContent);
  });
}

function getGist(code, host, callback) {
  getToken(code, host, function(token) {
    getGistId(token, function(id) {
      readGist(token, id, function(data) {
        callback(data);
      });
    });
  });
}

function editGist(code, host, content) {
  getToken(code, host, function(token) {
    getGistId(token, function(id) {

      github.authenticate({
        type: "oauth",
        token: token
      });

      var params = {
        id: id,
        files: {}
      };
      params.files[filename] = {
        content: content
      };
      github.gists.edit(
        params,
        function(err, res) {
          ;
        }
      );
    });
  });
}

function getToken(code, host, callback) {
  if (!tokens[code]) {

    var oauth = simpleOauth2({
      clientID: '629d6f58d67ac0082a37',
      clientSecret: secret,
      site: 'https://github.com/login',
      tokenPath: '/oauth/access_token'
    });

    oauth.authCode.getToken({
        code: code,
        redirect_uri: 'https://' + host + '/today.html'
      }, 
      function(error, result) {
        if (error) { console.log('Access Token Error', error.message); }

        var token = result.substring(result.indexOf("=") + 1, result.indexOf("&"));

        tokens[code] = token;

        callback(token);
      }
    );      
  } else {
    callback(tokens[code]);
  }
}

function getGistId(token, callback) {
  if (!gistIds[token]) {

    github.authenticate({
      type: "oauth",
      token: token
    });

    github.gists.getAll({}, function(err, gists) {
      for (var i = 0 ; i < gists.length ; ++i) {
        var gist = gists[i];
        if (gist.files[filename]) {
          gistIds[token] = gist.id;
          callback(gist.id);
        }
      }
    });
  } else {
    callback(gistIds[token]);
  }
}

function readGist(token, id, callback) {
  github.authenticate({
    type: "oauth",
    token: token
  });

  github.gists.get({id: id}, function (err, gist) {
    callback(gist.files[filename].content);
  });
}

module.exports = {
  getData: getData,
  appendData: appendData
}