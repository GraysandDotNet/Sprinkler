
/**
 * Module dependencies.
 */

var fs = require( 'fs' );
var path = require( 'path' );
var colors = require( 'colors2' );
var express = require( 'express' );
var mongoose = require( 'mongoose' );
var passport = require( 'passport' );
var utils = require( './utils' );

var app = express( );

//	config/index.js  will load and set the config var per settings in the env subdir.
var config = require( './config' );

//	create a json wrapper object as param to pass to all included/required modules:
var requireArgs = { app: app, passport: passport, config: config, utils: utils };

//	app/db/index.js: Initialize and startup the database and load all models (currently also does routes?)
require( './app/db'  )( requireArgs );		//	initialize mongoose and mongo.

// app/express/index.js: Bootstrap application settings
require( './app/express' )( requireArgs );

// config/passport/index.js: Bootstrap passport config
require( './app/auth' )( requireArgs );

// Bootstrap routes
//require( './app/routes' )( requireArgs );


console.log(app.packageJson.name.bold, 
             'v', app.packageJson.version, 
             '(c)', app.packageJson.author.name.grey, app.packageJson.author.copyright.grey,
             'Started:', app.getCurrentTime());


//  load our local route controllers
//var auth = require( './controllers/auth.js' );
var routes = require( './controllers/get' );
var specs = require( './controllers/specs' );

//  try out the table-driven commonHandler :
//app.get('/', routes.commonHandler);
app.get('/about', routes.commonHandler);
app.get('/contact', routes.commonHandler);
app.get('/spec', specs.spec);

specs.ensureSpecs();

// Extract environment variables, and setup webserver/template-parser
//  as set in the PiZone.sln on VS, 
//  although still unsure how to set envirionment vars on Linus on Pi 
var webserverPort = process.env.PORT;
app.set( 'port', webserverPort );

//  create the webserver object for this app: 
var webserver = require('http').createServer(app);
// and begin listening on the configured port:
//  note: the webserver object will invoke the app defined routes when client connects
webserver.listen(webserverPort, 
    function () 
    {
        console.log( app.packageJson.name.bold, 'listening on port', webserverPort);
    });

//  Now let's setup our periodic internal notification timer:

var timerTick = 30 * 1000;  //  nyquist for once every minute :-)
var intervalObject = setInterval(app.pollTimer, /* the polltimer callback instance*/
                                timerTick, /* milliseconds between ticks*/
                                app /* app is passed as parameter to the timer callback functionn above*/ );
