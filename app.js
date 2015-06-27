
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

// config/passport/index.js: Bootstrap passport config
require( './app/auth' )( requireArgs );

// app/express/index.js: Bootstrap application settings
require( './app/express' )( requireArgs );

// Bootstrap routes, which must be done after passport 
require( './app/routes' )( requireArgs );

console.log(app.packageJson.name.bold, 
             'v', app.packageJson.version, 
             '(c)', app.packageJson.author.name.grey, app.packageJson.author.copyright.grey,
             'Started:', app.getCurrentTime());


app.listen( config.webserver.port );
console.log( app.packageJson.name.bold, 'listening on port', config.webserver.port );

//  Now let's setup our periodic internal notification timer:

var timerTick = 30 * 1000;  //  nyquist for once every minute :-)
var intervalObject = setInterval(app.pollTimer, /* the polltimer callback instance*/
                                timerTick, /* milliseconds between ticks*/
                                app /* app is passed as parameter to the timer callback functionn above*/ );
