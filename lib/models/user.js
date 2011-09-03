var _ = require('../../public/lib/underscore')._
  , hash = require('../../vendor/node_hash');

var instance_methods = {
  valid: function() {
    this._errors = [];
    if(!this.email || !this.password) {
      this._errors = ["Sorry you are missing either a login or password."];
    }
    return this._errors.length === 0;
  }
  , key: function() {
    return Helper.get_key(this.email, 'User');
  }
  , errors: function() {
    return this._errors[0];
  }
  , authenticate: function(password) {
    return this.encrypted_password == encryptPassword(password, this.salt);
  }
  , toRedis: function() {
    return JSON.stringify(this.toJSON());
  }
  , toJSON: function() {
    return {
        name: this.email
      , email: this.email
      , location: this.location || [0, 0]
      , speed: this.speed
      , salt: this.salt
      , encrypted_password: this.encrypted_password
    };
  }
};

User = module.exports = {
  get_key: function(id) {
    return Helper.get_key(id , 'User');
  }
  , fromParams: function(params) {
    var salt = params.salt || randomString(256);
    return _({
        salt: salt
      , encrypted_password: encryptPassword(params.password, salt)
      , speed: 0
      , name: params.email
    }).extend(instance_methods, params);
  }
  , fromRedis: function(redis) {
    return this.fromParams(JSON.parse(redis));
  }
};


function encryptPassword(password, salt) {
  return hash.sha256(password + salt);
};

function randomString(bits) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    rand, i, ret = '';
  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while(bits > 0) {
    rand = Math.floor(Math.random()*0x100000000); // 32-bit integer
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for(i=26; i>0 && bits>0; i-=6, bits-=6) {
      ret += chars[0x3F & rand >>> i];
    }
  };
  return ret;
}