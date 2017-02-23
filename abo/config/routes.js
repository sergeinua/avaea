/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /login': 'AuthController.login',
  'get /logout': 'AuthController.logout',
  // 'get /register': 'AuthController.register',

  'get /auth/:provider': 'AuthController.provider',
  'get /auth/:provider/callback': 'AuthController.callback',
  'get /auth/:provider/:action': 'AuthController.callback',

  // 'get /order': 'BuyController.order',
  // 'get /search': 'SearchController.index',
  // 'post /result': 'SearchController.result',

  'get /profile/:user_id': 'UserController.profile',
  'get /create/:user_id': 'UserController.create',
  'post /update/:user_id': 'UserController.update',

  'get /:selectedAirline/profile/:user_id': 'UserController.profile',
  'get /:selectedAirline/create/:user_id': 'UserController.create',
  'post /:selectedAirline/update/:user_id': 'UserController.update',

  // 'post /prediction/order_tiles': 'PredictionController.order_tiles',
  // 'post /prediction/order_itineraries': 'PredictionController.order_itineraries',
  // 'post /prediction/on_tile_choice': 'PredictionController.on_tile_choice',
  // 'post /prediction/on_itinerary_purchase': 'PredictionController.on_itinerary_purchase',

  // 'post /ac/airports': 'AcController.airports',

   'get /ac/airlines': 'AcController.airlines',
   'get /ac/ffm_airlines': 'AcController.ffm_airlines',

  'post /getActionByType': 'AboController.getActionByType',
  'post /getaction': 'AboController.getaction',
  'post /getbyuser/:user_id': 'AboController.getByUser',
  'post /gettilesbyuser/:user_id': 'AboController.getTilesByUser',
  'get /:selectedAirline': 'AboController.index',
  'get /': 'AuthController.login',

  // Vanity URLs routes
  'post /vanityURLs/create/': 'VanityURLsController.create',
  'get /vanityURLs/read/:id': 'VanityURLsController.read',
  'post /vanityURLs/edit/:id': 'VanityURLsController.edit',
  'post /vanityURLs/delete/:id': 'VanityURLsController.delete',

  // Transactions Report routes
  'post /report/transactions': 'AboController.getTransactions'

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
