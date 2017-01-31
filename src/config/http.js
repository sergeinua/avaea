/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/

   middleware: {

  /***************************************************************************
  *                                                                          *
  * The order in which middleware should be run for HTTP request. (the Sails *
  * router is invoked by the "router" middleware below.)                     *
  *                                                                          *
  ***************************************************************************/

     order: [ // default middleware + vanityURLsHandler
       //'startRequestTimer',
       'cookieParser',
       'session',
       'bodyParser',
       //'handleBodyParserError',
       'vanityURLsHandler',
       'compress',
       //'methodOverride',
       'poweredBy',
       //'$custom',
       'router',
       'www',
       'favicon',
       '404',
       '500'
     ],
  /****************************************************************************
  *                                                                           *
  * Example custom middleware; logs each request to the console.              *
  *                                                                           *
  ****************************************************************************/

     vanityURLsHandler: function (req, res, next) {
          // Checking for Vanity URL
        return VanityURLsService.loadCache().then((result)=>{
            
            sails.log(result);
            
            // skiping of socket requests
            if(req.isSocket) return next();
               
            // skiping of images, js, css, pdf ... files            
            if(req.url.match(/\.(?:jpg|jpeg|png|gif|svg|js|json|map|css|less|pdf|mp4|woff2|ttf|html|htm|php)$/)) return next();
            
            // checking of request url for vanity url
            let requestURL = req.headers.host+req.url;          
            for(var i in result){        
              //remove protocol info from vanityURL
              let vanityURL = url = (result[i].vanity_url || '').replace(/^(http|https):\/\//i, '');
              
              if(requestURL === vanityURL){
                req.session.vanityURL = result[i];
                break;
              }
            }
            return next();
          });
     }


  /***************************************************************************
  *                                                                          *
  * The body parser that will handle incoming multipart HTTP requests. By    *
  * default as of v0.10, Sails uses                                          *
  * [skipper](http://github.com/balderdashy/skipper). See                    *
  * http://www.senchalabs.org/connect/multipart.html for other options.      *
  *                                                                          *
  ***************************************************************************/

    // bodyParser: require('skipper')

   },

  /***************************************************************************
  *                                                                          *
  * The number of seconds to cache flat files on disk being served by        *
  * Express static middleware (by default, these files are in `.tmp/public`) *
  *                                                                          *
  * The HTTP static cache is only active in a 'production' environment,      *
  * since that's the only time Express will cache flat-files.                *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000
};
