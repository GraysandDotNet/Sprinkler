
var wunderground = require('wundergroundnode');

var wundergroundKey = '8e1f6a35e244943e';
var location = '03053';
var weatherService = new wunderground(wundergroundKey);

var getWeather = function(app)
{
    weatherService.conditions().request( location,
                                         function (err, response) 
                                         {
                                            console.log(response);
                                         });
}

module.exports = getWeather;