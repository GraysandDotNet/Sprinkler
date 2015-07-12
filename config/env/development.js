
/*!
 * Module dependencies.
 */

module.exports = 
{
	db: {
		url:  "mongodb://localhost/Sprinklers", 
		dir: "C:\\Program Files\\MongoDB\\Server\\3.0\\bin\\", 
		exe: "C:\\Program Files\\MongoDB\\Server\\3.0\\bin\\mongod.exe",
		args: [ 'dbpath', 'C:\\Program Files\\MongoDB\\Server\\3.0\\bin\\data\\db']
		},
 
  twitter:	{
				clientID: process.env.TWITTER_CLIENTID,
				clientSecret: process.env.TWITTER_SECRET,
				callbackURL: "http://localhost:3000/auth/twitter/callback"
			}


};
