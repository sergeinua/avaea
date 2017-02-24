/**
 * ffmapi
 * 30K.com MilefyAPI and WalletAPI
 * @docs http://www.30k.com/30k-api/
 *
 */
/* global sails */
const _REQUEST = require('request');
const lodash = require('lodash');
const qpromice = require('q');

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
      timeout: 20000,
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
      let apiUrl = 'api/miles/programs';
      ffmapi.get('milefy', apiUrl, 'GET', {}, cb);
    },

    /**
     * The Calculate web method uses provided flight information to calculate accruals for every given flight
     *
     *
     * @docs http://www.30k.com/30k-api/milefy-api/calculate/
     *
     * @params {itineraries: [], milesPrograms: []} // milesPrograms is optional
     *
     * */
    Calculate: function ({itineraries = [], milesPrograms = []}, callback) {

      /**
       * Convert data to 30kApi format __version 2.5__ or lover for request "/api/miles/calculate"
       * {
       *   program_name: 'LMM',
       *   account_number: '34afadfg45gdagdfg',
       *   tier: '24',
       *   status: '8'
       * }
       * Is converted to
       * {
       *   tc: 'LMM',
       *   ut: '24'
       * }
       *
       * @param {object}
       * @return {object}
       *
       */
      function convertMilesProgramTo30kFormat({program_name: tc = '', tier: ut = ''}) {
        return { tc, ut };
      }

      function convertItineraryTo30kFlightFormat(itinerary) {
        //Mapping our structure to 30K api request
        let RequestFlight = {
          fid: itinerary.id,
          lg: []
        };
        if (itinerary.citypairs) {
          itinerary.citypairs.forEach(function (citypair) {
            let FlightLeg = {
              sg: []
            };
            citypair.flights.forEach(function (flight) {
              let FlightSegment = {
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
        }

        return RequestFlight;
      }

      let apiUrl = 'api/miles/calculate';

      // map itinerary to 30K request
      let _30kparams = {
        flts: [],
        tgp:[],
      };

      itineraries.forEach((itinerary) => {
        _30kparams.flts.push(convertItineraryTo30kFlightFormat(itinerary));
      });

      milesPrograms.forEach((milesProgram) => {
        _30kparams.tgp.push(convertMilesProgramTo30kFormat(milesProgram));
      });

      onvoya.log.verbose('Request to 30K api: ', _30kparams);
      let _calculate = () => {
        return new Promise((resolve, reject) => {
          ffmapi.get('milefy', apiUrl, 'POST', _30kparams, (error, response, body) => {
            onvoya.log.verbose('Response 30K api:', body);
            if (error) {
              return reject(error);
            }
            let result;
            try {
              result = (typeof body == 'object') ? body : JSON.parse(body || '{}');
            } catch (e) {
              return reject(e);
            }
            if (result && result.Success == false) {
              return reject(result.Status.Message);
            }
            return resolve(result);
          });
        });
      };
      return _calculate()
        .then(result => {

          let filteredResults = [],
            programCodesAsObject = {};

          if (result.Value && !lodash.isEmpty(result.Value.flts)) {

            let nonEmptyFlights = result.Value.flts.filter((flight) => !lodash.isEmpty(flight.aprg[0].mi));
            filteredResults = nonEmptyFlights.map(function (flight) {
              let filteredResult = {
                AccrualType: ffmapi.AccrualTypes[0],
                miles: 0,
                ProgramCode:'',
                ProgramCodeName:''
              };

              flight.aprg[0].mi.forEach(function (miles, i) {
                if (filteredResult.miles < miles.val && (miles.at == '1' || miles.at == '2')) {
                  filteredResult.AccrualType = ffmapi.AccrualTypes[miles.at];
                  filteredResult.miles = miles.val;
                  filteredResult.ProgramCode = flight.aprg[0].pc;
                  programCodesAsObject[filteredResult.ProgramCode] = true;
                }
              });
              return {
                id: flight.fid,
                ffmiles: filteredResult
              };
            });

          }
          return {results: filteredResults, programCodes: programCodesAsObject};

        })
        .then(filtered => {

          return new Promise((resolve, reject) => {

            let programCodesAsArray = Object.keys(filtered.programCodes);
            if (programCodesAsArray.length) {

              let queryArray = programCodesAsArray.map((code) => ({program_code: code}));
              FFMPrograms.find(queryArray)
                .then((foundPrograms) => {

                  if (foundPrograms && foundPrograms.length) {
                    foundPrograms.forEach((foundItem) => {
                      filtered.programCodes[foundItem.program_code] = foundItem.program_name;
                    });

                    let definedProgramCodesAsObject = {};
                    Object.keys(filtered.programCodes)
                      .filter((program) => filtered.programCodes[program] !== true)
                      .forEach((program) => { definedProgramCodesAsObject[program] = filtered.programCodes[program] });

                    filtered.results.forEach((flight) => {
                      if (definedProgramCodesAsObject[flight.ffmiles.ProgramCode]) {
                        flight.ffmiles.ProgramCodeName = definedProgramCodesAsObject[flight.ffmiles.ProgramCode];
                      }
                    });
                  }
                  return resolve(filtered.results);

                })
                .catch((e) => {
                  return reject(e);
                });

            } else {
              return resolve(filtered.results);
            }

          });

        })
        .then(filtered => {
          try {
            return callback(null, filtered);
          } catch (e) {
            // avoid double callback call on errors
            return;
          }
        })
        .catch(e => {
          onvoya.log.error('Error 30K api:', e);
          return callback(e, []);
        })
    },

    /**
     * The CalculateOne web method uses provided flight information to calculate accruals
     * for all supported frequent flyer programs and their tiers that apply.
     *
     * @todo implement when needed
     * @docs http://www.30k.com/30k-api/milefy-api/calculateone/
     * */
    CalculateOne: function (params, cb) {
      let apiUrl = 'api/miles/calculateone';
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
      let apiUrl = 'api/upgrades/calculate';
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
      let apiUrl = 'api/upgrades/calculateone';
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
      let apiUrl = 'api/mixed/calculate';
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
      let apiUrl = 'api/mixed/calculateone';
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
      let apiUrl = 'api/checkaccounts';
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
      let apiUrl = 'api/accountsmanual';
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
      let apiUrl = 'api/memberships';
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
      let apiUrl = 'api/memberships';
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
      let apiUrl = 'api/providers';
      cb({msg: 'not implemented'}, {}, {});
    }
  }

};
