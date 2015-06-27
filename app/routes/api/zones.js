
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	zones = app.zoneController;
	app.get( '/zones', zones.zones );	//	perhaps we'll default to current status, once that exists?
	app.get( '/groups', zones.groups );
	app.get( '/schedules', zones.schedules );
	app.get( '/status', zones.status );

	console.log( 'Zones routes initialized' );
}
