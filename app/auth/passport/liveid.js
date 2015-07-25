
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var WindowsLiveId = require('passport-windowslive').Strategy;
var User = mongoose.model('User');

/**
 * Expose
 */


/*
 * https://login.live.com/err.srf?lc=1033#error=invalid_request&error_description=The+provided+value+for+the+input+parameter+'redirect_uri'+is+not+valid.+The+expected+value+is+'https://login.live.com/oauth20_desktop.srf'+or+a+URL+which+matches+the+redirect+URI+registered+for+this+client+application.
 * 
 * */
module.exports = function( auth )
{
	return  new WindowsLiveId( 
		{
			clientID:		auth.clientID,
			clientSecret:	auth.clientSecret,
			callbackURL:	auth.callbackURL
		},		
		function( accessToken, refreshToken, profile, done )
		{
			var options = {
							criteria: {
										 provider : 'live', 
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
				var liveData = profile._json;
					
				var photo = 'images/avatar.png';
				if (liveData && profile.photos && profile.photos[0].value )
					photo = profile.photos[0].value; // url.parse( googleData.image.url );

				user = new User( {
									name: profile.displayName,
									avatar: photo, 
									email: profile.emails[0].value,
									username: profile.emails[0].value,
									provider: 'live',
									providerData: liveData
								} );
				
				//	and save the newly instantiated user to db:
				user.save( function( err )
				{
					if( err )
					{
						console.log( err );
						return done( err );
					}
					
					//	we saved this providerData.id in our db,
					// so return the validated user
					return done( err, user );
				} );
			} 
			else
			{
				//	we found this providerData.id in our db,
				// so return the validated user
				return done( err, user );
			}
		} );
	} );
}