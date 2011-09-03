module.exports = function(app) {
  app.post('/users', function(request, response) {
    var user = User.fromParams(request.body);

    if(user.valid()) {
      app.redis.mget( 'Universe:largest_x', 'Universe:largest_y', function(err, location) {
        if(err) {
          response.writeHead(403);
          response.end('Universe cannot expand further.');
          return;
        }

        user.location = location;

        app.redis.set(user.key(), user.toRedis(), function(err) {
          if(err) {        
            response.writeHead(403);
            response.end('User exists.');
          } else {
            request.session.auth = true;
            response.send(user.toJSON());
          }
        });
      });
    } else {
      response.writeHead(403);
      response.end(user.errors());
    }
  });
  
  app.get('/myself', function(request,response){
      request.session.user ? response.send( request.session.user['name'] ) : response.send( null );
  });
}