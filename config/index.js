
/**
 * Module dependencies.
 */

var path = require( 'path' );
var extend = require( 'util' )._extend;


var envDir = path.join( __dirname, 'env' );
// read and parse the env file, to make available as local object:
var envJson = require( path.join( envDir , 'env.json' ) );		//	read the file
envJson.root = path.normalize( path.join( __dirname, '..' ) );	//	add in the local path as root
//	and any environment specific overrides:
var development = require( path.join( envDir , 'development.js' ));
var test = require( path.join( envDir , 'test.js' ));
var production = require( path.join( envDir , 'production.js' ));


/**
 * Expose based on NODE_ENV
 */
module.exports = 
{
	development: extend( development, envJson ),
	test: extend( test, envJson ),
	production: extend( production, envJson )

}[process.env.NODE_ENV || 'development'];
