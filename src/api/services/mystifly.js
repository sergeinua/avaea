/* global memcache */
/* global async */
/* global sails */
var lodash = require('lodash');

var getWsdlUrl = function() {
  return sails.config.flightapis.mystifly.baseEndPoint + '?singleWsdl';
};

var getCreateSessionRq = function() {
  return {
    'tns:rq': {
      'q41:AccountNumber': sails.config.flightapis.mystifly.AccountNumber,
      'q41:Password': sails.config.flightapis.mystifly.Password,
      'q41:Target': sails.config.flightapis.mystifly.Target,
      'q41:UserName': sails.config.flightapis.mystifly.UserName
    }
  }
};

var getAirLowFareSearchRq = function(sessionId, params) {
  // minimum requirements for search request
  var req = {
    'tns:rq': {
      'q36:OriginDestinationInformations': {
        'q36:OriginDestinationInformation': [
          {
            'q36:DepartureDateTime': sails.moment(params.departureDate, "DD/MM/YYYY").format('YYYY-MM-DDTHH:mm:SS'),
            'q36:DestinationLocationCode': params.ArrivalLocationCode,
            'q36:OriginLocationCode': params.DepartureLocationCode
          }
        ]
      },
      'q36:PassengerTypeQuantities': {
        'q36:PassengerTypeQuantity': [
          {
            'q36:Code': 'ADT',
            'q36:Quantity': 1
          }
        ]
      },
      'q36:PricingSourceType': 'All',
      'q36:RequestOptions': 'TwoHundred',
      'q36:SessionId': sessionId,
      'q36:Target': sails.config.flightapis.mystifly.Target,
      'q36:TravelPreferences': {
        'q36:AirTripType': 'OneWay',
        'q36:CabinPreference': 'Y',
        'q36:MaxStopsQuantity': 'All',
        'q36:Preferences': {
          'q36:CabinType': 'Y',
          'q36:PreferenceLevel': 'Restricted'
        }
      }
    }
  };
  // add return OriginDestination if we have return date
  if (params.returnDate) {
    req['tns:rq']['q36:OriginDestinationInformations']['q36:OriginDestinationInformation'].push({
      'q36:DepartureDateTime': sails.moment(params.returnDate, "DD/MM/YYYY").format('YYYY-MM-DDTHH:mm:SS'),
      'q36:DestinationLocationCode': params.DepartureLocationCode,
      'q36:OriginLocationCode': params.ArrivalLocationCode
    });
    req['tns:rq']['q36:TravelPreferences']['q36:AirTripType'] = 'Return';
  }
  // set the same CabinClass for all OriginDestination elements
  if (['E','B','F','P'].indexOf(params.CabinClass) != -1) {
    /*
     Y Economy/Coach
     S Economy/Coach
     C Business Class
     J Business Class Premium
     F First Class
     P First Class Premium
     */
    var mapClass = {
      'E':'Y',
      'B':'C',
      'F':'F',
      'P':'J'
    };
    req['tns:rq']['q36:TravelPreferences']['q36:CabinPreference'] = mapClass[params.CabinClass];
  }
  return req;
  /*
         <mys:rq>
            <!--Optional:-->
            <mys1:IsRefundable>false</mys1:IsRefundable>
            <!--Optional:-->
            <!--mys1:IsResidentFare>?</mys1:IsResidentFare-->
            <!--Optional:-->
            <mys1:NearByAirports>false</mys1:NearByAirports>
            <!--Optional:-->
            <mys1:OriginDestinationInformations>
               <!--Zero or more repetitions:-->
               <mys1:OriginDestinationInformation>
                  <!--Optional:-->
                  <!--mys1:ArrivalWindow>?</mys1:ArrivalWindow-->
                  <!--Optional:-->
                  <mys1:DepartureDateTime>2016-01-10T00:00:00</mys1:DepartureDateTime>
                  <!--Optional:-->
                  <!--mys1:DepartureWindow>?</mys1:DepartureWindow-->
                  <!--Optional:-->
                  <mys1:DestinationLocationCode>ORD</mys1:DestinationLocationCode>
                  <!--Optional:-->
                  <mys1:OriginLocationCode>ATL</mys1:OriginLocationCode>
               </mys1:OriginDestinationInformation>
               <mys1:OriginDestinationInformation>
                  <!--Optional:-->
                  <!--mys1:ArrivalWindow>?</mys1:ArrivalWindow-->
                  <!--Optional:-->
                  <mys1:DepartureDateTime>2016-01-16T00:00:00</mys1:DepartureDateTime>
                  <!--Optional:-->
                  <!--mys1:DepartureWindow>?</mys1:DepartureWindow-->
                  <!--Optional:-->
                  <mys1:DestinationLocationCode>ATL</mys1:DestinationLocationCode>
                  <!--Optional:-->
                  <mys1:OriginLocationCode>ORD</mys1:OriginLocationCode>
               </mys1:OriginDestinationInformation>
            </mys1:OriginDestinationInformations>
            <!--Optional:-->
            <mys1:PassengerTypeQuantities>
               <!--Zero or more repetitions:-->
               <mys1:PassengerTypeQuantity>
                  <!--Optional:-->
                  <mys1:Code>ADT</mys1:Code>
                  <!--Optional:-->
                  <mys1:Quantity>1</mys1:Quantity>
               </mys1:PassengerTypeQuantity>
            </mys1:PassengerTypeQuantities>
            <!--Optional:-->
            <mys1:PricingSourceType>All</mys1:PricingSourceType>
            <!--Optional:-->
            <mys1:RequestOptions>Fifty</mys1:RequestOptions>
            <!--Optional:-->
            <mys1:SessionId>526950d4-f39d-4deb-88b4-d85fec031d34</mys1:SessionId>
            <!--Optional:-->
            <mys1:Target>Test</mys1:Target>
            <!--Optional:-->
            <mys1:TravelPreferences>
               <!--Optional:-->
               <mys1:AirTripType>Return</mys1:AirTripType>
               <!--Optional:-->
               <mys1:CabinPreference>Y</mys1:CabinPreference>
               <!--Optional:-->
               <mys1:MaxStopsQuantity>All</mys1:MaxStopsQuantity>
               <!--Optional:-->
               <!--mys1:Preferences-->
                  <!--Optional:-->
                  <!--mys1:CabinClassPreference-->
                     <!--Optional:-->
                     <!--mys1:CabinType>?</mys1:CabinType-->
                     <!--Optional:-->
                     <!--mys1:PreferenceLevel>?</mys1:PreferenceLevel-->
                  <!--/mys1:CabinClassPreference-->
               <!--/mys1:Preferences-->
               <!--Optional:-->
               <!--mys1:VendorExcludeCodes-->
                  <!--Zero or more repetitions:-->
                  <!--arr:string>?</arr:string!-->
               <!--/mys1:VendorExcludeCodes-->
               <!--Optional:-->
               <!--mys1:VendorPreferenceCodes-->
                  <!--Zero or more repetitions:-->
                  <!--arr:string>?</arr:string-->
               <!--/mys1:VendorPreferenceCodes-->
            </mys1:TravelPreferences>
         </mys:rq>
  */
};

