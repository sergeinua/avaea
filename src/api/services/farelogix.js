/* global memcache */
/* global async */
/* global sails */
var
  util    = require('util'),
  lodash  = require('lodash'),
  ejs     = require('ejs'),
  https   = require('https'),
  x2j     = require('xml2json');

var serviceName = require('path').basename(module.filename, '.js');
var currency = 'USD';

var getEndPoint = function() {
  return [
    'https://',
    sails.config.flightapis.farelogix.post_options.host + ':' + sails.config.flightapis.farelogix.post_options.port,
    sails.config.flightapis.farelogix.post_options.path
  ].join('');
};

var getTc = function() {
  var template = '' +
    '<tc>\
        <iden<% for (var attr in iden) { %> <%=attr%>="<%=iden[attr]%>"<% } %>/>\
        <agent<% for (var attr in agent) { %> <%=attr%>="<%=agent[attr]%>"<% } %>/>\
        <trace><%=trace%></trace>\
        <script<% for (var attr in script) { %> <%=attr%>="<%=script[attr]%>"<% } %>/>\
    </tc>';
  return ejs.render(template, {
    iden: sails.config.flightapis.farelogix.tc.iden,
    agent: sails.config.flightapis.farelogix.tc.agent,
    trace: sails.config.flightapis.farelogix.tc.trace,
    script: sails.config.flightapis.farelogix.tc.script
  });
};

var getFullRq = function(request) {
  var template = '' +
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">\
      <SOAP-ENV:Header>\
        <t:Transaction xmlns:t="xxs">\
          <%-tc%>\
        </t:Transaction>\
      </SOAP-ENV:Header>\
      <SOAP-ENV:Body>\
        <ns1:XXTransaction xmlns:ns1="xxs">\
          <REQ>\
            <%-request%>\
          </REQ>\
        </ns1:XXTransaction>\
      </SOAP-ENV:Body>\
    </SOAP-ENV:Envelope>';
  return ejs.render(template, {
    tc: getTc(),
    request: request
  });
};

