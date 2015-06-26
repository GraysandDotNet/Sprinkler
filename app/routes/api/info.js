﻿
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	info = app.infoController;
	
	app.get( '/about', info.about );
	app.get( '/contact', info.contact );

	console.log( 'Info routes initialized' );
}
