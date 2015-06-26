
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var WindowsLiveId = require('passport-windowslive').Strategy;
var User = mongoose.model('User');

/**
 * Expose
 */

GRAYSAND_LIVEID_CLIENTID = '00000000401588CE ';
GRAYSAND_LIVEID_CLIENTSECRET = 'BIbeHIYZy0X47qIAskiwdhHonWagNyMM';
GRAYSAND_LIVEID_AUTHCALLBACK = 'http://localhost:1337/auth/live/callback';


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
			callbackURL: auth.callbackURL
		},		
		function( accessToken, refreshToken, profile, done )
		{
			var options = {
							criteria: {
										 provider : 'liveid', 
										 'providerData.id': profile.id
									  }
							};
		
		User.load( options, function( err, user )
		{
			if( err )
				return done( err );
			
			if( !user )
			{
				user = new User( {
									name: profile.displayName,
									email: profile.emails[0].value,
									username: profile.emails[0].value,
									provider: 'liveid',
									providerData: profile._json
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