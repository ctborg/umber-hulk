require.paths.unshift('lib');

var   http = require('http')
    , nko = require('nko')('TNvpskvCg1xzhyex')
    , express = require('express')
    , app = express.createServer()
    , redis_lib = require("redis")
    , redis_session_store = require('connect-redis')(express)
    , User = require('models/user')
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

//TODO: add some error checking here.
//TODO: add validation


require('controllers/users')(app);
require('controllers/session')(app);


//PLANETS
// Create
var Planet = {
    get_key : function(id){ return Helper.get_key( id , 'Planet'); },
    qualities : function( planet ){
                    var planet_qualities = { 'name'      : planet.name,
                                             'location'  : planet.location,
                                             'resources' : planet.speed,
                                             'defense'   : planet.defense,
                                             'owner'     : planet.owner
                                           };

                    return planet_qualities;
                },
    add_or_update : function(request, response){
        Helper.add_or_update( app.redis, request, response, 'Planet', this.qualities( request ) );
    },
    get_planet_name : function(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 15; i++ ) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    get_planet_location : function(){
        //not too sure about this one
        return [0,0];
    },
    get_planet_resources : function(){
        return Math.floor(Math.random()*9);
    },
    get_planet_defense : function(){
        return Math.floor(Math.random()*9);
    },
    create_planet : function(x,y){
        //build planet creation logic here
        var planet = {  'name'      : this.get_planet_name(),
                        'location'  : [ x, y ],
                        'resource'  : this.get_planet_resources(),
                        'defense'   : this.get_planet_defense(),
                        'owner'     : null };
        this.add_or_update( planet );
        return planet;
    },
    conquer_planet : function(){},
    delete_planet : function(){}
};

// Read
app.get('/planets/:id', function(request, response) {
  app.redis.get( Planet.get_key( request.params.id ), function( err, data ){
      response.send( JSON.stringify( data ) );
  } );
});

//UNIVERSE

var Universe = {
    get_key : function(id){ return Helper.get_key( id , 'Universe'); },
    qualities : function( universe ){
                    var universe_qualities = { 'name'  : universe.location,
                                               'location'  : universe.location,
                                               'planet'    : universe.planet,
                                               'user'      : universe.user
                                             };

                    return universe_qualities;
                },
    add_or_update : function(request, response){
        Helper.add_or_update( app.redis, request, response, 'Planet', this.qualities( request ) );
    },
    get_planet_maybe : function(x,y){
        return Helper.randint(1, 10) == 10 ? Planet.create_planet(x,y) : false;
    },
    place_user_at_edge_of_known_universe : function( callback ){
        app.redis.mget( 'Universe:largest_x', 'Universe:largest_y', callback);
        //increment by 10 for every new user, so they don't stack up.
        app.redis.INCRBY( 'Universe:largest_x', 10 );
        app.redis.INCRBY( 'Universe:largest_y', 10 );
    }
};

app.get( '/test/user_placement', function(request, response){
    //Universe.place_user_at_edge_of_known_universe()
    
});

app.get('/universe/:x/:y/:range', function( request, response){
    //A bit of an oddball function.  Get space, if unknown set space.
    var lookup_keys = [],
        get_keys    = [],
        empty_space = [],
        x_range_max = parseInt( request.params.x, 10 ) + parseInt( request.params.range, 10 ),
        x_range_min = parseInt( request.params.x, 10 ) - parseInt( request.params.range, 10 ),
        y_range_max = parseInt( request.params.y, 10 ) + parseInt( request.params.range, 10 ),
        y_range_min = parseInt( request.params.y, 10 ) - parseInt( request.params.range, 10 );
    for (var i= x_range_min; i <= x_range_max; i++ ){
        for (var j= y_range_min; j <= y_range_max; j++ ){
            lookup_keys.push( 'Universe:' + i + ':' + j);
            lookup_keys.push( JSON.stringify( { 'location' :[i,j], 'planet' : Universe.get_planet_maybe(i,j), 'user' : false } ) );
            get_keys.push( 'Universe:' + i + ':' + j );
        }
    }
    
    app.redis.INCRBY( 'Universe:largest_x', x_range_max );
    app.redis.INCRBY( 'Universe:largest_y', y_range_max );
    lookup_keys = Helper.cleanArray( lookup_keys );
    get_keys = Helper.cleanArray( get_keys );
    
    app.redis.msetnx( lookup_keys, function(err, data){
        app.redis.mget( get_keys, function( err, data ){
            data = Helper.cleanArray( data );
            response.send( JSON.stringify( data ) );
        });
    });

});

//LEADERBOARD

var LeaderBoard = {
    index_name : 'leaderboard',
    add_score : function( score, user, type) {
        app.redis.zadd( this.name, score, user, function( err, data ){
            response.send( JSON.stringify( data ));
        });
    },
    get_top_10 : function( callback, type ){
        var index_name = type ? 'leaderboard:' + type : 'leaderboard';
        app.redis.zrevrange( index_name , 0, 10, 'WITHSCORES', callback );
    },
    update_score : function( score, user ){ return this.add_score( score, user ); }
};

app.get('/leaderboard', function(request, response) {
    LeaderBoard.get_top_10( function( err, top_10_data ){
        if( top_10_data ){
            var count = 0;
            var formated_data = [];
            for(item in top_10_data){
                if( count % 2){
                    var ranking = { "name" : top_10_data[ count -1 ], "score" : top_10_data[ count ]  };
                    formated_data.push( ranking );
                }
                count++;
            }
        }
    
        response.send( JSON.stringify( formated_data ));
    });
});

app.get('/leaderboard/:type', function(request, response) {
    LeaderBoard.get_top_10( function( err, top_10_data ){
        response.send( JSON.stringify( top_10_data ));
    }, request.params.type);
});