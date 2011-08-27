var http = require('http'), 
    nko = require('nko')('TNvpskvCg1xzhyex');
var app = require('express').createServer();

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
