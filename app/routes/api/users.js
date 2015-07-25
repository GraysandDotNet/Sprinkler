
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
		
	app.post( '/auth/local',
				passport.authenticate( 'local', 
										{	failureRedirect: '/login',
											failureFlash: 'Invalid username or password.'
										} ), 
			users.loginComplete );

	app.get( '/users', loggedInMiddlewareFunctions, 
			 users.showUsers );
	
	//	Github OAuth2 routes: authenticate & validation callback:
	//  get /auth/provider is a user-click on the auth icon on the login page
	app.get( '/auth/github',
			 passport.authenticate( 'github', 
									{
										failureRedirect: '/login',
										falureFlash: 'Sorry, not authenticated by Github (1)'
									} ), 
			 users.loginComplete );
	
	//  get /auth/provider/callback  is the url registered for this app with the provider
	app.get( '/auth/github/callback',
			 passport.authenticate( 'github', 
									{
										failureRedirect: '/login',
										falureFlash: 'Sorry, not authenticated by Github (2)'
									} ), 
			users.loginComplete );
	

	//	Google API Oauth2 routes:Spec oauth2 scopes to the defined user-profile & email scopes
	app.get( '/auth/google',
			passport.authenticate( 'google', 
									{
										scope:  [ 'https://www.googleapis.com/auth/userinfo.profile',
												  'https://www.googleapis.com/auth/userinfo.email'
												],
										failureRedirect: '/login',
										failureFlage: 'Sorry, not authenticated by Google (1)'
									} ), 
			users.loginComplete );

	app.get( '/auth/google/callback',
			passport.authenticate( 'google', 
									{
										failureRedirect: '/login',
										falureFlash: 'Sorry, not authenticated by Google (2)'
									} ), 
			users.loginComplete );
	
	//	Microsoft Live OAuth2 routes: Spec oauth2 scopes to the defined live basic scope
	//	see https://msdn.microsoft.com/en-us/library/hh243646.aspx
	app.get( '/auth/live',
			passport.authenticate( 'windowslive', 
									{
										scope: ['wl.signin', 'wl.basic', 'wl.emails'],
										failureRedirect: '/login',
										failureFlash: 'Sorry, not authenticated by Windows (1)'
									} ),
			users.loginComplete );
	
	app.get( '/auth/live/callback',
		    passport.authenticate( 'windowslive', 
									{
										failureRedirect: '/login',
										failureFlash: 'Sorry, not authenticated by Windows (2)'
									} ), 
			users.loginComplete );
	
	
	app.get('/api/user', loggedInMiddlewareFunctions, users.getAll);			//	get all currently defined users	
	app.post('/api/user', loggedInMiddlewareFunctions, users.newUser);			//	create a new zone, with form data
	app.get('/api/user/:id', loggedInMiddlewareFunctions, users.getUser);		//	get specified zone
	app.put('/api/user/:id', loggedInMiddlewareFunctions, users.updateUser);	//	update specified zone, with zoneid in url
	app.put('/api/user', loggedInMiddlewareFunctions, users.updateUser);		//	update specified zone, with form data
	app.delete('/api/user/:id', loggedInMiddlewareFunctions, users.deleteUser);//	delete specified zone
	

	console.log( 'User routes initialized' );
}
