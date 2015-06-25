

exports.zones = function( req, res )
{
	var templateData = { title: 'zones' };
	
	res.render( 'zones/index', 
				templateData );
};

var utils;	//	we need to retain a reference to the passed in args, since utils is used in our exported methods

module.exports = function( args )	//	args is of type requireArgs
{
	utils = args.utils;
	args.app.zoneController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded zones controller' );
}
