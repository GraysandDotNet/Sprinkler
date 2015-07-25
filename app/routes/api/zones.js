
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	zones = app.zoneController;

	users = app.userController;	
	//	Auth middleware as setup by app/auth/index.js:
	var loggedInMiddlewareFunctions = [passport.authMiddleware.loggedIn, users.loggedInMiddleware];
	
	//	The following http://get routes are handed to zone controllers which render the swig views 
	app.get( '/zones', loggedInMiddlewareFunctions, zones.zonesPage );	//	perhaps we'll default to current status, once that exists?
	app.get( '/groups', loggedInMiddlewareFunctions, zones.groups );
	app.get( '/schedules', loggedInMiddlewareFunctions, zones.schedules );
	app.get( '/status', loggedInMiddlewareFunctions, zones.status );
	
	//	The following http://get/put/post/delete routes are the REST handlers for zones related angular pages
	//	see example in http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html
	/*
	GET	/api/ zone / — Gets all booking
	GET /api/ zone / 1 — Gets the booking withID 1
	POST /api/ zone / — Creates a new booking
	PUT /api/zone / 1 — Update booking ID 1
	DELETE /api / zone / 1 — Delete booking ID 1
	*/
	app.get( '/api/zone', loggedInMiddlewareFunctions, zones.getAll );			//	get all currently defined zones
	app.post( '/api/zone', loggedInMiddlewareFunctions, zones.newZone );		//	create a new zone, with form data
	app.get( '/api/zone/:id', loggedInMiddlewareFunctions, zones.getZone );		//	get specified zone
	app.put( '/api/zone/:id', loggedInMiddlewareFunctions, zones.updateZone );	//	update specified zone, with zoneid in url
	app.put( '/api/zone', loggedInMiddlewareFunctions, zones.updateZone );		//	update specified zone, with form data
	app.delete( '/api/zone/:id', loggedInMiddlewareFunctions, zones.deleteZone );//	delete specified zone

	console.log( 'Zones routes initialized' );
}
