
/*!
 * Module dependencies.utilsObj
 */

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
	passport = args.passport;

	users = app.userController;

	var auth = require( './middlewares/authorization' );
	
	var zoneAuth = [auth.requiresLogin /* add another auth param to arry here */];

	// user routes
	app.get('/login', users.login);
	app.get('/signup', users.signup);
	app.get( '/logout', users.logout );

	app.post('/users', users.create);
	
	app.post( '/users/session',
				passport.authenticate( 'local', 
										{	failureRedirect: '/login',
											failureFlash: 'Invalid email or password.'
										} ), 
				users.session );

	app.get('/users/:userId', users.show);
	
	//	Github OAuth2 routes: authenticate & validation callback:
	app.get( '/auth/github',
			passport.authenticate('github', { failureRedirect: '/login'
											} ), 
			users.signin );

	app.get('/auth/github/callback',
			passport.authenticate('github', { failureRedirect: '/login'
											} ), 
			users.authCallback );
	
	//	Google API Oauth2 routes:Spec oauth2 scopes to the defined user-profile & email scopes
	app.get('/auth/google',
			passport.authenticate('google', { failureRedirect: '/login',
											  scope: [	'https://www.googleapis.com/auth/userinfo.profile',
														'https://www.googleapis.com/auth/userinfo.email'
													 ]
											} ), 
			users.signin );

	app.get('/auth/google/callback',
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


	// home route ( should'nt live here, this is temp):
	zones = app.zoneController;
	app.get('/', zones.zones );	//	perhaps we'll default to current status, once that exists?



	/**
	* Error handling
	*/
	app.use( function( err, req, res, next ) 
	{
		// treat as 404
		if( err.message &&
			 ( ~err.message.indexOf( 'not found' ) 	|| ( ~err.message.indexOf( 'Cast to ObjectId failed' ) ) ) )
		{
			return next();
		}
		
		console.error( err.stack );
		// error page
		res.status( 500 ).render( '500', 
								 { error: err.stack } );
	});

	// assume 404 since no middleware responded
	app.use( function( req, res, next )				
	{
		res.status( 404 ).render(	'404', 
									{	url: req.originalUrl,
										error: 'Not found'
									});
	} );

	console.log( 'Loaded user routes' );
}
