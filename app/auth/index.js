
/*!
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var LocalStrategy = require( 'passport-local' ).Strategy;
var User = mongoose.model( 'User' );

/*
 *  Generic require login routing middleware
 */
exports.loggedIn = function( req, res, next )
{
	//	allow this request to proceed only for logged in valid users
	if( req.isAuthenticated( ) )
		return next( );
	
	//	if not yet authenitcated, then redirect to the login page:
	if( req.method == 'GET' )
		req.session.returnTo = req.originalUrl;

	res.redirect( '/login' )
}

exports.notLoggedIn = function( req, res, next )
{
	//	allow this to proceed only for users not yet authenticated:	
	if( !req.isAuthenticated( ) )
		return next( );

	//	authenticated users attempting to access this page directly
	//	are redirected to the logged-in status page
	if( req.method == 'GET' )
		req.session.returnTo = req.originalUrl;
	
	res.redirect( '/status' )
}

/*
 *  User authorization routing middleware
 */
exports.user = 
{
	hasAuthorization: function( req, res, next )
	{
		if( req.profile.id != req.user.id )
		{
			req.flash( 'info', 'You are not authorized' )
			return res.redirect( '/users/' + req.profile.id )
		}
		next( )
	}
}


/**
 * Expose as require('passport.js')(passport, config)
 */

module.exports = function( args ) //	args is of type requireArgs
{
	passport = args.passport;
	config = args.config;

	// serialize user for storage within passport.
	//	We store only the mongo id
	passport.serializeUser( function( user, done )
	{
		done( null, user.id )
	} );
	
	//	Deserialize the user from passpoort, and hand to the done callback.
	//	Given just the id of a user, this will load the full user from the database
	//	and pass to the done callback.
	passport.deserializeUser( function( id, done )
	{
		User.load( 
			{ criteria: { _id: id } }, 
			function( err, user )
			{
				done( err, user )
			} );
	} );
	
	
	var local = require( './passport/local' );
	var google = require( './passport/google' )(config.auth.google);
	var windows = require( './passport/liveid' )(config.auth.liveId);
	var github = require( './passport/github' )(config.auth.github);

	// use these strategies
	passport.use( local );
	passport.use( github );
	passport.use( google );
	passport.use( windows );
	
	
	args.passport.authMiddleware = exports;	//	merge our exports into the passport object as authMiddleware member data

	console.log( 'Authentication initialized' );
};
// JavaScript source code
