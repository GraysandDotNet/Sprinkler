/**
 * Expose as require('index.js')( config, utils)
 * 
 * Initiatate and manage connection to config.db
 */
module.exports = function( args ) //	args is of type requireArgs
{
	config = args.config;
	utils = args.utils;
	app = args.app;

	var path = require( 'path' );
	utils.requireAll( path.join( __dirname, 'api' ), args );
	
	//	default home-page:
	users = app.userController;
	app.get( '/', users.login );

	/**
	* Error handling
	*/
	app.use( function( err, req, res, next )
	{
		// treat as 404
		if( err.message &&
			 ( ~err.message.indexOf( 'not found' ) || ( ~err.message.indexOf( 'Cast to ObjectId failed' ) ) ) )
		{
			return next( );
		}
		
		console.error( err.stack );
		// error page
		res.status( 500 ).render( '500', 
								 { error: err.stack } );
	} );
	
	// assume 404 since no middleware responded
	app.use( function( req, res, next )
	{
		res.status( 404 ).render( '404', 
									{
			url: req.originalUrl,
			error: 'Not found'
		} );
	} );

	console.log( 'Routes initialized' );
};
