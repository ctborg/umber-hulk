var http = require('http'), 
    nko = require('nko')('TNvpskvCg1xzhyex'),
    express = require('express'),
    app = express.createServer(),
    redis_lib = require("redis"),
    redis = redis_lib.createClient();

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

redis.on("error", function (err) {
    console.log( err );
});

app.get('/users.:format', function(request, response) {

});

//TODO: add some error checking here.
//TODO: add validation
 
// Create 
app.post('/users', function(request, response) { 
    add_or_update_user( request, response );
});

// Read
app.get('/users/:id', function(request, response) {
  redis.get( get_user_key( request.params.id ), function( err, data ){
      response.send( JSON.stringify( data ) );
  } );
});

// Update
app.put('/users/:id', function(request, response) {
    add_or_update_user( request, response );
});

// Delete
app.del('/users/:id', function(request, response) {
    redis.del( get_user_key( request.params.id ), function( err, data){
        response.send( JSON.stringify( data ) );
    });
});

//TODO: perhaps abstract this a little.
function get_user_key( id ){
    var   type        = 'User',
          version     = 'v1',
          key = type + ':' + version +':' + id;
    return key;
}
function add_or_update_user( request, response ){
    var user_object = { 'email'     : request.body.email,
                        'location'  : request.body.location,
                        'speed'     : request.body.speed },
        key = get_user_key( request.body.email );
                        
    redis.get( key, function(err, data){
       //check error, if no error and no value returned, then insert.
       if(!err && isNaN( parseInt( data ) ) ){
           redis.set( key, JSON.stringify( user_object ) );
       }
    });
    
    response.send( request.body );
}