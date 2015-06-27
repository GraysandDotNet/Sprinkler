
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');

/**
 * Expose  : Find by email.  I'd also like a find by username
 */
module.exports = new LocalStrategy( {	usernameField: 'username',
										passwordField: 'password'
									},
	function( username, password, done ) 
	{
		var options = { criteria: { username: username },
						select: 'name username email hashed_password salt'
					  };
		//	invoke the UserSchema.static function 'load' 
		//	from \app\models\user.js
		User.load( options, function( err, user ) 
		{
			if( err )
				return done( err );

			if( !user )
			{	
				//	if we haven't found user in local db, consider it an error
				return done(null, false, { message: 'Unknown user' });
			}
		
			//	if we did find the user, authenticate the user-provided plaintext password
			if( !user.authenticate( password ) )
			{
				return done( null, false, { message: 'Invalid password' } );
			}
		
			//	we found user, and password matches hashed version 
			return done(null, user);
		});
	}
);
