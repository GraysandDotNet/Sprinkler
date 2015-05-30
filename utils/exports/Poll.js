

function doHourlyPoll(app)
{
    console.log('Hourly Poll', app.getCurrentTime('time').bold);
}

function doDailyPoll(app) 
{
    console.log('Daily Poll', app.getCurrentTime('date').bold);
    
    app.getWeather();
}

function doMinutePoll(app) 
{
    console.log('PollTimer:', app.getCurrentTime());
}

var timerCallback = function ( app )
{
    var pollTime = new Date();
    
    if ((app.prevPollTime == undefined) ||
        (pollTime.getDay() != app.prevPollTime.getDay()))
        doDailyPoll( app );
    
    if ((app.prevPollTime == undefined) || 
        (pollTime.getHours() != app.prevPollTime.getHours()))
        doHourlyPoll( app );
    
    if ((app.prevPollTime == undefined) || 
        (pollTime.getMinutes() != app.prevPollTime.getMinutes()))
        doMinutePoll( app );
        
    app.prevPollTime = pollTime;
}

module.exports = timerCallback;

