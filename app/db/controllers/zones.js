
/**
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var Zone = mongoose.model( 'Zone' );



//		SWIG page rendering
exports.zonesPage = function( req, res )
{
	var templateData = { title: 'Zones' };
	
	res.render( 'zones/zones', 
				templateData );
};

//	REST API methods:
//	return res as json to calling angular script

//	create a single new zone:
exports.newZone = function( req, res )
{
	var zoneNum = req.param( 'number' );
	console.log( 'Create new zone' );
	
	//	kosherize to work only with valid zone numbers, to prevent contraint throwing an onReject
	if( !Zone.validZone( zoneNum ) )
		return res.status(400).send(  'Zone must be in range 1-16');

	//	we want to treat number as a unique fieldsince zoneNum is not an index field,
	//	so only create a new entry if a lookup by number doesn't find the zone
	Zone.loadByNumber( zoneNum, function( err, zone )
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		
		//	create as new zone if not found in db:
		if( !zone )
		{
			zone = new Zone( {
								number: zoneNum,			
								name: req.param( 'name' ) ,		
								tLastChange: Date.now( )
							} );

			res.status( 201 );	//	201: Created new resource
		}
		
		//	and save the zone we now have 
		//	(could be either create or update)
		zone.save( function( err, zone )
		{
			if( err )
			{
				console.dir( err );
				return res.status( 500 ).send( err );
			}
			return res.json( zone );	
		} );	
	} );	
};


//	gets all currently defined zones from db:
exports.getAll = function( req, res )
{
	console.log( 'Retrieving all zones' );

	Zone.find( 'number name tLastChange state', function( err, zones )
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		return res.json( zones );
	} );
};

//	gets specified zone
exports.getZone =  function( req, res )
{
	var zoneNum = req.params.id;
	console.log( 'Retrieve single zone', zoneNum );
	
	//	kosherize to work only with valid zone numbers, to prevent contraint throwing an onReject
	if( !Zone.validZone( zoneNum ) )
		return res.status( 400 ).send( 'Zone must be in range 1-16' );

	Zone.loadByNumber( zoneNum, function( err, zone ) 
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		
		res.json( zone );		
	} );	
};

//	updates specified zone
exports.updateZone = function( req, res )
{
	var zoneNum = req.params.id;
	console.log( 'Update single zone', zoneNum );
	
	//	kosherize to work only with valid zone numbers, to prevent contraint throwing an onReject
	if( !Zone.validZone( zoneNum ) )
		return res.status( 400 ).send( 'Zone must be in range 1-16' );

	Zone.loadByNumber( zoneNum, function( err, zone )
	{
		if( err )
		{
			console.dir( errot );
			res.status( 500 ).send( err );
		}
		
		//	udpate the fields in the retrieved zone with the user-supplied values:			
		zone.number = req.param( 'number' );
		zone.name = req.param( 'name' ) ;
		
		//	update in db:
		zone.save( function( err, zone )
		{
			if( err )
			{
				console.dir( err );
				res.status( 500 ).send( err );
			}
			
			res.json( zone );
		} );
	} );
};

//	deletes the zone
exports.deleteZone = function( req, res )
{
	var zoneNum = req.params.id;
	console.log( 'Delete single zone', zoneNum);
	
	//	kosherize to work only with valid zone numbers, to prevent contraint throwing an onReject
	if( !Zone.validZone( zoneNum ) )
		return res.status( 400 ).send( 'Zone must be in range 1-16' );
	
	Zone.loadByNumber( zoneNum, function( err, zone )
	{
		if( err )
		{
			console.dir( err );
			res.status( 500 ).send( 'Zone', zoneNum, 'not found' );
		}
		
		if( !zone )
		{
			res.status( 400 ).json( );	//	400: bad request, no such zone
		}
		else
		{			
			Zone.remove( { _id: zone._id }, function( err )
			{
				if( err )
				{
					console.dir( err );
					res.status( 500 ).send( 'Zone', zoneNum, 'error' );
				}
				
				res.status( 410 ).json( );		//	410: resource gone
			} );
		}
	} );
};



exports.groups = function( req, res )
{
	var templateData = { title: 'Groups' };
	
	res.render( 'zones/groups', 
				templateData );
};

exports.schedules = function( req, res )
{
	var templateData = { title: 'Schedules' };
	
	res.render( 'zones/schedules', 
				templateData );
};

exports.status = function( req, res )
{
	var templateData = { title: 'Status' };
	
	res.render( 'zones/status', 
				templateData );
};

var utils;	//	we need to retain a reference to the passed in args, since utils is used in our exported methods

module.exports = function( args )	//	args is of type requireArgs
{
	utils = args.utils;
	args.app.zoneController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded zones controller' );
}
