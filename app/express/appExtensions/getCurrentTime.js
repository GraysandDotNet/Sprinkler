

/*  getCurrentTime()
 * 
 *  exported function
 *  
 *  optional param:  oneof:  year,date,time
 *  
 * returns current date/time as string
 * 
 */
var getCurrentTime = function getCurrentTime( param ) 
{
    
    var now = new Date();
    
    var minutes = now.getMinutes();
    if (minutes < 10)
        minutes = "0" + minutes;
    var timeWithoutSeconds = now.getHours().toString() + ':' + minutes.toString();
    
    if (param != undefined) 
    {
        if (param == 'year')
            return now.getFullYear();
        if (param == 'date')
            return now.toLocaleDateString();
        if (param == 'time')
            return timeWithoutSeconds;
    }
    return now.toLocaleDateString() + ' ' + timeWithoutSeconds;
}

module.exports = function( app )
{
	app.getCurrentTime = getCurrentTime;
}