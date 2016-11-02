/* global itineraryPrediction */
/* global UserAction */
/* global memcache */
/* global sails */
/* global Profile */
/* global Order */
var util = require('util');
var url = require('url');
var lodash = require('lodash');
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

    var onIllegalResult = function () {
      delete req.session.booking_itinerary;
      req.session.flash = 'Your search has expired. Try a new search.';
      req.flash('errors', req.session.flash);
      return res.redirect('/search');
    };

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
      if (typeof id == 'undefined') {
        return onIllegalResult();
      }

      var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
      memcache.get(cacheId, function(err, result) {
        if (!err && !_.isEmpty(result)) {
          var logData = {
            action    : 'order',
            itinerary : JSON.parse(result)
          };
          lodash.assignIn(logData.itinerary, {RefundType: ''});

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
              order:[logData.itinerary]
            },
            'order'
          );
        }
        else {
          return onIllegalResult();

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

  booking_proc: function (req, res) {
    req.session.time_log = [];

    // for API argument
    var params = req.allParams();
    params.session = req.session;

    var parseFlightBooking = function (err, result) {
      var reqParams = req.allParams();

      if (err) {
        segmentio.track(req.user.id, 'Booking Failed', {error: err, params: params});
        // req.session.flash = (err instanceof Error) ? (err.message || err.err) : err;
        req.session.flash = 'Something went wrong. Your credit card wasn\'t charged. Please try again';
        // redirect to order action, i.e. repeat request
        res.redirect(url.format({pathname: "/order", query: reqParams}), 302);
        return;
      }
      segmentio.track(req.user.id, 'Booking Succeeded', {params: params, result: result});
      sails.log.info("Itinerary booked successfully:", result);
      // Clear flash errors
      req.session.flash = '';

      var order = (typeof req.session.booking_itinerary == 'object') ? _.clone(req.session.booking_itinerary.itinerary_data, true) : {};

      // E-mail notification
      var tpl_vars = {
        reqParams: reqParams,
        order: order,
        miles: { value: 0, name: ''},
        bookingRes: result,
        replyTo: sails.config.email.replyTo,
        callTo: sails.config.email.callTo,
      };

      ffmapi.milefy.Calculate(order, function (error, response, body) {
        if (!error) {
          var jdata = (typeof body == 'object') ? body : JSON.parse(body);
          tpl_vars.miles.name = jdata.ProgramCodeName || '';
          tpl_vars.miles.value = jdata.miles || 0;
        }
        Mailer.makeMailTemplate(sails.config.email.tpl_ticket_confirm, tpl_vars)
          .then(function (msgContent) {
            Mailer.sendMail({to: req.user.email, subject: 'Booking with reservation code '+tpl_vars.bookingRes.PNR}, msgContent)
              .then(function () {
                sails.log.info('Mail was sent to '+ req.user.email);
              })
          })
          .catch(function (error) {
            sails.log.error(error);
          });
      });

      // Save result to DB
      Booking.saveBooking(req.user, result, req.session.booking_itinerary, reqParams)
        .then(function (record) {
          delete req.session.booking_itinerary;
          // Redirec to result page
          return res.redirect(url.format({pathname: "/booking", query: {bookingId: record.id}}));
        })
        .catch(function (error) {
          sails.log.error(error);
          delete req.session.booking_itinerary;
          return res.serverError();
        });
    };

    mondee.flightBooking(Search.getCurrentSearchGuid() +'-'+ sails.config.flightapis.searchProvider, params, parseFlightBooking);
  },

  booking: function (req, res) {
    Booking.findOne({
      id: req.param('bookingId'),
      user_id: req.user.id
    }).exec(function (err, record){
      if (err) {
        sails.log.error(err);
        return res.serverError();
      }
      if (!record) {
        return res.notFound('Could not find your booked ticket');
      }

      // Render view
      return res.ok(
        {
          reqParams: record.req_params,
          order: [record.itinerary_data],
          bookingRes: {PNR: record.pnr, ReferenceNumber: record.reference_number},
          replyTo: sails.config.email.replyTo,
          callTo: sails.config.email.callTo,
        },
        'booking'
      );
    });
  }

};
