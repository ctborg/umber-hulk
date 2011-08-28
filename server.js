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

//TODO: add some error checking here.
//TODO: add validation

// USERS
// Create 
var User = {
    get_key : function(id){ return Helper.get_key( id , 'User'); },
    qualities : function( request ){
                    var user_qualities = { 'email'     : request.body.email,
                                           'location'  : request.body.location,
                                           'speed'     : request.body.speed 
                                          }; 
                                          
                    return user_qualities
                },
    add_or_update : function(request, response){
        Helper.add_or_update( request, response, 'User', this.qualities( request ) )
    }
};

app.post('/users', function(request, response) { 
    User.add_or_update( request, response );
});

// Read
app.get('/users/:id', function(request, response) {
  redis.get( User.get_key( request.params.id ), function( err, data ){
      response.send( JSON.stringify( data ) );
  } );
});

// Update
app.put('/users/:id', function(request, response) {
    User.add_or_update( request, response );
});

// Delete
app.del('/users/:id', function(request, response) {
    redis.del( User.get_key( request.params.id ), function( err, data){
        response.send( JSON.stringify( data ) );
    });
});

//PLANETS
// Create 
var Planet = {
    get_key : function(id){ return Helper.get_key( id , 'Planet') },
    qualities : function( planet ){
                    var planet_qualities = { 'name'      : planet.name,
                                             'location'  : planet.location,
                                             'resources' : planet.speed,
                                             'defense'   : planet.defense,
                                             'owner'     : planet.owner
                                           }; 
                                          
                    return planet_qualities
                },    
    add_or_update : function(request, response){
        Helper.add_or_update( request, response, 'Planet', this.qualities( request ) )
    },
    get_planet_name : function(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 15; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    get_planet_location : function(){
        //not too sure about this one
        return [0,0];
    },
    get_planet_resources : function(){
        return Math.floor(Math.random()*9)
    },
    get_planet_defense : function(){
        return Math.floor(Math.random()*9)
    },
    create_planet : function(){
        //build planet creation logic here
        var planet = {  'name'      : this.get_planet_name(),
                        'location'  : this.get_planet_location(),
                        'resource'  : this.get_planet_resources(),
                        'defense'   : this.get_planet_defense(),
                        'owner'     : null }
        this.add_or_update( planet )
    },
    conquer_planet : function(){},
    delete_planet : function(){},
};

// Read
app.get('/planets/:id', function(request, response) {
  redis.get( Planet.get_key( request.params.id ), function( err, data ){
      response.send( JSON.stringify( data ) );
  } );
});

//LEADERBOARD

var LeaderBoard = {
    index_name : 'leaderboard',
    add_score : function( score, user, type) {
        redis.zadd( this.name, score, user, function( err, data ){
            return data;
        });
    },
    get_top_10 : function( callback ){
        redis.zrange( 'leaderboard', 0, 10, callback );
    },
    update_score : function( score, user ){ return this.add( score, user ) }
};

app.get('/leaderboard', function(request, response) {
    LeaderBoard.get_top_10( function( err, top_10_data ){
        response.send( JSON.stringify( top_10_data ));
    })
});

app.get('/leaderboard/:type', function(request, response) {
  redis.zrange( LeaderBoard.index_name + ":" + request.params.type, 0, 10, function( err, data){
      response.send( JSON.stringify( data ) );
  });
});

//HELPERS

var Helper = {
    add_or_update : function( request, response, type, qualities ){
        var key = this.get_key( request.body.email, type );

        redis.get( key, function(err, data){
           //check error, if no error and no value returned, then insert.
           if(!err && isNaN( parseInt( data ) ) ){
               redis.set( key, JSON.stringify( qualities ) );
           }
        });

        response.send( request.body );
    },
    get_key : function( id, type ){
        var   type        = type,
              version     = 'v1',
              key = type + ':' + version +':' + id;
        return key;
    }  
};

