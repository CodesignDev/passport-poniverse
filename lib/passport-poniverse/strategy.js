/**
 * Module dependencies.
 */
var util = require('util')
    , OAuth2Strategy = require('passport-oauth2');


/**
 * `Strategy` constructor.
 *
 * The Poniverse authentication strategy authenticates requests by delegating
 * to Poniverse using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`               your Poniverse application's client id
 *   - `clientSecret`           your Poniverse application's client secret
 *   - `callbackURL`            URL to which Poniverse will redirect the user after granting authorization
 *   - `scope`                  array of permission scopes to request, for example:
 *                              'basic', or 'ponyfm:tracks:upload'
 *                              only 'basic' and 'ponyfm:tracks:upload' are valid scopes at present
 *
 * Examples:
 *
 *     passport.use(new PoniverseStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/poniverse/callback',
 *         scope: 'basic'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://poniverse.net/oauth/authorize';
    options.tokenURL = options.tokenURL || 'https://poniverse.net/oauth/access_token';
    options.scopeSeparator = options.scopeSeparator || ' ';
    this.profileUrl = options.profileUrl || 'https://api.poniverse.net/v1/users/me';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'poniverse';
    this._oauth2.useAuthorizationHeaderforGET(false);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Poniverse.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `poniverse`
 *   - `id`               the user's Poniverse ID
 *   - `username`         the user's Poniverse username
 *   - `displayName`      the user's display name
 *   - `email`            the user's email
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
    var self = this;
    this._oauth2.get(this.profileUrl, accessToken, function (err, body, res) {
        var json;

        if (err) {
            if (err.data) {
                try {
                    json = JSON.parse(err.data);
                } catch (_) {}
            }

            if (json && json.error) {
                return done(new Error(json.error_description));
            }
            return done(new Error('Failed to fetch user profile', err));

        } else {
            try {
                json = JSON.parse(body);
            } catch (_) {
                return done(new Error('Failed to parse user profile'));
            }

            var profile = {
                provider: 'poniverse',
            };

            profile.id = json.id;
            profile.username = json.username;
            profile.displayName = json.display_name;
            profile.email = json.email;

            profile._raw = body;
            profile._json = json;

            return done(null, profile);
        }
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;