
/* Specifications static page */

//  definition of a function that will return an autoincrementing uniqueid
var autoincId = (function () { var id = 0; return function () { if (arguments[0] === 0) id = 0; return id++; } })();

//  include script that will permit creation of multiline strings:
var multilineString = require('multiline.js');

var fs = require('fs');
var path = require('path');
var localDiagramPath = path.join('public', 'images');
var localDiagramExt = 'png';

var specDiagrams = 
 [
    {
        title: 'Retrieve Current Weather',
        wsdFilename: ['retrieveWeather', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {        
/*
Browser->Node: get /weather
note right of Node: makes webservice call
Node->Weather: get /forecast
Weather->Node: forecast response
Node->Browser: weather response 
*/
        })
    },

    {
        title: 'Retrieve Weather History',
        wsdFilename: ['retrieveWeatherHistory', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {        
/*
title Retrieve Weather Conditions
Browser->Node: get /weather
note right of Node: makes webservice call
Node->Weather: get /forecast
Weather->Node: forecast response
Node->Browser: weather response 
*/
        })
    },

    {
        title: 'Get Current Status',
        wsdFilename: ['getStatus', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {        
/*
title Get Current Status
opt Get Current Status
Browser->Node: get /status
note right of Node: get gpio hardware
Node->Browser: resp /status
*/
        })
    },

    {
        title: 'Update Current Status',
        wsdFilename: ['updateStatus', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {        
/*
title Update Current Status
Browser->Node: post /status
note right of Node: set gpio hardware
Node->Browser: resp ack
*/
        })
    },

    {
        title: 'Periodic Worker',
        wsdFilename: ['periodicPoll', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {
/*
title Periodic Weather Poll Timeout Handler
Node->Node: timer callback
                    
opt Retrieve conditions/Forecast                    
Node->WeatherService: get /weather
WeatherService->Node: res /weather
Node->Db: update historical weather
end
                 
Node->Db: query schedules
Db->Node: active schedules

opt Loop through schedules if weather / sunrisechange
Node--> Node: modify schedules
Node--> Db: update schedules
end

loop Check Current Schedules
Node->Node: check timestamp
note right of Node:  issue on/off event for affected zone
end
*/
        })
    },

    {
        title: 'OnOff Event',
        wsdFilename: ['handleEvent', '.', localDiagramExt].join(''),     //  inline array <uniqueId>.ext joined with no spaces   
        diagram: multilineString(function () {        
/*
title Handle on/off event
Node->Node: receive event for zone
Note right of Node: update gpio hardware
Node->Db: update current zone status
*/
        })
    }

];

exports.ensureSpecs = function ensureWsdImages( )
{
    //  interface to diagram tool:
    var wsd = require('websequencediagrams');
    
    var index = autoincId();
    if ( index < specDiagrams.length )
    {        
        var spec = specDiagrams[index];
        if (spec != undefined) {
            console.log('WSD Retrieving'.yellow, spec.title, 'as', spec.wsdFilename.grey);
            var fn = path.join(localDiagramPath, spec.wsdFilename);
            //  we just invoke the diagram webservice, and pass in the diagram multiline string
            wsd.diagram(spec.diagram, 
                        wsd.styles[0],              /* wsd.styles[0]='default', wsd.styles[8]='napkin' */
                        localDiagramExt,            /* png */
                        function (err, buf, typ)    /* callback from wsd.diagram, png in buf, if no err */ {
                if (err != null) {
                    console.log('WSD Error'.red,  spec.wsdFilename.grey, err);
                }
                else
                {
                    console.log( 'WSD Retrieved'.green, fn.grey, buf.length, 'byte', typ);
                    fs.writeFile(fn, buf);
                    ensureWsdImages();
                }
            });
        }
        else {
            console.log('WSD Complete'.green);
        }
     }
}


exports.spec = function (req, res) {
    
    var templateData = { index: req._route_index, template: 'spec', title: 'Sequence Diagrams', specs : specDiagrams };
    
    req.templateInfo = templateData;
    
    //  ensure we found template at that index 
    if (req.templateInfo == undefined)
        res.sendStatus(500);
    
    // and that it's the one we expect
    if (req.templateInfo.index != req._route_index)
        res.sendStatus(501);
    
    //  go ahead and process the template, log what we want to do: 
    console.log(req.route.method, req.route.path, 
                '--> route[', res.req.templateInfo.index, ']',
                '--> calling template ', req.templateInfo.template);
    
    //  extract info from the app package json and make it available to the templates:
    req.templateInfo.appName = req.app.packageJson.name;
    req.templateInfo.appVer = req.app.packageJson.version;
    req.templateInfo.author = req.app.packageJson.author.name;
    req.templateInfo.year = req.app.packageJson.author.copyright;
    
    //  and do it:
    res.render(req.templateInfo.template, 
                req.templateInfo, 
                function (err, html) {
        if (err == null) {
            //  and now that render has processed it, log the result
            //  Note that req is not available directly within this callback function,
            // but res is, and the result res has attached the incoming request as property 'req'
            console.log(res.req.route.method, res.req.route.path, 
                            '--> route[', res.req.templateInfo.index, ']', res.req.templateInfo.template,
                            '--> renders:', typeof html, 'length', html.length);
            //  and since we have used an express render callback, we must do the send ourself:
            res.send(html);
        }
    });

}

module.exports = function( args )	//	args is of type requireArgs
{
	args.app.specsController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded specs controller' );
}