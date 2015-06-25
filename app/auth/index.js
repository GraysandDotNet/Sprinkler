
/*!
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var LocalStrategy = require( 'passport-local' ).Strategy;
var User = mongoose.model( 'User' );

var local = require( './passport/local' );
var google = require( './passport/google' );
var windows = require( './passport/liveid.js' );
var github = require( './passport/github' );

//	middleware helpers
var auth = require( './authorization.js' );

/**
 * Expose as require('passport.js')(passport, config)
 */

module.exports = function( args ) //	args is of type requireArgs
{
	passport = args.passport;

	// serialize sessions
	passport.serializeUser( function( user, done )
	{
		done( null, user.id )
	} )
	
	passport.deserializeUser( function( id, done )
	{
		User.load( 
			{ criteria: { _id: id } }, 
			function( err, user )
			{
				done( err, user )
			} )
	} )
		
	// use these strategies
	passport.use( local );
	passport.use( github );
	passport.use( google );
	passport.use( windows );

	console.log( 'Authentication initialized' );
};
// JavaScript source code
