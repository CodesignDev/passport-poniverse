/* global describe, it, before, expect */
/* jshint expr: true */

var PoniverseStrategy = require('../lib/passport-poniverse/strategy');


describe('Strategy#userProfile', function() {
    
  describe('fetched from default endpoint', function() {
    var strategy =  new PoniverseStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
    }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://api.poniverse.net/v1/users/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }
    
      var body = '{ "id": "47057", "username": "Codesign", "display_name": "Codesign", "email": "codesign@poniverse.net" }';
      callback(null, body, undefined);
    };
    
    
    var profile;
    
    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });
    
    it('should parse profile', function() {
      expect(profile.provider).to.equal('poniverse');
      
      expect(profile.id).to.equal('47057');
      expect(profile.username).to.equal('Codesign');
      expect(profile.displayName).to.equal('Codesign');
      expect(profile.email).to.equal('codesign@poniverse.net');
    });
    
    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });
    
    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint

  describe('error caused by invalid token', function() {
    var strategy =  new PoniverseStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"error":"access_denied","error_description":"The resource owner or authorization server denied the request."}';
      callback({ statusCode: 401, data: body });
    };
      
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('Error');
      expect(err.message).to.equal('The resource owner or authorization server denied the request.');
    });
  }); // error caused by invalid token
  
  describe('error caused by malformed response', function() {
    var strategy =  new PoniverseStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        callbackURL: 'https://passport-poniverse.poni/auth/callback'
      }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };
      
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  }); // error caused by malformed response
  
  describe('internal error', function() {
    var strategy =  new PoniverseStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
    }, function() {});
  
    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    }
    
    
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('Error');
      expect(err.message).to.equal('Failed to fetch user profile');
    });
    
    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error
  
});
