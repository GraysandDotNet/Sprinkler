
/**
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var GithubStrategy = require( 'passport-github' ).Strategy;
var User = mongoose.model('User');

/**
 * Expose
 */

module.exports = function( auth )
{

	return new GithubStrategy( 
		{
			clientID: auth.clientID,
			clientSecret: auth.clientSecret,
			callbackURL: auth.callbackURL
		},
		function( accessToken, refreshToken, profile, done )
		{
			var options = {
							criteria: { provider : 'github', 
										'providerData.id': profile.id
									  }
						  };

			User.load( options, function( err, user )
			{
				if( err )
				{
					console.log( err );
					return done( err );
				}

				if( !user ) 
				{
					var githubData = profile._json;
					
					var photo = 'images\avatar.png';
					if (githubData && githubData.avatar_url)
						photo = githubData.avatar_url;

					user = new User( {
										name: profile.displayName,
										avatar: photo,
										email: profile.emails[0].value,
										username: profile.username,
										provider: 'github',
										providerData: githubData
									} );
					
					user.save( function( err )
					{
						if( err )
							console.log( err );

						return done( err, user );
					} );
				} 
				else
				{
					return done( err, user );
				}
			} );
		} );
}