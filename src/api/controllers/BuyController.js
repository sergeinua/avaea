/* global itineraryPrediction */
/* global UserAction */
/* global memcache */
/* global sails */
/* global Profile */
/* global Order */
var util = require('util');
var url = require('url');
var lodash = require('lodash');
var qpromice = require('q');

/**
 * BuyController
 */

module.exports = {

  order: function (req, res) {
    // Get all params for redirect case
    var reqParams = req.allParams();

    let onIllegalResult = function () {
      req.session.flash = '';
      return res.ok({
        error: true,
        errorInfo: utils.showError('Error.Search.Expired')
      });
    };

    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {
      if (err) {
        sails.log.error(err);
        return res.ok({
          error: true,
          errorInfo: utils.showError('Error.Passport.User.Profile.NotFound')
        });
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

      let cacheId = 'itinerary_' + itinerary_id.replace(/\W+/g, '_');
      qpromice.nfbind(memcache.get)(cacheId)
        .then((resItinerary) => {

          if (lodash.isEmpty(resItinerary)) {
            return Promise.reject('cacheId "'+cacheId+'" not found by order action');
          }

          var logData = {
            action    : 'order',
            itinerary : JSON.parse(resItinerary)
          };
          lodash.assignIn(logData.itinerary, {RefundType: ''});

          itineraryPrediction.updateRank(req.user.id, logData.itinerary.searchId, logData.itinerary.price);

          UserAction.saveAction(req.user, 'on_itinerary_purchase', logData, function () {
            User.publishCreate(req.user);
          });

          var itinerary_data = logData.itinerary ? lodash.cloneDeep(logData.itinerary) : {};
          itinerary_data.price = parseFloat(itinerary_data.price || 0).toFixed(2);
          itinerary_data.orderPrice = (itinerary_data.currency == 'USD') ? '$'+itinerary_data.price : itinerary_data.price +' '+ itinerary_data.currency;

          return res.ok(
            {
              action: 'order',
              fieldsData: reqParams,
              itineraryData: itinerary_data,
              profileStructure: {
                Gender: Profile.attr_gender,
                CardType: Order.CardType
              },
              flashMsg: ''
            },
            'order'
          );
        })
        .catch((error) => {
          sails.log.error(error);
          return onIllegalResult();
        });
    });
  },

  booking_proc: function (req, res) {
    var booking_itinerary = {};
    var reqParams = req.allParams();
    let cacheId = 'itinerary_' + (reqParams.itineraryId || '').replace(/\W+/g, '_');

    qpromice.nfbind(memcache.get)(cacheId)
      .then((resItinerary) => {

        if (lodash.isEmpty(resItinerary)) {
          return Promise.reject('cacheId "' + cacheId + '" not found by booking_proc action');
        }
        booking_itinerary = JSON.parse(resItinerary);

        // Convert birthday date to the booking format. The sails returns date DB attribute as Date() object
        if (typeof reqParams.DateOfBirth == 'object') {
          reqParams.DateOfBirth = sails.moment(reqParams.DateOfBirth).format('YYYY-MM-DD');
        }
        if (reqParams.DateOfBirth) {
          var years = sails.moment().diff(reqParams.DateOfBirth, 'years');
          reqParams.PaxType = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
        }
        reqParams.user = req.user;

        // Clone and modify params for booking API
        let reqParamsApi = Object.assign({}, reqParams);
        reqParamsApi.FirstName = reqParamsApi.FirstName.trim().replace(/[^a-z]/ig,''); // remains alphabet only
        reqParamsApi.LastName = reqParamsApi.LastName.trim().replace(/[^a-z]/ig,'');
        // Save modified api params also
        reqParams.paramsApi = {
          FirstName: reqParamsApi.FirstName,
          LastName: reqParamsApi.LastName
        };

        req.session.time_log = [];
        reqParamsApi.session = reqParams.session = req.session;

        return global[booking_itinerary.service].flightBooking(Search.getCurrentSearchGuid() +'-'+ booking_itinerary.service, reqParamsApi, parseFlightBooking);
      })
      .catch((error) => {
        sails.log.error(error);

        return res.ok({
          error: true,
          flashMsg: 'Something went wrong. Your credit card wasn\'t charged. Please try again'
        });
      });

    var parseFlightBooking = function (err, result) {
      var _segmParams = _.merge({}, reqParams);
      _.forEach(_segmParams, function (item, key) {
        if (_.indexOf(['CardType','CardNumber','ExpiryDate','CVV'], key) != -1)
          delete _segmParams[key];
      });

      if (err) {
        segmentio.track(req.user.id, 'Booking Failed', {error: err, params: _segmParams});
        return res.ok({
          error: true,
          flashMsg: req.__('Error.Search.Booking.Failed')
        });
      }
      segmentio.track(req.user.id, 'Booking Succeeded', {params: _segmParams, result: result});
      sails.log.info("Itinerary booked successfully:", result);
      // Clear flash errors
      req.session.flash = '';

      var order = lodash.clone(booking_itinerary, true);

      // E-mail notification
      var tpl_vars = {
        reqParams: reqParams,
        order: order,
        bookingRes: result,
        replyTo: sails.config.email.replyTo,
        callTo: sails.config.email.callTo,
      };
      async.parallel(
        {
          miles: function (_cbDone) {
            ffmapi.milefy.Calculate(order, function (error, response, body) {
              var miles = {name: '', value: 0};
              if (!error) {
                var jdata = (typeof body == 'object') ? body : JSON.parse(body);
                miles = {
                  name: jdata.ProgramCodeName || '',
                  value: jdata.miles || 0
                }
              }
              _cbDone(null, miles);
            });
          },
          refundType: function (_cbDone) {
            Search.getRefundType(order, function (error, response) {
              _cbDone(null, response);
            });
          }
        },
        // main callback
        function(err, result) {
          tpl_vars.miles = result.miles;
          tpl_vars.refundType = result.refundType;
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
        }
      );

      // Save result to DB
      Booking.saveBooking(req.user, result, booking_itinerary, reqParams)
        .then(function (record) {
          return res.ok({bookingId: record.id});
        })
        .catch(function (error) {
          sails.log.error(error);
          return res.ok({
            error: true,
            flashMsg: req.__('Error.Search.Booking.Failed')
          });
        });
    };
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
        return res.ok({
          error: true,
          errorInfo: utils.showError('Error.Search.Booking.NotFound')
        });
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
