
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');

/**
 * Load
 */
exports.load = function( req, res, next, id ) 
{
	var options = { criteria: { _id : id } };
	
	User.load( options, function( err, user ) 
	{
		if( err )
			return next( err );

		if( !user )
			return next( new Error( 'Failed to load User ' + id ) );

		req.profile = user;

		next();
	});
};

/**
 * Create user
 */
exports.create = function( req, res ) 
{
	var user = new User(req.body);
	user.provider = 'local';
	user.save( function( err ) 
	{
		if( err )
		{
			var templateData = {
									title: 'Sign up',
									error: utils.errors( err.errors ),
									user: user
								};

			return res.render(	'users/signup', 
								templateData );
		}

		// manually login the user once successfully signed up
		req.logIn( user, function( err ) 
		{
				if( err )
					req.flash( 'info', 'Sorry! We are not able to log you in!' );
			
				return res.redirect( '/' );
		});
  });
};

/**
 *  Show profile
 */
exports.show = function( req, res ) 
{
	var user = req.profile;
	var templateData = {
							title: user.name,
							user: user
						}

	res.render( 'users/show', 
				templateData );
};

exports.signin = function (req, res) {};

/**
 * Auth callback
 */
exports.authCallback = login;

/**
 * Show login form
 */
exports.login = function( req, res ) 
{
	var templateData = { title: 'Login' };

	res.render( 'users/login', 
				templateData );
};

/**
 * Show sign up form
 */
exports.signup = function( req, res ) 
{
	var templateData = {
							title: 'Sign up',
							user: new User( )
						};
	
	res.render( 'users/signup', 
				templateData );
};

/**
 * Logout
 */
exports.logout = function( req, res ) 
{
  req.logout();
  res.redirect('/login');
};

/**
 * Login
 */
function login( req, res ) 
{
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
};

/**
 * Session
 */
exports.session = login;

var utils;	//	we need to retain a reference to the passed in args, since utils is used in our exported methods

module.exports = function( args )	//	args is of type requireArgs
{
	utils = args.utils;	
	args.app.userController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded user controller' );
}
