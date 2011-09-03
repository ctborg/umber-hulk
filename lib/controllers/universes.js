var _ = require('../../public/lib/underscore')._;

module.exports = function(app) {
  app.get('/universe/:x/:y/:range', function( request, response) {
    var universe = Universe.fromRange(request.params);
    
    _(universe.planetCoordinates).each(function(planetCoordinates) {
      var planet = Planet.fromCoordinates(planetCoordinates);
      app.redis.set(planet.key(), planet.toRedis());
    });
    
    app.redis.INCRBY( 'Universe:largest_x', universe.x_max );
    app.redis.INCRBY( 'Universe:largest_y', universe.y_max );

    var lookup_keys = _.compact(universe.lookup_keys);
    var get_keys = _.compact(universe.get_keys);
    
    app.redis.msetnx(lookup_keys, function(err, data) {
      app.redis.mget(get_keys, function(err, data) {
        response.send( JSON.stringify( _.compact(data) ) );
      });
    });
  });
};