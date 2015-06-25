
/**
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var GithubStrategy = require( 'passport-github' ).Strategy;
var User = mongoose.model('User');

/**
 * Expose
 */


GRAYSAND_GITHUB_CLIENTID = '574ac4ffa374e66ae422';
GRAYSAND_GITHUB_CLIENTSECRET = 'c2e68fab047b55fa134af90ad971fcfa02adae4d';
GRAYSAND_GITHUB_AUTHCALLBACK = 'http://localhost:1337/auth/github/callback';

module.exports = new GithubStrategy( {	clientID: GRAYSAND_GITHUB_CLIENTID,
										clientSecret: GRAYSAND_GITHUB_CLIENTSECRET,
										callbackURL: GRAYSAND_GITHUB_AUTHCALLBACK
									},
  function(accessToken, refreshToken, profile, done) {
    var options = {
      criteria: { 'github.id': profile.id }
    };
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.username,
          provider: 'github',
          github: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);
