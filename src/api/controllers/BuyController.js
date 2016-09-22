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
      res.locals.tmp_errors = [_.clone(req.session.flash)]; //will display by layout
      req.session.flash = '';
    }

    // Get all params for redirect case
    var reqParams = req.allParams();

    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {

      if (found) {
        // map between form fields (mondee API fields) and DB profile fields
        var userData = {
          FirstName: "first_name",
          LastName: "last_name",
          Gender: "gender",
          DateOfBirth: "birthday",
          PaxType: "pax_type"
        };

        var userAddress = {
          Address1: "street",
          City: "city",
          State: "state",
          Country: "country_code",
          ZipCode: "zip_code"
        };

        if (found && found.personal_info) {
          // Apply DB values if form fields is not defined yet
          for (var prop in userData) {
            if (typeof reqParams[prop] == 'undefined' || reqParams[prop] === null || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == ""))
              reqParams[prop] = found.personal_info[userData[prop]];
          }
          for (var prop in userAddress) {
            if (typeof reqParams[prop] == 'undefined' || reqParams[prop] === null || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == ""))
              reqParams[prop] = found.personal_info.address[userAddress[prop]];
          }
        }

        // Convert birthday date to the booking format. The sails returns date DB attribute as Date() object
        if(typeof reqParams.DateOfBirth == 'object')
          reqParams.DateOfBirth = sails.moment(reqParams.DateOfBirth).format('YYYY-MM-DD');
      }

      var id = req.param('id');

      var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
      memcache.get(cacheId, function(err, result) {
        if (!err && !_.isEmpty(result)) {
          var logData = {
            action    : 'order',
            itinerary : JSON.parse(result)
          };

          itineraryPrediction.updateRank(req.user.id, logData.itinerary.searchId, logData.itinerary.price);

          UserAction.saveAction(req.user, 'on_itinerary_purchase', logData, function () {
            User.publishCreate(req.user);
          });

          // Save for booking action
          req.session.booking_itinerary = {
            itinerary_id: id,
            itinerary_data: logData.itinerary
          };

          return res.ok(
            {
              user: req.user,
              reqParams: reqParams,
              head_content: Search.getHeadContent(req.param('searchId')),
              order:[logData.itinerary]
            },
            'order'
          );
        }
        else {
          delete req.session.booking_itinerary;
          req.session.flash = 'Cache has expired. Try new search.';
          req.flash('errors', req.session.flash);
          res.redirect('/search');

          // For debug only
          //return res.view('order', {
          //  user: req.user,
          //  reqParams: reqParams,
          //  order:[]
          //});
        }
      });
    });
  },

  booking: function (req, res) {
    req.session.time_log = [];

    // for API argument
    var params = req.allParams();
    params.session = req.session;

    var parseFlightBooking = function (err, result) {

      if (err) {
        req.session.flash = (err instanceof Error) ? (err.message || err.err) : err;
        // redirect to order action, i.e. repeat request
        res.redirect(url.format({pathname: "/order", query: req.allParams()}));
        return;
      }
      sails.log.info("Itinerary booked successfully:", result);
      // Clear flash errors
      req.session.flash = '';

      // Save result to DB
      Booking.saveBooking(req.user, result, req.session.booking_itinerary);

      // E-mail notification
      var _itin_data = req.session.booking_itinerary.itinerary_data;
      var _bres = result;
      var tpl_vars = {
        FirstName: params.FirstName,
        LastName: params.LastName,
        price: _itin_data.price,
        currency: _itin_data.currency,
        PNR: _bres.PNR,
        ReferenceNumber: _bres.ReferenceNumber,
        serviceClass  : Search.serviceClass, // @todo
      };
      if (typeof _itin_data.citypairs[0] != 'undefined' && _itin_data.citypairs[0].direction == "Depart") {
        tpl_vars.departData = _itin_data.citypairs[0];
      }
      if (typeof _itin_data.citypairs[1] != 'undefined' && _itin_data.citypairs[1].direction == "Return") {
        tpl_vars.returnData = _itin_data.citypairs[1];
      }

      Mailer.makeMailTemplate(sails.config.email.tpl_ticket_confirm, tpl_vars)
        .then(function (msgContent) {
          Mailer.sendMail({to: req.user.email, subject: 'Ticket confirmation with PNR '+_bres.PNR}, msgContent)
            .then(function () {
              sails.log.info('Mail was sent to '+ req.user.email);
            })
        })
        .catch(function (error) {
          sails.log.error(error);
        });

      delete req.session.booking_itinerary;

      // Render view
      return res.ok(
        {
          user: req.user,
          reqParams: req.allParams(),
          bookingRes: result
        },
        'booking'
      );
    };

    mondee.flightBooking(Search.getCurrentSearchGuid() +'-'+ sails.config.flightapis.searchProvider, params, parseFlightBooking);
  }

};
