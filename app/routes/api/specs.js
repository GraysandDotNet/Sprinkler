
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	specs = app.specsController;
	
	app.get( '/spec', specs.spec );
	
	specs.ensureSpecs( );

	console.log( 'Specs routes initialized' );
}
