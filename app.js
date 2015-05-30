
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();

//  load basic system dependencies.
var http = require('http');
var path = require('path');
require('method-override');
var colors = require('colors2');
var favicon = require('serve-favicon');

//  set the known static dirs for serving up non-templated html/images/scripts: 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'images')));  //  allow images to be statically served directly
app.use(express.logger());
app.use(express.json());
app.use(express.urlencoded());
app.use(favicon( path.join(__dirname, 'public', 'images', 'favicon.ico')));


//  fun with apis:  define getCurrentTime by requiring a module with only the functino in the module.exports:
app.getCurrentTime = require('./utils/exports/getCurrentTime.js');
app.pollTimer = require('./utils/exports/Poll.js');
app.getWeather = require('./utils/exports/weather.js');

// read and parse the packge file, to make available as local object:
app.packageJson = require(__dirname + '/package.json');
app.locals.copyright = app.getCurrentTime('year').toString();

//  load our local route controllers
var routes = require('./controllers/get');
var specs = require('./controllers/specs');

console.log(app.packageJson.name.bold, 
             'v', app.packageJson.version, 
             '(c)', app.packageJson.author.name.grey, app.packageJson.author.copyright.grey,
             'Started:', app.getCurrentTime());

// Extract environment variables, and setup webserver/template-parser
//  as set in the PiZone.sln on VS, 
//  although still unsure how to set envirionment vars on Linus on Pi 
var webserverPort = process.env.PORT;
app.set('port', webserverPort);

var viewEngine = process.env.ViewEngine;
app.set('views', path.join(__dirname, 'views', viewEngine));
app.set('view engine', viewEngine);
console.log('Using', viewEngine.green, 'view templates');


// stylus is used for css
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//  try out the table-driven commonHandler :
app.get('/', routes.commonHandler);
app.get('/about', routes.commonHandler);
app.get('/contact', routes.commonHandler);
app.get('/spec', specs.spec);

specs.ensureSpecs();

//  create the webserver object for this app: 
var webserver = http.createServer(app);
// and begin listening on the configured port:
//  note: the webserver object will invoke the app defined routes when client connects
webserver.listen(webserverPort, 
    function () 
    {
        console.log( app.packageJson.name.bold, 'listening on port', webserverPort);
    });

//  Now let's setup our periodic internal notification timer:

var timerTick = 30 * 1000;  //  nyquist for once every minute :-)
var intervalObject = setInterval(app.pollTimer, /* the polltimer callback instance*/
                                timerTick, /* milliseconds between ticks*/
                                app /* app is passed as parameter to the timer callback functionn above*/ );
