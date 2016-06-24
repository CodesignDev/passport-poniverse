/* global describe, it, before, expect */
/* jshint expr: true */

var $require = require('proxyquire')
  , chai = require('chai')
  , util = require('util')
  , path =require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // node <=0.6
  , PoniverseStrategy = require('../lib/passport-poniverse/strategy');


describe('Strategy', function() {
  
  describe('constructed', function() {
    var strategy = new PoniverseStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
    }, function() {});
    
    it('should be named poniverse', function() {
      expect(strategy.name).to.equal('poniverse');
    });
  })
  
  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new PoniverseStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  })
  
  describe('handling a response with an authorization code', function() {
    var OAuth2Strategy = require('passport-oauth2').Strategy;
    var OAuth2;
    if (existsSync('node_modules/oauth')) { // npm 3.x
      OAuth2 = require('oauth').OAuth2;
    } else {
      OAuth2 = require('passport-oauth2/node_modules/oauth').OAuth2;
    }
    
    var MockOAuth2Strategy = function(options, verify) {
      OAuth2Strategy.call(this, options, verify);
      
      this._oauth2 = new OAuth2(options.clientID,  options.clientSecret,
        '', options.authorizationURL, options.tokenURL, options.customHeaders);
      this._oauth2.getOAuthAccessToken = function(code, options, callback) {
        if (code != 'GB09ME6SMo8qRka3qECBye2V7KJF6H1CmI95J0VP') { return callback(new Error('wrong code argument')); }
        
        return callback(null, 's3cr1t-t0k3n', undefined, {});
      };
      this._oauth2.get = function(url, accessToken, callback) {
        if (url != 'https://api.poniverse.net/v1/users/me') { return callback(new Error('wrong url argument')); }
        if (accessToken != 's3cr1t-t0k3n') { return callback(new Error('wrong token argument')); }

        var body = '{ "id": "47057", "username": "Codesign", "display_name": "Codesign", "email": "codesign@poniverse.net" }';

        callback(null, body, undefined);
      };
    }
    util.inherits(MockOAuth2Strategy, OAuth2Strategy);
    
    var PoniverseStrategy = $require('../lib/passport-poniverse/strategy', {
      'passport-oauth2': MockOAuth2Strategy
    })
    
    var strategy = new PoniverseStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
    }, function verify(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        return done(null, profile);
      })
    });
    
    
    var user;

    before(function(done) {
      chai.passport.use(strategy)
        .success(function(u) {
          user = u;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.redirect_uri = 'https://passport-poniverse.poni/auth/callback';
          req.query.code = 'GB09ME6SMo8qRka3qECBye2V7KJF6H1CmI95J0VP';
        })
        .authenticate();
    });

    it('should authenticate user', function() {
      expect(user.id).to.equal('47057');
      expect(user.username).to.equal('Codesign');
    });
  });

  describe('error caused by invalid code sent to token endpoint', function() {
    var OAuth2Strategy = require('passport-oauth2').Strategy;
    var OAuth2;
    if (existsSync('node_modules/oauth')) { // npm 3.x
      OAuth2 = require('oauth').OAuth2;
    } else {
      OAuth2 = require('passport-oauth2/node_modules/oauth').OAuth2;
    }
    
    var MockOAuth2Strategy = function(options, verify) {
      OAuth2Strategy.call(this, options, verify);
      
      this._oauth2 = new OAuth2(options.clientID,  options.clientSecret,
        '', options.authorizationURL, options.tokenURL, options.customHeaders);
      this._oauth2.getOAuthAccessToken = function(code, options, callback) {
        return callback({
          statusCode: 400,
          data: '{"error":"invalid_grant","error_description":"The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client."}' });
      };
    }
    util.inherits(MockOAuth2Strategy, OAuth2Strategy);
    
    var PoniverseStrategy = $require('../lib/passport-poniverse/strategy', {
      'passport-oauth2': MockOAuth2Strategy
    })
    
    var strategy = new PoniverseStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://passport-poniverse.poni/auth/callback'
    }, function() {});
    
    
    var err;

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'GB09ME6SMo8qRka3qECBye2V7KJF6H1CmI95J0VP';
        })
        .authenticate();
    });

    it('should error', function() {
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal('The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.');
      expect(err.code).to.equal('invalid_grant');
    });
  }); // error caused by invalid code sent to token endpoint, with response correctly indicating success
  
});
