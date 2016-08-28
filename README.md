# passport-poniverse

[![Build](https://img.shields.io/travis/CodesignDev/passport-poniverse.svg)](https://travis-ci.org/CodesignDev/passport-poniverse)
[![Coverage](https://img.shields.io/coveralls/CodesignDev/passport-poniverse.svg)](https://coveralls.io/r/CodesignDev/passport-poniverse)
[![Quality](https://img.shields.io/codeclimate/github/CodesignDev/passport-poniverse.svg?label=quality)](https://codeclimate.com/github/CodesignDev/passport-poniverse)
[![Dependencies](https://img.shields.io/david/codesigndev/passport-poniverse.svg)](https://david-dm.org/codesigndev/passport-poniverse)


[Passport](http://passportjs.org/) strategy for authenticating with [Poniverse](https://poniverse.net/)
using the OAuth 2.0 API.

This module lets you authenticate using Poniverse in your Node.js applications.
By plugging into Passport, Poniverse authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-poniverse
```

## Usage

#### Create an Application

Before using `passport-poniverse`, you must first obtain a Client ID and Secret
from Poniverse.  This can be done by following the instructions at the bottom of
of the [API](https://poniverse.net/api) page.  The client ID and secret need to
be provided to the strategy.  You will also need to state a callback URL which
matches the route in your application.

#### Configure Strategy

The Poniverse authentication strategy authenticates users using a Poniverse account
and OAuth 2.0 tokens.  The client ID and secret obtained when creating an
application are supplied as options when creating the strategy.  The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` which contains the authenticated user's
Poniverse profile.  The `verify` callback must call `cb` providing a user to
complete authentication.

```js
var PoniverseStrategy = require('passport-poniverse').Strategy;

passport.use(new PoniverseStrategy({
    clientID: PONIVERSE_CLIENT_ID,
    clientSecret: PONIVERSE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/poniverse/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ poniverseId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'poniverse'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/poniverse',
  passport.authenticate('poniverse'));

app.get('/auth/poniverse/callback', 
  passport.authenticate('poniverse', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Examples

Developers using the popular [Express](http://expressjs.com/) web framework can
refer to an [example](https://github.com/passport/express-4.x-facebook-example)
as a starting point for their own web applications.  The example shows how to
authenticate users using Facebook.  However, because both Facebook and Poniverse
use OAuth 2.0, the code is similar.  Simply replace references to Facebook with
corresponding references to Poniverse.

## Contributing

#### Tests

The test suite is located in the `test/` directory.  All new features are
expected to have corresponding test cases.  Ensure that the complete test suite
passes by executing:

```bash
$ make test
```

#### Coverage

The test suite covers 100% of the code base.  All new feature development is
expected to maintain that level.  Coverage reports can be viewed by executing:

```bash
$ make test-cov
$ make view-cov
```

## License

[The Apache-2.0 License](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2016 Ross Gibson
