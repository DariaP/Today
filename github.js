
// API to get/edit gist

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

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.substring(0, str.length) === str;
  };
}

function getData(code, host, callback) {
  getGist(code, host, callback);
}

function appendData(code, record, host, callback) {
  getGist(code, host, function(content) {
    if (content) {
      var newContent = record + content;
      editGist(code, host, newContent);
    } else {
      createGist(code, host, record)
    }
  });
}

function getGist(code, host, callback) {
  getToken(code, host, function(token, err) {
    if (token) {
      getGistId(token, function(id, err) {
        if (err || id == 0) {
          callback(null, err);
        } else {
          readGist(token, id, function(data) {
            callback(data);
          });        
        }
      });
    } else {
      callback(null, err);      
    }
  });
}

function editGist(code, host, content, callback) {
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
          handleErr(err, callback);
        }
      );
    });
  });
}

function createGist(code, host, content, callback) {
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
        handleErr(err, callback);
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
        redirect_uri: 'http://' + host + '/today.html'
      }, 
      function(error, result) {

        if (result.startsWith("error=")) {

          var err = result.substring(result.indexOf("=") + 1, result.indexOf("&"));

          if (err === "bad_verification_code") {
            callback(null, {
              badCode: true
            });
          } else {
            console.log(result);
            console.trace();
            callback(null, {});            
          }
        } else {
          var token = result.substring(result.indexOf("=") + 1, result.indexOf("&"));

          tokens[code] = token;

          callback(token);
        }
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
        callback(0, err);
      } else {
        var id = findGistId(gists);
        gistIds[token] = id; //TODO: could use this to track failed tokens
        callback(id);
      }
    });
  } else {
    callback(gistIds[token]);
  }
}

function findGistId(gists) {
  for (var i = 0 ; i < gists.length ; ++i) {
    var gist = gists[i];
    if (gist.files[filename]) {
      return gist.id
    }
  }
  return 0;
}

function readGist(token, id, callback) {
  github.authenticate({
    type: "oauth",
    token: token
  });

  github.gists.get({id: id}, function (err, gist) {
    if (err) {
      console.log(err);
      console.trace();
      callback([]);
    } else {
      callback(gist.files[filename].content);
    }
  });
}

function handleErr(err, callback) {
  if (err) {
    console.log(err);
    console.trace();
    if (callback) {
      callback(err);
    }
  }
}

module.exports = {
  getData: getData,
  appendData: appendData
}