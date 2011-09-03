module.exports = function(app) {
  app.put( '/session', function(request, response) {
    var user = User.fromParams(request.body);

    app.redis.get(user.key(), function(err, data) {
      if(err) {
        response.writeHead(401);
        response.end('Invalid login.');
        request.session.auth = false;
      }

      var _user = User.fromRedis(data);

      if(_user.authenticate(request.body.password)) {
        request.session.auth = true;
        request.session.user = _user.toRedis();
        response.send(_user.toRedis());
      } else {
        response.writeHead(401);
        response.end('Invalid login.');
        request.session.auth = false;
      }
    });
  });

  app.del( '/session', function(request, response){
     request.session.destroy();
     response.send('OK');
  });
}