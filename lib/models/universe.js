Universe = module.exports = {
  get_key: function(id){ return Helper.get_key( id , 'Universe'); }
  , qualities: function( universe ){
      var universe_qualities = { 'name'  : universe.location,
                                 'location'  : universe.location,
                                 'planet'    : universe.planet,
                                 'user'      : universe.user
                               };

      return universe_qualities;
  }
  , add_or_update: function(request, response){
      Helper.add_or_update( app.redis, request, response, 'Planet', this.qualities( request ) );
  }
  , place_user_at_edge_of_known_universe: function( callback ){
      app.redis.mget( 'Universe:largest_x', 'Universe:largest_y', callback);
      //increment by 10 for every new user, so they don't stack up.
      app.redis.INCRBY( 'Universe:largest_x', 10 );
      app.redis.INCRBY( 'Universe:largest_y', 10 );
  }
  , fromRange: function(params) {
    var universe = {
        planetCoordinates: []
      , x_max: max_x(params)
      , y_max: max_y(params)
      , lookup_keys: []
      , get_keys: []
    }
    , lookup_keys = []
    , get_keys    = []
    , x_range_min = min_x(params)
    , y_range_min = min_y(params);

    for (var i = x_range_min; i <= universe.x_max; i += 1) {
      for (var j = y_range_min; j <= universe.y_max; j += 1) {
        var create_planet = Helper.randint(1, 10) === 10;        
        if(create_planet) { universe.planetCoordinates.push({x: i, y: j}); }

        var key = 'Universe:' + i + ':' + j;
        var value = JSON.stringify( { 'location' :[i,j], 'planet' : create_planet, 'user' : false } );

        universe.lookup_keys.push(key, value);
        universe.get_keys.push(key);
      }
    }
    
    return universe;
  }
};

var min_x = function(params) {
  return parseInt( params.x, 10 ) - parseInt( params.range, 10 );
};

var max_x = function(params) {
  return parseInt( params.x, 10 ) + parseInt( params.range, 10 );
};

var min_y = function(params) {
  return parseInt( params.y, 10 ) - parseInt( params.range, 10 );
};

var max_y = function(params) {
  return parseInt( params.y, 10 ) + parseInt( params.range, 10 );
};