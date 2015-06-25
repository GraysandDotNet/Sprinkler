
/**
 * Module dependencies.
 */

var path = require( 'path' );
var extend = require( 'util' )._extend;


// Read env.json file, if it exists, load the id's and secrets from that
// Note that this is only in the development env
// it is not safe to store id's in files
function loadDefaults( dir )
{
	var fs = require( 'fs' );
	var envFile = path.join( dir, 'env.json' );
	
	if( fs.existsSync( envFile ) )
	{
		var env = fs.readFileSync( envFile, 'utf-8' );
		env = JSON.parse( env );
		Object.keys( env ).forEach( function( key )
		{
			process.env[key] = env[key];
		} );
	}
}

var envDir = path.join( __dirname, 'env' );

loadDefaults( envDir );

var development = require( './env/development' );
var test = require( './env/test' );
var production = require( './env/production' );

var defaults = 
 {
	root: path.normalize( path.join( __dirname, '..' ) )
};

/**
 * Expose based on NODE_ENV
 */

module.exports = 
{
	development: extend( development, defaults ),
	test: extend( test, defaults ),
	production: extend( production, defaults )

}[process.env.NODE_ENV || 'development'];
