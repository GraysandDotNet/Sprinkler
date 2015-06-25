
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = mongoose.model('User');

/**
 * Expose
 */

GRAYSAND_GOOGLE_CLIENTID = '403146415924 - gv1ptvmomorg68nc0esq0pubrb7c2st7.apps.googleusercontent.com';
GRAYSAND_GOOGLE_CLIENTSECRET= 'GAXShsVY_vSPkXoTxY6LLxNm';
GRAYSAND_GOOGLE_AUTHCALLBACK = 'http://localhost:1337/auth/google/callback';

module.exports = new GoogleStrategy( {	clientID: GRAYSAND_GOOGLE_CLIENTID,
										clientSecret: GRAYSAND_GOOGLE_CLIENTSECRET,
										callbackURL: GRAYSAND_GOOGLE_AUTHCALLBACK
									 },
	function( accessToken, refreshToken, profile, done ) 
	{
		var options = { criteria: { provider : 'google', 
									'providerData.id': profile.id } };
	
		//	invoke the UserSchema.static function 'load' 
		//	from \app\models\user.js
		User.load( options, function( err, user ) 
		{
			if( err )
				return done( err );

			if( !user )
			{	
				//	if we haven't found user in local db, instantiate from provider data
				user = new User( {
									name: profile.displayName,
									email: profile.emails[0].value,
									username: profile.username,
									provider: 'google',
									providerData: profile._json
								 });
			
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
					return done(err, user);
				} );
			} 
			else
			{
				//	we found this google providerData.id in our db,
				// so return the validated user
				return done(err, user);
			}
		} );
	}
);
