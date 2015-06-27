
//	BUG:  First time crash is mongo not running at startup
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

/*
var spawn = require( 'child_process' ).spawn;
/*
			var mongoProcess = path.join( process.env.MongoDir, process.env.MongoDaemon );
			var mongoArgs = process.env.MongoArgs;
			var logDir = ".\\";
			var stdoutFn = path.join( logDir, 'mongoDbOout.log');
			var stdErrFn = path.join( logDir, 'mongoDbErr.log');
			var mongoStdOut = fs.openSync( stdoutFn, 'a' );
			var mongoStdErr = fs.openSync( stdErrFn, 'a' );
						
			//	attempt to  startup the db, using the specificed environmnent variables
			var mongo = spawn( mongoProcess, 
								[ '----dbpath', '.\data\db'],
								{	detached: true,
									cwd: process.env.mongodir,
									stdio: ['ignore', mongoStdOut, mongoStdErr]
								} );
			
			console.dir( mongo );
			
			console.log( 'Spawned', process.env.MongoDaemon, 'PID', mongo.pid );
			mongo.unref( );

			var retryMs = 2 * 1000;
			setTimeout( initializeDatabase, retryMs );
			*/

var mongoose = require( 'mongoose' );

// Generatl information re mongoose connection practice, 
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
	setTimeout( connect, getRetryTimeout() );
}

var onOpen = function()
{
	console.log( 'Database Opened'.bold, mongoose.connections[0].name );
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

mongoose.connection.on( 'connecting', onConnecting );
mongoose.connection.on( 'connected', onConnected );
mongoose.connection.on( 'error', onError );
mongoose.connection.on( 'disconnected', onDisconnected );;
mongoose.connection.on( 'open', onOpen );
mongoose.connection.on( 'close', onClose );

var db = null;
function connect( config )
{
	//	config is provided upon initial require from main app.js
	//	in subsequent reconnect calls, config is absent
	if( config != undefined )
		db = config.db;
	
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

	//	initialize mongo connection
	connect( config );
	
	//	attach all models
	var path = require( 'path' );
	utils.requireAll( path.join( __dirname, 'models' ), args );
	
	utils.requireAll( path.join( __dirname, 'controllers' ), args );
		
	console.log( 'Database Models and Controllers initialized' );
};
