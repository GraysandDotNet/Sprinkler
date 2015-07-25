
//	BUG:  First time crash if mongo not running at startup
/*
 * 
 *  Environment variables used to start mongo daemon if not running
 *		Mongo="C:\\Program Files\\MongoDB\\Server\\3.0\\bin\\mongod.exe";
 *		MongoArgs="--dbpath .\\data\\db";
 *		MongoUrl="mongodb://localhost/Sprinklers:27017"
 *		
 * */

var path = require( 'path' );
var fs = require( 'fs' );

var exec = require( 'child_process' ).exec;
var spawn = require( 'child_process' ).spawn;

var mongoose = require( 'mongoose' );

// General information re mongoose connection practice, 
//	see http://theholmesoffice.com/mongoose-connection-best-practice/
/* 
 * Mongoose Connection is a node.js EventEmitter,
 *	see https://nodejs.org/api/events.html#events_class_events_eventemitter
 *	
 * The events emitteed are listed in http://mongoosejs.com/docs/api.html#connection-js
 * 	
 * ◾connecting:		Emitted when connection.{open,openSet}() is executed on this connection.
 * ◾connected:		Emitted when this connection successfully connects to the db. May be emitted multiple times in reconnected scenarios.
 * ◾open:			Emitted after we connected and onOpen is executed on all of this connections models.
 * ◾disconnecting:	Emitted when connection.close() was executed.
 * ◾disconnected:	Emitted after getting disconnected from the db.
 * ◾close:			Emitted after we disconnected and onClose executed on all of this connections models.
 * ◾reconnected:	Emitted after we connected and subsequently disconnected, followed by successfully another successfull connection.
 * ◾error:			Emitted when an error occurs on this connection.
 * ◾fullsetup:		Emitted in a replica-set scenario, when all nodes specified in the connection string are connected.
 * */

var onConnecting = function()
{
	console.log( 'Connecting to database:'.yellow, mongoose.connections[0].name );
}

var onConnected = function()
{
	console.log( 'Connected to database:'.green, mongoose.connections[0].name );

	connectionRetryCount = 0;
	connectionRetryTimeout = minConnectionRetryTimeout;
}

var connectionRetryCount = 0;
var minConnectionRetryTimeout = 1;
var maxConnectionRetryTimeout = 60;
var connectionRetryTimeout = minConnectionRetryTimeout;

function getRetryTimeout()
{
	var nTimeout = connectionRetryTimeout;
	connectionRetryTimeout = connectionRetryTimeout * 2;
	if( connectionRetryTimeout > maxConnectionRetryTimeout )
		connectionRetryTimeout = maxConnectionRetryTimeout;
	
	connectionRetryCount++;
	
	console.log( 'Connection Failed: Retry with attempt', connectionRetryCount, 'in', nTimeout, 'seconds' ) ;
	return nTimeout*1000;
}

var onDisconnected = function()
{
	console.log( 'Database disconnected:'.red, mongoose.connections[0].name );
	setTimeout( connect, getRetryTimeout( ) );
	connect( );
}

/*
 * When database connection is established, check to ensure that the local admin user exists:
 */
var onOpen = function()
{
	console.log( 'Database Opened'.bold, mongoose.connections[0].name );
	
	//	make sure that an admin user exists: 
	var User = mongoose.model( 'User' );
	
	//	look for a local user:
	var options = {
					criteria: { username: 'admin', provider: 'local' },
					select: 'username'
				 };
	
	//	invoke the UserSchema.static function 'load' 
	//	from \app\models\user.js
	User.load( options, 
			function( err, user )
	{
		if( err )
		{
			console.log( err );
		}
		
		if( !user )
		{
			//	db does not have an admin user, create one:
			var adminUser = new User( {
										username: 'admin', 
										password: 'admin',
										avatar: 'images/avatar.png',
										name: 'Administrator',
										priv: 2,
										provider: 'local'
									} );
			adminUser.save( function( err )
			{
				if( err )
				{
					console.log( err );
				}
				else
				{
					console.log( 'Created default admin user' );
				}
			} );
		}
	} );
}

var onClose = function()
{
	console.log( 'Database Closed'.bold, mongoose.connections[0].name );
}

var onError = function( err )
{
	console.log( 'Unable to connect to database:'.red, mongoose.connections[0 ], err.message.bold );
}

// If the Node process ends, close the Mongoose connection 
process.on( 'SIGINT', function() 
{
	mongoose.connection.close( function()
	{
		console.log( 'Mongoose default connection disconnected through app termination' );
		process.exit( 0 );
	} );
}); 

//	add the above event-handlers to the mongoose connection object
mongoose.connection.on( 'connecting', onConnecting );
mongoose.connection.on( 'connected', onConnected );
mongoose.connection.on( 'error', onError );
mongoose.connection.on( 'disconnected', onDisconnected );;
mongoose.connection.on( 'open', onOpen );
mongoose.connection.on( 'close', onClose );


//	I was trying to use this function to ensure that Mongo is running.
//	Sadly, this does not work. 
//	Sp the better thing to do is just install mongo as a service. 
function startDb( mongoDb )
{
	if( ( mongoDb.exe == undefined ) ||
		( mongoDb.args == undefined ) ||
		( mongoDb.dir == undefined ) )
		return;
	
/*
	var logDir = ".\\";
	var stdoutFn = path.join( logDir, 'mongoDbOout.log' );
	var stdErrFn = path.join( logDir, 'mongoDbErr.log' );
	var mongoStdOut = fs.openSync( stdoutFn, 'a' );
	var mongoStdErr = fs.openSync( stdErrFn, 'a' );
	
	//	attempt to  startup the db, using the specified environmnent variables
	var mongo = spawn(	mongoDb.exe, 
						mongoDb.args,
						{ detached: true,
							cwd: mongoDb.dir,
							stdio: ['ignore', mongoStdOut, mongoStdErr]
						} );
	
	console.dir( mongo );
	
	console.log( 'Spawned', process.env.MongoDaemon, 'PID', mongo.pid );
	mongo.unref( );
*/	
}

var db = null;
function connect( mongoDb )
{
	//	config is provided upon initial require from main app.js
	//	in subsequent reconnect calls, config is absent
	if( mongoDb != undefined )
		db = config.db.url;
	
	console.log( 'Requesting connection to', db );
	
	//	manage our own reconnect logic:
	var dbOptions = {
						server: { socketOptions : { keepAlive: 1 }, 
								  auto_reconnect: false
								}
					};
	mongoose.connect( db, dbOptions );
}
/**
 * Expose as require('index.js')( config, utils)
 * 
 * Initiatate and manage connection to config.db
 */
module.exports = function( args ) //	args is of type requireArgs
{
	config = args.config;
	utils = args.utils;
	
	//	ensure mongo is running:
	startDb( config.db );

	//	initialize mongo connection:
	connect( config.db );
	
	//	attach all models
	var path = require( 'path' );
	utils.requireAll( path.join( __dirname, 'models' ), args );
	
	utils.requireAll( path.join( __dirname, 'controllers' ), args );
		
	console.log( 'Database Models and Controllers initialized' );
};
