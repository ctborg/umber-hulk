Helper = module.exports = {
    add_or_update : function( redis, request, response, type, qualities ){
        var the_key = qualities ? qualities.name : request.body.email 
        var key = this.get_key( the_key, type );

        redis.get( key, function(err, data){
           //check error, if no error and no value returned, then insert.
           if(!err && isNaN( parseInt( data ) ) ){
               redis.set( key, JSON.stringify( qualities ) );
           }
        });

        response ? response.send( request.body ) : qualities;
    },
    get_key : function( id, type ){
        if(!id) { return null; }
      
        var   type        = type,
              version     = 'v1',
              key = type + ':' + version +':' + id;
        return key;
    },
    randint: function(start, stop){
    	// return an integer between start and stop, inclusive
    	if (stop === undefined){
    		stop = start;
    		start = 0;
    	}
    	var factor = stop - start + 1;
    	return Math.floor(Math.random() * factor) + start;
    },
    d: function(no_dice, sides){
    	if (sides === undefined){
    		sides = no_dice;
    		no_dice = 1;
    	}
    	var val = 0;
    	for (var i = 0; i < no_dice; i++){
    		val += randint(1, sides);
    	}
    	return val;
    },
    cleanArray : function( actual ){
      var newArray = new Array();
      for(var i = 0; i<actual.length; i++){
          if (actual[i]){
            newArray.push(actual[i]);
        }
      }
      return newArray;
    }
};