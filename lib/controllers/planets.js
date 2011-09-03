module.exports = function(app) {
  app.get('/planets/:id', function(request, response) {
    app.redis.get( Planet.get_key( request.params.id ), function( err, data ){
        response.send( JSON.stringify( data ) );
    } );
  });
};