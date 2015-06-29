/**
 * Module dependencies.
 */

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

/**
* Zone Schema:
	These are the fields which are stored in the database
*/
var ZoneSchema = new Schema(
	{	
		number: { type: Number },	//	we only support 16 zones
		name: { type: String, default: '' },
		state: { type: Boolean, default: false },
		tLastChange: { type: Date, default: Date.now() }	
	} );

/**
 * Zone Schema virtual fields: 
 *	Mongoose virtuals are non-persisted attributes, accesses via get/set.
 *	
 * state represents whether te current zone is turned on or off
 * This is where we actually touch the underlying hardware,
 * For a get, query the pi gpio pin status for the current zone number
 * For a set, we just set the pi gpio bin to on/off .
 */

var tMinToggleTime = new Date( 5000 );	//	5 seconds		

ZoneSchema.path( 'state' ).validate( function( desiredState )
{	
	if( this.state != desiredState )
	{
		var tNow = Date.now( );
		var tSinceLastChange = tNow - tLastChange;
		
		if( tMinToggleTime < tSinceLastChange )
			return false;

		//	here we set the gpio pin status
		this.state = desiredState;
		//	and we have to update to time at which we toggled the hardware, and persist in db
		this.tLastChange = tNow;
	}
	return true;

}, 'Please wait at least 5s between zone state toggles');


ZoneSchema.path( 'number' ).validate( function( zoneNum )
{
	if( this.isNew )
	{
		if( ( zoneNum < 0 ) || ( zoneNum > 16 ) )
			return false;
	}
	return true;

}, 'Zone imust be in range 1-16' );


/**
* Statics
*/
ZoneSchema.statics = 
{
	validZone: function( zoneNum )
	{
		if( ( zoneNum < 0 ) || ( zoneNum > 16 ) )
			return false;
		return true;
	},
/**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
	load: function( options, cb )
	{
		this.findOne( options.criteria )
				.select( options.select )
				.exec( cb );
	},

	loadByNumber : function( zoneNum, cb )
	{
		var options = {
						criteria: { 'number': zoneNum },
						select: 'number name tLastChange state', 
					};
		this.findOne( options.criteria )
				.select( options.select )
				.exec( cb );
	}
}
//	compile the ZonesSchema, and export under the name 'Zone'
mongoose.model( 'Zone', ZoneSchema );


module.exports = function(  )
{
	console.log( 'Loaded Zone Schema' );
}