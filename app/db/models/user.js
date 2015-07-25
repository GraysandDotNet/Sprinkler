
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');		

var Schema = mongoose.Schema;

var authEnum = 
	{
		none: { val: 0, str: 'none' },
		user: { val: 1, str: 'User' },
		admin: { val: 2, str: 'Administrator' }
	};

var authProviders = 
	[
		'github',
		'google',
		'live'
	];

/**
* User Schema:
	These are the fields which are stored in the database
*/
var UserSchema = new Schema(
	{
		priv: { type: authEnum, default: authEnum.user.val },
		
		username: { type: String, default: '' },
		avatar: { type: String, default: '' },

		name: { type: String, default: '' },
		email: { type: String, default: '' },

		hashed_password: { type: String, default: '' },
		salt: { type: String, default: '' },

		authToken: { type: String, default: '' },		
		provider: { type: String, default: '' },
		providerData: {},
	});


/**
 * User Schema virtual fields: 
 *	Mongoose virtuals are non-persisted attributes, accesses via get/set.
 *	
 * password is a virtual field, since we only store the encrypted password,
 * plaintext is transient as local _password member only.
 */

UserSchema.virtual('password')
	.set( function( password ) 
	{
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function() { return this._password });


/**
 * Database field validators
 */

var validatePresenceOf = function( value ) 
{
  return value && value.length;
};

/*	See http://mongoosejs.com/docs/2.7.x/docs/validation.html
* Mongoose validators return the error string if the validator function returns false
*/

//	name: Simple Validator : Field must not be blank
UserSchema.path( 'name' ).validate( function( name ) 
{
	if( this.externalProviderValidation( ) )
		return true;

	return name.length;

}, 'Name cannot be blank');

/*
//	email: Simple Validator: Field must not be blank
UserSchema.path( 'email' ).validate( function( email ) 
{
	if( this.externalProviderValidation( ) )
		return true;
	
	return email.length;

}, 'Email cannot be blank');

//	additional async email validator.
UserSchema.path( 'email' ).validate( function( email, fn ) 
{
	var User = mongoose.model( 'User' );
	
	if( this.externalProviderValidation( ) )
		fn( true );

	// Check only when it is a new user or when email field is modified
	if( this.isNew || this.isModified( 'email' ) )
	{
		User.find( { email: email } ).exec( function( err, users )
		{
			fn( !err && users.length === 0 );
		} );
	} 
	else
	{
		fn( true );
	}
}, 'Email already exists');

 */

//	email: Simple Validator: Field must not be blank
UserSchema.path( 'username' ).validate( function( username ) 
{
	if( this.externalProviderValidation( ) )
		return true;
	
	return username.length;

}, 'Username cannot be blank');

//	password: Simple Validator: Field must not be blank
UserSchema.path( 'hashed_password' ).validate( function( hashed_password ) 
{
	if( this.externalProviderValidation( ) )
		return true;

	return hashed_password.length;

}, 'Password cannot be blank');


/**
 * http://mongoosejs.com/docs/2.7.x/docs/middleware.html
 * 
 * Pre-save hook
 */
UserSchema.pre( 'save', function( next ) 
{
	if( !this.isNew )
		return next( );

	if( !validatePresenceOf( this.password ) && 
		!this.externalProviderValidation( ) )
	{
	    next(new Error('Invalid password'));
	} 
	else
	{
		next();
	}
})


/**
 * Methods
 */
UserSchema.methods = 
{

	/**
	* Authenticate - check if the passwords are the same
	*
	* @param {String} plainText
	* @return {Boolean}
	* @api public
	*/
	authenticate: function( plainText ) 
	{
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	/**
	* Make salt : Random number gen for password hash
	*
	* @return {String}
	* @api public
	*/
	makeSalt: function() 
	{
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},

	/**
	* Encrypt password
	*
	* @param {String} password
	* @return {String}
	* @api public
	*/
	encryptPassword: function( password ) 
	{
		if (!password) return '';
		try
		{
		  return crypto.createHmac('sha1', this.salt)
						.update(password)
						.digest('hex');
		} 
		catch ( err )
		{
		  return '';
		}
	  },

	/**
	* Validation is not required if using a defined OAuth Provider
	*/
	externalProviderValidation: function() 
	{
		return ~authProviders.indexOf(this.provider);
	}

};	//	end UserSchema.methods


/**
 * Statics
 */
UserSchema.statics = 
{

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
	load: function( options, cb ) 
	{
		options.select = options.select || '_id name username avatar provider providerData';
		this.findOne(options.criteria)
			.select(options.select)
			.exec(cb);
	},

	loadByNumber : function( id, cb )
	{
		var options = {
			criteria: { '_id': id },
			select: '_id name username avatar provider providerData' 
		};
		this.findOne( options.criteria )
				.select( options.select )
				.exec( cb );
	}
}


mongoose.model('User', UserSchema);

module.exports = function()
{
	console.log( 'Loaded User Schema' );
}