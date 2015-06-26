
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	zones = app.zoneController;
	app.get( '/zones', zones.zones );	//	perhaps we'll default to current status, once that exists?

	console.log( 'Zones routes initialized' );
}
