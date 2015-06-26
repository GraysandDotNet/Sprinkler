/**
 * Expose as require('index.js')( config, utils)
 * 
 * Initiatate and manage connection to config.db
 */
module.exports = function( args ) //	args is of type requireArgs
{
	config = args.config;
	utils = args.utils;
	
	var path = require( 'path' );
	utils.requireAll( path.join( __dirname, 'api' ), args );
	
	console.log( 'Routes initialized' );
};
