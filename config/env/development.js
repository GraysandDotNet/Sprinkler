
/*!
 * Module dependencies.
 */

module.exports = 
{
  db: "mongodb://localhost/Sprinklers",

 
  twitter:	{
				clientID: process.env.TWITTER_CLIENTID,
				clientSecret: process.env.TWITTER_SECRET,
				callbackURL: "http://localhost:3000/auth/twitter/callback"
			}


};
