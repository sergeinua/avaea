/* global itineraryPrediction */
/* global UserAction */
/* global memcache */
/* global sails */
/* global Profile */
/* global Order */
var util = require('util');
var url = require('url');
/**
 * BuyController
 */

module.exports = {

  order: function (req, res) {

    // Flash errors
    if (!_.isEmpty(req.session.flash)) {
      res.locals.errors = [_.clone(req.session.flash)]; //will display by layout
      req.session.flash = '';
    }

    // Get all params for redirect case
    var reqParams = req.allParams();

    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {

      if (found) {
        var profileFields = {FirstName:"firstName", LastName:"lastName", Address1:"address"};

        // Apply DB values if form fields is not defined yet
        for(var prop in profileFields) {
          if(typeof reqParams[prop] == 'undefined' || reqParams[prop].trim()=="")
            reqParams[prop] = found[profileFields[prop]];
        }
      }
      //sails.log.info("__params all:", req.params.all());

      var id = req.param('id');

      var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
      memcache.get(cacheId, function(err, result) {
        if (!err && !_.isEmpty(result)) {
          var logData = {
            action    : 'order',
            itinerary : JSON.parse(result)
          };

          itineraryPrediction.updateRank(req.user.id, logData.itinerary.searchId, logData.itinerary.price);
          //sails.log.info("__order:", util.inspect(logData.itinerary, {showHidden: true, depth: null}));

          UserAction.saveAction(req.user, 'on_itinerary_purchase', logData);

          return res.view('order', {
            user: req.user,
            reqParams: reqParams,
            order:[logData.itinerary]
          });
        }
        else {
          //req.session.flash = 'Cache has expired. Try new search.';
          //req.flash('errors', req.session.flash);
          //res.redirect('/search');
          return res.view('order', {
            user: req.user,
            reqParams: reqParams,
            order:[]
          });
        }
      });
    });
  },

  booking: function (req, res) {
    sails.log.info("__params:", util.inspect(req.allParams(), {showHidden: true, depth: null}));

    var parseFlightBooking = function (err, result) {
      sails.log.info("__param err:", util.inspect(err, {showHidden: true, depth: null}));
      sails.log.info("__result:", util.inspect(result, {showHidden: true, depth: null}));

      if (err) {
        req.session.flash = err;
        // redirect to order action, i.e. repeat request
        res.redirect(url.format({pathname: "/order", query: req.allParams()}));
      }
      // Clear flash errors
      req.session.flash = '';

      //return res.view('booking', {
      //  reqParams: req.allParams()
      //});
    };

    parseFlightBooking("err", "res");
    //mondee.flightBooking(Search.getCurrentSearchGuid() +'-'+ sails.config.flightapis.searchProvider, req.allParams(), parseFlightBooking);
  }

};

