require.paths.unshift('lib');

var   http = require('http')
    , nko = require('nko')('TNvpskvCg1xzhyex')
    , express = require('express')
    , app = express.createServer()
    , redis_lib = require("redis")
    , redis_session_store = require('connect-redis')(express)
    , User = require('models/user')
    , Planet = require('models/planet')
    , Universe = require('models/universe')
    , Leaderboard = require('models/leaderboard')
    , Helper = require('helpers/helper');

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "vzi13nmADFmnizfFmkjkkZqaQa9pPI&^5n==", store: new redis_session_store }));
  app.use(app.router);
});

app.configure('development', function(){
  app.redis = redis_lib.createClient();
  app.use('/', express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.listen(3000);
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use('/', express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
  app.listen(80);
});

app.redis.on("error", function (err) {
  console.log( err );
});

require('controllers/users')(app);
require('controllers/session')(app);
require('controllers/planets')(app);
require('controllers/universes')(app);
require('controllers/leaderboard')(app);