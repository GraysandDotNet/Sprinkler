

exports.zones = function( req, res )
{
	var templateData = { title: 'Zones' };
	
	res.render( 'zones/zones', 
				templateData );
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
