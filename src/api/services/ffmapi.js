/**
 * ffmapi
 * 30K.com MilefyAPI and WalletAPI
 * @docs http://www.30k.com/30k-api/
 *
 */
/* global sails */
var _REQUEST = require('request');
var lodash = require('lodash');

module.exports = {
  AccrualTypes: {
    0: 'Unknown',
    1: 'RDM. Redeemable miles usually by default.',
    2: 'EQM. Elite qualifying miles by default.',
    3: 'EQS. Elite qualifying segments by default.',
    4: 'EQP. Elite qualifying points by default.',
    5: 'EQD. Elite qualifying dollars by default.'
  },

  ErrorCodes: {
    FLEMP:   'Flights collection is empty.',
    FLIDE:   'The FlightId field is not set for some flight(s).',
    FLTPE:   'Flight doesn’t have total price specified in the price block.',
    FLLGE:   'Legs are not set for some flight(s).',
    FLSGE:   'Segment are not set for some flight(s).',
    FLSGDAE: 'Departure airport code is either not set or has been provided in non-IATA format.',
    FLSGAAE: 'Arrival airport code is either not set or has been provided in non-IATA format.',
    FLSGMKE: 'Marketing airline code is either not set or has been provided in non-IATA format.',
    FLSGOPE: 'Operating airline code is either not set or has been provided in non-IATA format.',
    FLSGFCE: 'The fare code is not set for some flight(s).',
    FLSGDDE: 'Departure date is either not populated or set in the wrong format which was not parsed.',
    FLSGFNE: 'The flight number is not set for some flight(s).',
    PCUKNW:  'Unknown program code detected.',
    PTUKNW:  'Unknown program tier code detected for the certain program.'
  },

  /**
   * @param {String} api ['milefy', 'wallet']
   * @param {String} url The URL of the web method
   * @param {String} method The HTTP verb to be used
   * @param {Object} params Data is to be supplied in the body of the request as JSON encoded value
   * @param {Function} cb Callback function to pass result
   * */
  get: function (api, url, method, params, cb) {
    _REQUEST({
      url: sails.config.ffmapis[api].url + url,
      method: method,
      json: params,
      auth: {
        'user': sails.config.ffmapis[api].login,
        'pass': sails.config.ffmapis[api].password
      }
    }, cb);
  },

  /**
   * MilefyAPI
   *
   * @docs http://www.30k.com/30k-api/milefy-api/
   * */
  milefy: {
    /**
     * @docs http://www.30k.com/30k-api/milefy-api/programs/
     * */
    Programs: function (cb) {
      var apiUrl = 'api/miles/programs';
      ffmapi.get('milefy', apiUrl, 'GET', {}, cb);
    },

    /**
     * The Calculate web method uses provided flight information to calculate accruals for every given flight
     *
     * @todo add support of fligts array not only one flight
     * @docs http://www.30k.com/30k-api/milefy-api/calculate/
     *
     * */
    Calculate: function (params, cb) {
      var apiUrl = 'api/miles/calculate';

      // map itinerary to 30K request
      var _30kparams = {
        flts: []
      };

      //Mapping our structure to 30K api request
      var RequestFlight = {
        fid: params.id,
        lg: []
      };
      params.citypairs.forEach(function (citypair) {
        var FlightLeg = {
          sg: []
        };
        citypair.flights.forEach(function (flight) {
          var FlightSegment = {
            mac: flight.airlineCode,
            oac: flight.airlineCode,
            dac: flight.from.code,
            aac: flight.to.code,
            dd:  flight.from.date,
            fc:  flight.bookingClass,
            fn:  flight.number
          };
          FlightLeg.sg.push(FlightSegment);
        });
        RequestFlight.lg.push(FlightLeg)
      });
      _30kparams.flts.push(RequestFlight);

      sails.log.info('Request to 30K api: ', JSON.stringify(_30kparams));
      ffmapi.get('milefy', apiUrl, 'POST', _30kparams, function (error, response, body) {
        if (error) {
          sails.log.error('30K api', error);
          return cb(error, response, body);
        }
        var result = (typeof body == 'object') ? body : JSON.parse(body);
        if (result.Success == false) {
          sails.log.error('30K api', body);
          return cb({msg: result.Status.Message}, response, body);
        }
        sails.log.info('Response 30K api:', JSON.stringify(body));
        // return only one result
        var filteredResult = {
          AccrualType: ffmapi.AccrualTypes[0],
          miles: 0,
          ProgramCode:'',
          ProgramCodeName:''
        };
        if (!lodash.isEmpty(result.Value.flts) && !lodash.isEmpty(result.Value.flts[0].aprg[0].mi)) {
          result.Value.flts[0].aprg[0].mi.forEach (function (miles, i) {
            if (filteredResult.miles < miles.val && (miles.at == '1' || miles.at == '2')) {
              filteredResult.AccrualType = ffmapi.AccrualTypes[miles.at];
              filteredResult.miles = miles.val;
              filteredResult.ProgramCode = result.Value.flts[0].aprg[0].pc;
            }
          });
        }
        if (filteredResult.ProgramCode) {

          FFMPrograms.findOne({program_code: filteredResult.ProgramCode}).exec(function findOneCB(err, found) {
              if (found) {
                filteredResult.ProgramCodeName = found.program_name;
                return cb(null, response, filteredResult);
              }
            }
          );

        } else {
          return cb(null, response, filteredResult);
        }
      });
    },

    /**
     * The CalculateOne web method uses provided flight information to calculate accruals
     * for all supported frequent flyer programs and their tiers that apply.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculateone/
     * */
    CalculateOne: function (params, cb) {
      var apiUrl = 'api/miles/calculateone';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The CalculateUpgrades web method uses provided itinerary information
     * and tries to find flight’s per-segment upgrade options
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculate-upgrades/
     * */
    CalculateUpgrades: function (params, cb) {
      var apiUrl = 'api/upgrades/calculate';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The CalculateOneUpgrades web method uses provided flight information
     * and tries to identify all possible upgrade options
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculateone-upgrades/
     * */
    CalculateOneUpgrades: function (params, cb) {
      var apiUrl = 'api/upgrades/calculateone';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The CalculateMixed web method uses provided itinerary information
     * and tries to find requested information (miles or upgrades or both
     * as specified within request)
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculate-mixed/
     * */
    CalculateMixed: function (params, cb) {
      var apiUrl = 'api/mixed/calculate';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The CalculateOneMixed web method uses provided itinerary information
     * and tries to find requested information (miles or upgrades or both
     * as specified within request).
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculateone-mixed/
     * */
    CalculateOneMixed: function (params, cb) {
      var apiUrl = 'api/mixed/calculateone';
      cb({msg: 'not implemented'}, {}, {});
    }
  },

  /**
   * WalletAPI
   *
   * @docs http://www.30k.com/30k-api/wallet-api/
   * */
  wallet: {

    /**
     * The CheckAccounts method should be used to retrieve live frequent flyers  program(s)
     * information such as award and status miles balances
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/wallet-api/checkaccounts/
     * */
    CheckAccounts: function (params, cb) {
      var apiUrl = 'api/checkaccounts';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The “AccountsManualInput” method should be used to input a program to the “wallet”
     * when it cannot be populated with values by using client’s credentials via “CheckAccounts”.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/wallet-api/accountsmanualinput/
     * */
    AccountsManualInput: function (params, cb) {
      var apiUrl = 'api/accountsmanual';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The “Memberships” method should be used to retrieve user’s frequent flyers  program(s)
     * memberships associated with given ClientUserId.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/wallet-api/memberships/
     * */
    Memberships: function (params, cb) {
      var apiUrl = 'api/memberships';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The “DeleteMembership” method should be used to remove some of user’s
     * membership which has been previously connected to his/her account.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/wallet-api/deletemembership/
     * */
    DeleteMembership: function (params, cb) {
      var apiUrl = 'api/memberships';
      cb({msg: 'not implemented'}, {}, {});
    },

    /**
     * The Providers web method should be used to retrieve detailed information about
     * all supported frequent flyer programs for which loyalty account information can be retrieved.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/wallet-api/providers/
     * */
    Providers: function (params, cb) {
      var apiUrl = 'api/providers';
      cb({msg: 'not implemented'}, {}, {});
    }
  }

};
