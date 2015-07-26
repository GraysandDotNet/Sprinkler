
/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
//var compression = require('compression');	//	server response deflate/gzip support
var favicon = require( 'serve-favicon' );	//	fun little favicons
var cookieParser = require( 'cookie-parser' );
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require('multer');		//	multi-part form support

var swig = require( 'swig' );
var mongoStore = require( 'connect-mongo' )( session );

var flash = require( 'connect-flash' );
var helpers = require( 'view-helpers' );

var path = require( 'path' );

/**
 * Expose
 */
module.exports = function( args ) // args is of type requireArgs
{
	app = args.app;
	passport = args.passport;
	config = args.config;
	utils = args.utils;

	//  set the known static dirs for serving up non-templated html/images/scripts: 
	app.use( express.static( path.join( config.root, 'public' ) ) );
	app.use( express.logger( 'dev' ) );
	
	// set views path, template engine and default layout	
	app.engine( 'html', swig.renderFile );
	app.set( 'views', path.join( config.root, 'app', 'views' ) );
	app.set( 'view engine', 'html' );
	
	app.use( favicon( path.join( config.root, 'public', 'images', 'favicon.ico' ) ) );
		
	// read and parse the packge file, to make available as local object:
	app.packageJson = require( path.join( config.root, 'package.json' ) );
	app.env = process.env.NODE_ENV || 'development';
	// expose package.json to views
	app.use( function( req, res, next )
	{
		res.locals.packageJson = app.packageJson;
		res.locals.env = app.env;
		next( );
	} );
	
	utils.requireAll( path.join( __dirname, 'appExtensions' ), app )

	app.locals.copyright = app.getCurrentTime( 'year' ).toString( );

	//	dev/debug only settings:	
	if( app.get( 'env' ) === 'development' )
	{		
		swig.setDefaults( { cache: false } );
		app.use( express.errorHandler( ) );
	}
	
	// bodyParser should be above methodOverride
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// CookieParser should be above session
	app.use(cookieParser());
	app.use( cookieSession( {
								secret: app.packageJson.name, 
								signed: 'false', 
								httpOnly: 'false'
							} ) );
	app.use(session( { 
						resave: true,
						saveUninitialized: true,
						secret: app.packageJson.name,
						store: new mongoStore( { url: config.db.url,
												 collection : 'sessions'
												})
					 }));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages - should be declared after sessions
	app.use( flash( ) );
	
	// should be declared after session and flash
	app.use( helpers( app.packageJson.name ) );
	
	console.log( 'Express initialized' );
};
