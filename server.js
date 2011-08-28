var http = require('http'),
    nko = require('nko')('TNvpskvCg1xzhyex'),
    express = require('express'),
    app = express.createServer(),
    redis_lib = require("redis"),
    redis = redis_lib.createClient(),
    redis_session_store = require('connect-redis')(express);

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "vzi13nmADFmnizfFmkjkkZqaQa9pPI&^5n==", store: new redis_session_store }));;
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

app.post('/new_user', function(request, response){
    if( request.body.email &&
        request.body.password ){
            redis.get( User.get_key( request.body.email ), function( err, data ){
               if( data ){
                   response.writeHead(403);
                   response.end('User exists.');
               }
            });
            var bcrypt = require('bcrypt'),
                salt = bcrypt.gen_salt_sync(10),
                hash = bcrypt.encrypt_sync( request.body.password, salt);

            request.body.password = hash; //oh so awful
            request.body.location = 0; //add intelligent location, for reals;
            request.body.speed = 0; //add random speed;
            User.add_or_update( request, response );
            request.session.auth = true;
    } else{
            response.writeHead(403);
            response.end('Sorry you missing either a login or password.');
            request.session.auth = false;
    }

})

app.post( '/login', function( request, response){
   if( request.body.email &&
       request.body.password ){
           redis.get( User.get_key( request.body.email ), function( err, data ){
               if( data ){
                    var bcrypt = require('bcrypt'),
                        parsed_data = JSON.parse(data);
                        console.log( parsed_data );
                        hash = parsed_data['password'];
                    if( bcrypt.compare_sync(  request.body.password, hash ) ){
                        response.send( JSON.stringify( data ) );
                        request.session.auth = true;
                    } else{
                        response.writeHead(403);
                        response.end('Sorry you are fail.');
                        request.session.auth = false;
                        return;
                    };
                }else{
                    response.writeHead(401);
                    response.end('Invalid login');
                    request.session.auth = false;
                }
              });
   } else{
       response.writeHead(406);
       response.end('Sorry you are unauthorized.');
       request.session.auth = false;
       return;
   };
});

app.get( '/logout', function( request, response){
   request.session.destroy();
   response.send( 'OK');
});

// USERS
// Create
var User = {
    get_key : function(id){ return Helper.get_key( id , 'User'); },
    qualities : function( request ){
                    var user_qualities = { 'email'     : request.body.email,
                                           'location'  : request.body.location,
                                           'speed'     : request.body.speed,
                                           'password'  : request.body.password
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

//UNIVERSE

var Universe = {
    get_key : function(id){ return Helper.get_key( id , 'Universe') },
    qualities : function( universe ){
                    var universe_qualities = { 'location'  : universe.location,
                                               'planet'    : universe.planet,
                                               'user'      : universe.user
                                             };

                    return universe_qualities
                },
    add_or_update : function(request, response){
        Helper.add_or_update( request, response, 'Planet', this.qualities( request ) )
    }
}

app.get('/universe/:x/:y/:range', function( request, response){
    //A bit of an oddball function.  Get space, if unknown set space.
    var lookup_keys = [],
        empty_space = [],
        x_range_max = parseInt( request.params.x ) + parseInt( request.params.range ),
        x_range_min = parseInt( request.params.x ) - parseInt( request.params.range ),
        y_range_max = parseInt( request.params.y ) + parseInt( request.params.range ),
        y_range_min = parseInt( request.params.y ) - parseInt( request.params.range );
    for (var i= x_range_min; i <= x_range_max; i++ ){
        for (var j= y_range_min; j <= y_range_max; j++ ){
            lookup_keys.push( 'Universe:' + i + ':' + j);
            lookup_keys.push( JSON.stringify( { 'location' : i.toString() + '|' + j.toString(), 'planet' : false, 'user' : false } ) );
        }
    }
    console.log( lookup_keys );
    redis.msetnx( lookup_keys );

    redis.mget( lookup_keys, function( err, data ){
        response.send( JSON.stringify( data ) );
    });
});

//LEADERBOARD

var LeaderBoard = {
    index_name : 'leaderboard',
    add_score : function( score, user, type) {
        redis.zadd( this.name, score, user, function( err, data ){
            response.send( JSON.stringify( data ));
        });
    },
    get_top_10 : function( callback, type ){
        var index_name = type ? 'leaderboard:' + type : 'leaderboard';
        redis.zrange( index_name , 0, 10, callback );
    },
    update_score : function( score, user ){ return this.add( score, user ) }
};

app.get('/leaderboard', function(request, response) {
    LeaderBoard.get_top_10( function( err, top_10_data ){
        response.send( JSON.stringify( top_10_data ));
    })
});

app.get('/leaderboard/:type', function(request, response) {
    LeaderBoard.get_top_10( function( err, top_10_data ){
        response.send( JSON.stringify( top_10_data ));
    }, request.params.type)
});

//HELPERS

function randint(start, stop){
	// return an integer between start and stop, inclusive
	if (stop === undefined){
		stop = start;
		start = 0;
	}
	var factor = stop - start + 1;
	return Math.floor(Math.random() * factor) + start;
}
function d(no_dice, sides){
	if (sides === undefined){
		sides = no_dice;
		no_dice = 1;
	}
	var val = 0;
	for (var i = 0; i < no_dice; i++){
		val += randint(1, sides);
	}
	return val;
}


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

