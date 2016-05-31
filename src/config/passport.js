/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

module.exports.passport = {
  // local: {
  //   strategy: require('passport-local').Strategy
  // },

  // bearer: {
    // strategy: require('passport-http-bearer').Strategy
  // },

  // twitter: {
  //   name: 'Twitter',
  //   protocol: 'oauth',
  //   strategy: require('passport-twitter').Strategy,
  //   options: {
  //     consumerKey: '37YKxX7hnMKXQgyx5SZbrZxKH',
  //     consumerSecret: 'Z1rIFeMyK3HqfOO5SAenXlfV24O9KuHCgKhJO2wFQjdh8XViCr'
  //   }
  // },

  // facebook: {
  //   name: 'Facebook',
  //   protocol: 'oauth2',
  //   strategy: require('passport-facebook').Strategy,
  //   options: {
  //     clientID: '1022188547826218',
  //     clientSecret: '44aec5d0d5814b743cc04c6cd4abf5ca',
  //     scope: ['email'] /* email is necessary for login behavior */
  //   }
  // },
  //*/ //production settings
  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || '353849264959-s6n15fmj0s094hs95b46s5osuikm2agi.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'wURGldrAW0CS1kS8PX1QJi1m',
      prompt: 'select_account',
      scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read']
    }
  },
/*/
//test account setted up to http://localhost:1337
  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: '964565280166-e77at51l90hu9a4q41kmbhdc1tbnnlmd.apps.googleusercontent.com',
      clientSecret: 'C4oFObpXseTuTZdHbEE97wLV',
      prompt: 'select_account',
      scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read']
     }
   },
//*/
};
