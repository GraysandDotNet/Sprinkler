
/*!
 * Module dependencies.utilsObj
 */
var passport = require( 'passport');
// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

/**
 * Route middlewares
 */


/**
 * Expose routes
 */

module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	
	users = app.userController;
	
	//	Auth middleware as setup by app/auth/index.js:
	var loggedInOnly = [passport.authMiddleware.requiresLogin /* add another auth param to arry here */];

	// user routes
	app.get( '/login',  users.login);
	app.get( '/logout', users.logout );
	
	app.get( '/signup', users.signup );

	app.post( '/users', users.create);
	
	app.post( '/users/session',
				passport.authenticate( 'local', 
										{	failureRedirect: '/login',
											failureFlash: 'Invalid email or password.'
										} ), 
				users.session );

	app.get( '/users/:userId', 
			 users.show );
	
	//	Github OAuth2 routes: authenticate & validation callback:
	app.get( '/auth/github',
			 passport.authenticate('github', { failureRedirect: '/login'
											 } ), 
			 users.signin );

	app.get( '/auth/github/callback',
			 passport.authenticate('github', { failureRedirect: '/login'
											 } ), 
			 users.authCallback );
	
	//	Google API Oauth2 routes:Spec oauth2 scopes to the defined user-profile & email scopes
	app.get( '/auth/google',
			passport.authenticate('google', { failureRedirect: '/login',
											  scope: [	'https://www.googleapis.com/auth/userinfo.profile',
														'https://www.googleapis.com/auth/userinfo.email'
													 ]
											} ), 
			users.signin );

	app.get( '/auth/google/callback',
			passport.authenticate('google', { failureRedirect: '/login'
											} ), 
			users.authCallback );
	
	//	Microsoft Live OAuth2 routes: Spec oauth2 scopes to the defined live basic scope
	//	see https://msdn.microsoft.com/en-us/library/hh243646.aspx
	app.get( '/auth/live',
			passport.authenticate( 'windowslive', { failureRedirect: '/login',
													scope: ['wl.signin', 'wl.basic', 'wl.emails' ]
												  } ),
			users.signin );
	
	app.get( '/auth/live/callback',
		    passport.authenticate( 'windowslive', { failureRedirect: '/login' } ), 
			users.authCallback );

	app.param( 'userId', users.load);

	console.log( 'User routes initialized' );
}
