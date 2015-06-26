
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

/*
 *  Generic require login routing middleware
 */
exports.requiresLogin = function( req, res, next )
{
	if( req.isAuthenticated( ) )
		return next( )
	if( req.method == 'GET' )
		req.session.returnTo = req.originalUrl
	res.redirect( '/login' )
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

	// serialize sessions
	passport.serializeUser( function( user, done )
	{
		done( null, user.id )
	} );
	
	passport.deserializeUser( function( id, done )
	{
		User.load( 
			{ criteria: { _id: id } }, 
			function( err, user )
			{
				done( err, user )
			} );
	} );
		
	// use these strategies
	passport.use( local );
	passport.use( github );
	passport.use( google );
	passport.use( windows );
	
	
	args.passport.authMiddleware = exports;	//	merge our exports into the passport object as authMiddleware member data

	console.log( 'Authentication initialized' );
};
// JavaScript source code