var mapIntermediateStops = function (stops) {
  var res = {
    stops: [],
    stopsDurationMinutes: 0
  };
  for (var i = 0; i < stops.length; i++) {
    var stop = stops[i];
    var cpStopDuration = sails.moment.duration(
      sails.moment(stop.departureDate).diff(stop.arrivalDate)
    ).asMinutes();
    var mappedStop = {
      code: stop.locationCode,
      begin: {
        date: sails.moment(stop.arrivalDate).format('YYYY-MM-DD'),
        time: sails.moment(stop.arrivalDate).format('hh:mma').slice(0, -1)
      },
      end: {
        date: sails.moment(stop.departureDate).format('YYYY-MM-DD'),
        time: sails.moment(stop.departureDate).format('hh:mma').slice(0, -1)
      },
      duration: utils.minutesToDuration(cpStopDuration),
      durationMinutes: cpStopDuration
    };
    res.stopsDurationMinutes += mappedStop.durationMinutes;
    res.stops.push( mappedStop );
  }
  return res;
};

var mapFlights = function(flights) {
  var res = {
    flights: [],
    path: [],
    stops: [],
    stopsCodes: [],
    stopsDurationMinutes: 0,
    durationMinutes: 0
  };
  for (var j=0; j < flights.length; j++) {
    var flight = flights[j];

    if (j>0) {
      // fill the citypair stops
      var cpStopDuration = sails.moment.duration(
        sails.moment(flight.DepartureDateTime).diff(flights[j-1].ArrivalDateTime)
      ).asMinutes();
      res.stopsCodes.push(flight.DepartureAirportLocationCode);
      res.stops.push({
        code: flight.DepartureAirportLocationCode,
        begin: {
          date: sails.moment(flights[j-1].ArrivalDateTime).format('YYYY-MM-DD'),
          time: sails.moment(flights[j-1].ArrivalDateTime).format('hh:mma').slice(0, -1)
        },
        end: {
          date: sails.moment(flight.DepartureDateTime).format('YYYY-MM-DD'),
          time: sails.moment(flight.DepartureDateTime).format('hh:mma').slice(0, -1)
        },
        duration: utils.minutesToDuration(cpStopDuration),
        durationMinutes: cpStopDuration
      });
      res.stopsDurationMinutes += cpStopDuration;
    }
    var mapReverseClass = {
      'Y':'E',
      'C':'B',
      'F':'F',
      'J':'P'
    };

    res.path.push(flight.DepartureAirportLocationCode);
    var mappedFlight = {
      number: flight.FlightNumber,
      abbrNumber: flight.MarketingAirlineCode.toUpperCase() + flight.FlightNumber,
      from: {
        code: flight.DepartureAirportLocationCode,
        date: sails.moment(flight.DepartureDateTime).format('YYYY-MM-DD'),
        time: sails.moment(flight.DepartureDateTime).format('hh:mma').slice(0, -1)
      },
      to: {
        code: flight.ArrivalAirportLocationCode,
        date: sails.moment(flight.ArrivalDateTime).format('YYYY-MM-DD'),
        time: sails.moment(flight.ArrivalDateTime).format('hh:mma').slice(0, -1)
      },
      durationMinutes: flight.JourneyDuration,
      duration: utils.minutesToDuration(flight.JourneyDuration),
      bookingClass: flight.ResBookDesigCode,
      cabinClass: mapReverseClass[flight.CabinClassCode],
      airline: flight.MarketingAirlineCode.toUpperCase(),
      airlineCode: flight.MarketingAirlineCode.toUpperCase(),
      noOfStops: 0, //flight.StopQuantity,
      stopsDuration: '',
      stopsDurationMinutes: 0,
      stops: [],
      merchandising: [] // Merchandising Fake data Issue #39
    };
    /*
    // TODO: process intermediate stops
    if (flight.StopQuantity) {
      var mStops = mapIntermediateStops(flight.IntermediateStops);
      mappedFlight.stops = mStops.stops;
      mappedFlight.stopsDurationMinutes = mStops.stopsDurationMinutes;
      mappedFlight.stopsDuration = utils.minutesToDuration(mappedFlight.stopsDurationMinutes);
      res.stopsDurationMinutes += mappedFlight.stopsDurationMinutes;
    }
    */
    res.durationMinutes += mappedFlight.durationMinutes;
    res.flights.push( mappedFlight );
    // push last node of path
    if (j == flights.length - 1) {
      res.path.push(flight.ArrivalAirportLocationCode);
    }
  }
  return res;
};

