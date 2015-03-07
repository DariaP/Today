
var simpleOauth2 = require('simple-oauth2'),
    GitHubApi = require("github");

var filename = "todayAppTest.md",
    clientId = "629d6f58d67ac0082a37",
    clientSecret = process.env.GITHUB_CLIENT_SECRET,

    github = new GitHubApi({
      version: "3.0.0",
    }),

    gistIds = {},
    tokens = {};

function getData(code, host, callback) {
  getGist(code, host, callback);
}

function appendData(code, record, host, callback) {
  getGist(code, host, function(content) {
    if (content) {
      var newContent = content + record;
      editGist(code, host, newContent);
    } else {
      createGist(code, host, record)
    }
  });
}

function getGist(code, host, callback) {
  getToken(code, host, function(token) {
    getGistId(token, function(id) {
      if (id == 0) {
        callback(null);
      } else {
        readGist(token, id, function(data) {
          callback(data);
        });        
      }
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
          console.log(err);
        }
      );
    });
  });
}

function createGist(code, host, content) {
  getToken(code, host, function(token) {

    github.authenticate({
      type: "oauth",
      token: token
    });

    var params = {
      public: "false",
      files: {}
    };
    params.files[filename] = {
      content: content
    };
    github.gists.create(
      params,
      function(err, res) {
        console.log(err);
      }
    );
  });
}

function getToken(code, host, callback) {
  if (!tokens[code]) {

    var oauth = simpleOauth2({
      clientID: clientId,
      clientSecret: clientSecret,
      site: 'https://github.com/login',
      tokenPath: '/oauth/access_token'
    });

    oauth.authCode.getToken({
        code: code,
        redirect_uri: 'https://' + host + '/today.html'
      }, 
      function(error, result) {
        if (error) { 
          console.log('Access Token Error', error.message);
        }

        var token = result.substring(result.indexOf("=") + 1, result.indexOf("&"));
        console.log(token);
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
      if (err) {
        console.log(err);
      }

      for (var i = 0 ; i < gists.length ; ++i) {
        var gist = gists[i];
        if (gist.files[filename]) {
          gistIds[token] = gist.id;
          callback(gist.id);
          return;
        }
      }
      callback(0);
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
    if (err) {
      console.log(err);
    }

    callback(gist.files[filename].content);
  });
}

module.exports = {
  getData: getData,
  appendData: appendData
}