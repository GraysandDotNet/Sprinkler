
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');

/************************************************
 * Signup
 * 
 *  http GET  /signup 
 *  
 * Show sign up form
 */
exports.signup = function( req, res )
{
	var templateData = {
		title: 'Add user',
	};
	
	res.render( 'users/signup', 
				templateData );
};

/**	
 *	Signup
 *	
 *	http  POST /Signup
 *	
 * Form submitted by the signup for Create user
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
									title: 'Add User',
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

/*******************************************************************
 * 
 *  Show profile
 */
exports.showUsers = function( req, res ) 
{
	//	preload the list of all known users as static swig data:
	User.find( '_id username name avatar provider providerData', function( err, users )
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		//   the users.loggidInMiddleware has already queried for current user, \
		//	and set req params userid, provider, name, avatar.	
		var templateData = {
								title: 'Registered Users',
								currentUser : req.userid,
								users: users
							};
		
		//	users.html is an angular page
		res.render( 'users/users', 
				templateData );
	} );
};

exports.signin = function (req, res) {};


//	query user database for any known valid signin matching the given provider.
//	return true if one is found:
function checkProvider( req, res, 
						providerName, templateData,
						next )
{
	//	The login screen should only show the odata auth icon shortcuts for those auth-sited for which a valid login exists:
	
	User.load( { criteria: { provider : providerName } }, function( err, user )
	{
		//	if the db select found a user matching this provider, 
		//	add this provider name to the array of found providers 
		if( !err && ( user != null ) )
			templateData.currentAuthProvider.push( providerName) ;
		//	and invoke the supplied callback
		next( req, res, templateData );
	} );
}

/**
 * Show login form
 * 
 * Rendered template:  views\users\login.html
 * 
 * Displays the login entry form, 
 * with icon-shortcuts that correspond to each known auth-provider.
 * 
 */
exports.showLoginForm = function( req, res ) 
{
	var templateData = {
		title: 'Login',
		currentAuthProvider : []			//	an array of provider names for which we have entries in the db
		};
	
	//	yucky callback hell to determine which auth-providers exist:
	checkProvider( req, res, 'google', templateData, 
	function( req, res, templateData )
	{
		checkProvider( req, res, 'live', templateData, 
		function( req, res, templateData )
		{
			checkProvider( req, res, 'github', templateData,
			function( req, res, templateData )
			{
				//	in this final callback, the templatedata.found[] array should contain a list
				//	of the names of known-auto-providers.
				//	the login.html form will use the contents of that found[] array to determine
				//	whether or not to display the corresponding login icon shortcut :-)
				res.render( 'users/login', 
							templateData );
			} );
		} );
	} );

};

//	interim target url. 
//	logingComplete is the target supplied to the passport validation handlers
//	which the oauth provider will call upon auth-validation.
//	
//	We'll use this as a place to take the user id token, 
//	and persist it in a session cookie,
//	and immediately redirect to the generic status page.
exports.loginComplete = function( req, res )
{	
	if( req.isAuthenticated( ) )
	{
		res.redirect( '/status' );
	}
	else
	{
		res.redirect( '/login' );
	}
}

exports.initCookieOnLogin = function( req, res, next )
{
	if( req.isAuthenticated( ) )
	{
		if( !req.cookies.userid )
		{
			res.cookie( 'userid', req.user.id );
		}
	}
	next( );
}
/*
 *  User cookie middleware
 */
exports.loggedInMiddleware = function( req, res, next )
{
	if( req.isAuthenticated( ) )
	{
		var id = req.cookies.userid;
		
		var options = { criteria: { _id : id } };
		
		User.load( options, function( err, user )
		{
			if( err )
				return next( err );
			
			if( !user )
				return next( new Error( 'Failed to load User ' + id ) );
			
			req.userid = id;
			req.provider = user.provider;
			req.userName = user.name;
			req.avatar = user.avatar;
			next( );
		} );
	}
	else return next( );
}



/**
 * Logout
 */
exports.logout = function( req, res ) 
{
	res.clearCookie( 'userid' );

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
	
	console.log( 'Login redirect to ', redirectTo );

	res.redirect(redirectTo);
};

/**
 * Session
 */
exports.session = login;

/**
 * Auth callback
 */
exports.authCallback = login;
//		REST APIs:

//	gets all currently defined users from db:
exports.getAll = function( req, res )
{
	console.log( 'Retrieving all users' );
	
	User.find( '_id username name avatar provider providerData', function( err, users )
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		return res.json( users );
	} );
};

//	gets specified user
exports.getUser = function( req, res )
{
	var id = req.params.id;
	console.log( 'Retrieve single User', id );
		
	User.loadByNumber( id, function( err, user )
	{
		if( err )
		{
			console.dir( err );
			return res.status( 500 ).send( err );
		}
		
		res.json( user );
	} );
};

//	updates specified zone
exports.updateUser = function( req, res )
{
	var id = req.params.id;
	console.log( 'Update single user', id );
		
	User.loadByNumber( id, function( err, user )
	{
		if( err )
		{
			console.dir( errot );
			res.status( 500 ).send( err );
		}
		 
		if( user.provider != 'local' )
			rest.status( 401 ); // bad request

		//	udpate the fields in the retrieved zone with the user-supplied values:			
		user.password = req.param( 'password' );
		
		//	update in db:
		user.save( function( err, zone )
		{
			if( err )
			{
				console.dir( err );
				res.status( 500 ).send( err );
			}
			
			res.json( user );
		} );
	} );
};

//	deletes the zone
exports.deleteUser = function( req, res )
{
	var id = req.params.id;
	console.log( 'Delete single user', id );
		
	User.loadByNumber( id, function( err, zone )
	{
		if( err )
		{
			console.dir( err );
			res.status( 500 ).send( 'User', id, 'not found' );
		}
		
		if( !zone )
		{
			res.status( 400 ).json( );	//	400: bad request, no such zone
		}
		else
		{
			User.remove( { _id: zone._id }, function( err )
			{
				if( err )
				{
					console.dir( err );
					res.status( 500 ).send( 'User', id, 'error' );
				}
				
				res.status( 410 ).json( );		//	410: resource gone
			} );
		}
	} );
};


var utils;	//	we need to retain a reference to the passed in args, since utils is used in our exported methods

module.exports = function( args )	//	args is of type requireArgs
{
	utils = args.utils;
	args.app.userController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded user controller' );
}

