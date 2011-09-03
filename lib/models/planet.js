var _ = require('../../public/lib/underscore')._;

var instance_methods = {
  key: function() {
    return Helper.get_key(this.name , 'Planet');
  },
  
  toRedis: function() {
    return JSON.stringify({
        name: this.name
      , location: this.location
      , resources: this.resources
      , defense: this.defense
      , owner: this.owner
    });
  }
};

var randomNumber = function() {
  return Math.floor(Math.random()*9);
};

var generateName = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 15; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

Planet = module.exports = {
    get_key : function(id){ return Helper.get_key( id , 'Planet'); }
  , fromCoordinates: function(coordinates) {
    return _({
        name: generateName()
      , location: [ coordinates.x, coordinates.y ]
      , resources: randomNumber()
      , defense: randomNumber()
      , owner: null
    }).extend(instance_methods);
  }
};