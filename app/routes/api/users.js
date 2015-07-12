
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
	zones = app.zoneController;	//	reuired to permit access upon signin to zones.status

	
	//	Auth middleware as setup by app/auth/index.js:
	var loggedInMiddlewareFunctions = [passport.authMiddleware.loggedIn, users.loggedInMiddleware ];
	var notLoggedInOnly = [passport.authMiddleware.notLoggedIn /* add another auth param to arry here */];

	// user routes
	app.get( '/login',  notLoggedInOnly, users.showLoginForm);
	app.get( '/logout', loggedInMiddlewareFunctions, users.logout );
	
	//	get /signup   displays the users/signup form page:
	app.get( '/signup', loggedInMiddlewareFunctions, users.signup );
	//	post /users is the target of he users/signup form
	app.post( '/signup', loggedInMiddlewareFunctions, users.create);
	
	app.post( '/auth/local',
				passport.authenticate( 'local', 
										{	failureRedirect: '/login',
											failureFlash: 'Invalid username or password.'
										} ), 
			users.initCookieOnLogin,
			users.loginComplete );

	app.get( '/users', loggedInMiddlewareFunctions, 
			 users.showUsers );
	
	//	Github OAuth2 routes: authenticate & validation callback:
	//  get /auth/provider is a user-click on the auth icon on the login page
	app.get( '/auth/github',
			 passport.authenticate('github', { failureRedirect: '/login' } ), 
			 users.showLoginForm );
	
	//  get /auth/provider/callback  is the url registered for this app with the provider
	app.get( '/auth/github/callback',
			 passport.authenticate('github', { failureRedirect: '/login' } ), 
			users.initCookieOnLogin,
			users.loginComplete );
	

	//	Google API Oauth2 routes:Spec oauth2 scopes to the defined user-profile & email scopes
	app.get( '/auth/google',
			passport.authenticate('google', { failureRedirect: '/login',
											  scope: [	'https://www.googleapis.com/auth/userinfo.profile',
														'https://www.googleapis.com/auth/userinfo.email'
													 ]
											} ), 
			users.showLoginForm );

	app.get( '/auth/google/callback',
			passport.authenticate('google', { failureRedirect: '/login' } ), 
			users.initCookieOnLogin,
			users.loginComplete );
	
	//	Microsoft Live OAuth2 routes: Spec oauth2 scopes to the defined live basic scope
	//	see https://msdn.microsoft.com/en-us/library/hh243646.aspx
	app.get( '/auth/live',
			passport.authenticate( 'windowslive', { failureRedirect: '/login',
													scope: ['wl.signin', 'wl.basic', 'wl.emails' ]
												  } ),
			users.showLoginForm );
	
	app.get( '/auth/live/callback',
		    passport.authenticate( 'windowslive', { failureRedirect: '/login' } ), 
			users.loginComplete );
	
	console.log( 'User routes initialized' );
}