var mapCitypairs = function(citypairs) {
  var res = {
    durationMinutes: 0,
    duration: '',
    citypairs: []
  };
  for (var i=0; i < citypairs.length; i++) {
    var currentDurationArr = [];
    var pair = citypairs[i];
    var from = pair.FlightSegments.FlightSegment[0];
    var to = pair.FlightSegments.FlightSegment[pair.FlightSegments.FlightSegment.length-1];
    var mappedPair = {
      direction: i==0 ? 'Depart' : 'Return',
      from: {
        code: from.DepartureAirportLocationCode,
        date: sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'),
        time: sails.moment(from.DepartureDateTime).format('hh:mma').slice(0, -1),
        quarter: Math.floor(parseInt(sails.moment(from.DepartureDateTime).format('H'))/6)+1,
        airlineCode: from.MarketingAirlineCode.toUpperCase(),
        airline: from.MarketingAirlineCode.toUpperCase(),
        minutes: sails.moment.duration(
          sails.moment(from.DepartureDateTime).diff(sails.moment(from.DepartureDateTime).format('YYYY-MM-DD'))
        ).asMinutes()
      },
      to: {
        code: to.ArrivalAirportLocationCode,
        date: sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'),
        time: sails.moment(to.ArrivalDateTime).format('hh:mma').slice(0, -1),
        quarter: Math.floor(parseInt(sails.moment(to.ArrivalDateTime).format('H'))/6)+1,
        minutes: sails.moment.duration(
          sails.moment(to.ArrivalDateTime).diff(sails.moment(to.ArrivalDateTime).format('YYYY-MM-DD'))
        ).asMinutes()
      },
      durationMinutes: 0,
      duration: '',
      noOfStops: 0,
      stopsDurationMinutes: 0,
      stopsDuration: '',
      stopsCodes: [],
      stops: [],
      path: [],
      flights: []
    };

    var mFlights = mapFlights(pair.FlightSegments.FlightSegment);
    mappedPair.flights = mFlights.flights;
    mappedPair.path = mFlights.path;
    mappedPair.stops = mFlights.stops;
    mappedPair.noOfStops = mFlights.stops.length;
    mappedPair.stopsCodes = mFlights.stopsCodes;
    mappedPair.durationMinutes = mFlights.durationMinutes;
    mappedPair.duration = utils.minutesToDuration(mappedPair.durationMinutes);
    mappedPair.stopsDurationMinutes = mFlights.stopsDurationMinutes;
    mappedPair.stopsDuration = utils.minutesToDuration(mappedPair.stopsDurationMinutes);

    res.durationMinutes += mappedPair.durationMinutes;

    res.citypairs.push( mappedPair );
  }
  res.duration = utils.minutesToDuration(res.durationMinutes);
  return res;
};

