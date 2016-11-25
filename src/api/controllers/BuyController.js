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
    var flashMsg = '';
    if (!lodash.isEmpty(req.session.flash)) {
      flashMsg = lodash.clone(req.session.flash);
      req.session.flash = '';
    }

    // Get all params for redirect case
    var reqParams = req.allParams();
    var user_out = {
      id: req.user.id,
      email: req.user.email,
    };

    var onIllegalResult = function () {
      delete req.session.booking_itinerary;
      req.session.flash = '';
      return res.ok({user: user_out, error: true, errorType: 'search_expired'});
    };

    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {
      if (err) {
        sails.log.error(err);
        return req.wantsJSON ? res.ok({user: user_out, error: true}) : res.redirect('/search');
      }

      if (found) {
        // map between form fields (mondee API fields) and DB profile fields
        var userData = {
          FirstName: "first_name",
          LastName: "last_name",
          Gender: "gender",
          DateOfBirth: "birthday",
        };

        var userAddress = {
          Address1: "street",
          City: "city",
          State: "state",
          Country: "country_code",
          ZipCode: "zip_code"
        };

        // Set profile structure if data was not found
        if (!found) {
          found = {personal_info: {address: {}}}
        }
        else if (!found.address) {
          found.address = {};
        }
        // Apply DB values if form fields is not defined yet
        for (var prop in userData) {
          if (!reqParams[prop] || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == "")) {
            reqParams[prop] = found.personal_info[userData[prop]] || '';
          }
        }
        for (var prop in userAddress) {
          if (!reqParams[prop] || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == "")) {
            reqParams[prop] = found.personal_info.address[userAddress[prop]] || '';
          }
        }
      }

      var itinerary_id = req.param('itineraryId');
      if (typeof itinerary_id == 'undefined') {
        return onIllegalResult();
      }

      var cacheId = 'itinerary_' + itinerary_id.replace(/\W+/g, '_');
      memcache.get(cacheId, function(err, result) {
        if (!err && !lodash.isEmpty(result)) {
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
            itinerary_id: itinerary_id,
            itinerary_data: logData.itinerary
          };

          var itinerary_data = logData.itinerary ? lodash.cloneDeep(logData.itinerary) : {};
          itinerary_data.price = parseFloat(itinerary_data.price || 0).toFixed(2);
          itinerary_data.orderPrice = (itinerary_data.currency == 'USD') ? '$'+itinerary_data.price : itinerary_data.price +' '+ itinerary_data.currency;

          return res.ok(
            {
              user: user_out,
              action: 'order',
              fieldsData: reqParams,
              itineraryData: itinerary_data,
              profileStructure: {
                Gender: Profile.attr_gender,
                CardType: Order.CardType
              },
              flashMsg: flashMsg
            },
            'order'
          );
        } else {
          return onIllegalResult();
        }
      });
    });
  },

  booking_proc: function (req, res) {
    var service = req.session.booking_itinerary.itinerary_data.service;
    var reqParams = req.allParams();

    // Convert birthday date to the booking format. The sails returns date DB attribute as Date() object
    if (typeof reqParams.DateOfBirth == 'object') {
      reqParams.DateOfBirth = sails.moment(reqParams.DateOfBirth).format('YYYY-MM-DD');
    }
    if (reqParams.DateOfBirth) {
      var years = sails.moment().diff(reqParams.DateOfBirth, 'years');
      reqParams.PaxType = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
    }

    req.session.time_log = [];

    // for API argument
    var params = reqParams;
    params.session = req.session;
    params.user = req.user;

    var parseFlightBooking = function (err, result) {

      var _segmParams = _.merge({}, params);
      _.forEach(_segmParams, function (item, key) {
        if (_.indexOf(['CardType','CardNumber','ExpiryDate','CVV'], key) != -1)
          delete _segmParams[key];
      });

      if (err) {
        segmentio.track(req.user.id, 'Booking Failed', {error: err, params: _segmParams});
        // req.session.flash = (err instanceof Error) ? (err.message || err.err) : err;
        // req.session.flash = 'Something went wrong. Your credit card wasn\'t charged. Please try again';
        // redirect to order action, i.e. repeat request
        // res.redirect(302, url.format({pathname: "/order", query: reqParams}));
        return res.ok({
          error: true,
          flashMsg: 'Something went wrong. Your credit card wasn\'t charged. Please try again'
        });
      }
      segmentio.track(req.user.id, 'Booking Succeeded', {params: _segmParams, result: result});
      sails.log.info("Itinerary booked successfully:", result);
      // Clear flash errors
      req.session.flash = '';

      var order = (typeof req.session.booking_itinerary == 'object') ? lodash.clone(req.session.booking_itinerary.itinerary_data, true) : {};

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
          return res.ok({bookingId: record.id});
        })
        .catch(function (error) {
          sails.log.error(error);
          delete req.session.booking_itinerary;
          return res.ok({
            error: true,
            flashMsg: 'Something went wrong. Your credit card wasn\'t charged. Please try again'
          });
        });
    };

    return global[service].flightBooking(Search.getCurrentSearchGuid() +'-'+ service, params, parseFlightBooking);
  },

  booking: function (req, res) {
    Booking.findOne({
      id: req.param('bookingId'),
      user_id: req.user.id
    }).exec(function (err, record) {
      if (err) {
        sails.log.error(err);
        return res.ok({error: true});
      }
      if (!record) {
        sails.log.error('Could not find by bookingId:', req.param('bookingId'));
        return res.ok({error: true, errorType: 'no_booking'});
      }

      // Render view
      return res.ok(
        {
          action: 'booking',
          fieldsData: record.req_params,
          itineraryData: record.itinerary_data,
          bookingRes: {PNR: record.pnr, ReferenceNumber: record.reference_number},
          replyTo: sails.config.email.replyTo,
          callTo: sails.config.email.callTo,
        },
        'booking'
      );
    });
  }

};
