/* global itineraryPrediction */
/* global UserAction */
/* global FFMPrograms */
/* global cache */
/* global sails */
/* global Profile */
/* global Order */
/* global utils */
const util = require('util');
const url = require('url');
const lodash = require('lodash');
const qpromice = require('q');

/**
 * BuyController
 */

module.exports = {

  order: function (req, res) {
    // Get all params for redirect case
    let reqParams = req.allParams();

    let onIllegalResult = function () {
      req.session.flash = '';
      return res.ok({
        error: true,
        errorInfo: utils.showError('Error.Search.Expired')
      });
    };

    //FIXME in ONV-1012
    if (!req.user) {
      sails.log.info(utils.showError('Error.User.NotAuthorised'));
      return res.ok({
        error: true,
        errorInfo: utils.showError('Error.User.NotAuthorised')
      });
    }

    let userId = utils.getUser(req);

    Profile.findOneByUserId(userId).exec(function findOneCB(err, found) {
      if (err) {
        sails.log.error(err);
        return res.ok({
          error: true,
          errorInfo: utils.showError('Error.Passport.User.Profile.NotFound')
        });
      }

      if (found) {
        // map between form fields (mondee API fields) and DB profile fields
        let userData = {
          FirstName: "first_name",
          LastName: "last_name",
          Gender: "gender",
          DateOfBirth: "birthday",
          Phone: "phone"
        };

        let userAddress = {
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
        for (let prop in userData) {
          if (!reqParams[prop] || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == "")) {
            reqParams[prop] = found.personal_info[userData[prop]] || '';
          }
        }
        for (let prop in userAddress) {
          if (!reqParams[prop] || (typeof reqParams[prop] == 'string' && reqParams[prop].trim () == "")) {
            reqParams[prop] = found.personal_info.address[userAddress[prop]] || '';
          }
        }
      }

      let itinerary_id = req.param('itineraryId');
      if (typeof itinerary_id == 'undefined') {
        return onIllegalResult();
      }

      let cacheId = 'itinerary_' + itinerary_id.replace(/\W+/g, '_');
      qpromice.nfbind(cache.get)(cacheId)
        .then((resItinerary) => {

          if (lodash.isEmpty(resItinerary)) {
            return Promise.reject('cacheId "'+cacheId+'" not found by order action');
          }

          let logData = {
            action    : 'order',
            itinerary : JSON.parse(resItinerary)
          };
          lodash.assignIn(logData.itinerary, {RefundType: ''});

          let userId = utils.getUser(req);
          itineraryPrediction.updateRank(userId, logData.itinerary.searchId, logData.itinerary.price);

          UserAction.saveAction(userId, 'on_itinerary_purchase', logData, function () {
            User.publishCreate(userId);
          });

          let itinerary_data = logData.itinerary ? lodash.cloneDeep(logData.itinerary) : {};
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
    let booking_itinerary = {};
    let reqParams = req.allParams();
    let cacheId = 'itinerary_' + (reqParams.itineraryId || '').replace(/\W+/g, '_');

    //FIXME in ONV-1012
    if (!req.user) {
      sails.log.info(utils.showError('Error.User.NotAuthorised'));
      return res.ok({
        error: true,
        errorInfo: utils.showError('Error.User.NotAuthorised')
      });
    }

    qpromice.nfbind(cache.get)(cacheId)
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
          let years = sails.moment().diff(reqParams.DateOfBirth, 'years');
          reqParams.PaxType = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
        }
        reqParams.user = req.user;
        reqParams.price = booking_itinerary.price;

        // Clone and modify params for booking API
        let reqParamsApi = Object.assign({}, reqParams);
        reqParamsApi.booking_itinerary = booking_itinerary;
        reqParamsApi.FirstName = reqParamsApi.FirstName.trim().replace(/[^a-z]/ig,''); // remains alphabet only
        reqParamsApi.LastName = reqParamsApi.LastName.trim().replace(/[^a-z]/ig,'');
        // Save modified api params also
        reqParams.paramsApi = {
          FirstName: reqParamsApi.FirstName,
          LastName: reqParamsApi.LastName
        };
        if (Array.isArray(reqParamsApi.passengers)) {
          for (let i=0; i < reqParamsApi.passengers.length; i++) {
            // remains alphabet only
            reqParamsApi.passengers[i].FirstName = reqParamsApi.passengers[i].FirstName.trim().replace(/[^a-z]/ig,'');
            reqParamsApi.passengers[i].LastName = reqParamsApi.passengers[i].LastName.trim().replace(/[^a-z]/ig,'');
          }
        }
        // Important ! Remove credit cards data before parsing of the flight-booking
        delete reqParams.CardNumber;
        delete reqParams.ExpiryDate;
        delete reqParams.CVV;

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

    const parseFlightBooking = function (err, result) {
      let _segmParams = _.merge({}, reqParams);
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
      if( req.user ) {
        segmentio.track(req.user.id, 'Booking Succeeded', {params: _segmParams, result: result});
      }
      sails.log.info("Itinerary booked successfully:", result);
      // Clear flash errors
      req.session.flash = '';

      // Make and send booking confirmation
      let _itinerary_data = _.cloneDeep(booking_itinerary);
      let tpl_vars = {};

      FFMPrograms.getMilesProgramsByUserId(req.user && req.user.id).then(function (milesPrograms) {
        qpromice.all(ReadEticket.procUserPrograms({itinerary_data: _itinerary_data, milesPrograms}))
          .then(function (programsResults) {
            let _programs_res = Object.assign(...programsResults);
            // E-mail notification
            tpl_vars = {
              mailType: 'booking',
              reqParams: reqParams,
              order: _itinerary_data,
              bookingRes: result,
              replyTo: sails.config.email.replyTo,
              callTo: sails.config.email.callTo,
              miles: _programs_res.miles,
              refundType: _programs_res.refundType,
              eticketNumber: null, // Is not defined yet
              serviceClass: Search.serviceClass,
              providerInfo: sails.config.flightapis[_itinerary_data.service].providerInfo
            };
            return Mailer.makeMailTemplate(sails.config.email.tpl_ticket_confirm, tpl_vars);
          })
          .then(function (msgContent) {
            return Mailer.sendMail({to: req.user.email, subject: 'Booking with reservation code '+tpl_vars.bookingRes.PNR}, msgContent);
          })
          .then(function () {
            sails.log.info('Mail with booking confirmation was sent to '+ req.user.email);
          })
          .catch(function (error) {
            sails.log.error('in booking sendMail chain:', error);
          });
      });

      // Save result to DB
      Booking.saveBooking(req.user, result, booking_itinerary, reqParams)
        .then(function (record) {
          return res.ok({bookingId: record.id_pub});
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
    if (! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.param('bookingId'))) {
      sails.log.error('Invalid bookingId format:', req.param('bookingId'));
      return res.ok({
        error: true,
        errorInfo: utils.showError('Error.Search.Booking.NotFound')
      });
    }

    // Sails work with ORM in case-insensitive mode only. In this case we need query method
    Booking.query(
      `SELECT * FROM ${Booking.tableName} WHERE id_pub=$1 AND user_id=$2`, [req.param('bookingId'), req.user.id], function (err, dbResults) {
        if (err) {
          sails.log.error('Booking.query: '+ req.param('bookingId'), err);
          return res.ok({error: true});
        }
        if (dbResults.rows.length == 0) {
          sails.log.error('Could not find by bookingId:', req.param('bookingId'));
          return res.ok({
            error: true,
            errorInfo: utils.showError('Error.Search.Booking.NotFound')
          });
        }
        let record = dbResults.rows[0];

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