// Merchandising Fake keys Issue #39
var _keysMerchandisingWiFi, _keysMerchandising1bagfree, _keysMerchandisingPrioritySeat;
var mapMerchandising = function (citypairs, val) {
    var _cityPairKey = ((citypairs.length > 1) ? lodash.random(0, citypairs.length - 1) : 0),
        _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? lodash.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

    citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
};

var mapItinerary = function(itinerary) {
  var res = {
    id: itinerary.AirItineraryPricingInfo.FareSourceCode,
    service: 'mystifly',
    price: (parseFloat(itinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare.Amount)).toFixed(2),
    currency: itinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare.CurrencyCode,
    duration: '',
    durationMinutes: 0,
    citypairs: []
  };

  var mCitypairs = mapCitypairs(itinerary.OriginDestinationOptions.OriginDestinationOption);
  res.citypairs = mCitypairs.citypairs;
  res.durationMinutes = mCitypairs.durationMinutes;
  res.duration = utils.minutesToDuration(res.durationMinutes);

  // Merchandising Fake data Issue #39
  if (lodash.isArray(_keysMerchandisingWiFi) && lodash.indexOf(_keysMerchandisingWiFi, itinerary.AirItineraryPricingInfo.FareSourceCode) != -1) {
      mapMerchandising(res.citypairs, 'WiFi');
  }
  if (lodash.isArray(_keysMerchandising1bagfree) && lodash.indexOf(_keysMerchandising1bagfree, itinerary.AirItineraryPricingInfo.FareSourceCode) != -1) {
      mapMerchandising(res.citypairs, '1st bag free');
  }
  if (lodash.isArray(_keysMerchandisingPrioritySeat) && lodash.indexOf(_keysMerchandisingPrioritySeat, itinerary.AirItineraryPricingInfo.FareSourceCode) != -1) {
      mapMerchandising(res.citypairs, 'Priority seat');
  }

  return res;
};