var getSearchDestinations = function(params) {
  var cabin = 'Y';
  if (['E', 'B', 'F', 'P'].indexOf(params.CabinClass) != -1) {
    var mapClass = {
      'E': 'Y', // Economy Class
      'B': 'C', // Business Class
      'F': 'F', // First Class
      'P': 'W'  // Premium Economy
    };
    cabin = mapClass[params.CabinClass];
  }
  var template = '' +
    '<OriginDestination>\
      <Departure>\
          <CityCode><%=departure%></CityCode>\
      </Departure>\
      <Arrival>\
          <CityCode><%=arrival%></CityCode>\
      </Arrival>\
      <Date><%=date%></Date>\
      <Preferences MultiAirport="Y">\
        <Cabin><%=cabin%></Cabin>\
      </Preferences>\
    </OriginDestination>';
  var destinations = [];
  destinations.push(ejs.render(template, {
    departure: params.ArrivalLocationCode,
    arrival: params.DepartureLocationCode,
    date: sails.moment(params.departureDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    cabin: cabin
  }));
  if (params.returnDate) {
    destinations.push(ejs.render(template, {
      departure: params.DepartureLocationCode,
      arrival: params.ArrivalLocationCode,
      date: sails.moment(params.returnDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      cabin: cabin
    }));
  }
  return destinations.join('');
};

var farelogixRqGetters = {
  getAirAvailabilityRq: function (guid, params) {
    var template = '' +
      '<AirAvailabilityRQ TransactionIdentifier="<%-guid%>">\
        <%-destinations%>\
        <NumberInParty><%=passengers%></NumberInParty>\
        <% for (var i=1; i<=passengers; i++) { %><TravelerIDs PaxType="ADT" AssociationID="T<%=i%>"/><% } %>\
      </AirAvailabilityRQ>';
    var req = getFullRq(ejs.render(template, {
      guid: guid,
      destinations: getSearchDestinations(params),
      passengers: params.passengers
    }));
    return req;
  },

  getFareSearchRq: function (guid, params) {
    // be careful with BrandedFareSupport attribute, another value will lead to changing response structure
    var template = '' +
      '<FareSearchRQ BrandedFareSupport="Y" TransactionIdentifier="<%-guid%>">\
        <%-destinations%>\
        <TravelerInfo Type="ADT"><%=passengers%></TravelerInfo>\
        <% for (var i=1; i<=passengers; i++) { %><TravelerIDs PaxType="ADT" AssociationID="T<%=i%>"/><% } %>\
        <PricingInfo FareType="BOTH" NoBreak="Y">\
          <PricingCurrency><%=currency%></PricingCurrency>\
        </PricingInfo>\
      </FareSearchRQ>';
    var req = getFullRq(ejs.render(template, {
      guid: guid,
      destinations: getSearchDestinations(params),
      passengers: params.passengers,
      currency: currency
    }));
    return req;
  }
};

var callFarelogixApi = function (api, apiParams, apiCb) {
  api = lodash.upperFirst(api);
  var farelogixRqGetter = 'get' + api + 'Rq';
  if (!api) {
    throw 'api required';
  } else if (!farelogixRqGetters[farelogixRqGetter]) {
    throw 'getter for ' + api + ' does not exist';
  }
  if (!apiCb || typeof(apiCb) != 'function') {
    throw 'callback required and should be a function';
  }
  var request = farelogixRqGetters[farelogixRqGetter].apply(this, apiParams || []);

  var post_options = sails.config.flightapis.farelogix.post_options;
  post_options.headers['Content-Length'] = Buffer.byteLength(request);

  var post_req = https.request(post_options, function(response) {
    var body = '';

    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      try {
        bodyJson = x2j.toJson(body, {
          object: true
        });
      } catch(err) {
        return apiCb(err, {}, body);
      }
      if (err = bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault']) {
        throw err['faultstring'];
      }
      if (lodash.isEmpty(bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP'][api + 'RS'])) {
        throw api + 'RS does not exist';
      }
      return apiCb(null, bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP'][api + 'RS'], body);
    });
  });

  post_req.write(request);
  post_req.end();
};

var _jorneyTimeToMinutes = function (jt) {
  jt = jt.split(':');
  return parseInt(jt[0])*60 + parseInt(jt[1]);
};

var mapIntermediateStops = function (stops) {
  var res = {
    stops: [],
    stopsDurationMinutes: 0
  };
  for (var i = 0; i < stops.length; i++) {
    var stop = stops[i];
    var cpStopDuration = sails.moment.duration(
      sails.moment(stop.DepartureDate + ' ' + stop.DepartureTime).diff(stop.ArrivalDate + ' ' + stop.ArrivalTime)
    ).asMinutes();
    var mappedStop = {
      code: stop.locationCode,
      begin: {
        date: stop.ArrivalDate,
        time: sails.moment(stop.ArrivalTime, 'HH:mm').format('hh:mma').slice(0, -1)
      },
      end: {
        date: stop.DepartureDate,
        time: sails.moment(stop.DepartureTime, 'HH:mm').format('hh:mma').slice(0, -1)
      },
      duration: utils.minutesToDuration(cpStopDuration),
      durationMinutes: cpStopDuration
    };
    res.stopsDurationMinutes += mappedStop.durationMinutes;
    res.stops.push( mappedStop );
  }
  return res;
};

var mapFlights = function(flights, priceSettings) {
  var res = {
    flights: [],
    pathFlights: [],
    path: [],
    stops: [],
    stopsCodes: [],
    stopsDurationMinutes: 0
  };
  var mapReverseClass = {
    'Y': 'E', // Economy Class
    'C': 'B', // Business Class
    'F': 'F', // First Class
    'W': 'P'  // Premium Economy
  };
  for (var j=0; j < flights.length; j++) {
    var flight = flights[j];

    if (j>0) {
      // fill the citypair stops
      var cpStopDuration = sails.moment.duration(
        sails.moment(flight.Departure.Date + ' ' + flight.Departure.Time).diff(flights[j-1].Arrival.Date + ' ' + flights[j-1].Arrival.Time)
      ).asMinutes();
      res.stopsCodes.push(flight.Departure.AirportCode.toUpperCase());
      res.stops.push({
        code: flight.Departure.AirportCode.toUpperCase(),
        begin: {
          date: flights[j-1].Arrival.Date,
          time: flights[j-1].Arrival.Time
        },
        end: {
          date: flight.Departure.Date,
          time: flight.Departure.Time
        },
        duration: utils.minutesToDuration(cpStopDuration),
        durationMinutes: cpStopDuration
      });
      res.stopsDurationMinutes += cpStopDuration;
    }

    var mappedFlight = {
      number: flight.Carrier.FlightNumber,
      abbrNumber: flight.Carrier.AirlineCode.toUpperCase() + flight.Carrier.FlightNumber,
      from: {
        code: flight.Departure.AirportCode,
        date: flight.Departure.Date,
        time: sails.moment(flight.Departure.Time, 'HH:mm').format('hh:mma').slice(0, -1)
      },
      to: {
        code: flight.Arrival.AirportCode,
        date: flight.Arrival.Date,
        time: sails.moment(flight.Arrival.Time, 'HH:mm').format('hh:mma').slice(0, -1)
      },
      duration: utils.minutesToDuration(_jorneyTimeToMinutes(flight.FlightDuration)),
      durationMinutes: _jorneyTimeToMinutes(flight.FlightDuration),
      bookingClass: priceSettings[j].ClassOfService,
      cabinClass: mapReverseClass[priceSettings[j].Cabin],
      airline: flight.Carrier.AirlineName,
      airlineCode: flight.Carrier.AirlineCode.toUpperCase(),
      noOfStops: flight.NumberOfStops || 0,
      stopsDuration: '',
      stopsDurationMinutes: 0,
      stops: [],
      merchandising: [] // Merchandising Fake data Issue #39
    };
    if (flight.StopInformation) {
      if (!lodash.isArray(flight.StopInformation)) {
        flight.StopInformation = [flight.StopInformation];
      }
      mappedFlight.noOfStops = flight.StopInformation.length;

      var mStops = mapIntermediateStops(flight.StopInformation);
      mappedFlight.stops = mStops.stops;
      mappedFlight.stopsDurationMinutes = mStops.stopsDurationMinutes;
      mappedFlight.stopsDuration = utils.minutesToDuration(mappedFlight.stopsDurationMinutes);
      res.stopsDurationMinutes += mappedFlight.stopsDurationMinutes;
    }
    res.flights.push( mappedFlight );

    // prepare paths
    res.path.push(mappedFlight.from.code.toUpperCase());
    res.pathFlights.push(mappedFlight.abbrNumber);
    // push last node of path
    if (j > 0 && j == flights.length - 1) {
      res.path.push(mappedFlight.from.code.toUpperCase());
      res.pathFlights.push(mappedFlight.abbrNumber);
    }
  }
  return res;
};

var mapCitypairs = function(citypairs) {
  var res = {
    price: 0,
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };
  for (var i=0; i < citypairs.length; i++) {
    var currentDurationArr = [];
    var pair = citypairs[i];
    if (!pair.PriceGroup) {
      throw 'Wrong response format. No PriceGroup was found in flight';
    }
    if (!lodash.isArray(pair.PriceGroup.PriceClass)) {
      pair.PriceGroup.PriceClass = [pair.PriceGroup.PriceClass];
    }
    for (var pc = 0; pc < pair.PriceGroup.PriceClass.length; pc++) {
      if (!lodash.isArray(pair.PriceGroup.PriceClass[pc].PriceSegment)) {
        pair.PriceGroup.PriceClass[pc].PriceSegment = [pair.PriceGroup.PriceClass[pc].PriceSegment];
      }
    }
    res.price += parseInt(pair.PriceGroup.PriceClass[0].Price.Total) / Math.pow(10, parseInt(pair.CurrencyCode.NumberOfDecimals));
    if (!lodash.isArray(pair.Segment)) {
      pair.Segment = [pair.Segment];
    }
    var from = pair.Segment[0];
    from.Departure.DateTime = from.Departure.Date + ' ' + from.Departure.Time;
    var to = pair.Segment[pair.Segment.length-1];
    to.Arrival.DateTime = to.Arrival.Date + ' ' + to.Arrival.Time;
    var mappedPair = {
      direction: i==0 ? 'Depart' : 'Return',
      from: {
        code: from.Departure.AirportCode.toUpperCase(),
        date: from.Departure.Date,
        time: sails.moment(from.Departure.Time, 'HH:mm').format('hh:mma').slice(0, -1),
        quarter: Math.floor(parseInt(sails.moment(from.Departure.DateTime).format('H'))/6)+1,
        airlineCode: from.Carrier.AirlineCode.toUpperCase(),
        airline: from.Carrier.AirlineName,
        minutes: sails.moment.duration(
          sails.moment(from.Departure.DateTime).diff(sails.moment(from.Departure.DateTime).format('YYYY-MM-DD'))
        ).asMinutes()
      },
      to: {
        code: to.Arrival.AirportCode.toUpperCase(),
        date: to.Arrival.Date,
        time: sails.moment(to.Arrival.Time, 'HH:mm').format('hh:mma').slice(0, -1),
        quarter: Math.floor(parseInt(sails.moment(to.Arrival.DateTime).format('H'))/6)+1,
        airlineCode: to.Carrier.AirlineCode.toUpperCase(),
        airline: to.Carrier.AirlineName,
        minutes: sails.moment.duration(
          sails.moment(to.Arrival.DateTime).diff(sails.moment(to.Arrival.DateTime).format('YYYY-MM-DD'))
        ).asMinutes()
      },
      duration: utils.minutesToDuration(_jorneyTimeToMinutes(pair.JourneyTime)),
      durationMinutes: _jorneyTimeToMinutes(pair.JourneyTime),
      noOfStops: 0,
      stopsDurationMinutes: 0,
      stopsDuration: '',
      stopsCodes: [],
      stops: [],
      path: [],
      flights: [],
      pathFlights: []
    };
    res.durationMinutes += mappedPair.durationMinutes;

    var mFlights = mapFlights(pair.Segment, pair.PriceGroup.PriceClass[0].PriceSegment);
    mappedPair.noOfStops = mFlights.stops.length;
    mappedPair.stopsDurationMinutes = mFlights.stopsDurationMinutes;
    mappedPair.stopsDuration = utils.minutesToDuration(mappedPair.stopsDurationMinutes);
    mappedPair.stopsCodes = mFlights.stopsCodes;
    mappedPair.stops = mFlights.stops;
    mappedPair.path = mFlights.path;
    mappedPair.flights = mFlights.flights;
    mappedPair.pathFlights = mFlights.pathFlights;

    res.citypairs.push( mappedPair );

    res.key += '|' + mappedPair.pathFlights.join(',');
  }
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
    id: itinerary.ItineraryId,
    service: serviceName,
    currency: currency,
    price: 0,
    duration: '',
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };

  var mCitypairs = mapCitypairs(itinerary);
  res.price = mCitypairs.price.toFixed(2);
  res.duration = utils.minutesToDuration(mCitypairs.durationMinutes);
  res.durationMinutes = mCitypairs.durationMinutes;
  res.citypairs = mCitypairs.citypairs;
  res.key = mCitypairs.key;

  // Merchandising Fake data Issue #39
  if (lodash.isArray(_keysMerchandisingWiFi) && lodash.indexOf(_keysMerchandisingWiFi, itinerary.ItineraryId) != -1) {
    mapMerchandising(res.citypairs, 'WiFi');
  }
  if (lodash.isArray(_keysMerchandising1bagfree) && lodash.indexOf(_keysMerchandising1bagfree, itinerary.ItineraryId) != -1) {
    mapMerchandising(res.citypairs, '1st bag free');
  }
  if (lodash.isArray(_keysMerchandisingPrioritySeat) && lodash.indexOf(_keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
    mapMerchandising(res.citypairs, 'Priority seat');
  }
  if (lodash.isArray(_keysMerchandisingPrioritySeat) && lodash.indexOf(_keysMerchandisingPrioritySeat, itinerary.ItineraryId) != -1) {
    mapMerchandising(res.citypairs, 'Lounge');
  }

  return res;
};

module.exports = {
  flightSearch: function(guid, params, callback) {
    var
      _api_name = serviceName + '.flightSearch',
      farelogixApi = 'fareSearch';

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    var _cb = callback;
    callback = function (errors, resArr) {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return _cb(errors, resArr);
    };

    memcache.init(function(){});

    var endPoint = getEndPoint();
    sails.log.info(_api_name + ': Trying to connect to ' + endPoint);
    var op = _api_name + ': ' + farelogixApi;
    utils.timeLog(op);
    callFarelogixApi(farelogixApi, [guid, params.searchParams], function (err, result, raw) {
      try {
        var
          apiCallTime = utils.timeLogGet(op),
          apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
        if (apiCallTime > 7000) {
          params.session.time_log.push(op + ' took %s to respond', apiCallTimeHr);
        }
        sails.log.info(op + ' request time: %s', apiCallTimeHr);
        if (err) {
          throw err;
        } else {
          var resArr = [], errors = null;
          if (result.InfoGroup && (errors = result.InfoGroup.Error)) {
            if (!lodash.isArray(errors)) {
              errors = [errors];
            }
            var errtxt = [];
            for (var i = 0; i < errors.length; i++) {
              errtxt.push('(' + errors[i].Code + ') ' + errors[i].Text);
            }
            errors = errtxt.join('; ');
            throw errors;
          } else {
            utils.timeLog(_api_name + '_prepare_result');
            if (!result.FareGroup) {
              throw 'No results found';
            }
            if (!lodash.isArray(result.FareGroup)) {
              result.FareGroup = [result.FareGroup];
            }
            var
              flights = [];
            // prepare data for mapping
            for (var fg = 0; fg < result.FareGroup.length; fg++) {
              if (!lodash.isArray(result.FareGroup[fg].OriginDestination)) {
                result.FareGroup[fg].OriginDestination = [result.FareGroup[fg].OriginDestination];
              }
              for (var od = 0; od < result.FareGroup[fg].OriginDestination.length; od++) {
                if (!lodash.isArray(result.FareGroup[fg].OriginDestination[od].Flight)) {
                  result.FareGroup[fg].OriginDestination[od].Flight = [result.FareGroup[fg].OriginDestination[od].Flight];
                }
                for (var fl = 0; fl < result.FareGroup[fg].OriginDestination[od].Flight.length; fl++) {
                  result.FareGroup[fg].OriginDestination[od].Flight[fl].CurrencyCode = result.FareGroup[fg].CurrencyCode;
                }
                flights.push(result.FareGroup[fg].OriginDestination[od].Flight);
              }
            }
            // get all combination of flights
            var itineraries = utils.cartesianProductOf.apply(null, flights);
            // generate ItinerariesIds
            for (var it = 0; it < itineraries.length; it++) {
              itineraries[it].ItineraryId = guid + '-itin-' + (it+1);
            }

            // Merchandising Fake keys Issue #39
            var itineraryIds = lodash.map(itineraries, 'ItineraryId');
            _keysMerchandisingWiFi = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
            _keysMerchandising1bagfree = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
            _keysMerchandisingPrioritySeat = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

            async.map(itineraries, function (itinerary, doneCb) {

              var mappedItinerary = mapItinerary(itinerary);
              resArr.push( mappedItinerary );

              return doneCb(null);
            }, function (err) {
              if ( err ) {
                sails.log.error( err );
              }
              sails.log.info(_api_name + ': Map result data (%d itineraries) to our structure time: %s', resArr.length, utils.timeLogGetHr(_api_name + '_prepare_result'));
              return callback(errors, resArr);
            });
          }
        }
      } catch (e) {
        sails.log.error(op + ': An error occurs: ' + e);
        return callback(e, []);
      }
    });
  },

  /**
   * Itinerary booking
   *
   * @param {string} guid Own request id
   * @param {object} params Corresponding to http://developer.trippro.com/xwiki/bin/view/Developer+Network/Flight+Booking+API
   * @param {function} callback
   */
  flightBooking: function(guid, params, callback) {

  }
};
