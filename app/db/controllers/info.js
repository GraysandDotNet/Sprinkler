
/*
 * GET home page.
 */

var copyrightDate = new Date().getFullYear();

//  create an array of json data to be supplied to the jade templates.

var routeTemplateInfo = 
 [
    { index: 0, template: 'index', title: 'Express' },
    { index: 1, template: 'about', title: 'About' },
    { index: 2, template: 'contact', title: 'Contact' }
  ];


exports.commonHandler = function (req, res) 
{   
    //  attach templateInfo for this route to the incoming request:
    req.templateInfo = routeTemplateInfo[req._route_index];
    
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
                function (err, html) 
                {
                    //  and now that render has processed it, log the result
                    //  Note that req is not available directly within this callback function,
                    // but res is, and the result res has attached the incoming request as property 'req'
                    console.log(res.req.route.method, res.req.route.path, 
                            '--> route[', res.req.templateInfo.index, ']', res.req.templateInfo.template,
                            '--> renders:', typeof html, 'length', html.length);
                    //  and since we have used an express render callback, we must do the send ourself:
                    res.send(html);
                });

};

exports.index = function (req, res) {
    
    res.render('contact', { title: 'Contact', year: new Date().getFullYear(), message: 'Your contact page.' });

    console.log("Route", req._route_index);
    
    //  attach templateInfo for this route to the incoming request:
    var templateInfo = routeTemplateInfo[req._route_index];
    req.templateData = templateInfo;

    res.render( req.templateData.template, 
                req.templateData, 
                function (err, html ) 
                {

                    console.log(res.req.route.method, res.req.route.path, 
                            ' --> route[', res.req.templateData.index, ']',
                            res.req.templateData.templateName,
                            ' --> renders:', typeof html, html.length);

                    res.send(html);
                });

};

exports.about = function( req, res ) 
{
	var templateData =	{
							title: 'About', 
							year: new Date( ).getFullYear( ), 
							message: 'Your application description page.',
							about: 'Use this area to provide additional information'
						};

    res.render('info/about', templateData );
};

exports.contact = function( req, res ) 
{
	res.render( 'info/contact', 
	{ title: 'Contact', year: new Date( ).getFullYear( ), message: 'Your contact page.' } );
};


module.exports = function( args )	//	args is of type requireArgs
{
	args.app.infoController = exports;	//	merge our exports into the express app as userController member data
	
	console.log( 'Loaded info controller' );
}