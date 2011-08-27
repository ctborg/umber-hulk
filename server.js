var http = require('http'), 
    nko = require('nko')('TNvpskvCg1xzhyex'),
    express = require('express'),
    app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
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

app.get('/', function(req, res){
  res.send('hello world');
});

