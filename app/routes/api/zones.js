
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	zones = app.zoneController;
	
	//	The following http://get routes are handed to zone controllers which render the swig views 
	app.get( '/zones', zones.zones );	//	perhaps we'll default to current status, once that exists?
	app.get( '/groups', zones.groups );
	app.get( '/schedules', zones.schedules );
	app.get( '/status', zones.status );
	
	//	The following http://get/put/post/delete routes are the REST handlers for zones related angular pages
	//	see example in http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html

	console.log( 'Zones routes initialized' );
}
