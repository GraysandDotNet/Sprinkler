
/*!
 * Module dependencies.
 */

module.exports = 
{
  db: process.env.MONGO_DB,

 
  twitter:	{
				clientID: process.env.TWITTER_CLIENTID,
				clientSecret: process.env.TWITTER_SECRET,
				callbackURL: "http://localhost:3000/auth/twitter/callback"
			},

  github:	{
				clientID: process.env.GITHUB_CLIENTID,
				clientSecret: process.env.GITHUB_SECRET,
				callbackURL: 'http://localhost:3000/auth/github/callback'
			},

  linkedin: {
				clientID: process.env.LINKEDIN_CLIENTID,
				clientSecret: process.env.LINKEDIN_SECRET,
				callbackURL: 'http://localhost:3000/auth/linkedin/callback'
			},

  google:	{
				clientID: process.env.GOOGLE_CLIENTID,
				clientSecret: process.env.GOOGLE_SECRET,
				callbackURL: "http://localhost:3000/auth/google/callback"
			}

};
