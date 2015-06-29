
/**
 * Expose routes
 */
module.exports = function( args )	//	args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	
	zones = app.zoneController;
	
	//	The following http://get routes are handed to zone controllers which render the swig views 
	app.get( '/zones', zones.zonesPage );	//	perhaps we'll default to current status, once that exists?
	app.get( '/groups', zones.groups );
	app.get( '/schedules', zones.schedules );
	app.get( '/status', zones.status );
	
	//	The following http://get/put/post/delete routes are the REST handlers for zones related angular pages
	//	see example in http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html
	/*
	GET	/api/ zone / — Gets all booking
	GET /api/ zone / 1 — Gets the booking withID 1
	POST /api/ zone / — Creates a new booking
	PUT /api/zone / 1 — Update booking ID 1
	DELETE /api / zone / 1 — Delete booking ID 1
	*/
	app.get( '/api/zone', zones.getAll );			//	get all currently defined zones

	app.post( '/api/zone', zones.newZone );			//	create a new zone, with form data
	app.get( '/api/zone/:id', zones.getZone );		//	get specified zone
	app.put( '/api/zone/:id', zones.updateZone );	//	update specified zone, with zoneid in url
	app.put( '/api/zone', zones.updateZone );		//	update specified zone, with form data
	app.delete( '/api/zone/:id', zones.deleteZone );//	delete specified zone

	console.log( 'Zones routes initialized' );
}