module.exports = {
  flightSearch: function(guid, params, callback) {
    sails.log.info('Mystifly API call started');

    memcache.init(function(){});
    utils.timeLog('mystifly');

    var wsdlUrl = getWsdlUrl();
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);
    soap.createClient(wsdlUrl, function(err, client) {
      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback( err, [] );
      } else {
        var csRq = getCreateSessionRq();
        return client.CreateSession(csRq, function(err, session, raw, soapHeader) {
          if (err) {
            sails.log.error(err);
            return callback( err, [] );
          } else {
            if (!session.CreateSessionResult.SessionStatus ||
                session.CreateSessionResult.Errors.Error) {
              sails.log.error(session.CreateSessionResult.Errors.Error);
              return callback( err, [] );
            }
            var req = getAirLowFareSearchRq(session.CreateSessionResult.SessionId, params.searchParams);
            return client.AirLowFareSearch(req, function(err, result, raw, soapHeader) {
              if (utils.timeLogGet('mystifly') > 7000) {
                params.session.time_log.push(require('util').format('Mystifly took %ss to respond', (utils.timeLogGet('mystifly')/1000).toFixed(1)));
              }
              sails.log.info('Mystifly AirLowFareSearch request time: %s', utils.timeLogGetHr('mystifly'));
              var resArr = [];
              if (err) {
                sails.log.error(err);
                return callback( err, [] );
              } else {
                if (!result.AirLowFareSearchResult.Success ||
                  result.AirLowFareSearchResult.Errors.Error) {
                  sails.log.error(result.AirLowFareSearchResult.Errors.Error);
                  return callback( err, [] );
                }
                if (result.AirLowFareSearchResult.PricedItineraries.PricedItinerary) {
                  var minDuration, maxDuration, minPrice, maxPrice;

                  // Merchandising Fake keys Issue #39
                  var itineraryIds = lodash.map(result.AirLowFareSearchResult.PricedItineraries.PricedItinerary, function (item) {
                    return item.AirItineraryPricingInfo.FareSourceCode
                  });
                  _keysMerchandisingWiFi = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
                  _keysMerchandising1bagfree = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
                  _keysMerchandisingPrioritySeat = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

                  async.map(result.AirLowFareSearchResult.PricedItineraries.PricedItinerary, function (itinerary, doneCb) {
                    var mappedItinerary = mapItinerary(itinerary);
                    resArr.push( mappedItinerary );

                    if (minPrice === undefined || minPrice > parseFloat(mappedItinerary.price)) {
                      minPrice = Math.floor(parseFloat(mappedItinerary.price));
                    }

                    if (maxPrice === undefined || maxPrice < parseFloat(mappedItinerary.price)) {
                      maxPrice = Math.ceil(parseFloat(mappedItinerary.price));
                    }

                    if (minDuration === undefined || minDuration > mappedItinerary.durationMinutes) {
                      minDuration = mappedItinerary.durationMinutes;
                    }
                    if (maxDuration === undefined || maxDuration < mappedItinerary.durationMinutes) {
                      maxDuration = mappedItinerary.durationMinutes;
                    }

                    return doneCb(null);
                  }, function (err) {
                    if ( err ) {
                      sails.log.error( err );
                    }
                    resArr.priceRange = {
                      minPrice: minPrice || 0,
                      maxPrice: maxPrice || 0
                    };
                    resArr.durationRange = {
                      minDuration: minDuration || 0,
                      maxDuration: maxDuration || 0
                    };
                    return callback( null, resArr );
                  });
                }
              }
            });
          }
        });
      }
    });
  }
};
