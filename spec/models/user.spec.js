require.paths.unshift('lib');

require("models/user");
require("helpers/helper");

describe("User", function() {
  describe("validations", function() {
    it("should be invalid without an email", function() {
      var user = User.fromParams({password: 'password'});
      expect(user.valid()).toBe(false);
    });
    
    it("should be invalid without a password", function() {
      var user = User.fromParams({email: 'frank@tank.de'});
      expect(user.valid()).toBe(false);      
    });
    
    it("should be valid with both email and password are present", function() {
      var user = User.fromParams({email: 'frank@tank.de', password: 'password'});
      expect(user.valid()).toBe(true);
    });
  });
  
  describe("errors", function() {
    it("should return an error string if there are errors", function() {
      var user = User.fromParams({email: 'frank@tank.de'});
      user.valid();
      expect(user.errors()).toEqual("Sorry you are missing either a login or password.");
    });
  });
  
  describe("toJSON", function() {
    it("should return a json representation of the user", function() {
      var user = User.fromParams({email: 'frank@tank.de', password: 'password'});
      expect(user.toJSON()).toEqual({
          name: 'frank@tank.de'
        , email: 'frank@tank.de'
        , location: [0, 0]
        , speed: 0
        , salt: user.salt
        , encrypted_password: user.encrypted_password
      });
    });
  });
  
  describe("key", function() {
    it("should return a key representation of the user", function() {
      var user = User.fromParams({email: 'frank@tank.de', password: 'password'});
      expect(user.key()).toEqual("User:v1:frank@tank.de");
    });
    
    it("should return null if email is not present", function() {
      var user = User.fromParams({});
      expect(user.key()).toEqual(null);
    });
  });
  
  describe("authenticate", function() {
    it("should return true if the password matches", function() {
      var user = User.fromParams({email: 'frank@tank.de', password: 'password'});
      expect(user.authenticate('password')).toBe(true);
    });
    
    it("should return false if the password does not match", function() {
      var user = User.fromParams({email: 'frank@tank.de', password: 'password'});
      expect(user.authenticate('invalid')).toBe(false);
    });
  });
});