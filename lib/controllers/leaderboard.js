module.exports = function(app) {
  app.get('/leaderboard', function(request, response) {
    LeaderBoard.get_top_10( app.redis, function( err, top_10_data ){
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
    LeaderBoard.get_top_10( app.redis, function( err, top_10_data ){
      response.send( JSON.stringify( top_10_data ));
    }, request.params.type);
  });
};