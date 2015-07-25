
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = mongoose.model('User');
var url = require( 'url' );
/**
 * Expose
 */
module.exports = function( auth )
{
	
	return new GoogleStrategy( 
		{
			clientID:		auth.clientID,
			clientSecret:	auth.clientSecret,
			callbackURL:	auth.callbackURL
		},
		function( accessToken, refreshToken, profile, done )
		{
			var options = {
							criteria: { provider : 'google', 
										'providerData.id': profile.id
									  }
						  };
		
		//	invoke the UserSchema.static function 'load' 
		//	from \app\models\user.js
		User.load( options, function( err, user )
		{
			if( err )
				return done( err );
			
			if( !user )
			{
				var photo = 'images/avatar.png';
				var googleData = profile._json;
				if( googleData && googleData.image && googleData.image.url )
					photo = googleData.image.url; // url.parse( googleData.image.url );

				//	if we haven't found user in local db, instantiate from provider data
				user = new User( {
									name: profile.displayName,
									avatar: photo, 
									email: profile.emails[0].value,
									username: profile.username,
									provider: 'google',
									providerData: googleData
								} );
				
				//	and save the newly instantiated user to db:
				user.save( function( err )
				{
					if( err )
					{
						console.log( err );
						return done( err );
					}
					
					//	we saved this google providerData.id in our db,
					// so return the validated user
					return done( err, user );
				} );
			} 
			else
			{
				//	we found this google providerData.id in our db,
				// so return the validated user
				return done( err, user );
			}
		} );
	} );
}
