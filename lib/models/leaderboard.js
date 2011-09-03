LeaderBoard = module.exports = {
    index_name : 'leaderboard'
  , add_score : function( redis, score, user, type) {
      redis.zadd( this.name, score, user, function( err, data ){
          response.send( JSON.stringify( data ));
      });
  }
  , get_top_10 : function( redis, callback, type ){
      var index_name = type ? 'leaderboard:' + type : 'leaderboard';
      redis.zrevrange( index_name , 0, 10, 'WITHSCORES', callback );
  }
  , update_score : function( redis, score, user ){ return this.add_score( redis, score, user ); }
};
