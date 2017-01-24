/* global async */
/* global sails */
const
  util    = require('util'),
  lodash  = require('lodash'),
  ejs     = require('ejs'),
  https   = require('https'),
  x2j     = require('xml2json');

const serviceName = require('path').basename(module.filename, '.js');
const currency = 'USD';

const getEndPoint = function() {
  return [
    'https://',
    sails.config.flightapis.farelogix.post_options.host + ':' + sails.config.flightapis.farelogix.post_options.port,
    sails.config.flightapis.farelogix.post_options.path
  ].join('');
};

const getTc = function() {
  let template = '' +
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

const getFullRq = function(request) {
  let template = '' +
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

const getSearchDestinations = function(params) {
  let cabin = 'Y';
  if (['E', 'B', 'F', 'P'].indexOf(params.CabinClass) != -1) {
    let mapClass = {
      'E': 'Y', // Economy Class
      'B': 'C', // Business Class
      'F': 'F', // First Class
      'P': 'W'  // Premium Economy
    };
    cabin = mapClass[params.CabinClass];
  }
  let template = '' +
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
  let destinations = [];
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

const getPNRFlights = function(params, numberInParty) {
  let template = '' +
    '<Flight AssociationID="F<%=aid%>" OriginDestinationID="O<%=oid%>" Source="<%=source%>">\
      <Departure>\
          <AirportCode><%=departure.code%></AirportCode>\
          <Date><%=departure.date%></Date>\
          <Time><%=departure.time%></Time>\
      </Departure>\
      <Arrival>\
          <AirportCode><%=arrival.code%></AirportCode>\
          <Date><%=arrival.date%></Date>\
          <Time><%=arrival.time%></Time>\
      </Arrival>\
    <Carrier>\
      <AirlineCode><%=airline%></AirlineCode>\
      <FlightNumber><%=flightNumber%></FlightNumber>\
    </Carrier>\
    <ClassOfService><%=cls%></ClassOfService>\
    <NumberInParty><%=numberInParty%></NumberInParty>\
    <FareRefKey><%=fareKey%></FareRefKey>\
  </Flight>';
  let flights = [], aId = 1, oId = 1;
  for (let cp = 0; cp < params.length; cp++) {
    for (let fl = 0; fl < params[cp].flights.length; fl++) {
      flights.push(ejs.render(template, {
        departure: {
          code: params[cp].flights[fl].from.code,
          date: sails.moment(params[cp].flights[fl].from.date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          time: sails.moment(params[cp].flights[fl].from.time + 'm', 'hh:mma').format('HH:mm'),
        },
        arrival: {
          code: params[cp].flights[fl].to.code,
          date: sails.moment(params[cp].flights[fl].to.date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          time: sails.moment(params[cp].flights[fl].to.time + 'm', 'hh:mma').format('HH:mm'),
        },
        airline: params[cp].flights[fl].airlineCode,
        flightNumber: params[cp].flights[fl].number,
        cls: params[cp].flights[fl].bookingClass,
        fareKey: params[cp].flights[fl].fareRefKey,
        aid: aId,
        oid: oId,
        source: params[cp].flights[fl].source,
        numberInParty: numberInParty
      }));
      aId++;
    }
    oId++;
  }
  return flights.join('');
};

const getTravelers = function (passengers) {
  let template = '' +
    '<Traveler AssociationID="T<%=index%>" Type="<%=type%>">\
      <TravelerName>\
        <Surname><%=lastName%></Surname>\
        <GivenName><%=firstName%></GivenName>\
        <DateOfBirth><%=birthday%></DateOfBirth>\
        <Gender><%=gender%></Gender>\
      </TravelerName>\
    </Traveler>\
    ';
  let travelers = [];
  for (let i=0; i<passengers.length; i++) {
    let d_birth = sails.moment(passengers[i].DateOfBirth);
    let paxType = 'ADT',
      age = sails.moment().diff(d_birth, 'years');
    if (age < 2) {
      // less than 2
      paxType = 'INS'; // Infant occupying seat
    }
    else if (age < 12) {
      // between and including 2 and 11
      paxType = 'CHD';
    }

    travelers.push(ejs.render(template, {
      type: paxType,
      lastName: passengers[i].LastName,
      firstName: passengers[i].FirstName,
      birthday: d_birth.format('YYYY-MM-DD'),
      gender: passengers[i].Gender,
      index: i
    }));
  }
  return travelers.join('');
};

const farelogixRqGetters = {
  getAirAvailabilityRq: function (guid, params) {
    let template = '' +
      '<AirAvailabilityRQ TransactionIdentifier="<%-guid%>">\
        <%-destinations%>\
        <NumberInParty><%=passengers%></NumberInParty>\
        <% for (var i=1; i<=passengers; i++) { %><TravelerIDs PaxType="ADT" AssociationID="T<%=i%>"/><% } %>\
      </AirAvailabilityRQ>';
    let req = getFullRq(ejs.render(template, {
      guid: guid,
      destinations: getSearchDestinations(params),
      passengers: params.passengers
    }));
    return req;
  },

  getFareSearchRq: function (guid, params) {
    // be careful with BrandedFareSupport attribute, another value will lead to changing response structure
    let template = '' +
      '<FareSearchRQ BrandedFareSupport="N" TransactionIdentifier="<%-guid%>">\
        <%-destinations%>\
        <TravelerInfo Type="ADT"><%=passengers%></TravelerInfo>\
        <% for (var i=1; i<=passengers; i++) { %><TravelerIDs PaxType="ADT" AssociationID="T<%=i%>"/><% } %>\
        <PricingInfo FareType="BOTH" NoBreak="Y">\
          <PricingCurrency><%=currency%></PricingCurrency>\
        </PricingInfo>\
      </FareSearchRQ>';
    let req = getFullRq(ejs.render(template, {
      guid: guid,
      destinations: getSearchDestinations(params),
      passengers: params.passengers,
      currency: currency
    }));
    return req;
  },

  getPNRCreateRq: function (guid, params) {
    // be careful with BrandedFareSupport attribute, another value will lead to changing response structure
    let template = '' +
      '<PNRCreateRQ TransactionIdentifier="<%-guid%>">\
        <CompletePNRElements>\
          <Itinerary>\
            <%-flights%>\
          </Itinerary>\
          <%-travelers%>\
        </CompletePNRElements>\
        <OtherPNRElements>\
          <EmailAddress>\
            <Email><%=email%></Email>\
          </EmailAddress>\
          <BillingAndDeliveryData>\
            <FormOfPayment>\
            <CreditCard>\
              <CCCode><%=cc.code%></CCCode>\
              <CCNumber><%=cc.number%></CCNumber>\
              <CCExpiration>\
                <Month><%=cc.expiration.month%></Month>\
                <Year><%=cc.expiration.year%></Year>\
              </CCExpiration>\
              <SecurityID><%=cc.cvv%></SecurityID>\
              <CardholderFirstName><%=cc.firstName%></CardholderFirstName>\
              <CardholderLastName><%=cc.lastName%></CardholderLastName>\
              <CardholderFullName><%=cc.fullName%></CardholderFullName>\
            </CreditCard>\
            </FormOfPayment>\
          </BillingAndDeliveryData>\
        </OtherPNRElements>\
        <EndTransaction IgnoreWarnings="Y" TransactionType="ER"/>\
      </PNRCreateRQ>';
    let req = getFullRq(ejs.render(template, {
      guid: guid,
      flights: getPNRFlights(params.booking_itinerary.citypairs, params.passengers.length),
      cc: {
        code: params.CardType,
        number: params.CardNumber,
        expiration: {
          month: params.ExpiryDate.split('/')[0],
          year: params.ExpiryDate.split('/')[1]
        },
        cvv: params.CVV,
        firstName: params.FirstName,
        lastName: params.LastName,
        fullName: params.FirstName + ' ' + params.LastName // TODO: not sure we don't need a separated field for it
      },
      travelers: getTravelers(params.passengers),
      email: params.user.email
    }));
    return req;
  }
};

const callFarelogixApi = function (api, apiParams, apiCb) {
  api = lodash.upperFirst(api);
  let farelogixRqGetter = 'get' + api + 'Rq';
  if (!api) {
    throw 'api required';
  } else if (!farelogixRqGetters[farelogixRqGetter]) {
    throw 'getter for ' + api + ' does not exist';
  }
  if (!apiCb || typeof(apiCb) != 'function') {
    throw 'callback required and should be a function';
  }
  let request = farelogixRqGetters[farelogixRqGetter].apply(this, apiParams || []);
  sails.log.info(util.inspect(request, {showHidden: true, depth: null}));

  let post_options = sails.config.flightapis.farelogix.post_options;
  post_options.headers['Content-Length'] = Buffer.byteLength(request);

  let post_req = https.request(post_options, function(response) {
    let body = '';

    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      try {
        let bodyJson = x2j.toJson(body, {
          object: true
        });
        if( lodash.isEmpty(bodyJson['SOAP-ENV:Envelope']) || lodash.isEmpty(bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']) ) {
          throw api + " returned malformed result: " + body;
        }
        if (err = bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault']) {
          throw err['faultstring'];
        }
        let apiRs = api;
        if (api == 'PNRCreate') {
          apiRs = 'PNRView';
        }
        if (lodash.isEmpty(bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP'][apiRs + 'RS'])) {
          throw apiRs + 'RS does not exist';
        }
        return apiCb(null, bodyJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP'][apiRs + 'RS'], body);
      } catch(err) {
        return apiCb(err, {}, body);
      }
    });
  });

  post_req.write(request);
  post_req.end();
};

const _jorneyTimeToMinutes = function (jt) {
  jt = jt.split(':');
  return parseInt(jt[0])*60 + parseInt(jt[1]);
};

const mapIntermediateStops = function (stops) {
  let res = {
    stops: [],
    stopsDurationMinutes: 0
  };
  for (let i = 0; i < stops.length; i++) {
    let stop = stops[i];
    let cpStopDuration = sails.moment.duration(
      sails.moment(stop.DepartureDate + ' ' + stop.DepartureTime).diff(stop.ArrivalDate + ' ' + stop.ArrivalTime)
    ).asMinutes();
    let mappedStop = {
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

const mapFlights = function(flights, priceSettings) {
  let res = {
    flights: [],
    pathFlights: [],
    path: [],
    stops: [],
    stopsCodes: [],
    stopsDurationMinutes: 0
  };
  let mapReverseClass = {
    'Y': 'E', // Economy Class
    'C': 'B', // Business Class
    'F': 'F', // First Class
    'W': 'P'  // Premium Economy
  };
  for (let j=0; j < flights.length; j++) {
    let flight = flights[j];

    if (j>0) {
      // fill the citypair stops
      let cpStopDuration = sails.moment.duration(
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

    let mappedFlight = {
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
      fareRefKey: priceSettings[j].FareRefKey,
      source: priceSettings[j].Source,
      odId: priceSettings[j].OriginDestinationID,
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

      let mStops = mapIntermediateStops(flight.StopInformation);
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

const mapCitypairs = function(citypairs) {
  let res = {
    price: 0,
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };
  for (let i=0; i < citypairs.length; i++) {
    let currentDurationArr = [];
    let pair = citypairs[i];
    if (!pair.PriceGroup) {
      throw 'Wrong response format. No PriceGroup was found in flight';
    }
    res.price += parseInt(pair.PriceGroup.PriceClass[0].Price.Total) / Math.pow(10, parseInt(pair.CurrencyCode.NumberOfDecimals));
    if (!lodash.isArray(pair.Segment)) {
      pair.Segment = [pair.Segment];
    }
    let from = pair.Segment[0];
    from.Departure.DateTime = from.Departure.Date + ' ' + from.Departure.Time;
    let to = pair.Segment[pair.Segment.length-1];
    to.Arrival.DateTime = to.Arrival.Date + ' ' + to.Arrival.Time;
    let mappedPair = {
      direction: i==0 ? 'Depart' : 'Return',
      from: {
        code: from.Departure.AirportCode.toUpperCase(),
        date: from.Departure.Date,
        time: sails.moment(from.Departure.Time, 'HH:mm').format('hh:mma').slice(0, -1),
        quarter: utils.calculateDayTimeQuarter(from.Departure.DateTime),
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
        quarter: utils.calculateDayTimeQuarter(to.Arrival.DateTime),
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

    let mFlights = mapFlights(pair.Segment, pair.PriceGroup.PriceClass[0].PriceSegment);
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
let _keysMerchandisingWiFi, _keysMerchandising1bagfree, _keysMerchandisingPrioritySeat;
const mapMerchandising = function (citypairs, val) {
  let _cityPairKey = ((citypairs.length > 1) ? lodash.random(0, citypairs.length - 1) : 0),
    _flightKey = ((citypairs[_cityPairKey].flights.length > 1) ? lodash.random(0, citypairs[_cityPairKey].flights.length - 1) : 0);

  citypairs[_cityPairKey].flights[_flightKey].merchandising.push(val);
};

const mapItinerary = function(itinerary) {
  let res = {
    id: itinerary.ItineraryId,
    service: serviceName,
    currency: currency,
    price: 0,
    duration: '',
    durationMinutes: 0,
    citypairs: [],
    key: ''
  };

  let mCitypairs = mapCitypairs(itinerary);
  res.price = mCitypairs.price.toFixed(2);
  res.duration = utils.minutesToDuration(mCitypairs.durationMinutes);
  res.durationMinutes = mCitypairs.durationMinutes;
  res.citypairs = mCitypairs.citypairs;
  res.key = mCitypairs.key;
  // Set itinerary cabin class as value from the first flight at this moment
  res.cabinClass = (res.citypairs && res.citypairs[0].flights) ? res.citypairs[0].flights[0].cabinClass : '';

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
    let
      _api_name = serviceName + '.flightSearch',
      farelogixApi = 'fareSearch';

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    let _cb = callback;
    callback = function (errors, resArr) {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return _cb(errors, resArr);
    };

    let endPoint = getEndPoint();
    sails.log.info(_api_name + ': Trying to connect to ' + endPoint);
    let op = _api_name + ': ' + farelogixApi;
    utils.timeLog(op);
    callFarelogixApi(farelogixApi, [guid, params.searchParams], function (err, result, raw) {
      try {
        let
          apiCallTime = utils.timeLogGet(op),
          apiCallTimeHr = utils.durationHr(apiCallTime, 'm', 's');
        if (apiCallTime > 7000) {
          params.session.time_log.push(op + ' took %s to respond', apiCallTimeHr);
        }
        sails.log.info(op + ' request time: %s', apiCallTimeHr);
        if (err) {
          throw err;
        } else {
          let resArr = [], errors = null;
          if (result.InfoGroup && (errors = result.InfoGroup.Error)) {
            if (!lodash.isArray(errors)) {
              errors = [errors];
            }
            let errtxt = [];
            for (let i = 0; i < errors.length; i++) {
              errtxt.push('(' + errors[i].Code + ') ' + errors[i].Text);
            }
            errors = errtxt.join('; ');
            throw errors;
          } else {
            utils.timeLog(_api_name + '_prepare_result');
            if (!result.FareGroup) {
              // No Results Found
              return callback(null, []);
            }
            let isBrandedFareGroup = (result.FareGroup.TotalHighestPrice && result.FareGroup.TotalLowestPrice);

            if (!lodash.isArray(result.FareGroup)) {
              result.FareGroup = [result.FareGroup];
            }
            let itineraries = [];
            // prepare data for mapping
            for (let fg = 0; fg < result.FareGroup.length; fg++) {
              if (!isBrandedFareGroup) {
                /* convert element to array */
                if (!lodash.isArray(result.FareGroup[fg].TravelerGroup.FareRules.FareInfo)) {
                  result.FareGroup[fg].TravelerGroup.FareRules.FareInfo = [result.FareGroup[fg].TravelerGroup.FareRules.FareInfo];
                }
              }
              let flights = [];
              /* convert element to array */
              if (!lodash.isArray(result.FareGroup[fg].OriginDestination)) {
                result.FareGroup[fg].OriginDestination = [result.FareGroup[fg].OriginDestination];
              }
              for (let od = 0; od < result.FareGroup[fg].OriginDestination.length; od++) {
                /* convert element to array */
                if (!lodash.isArray(result.FareGroup[fg].OriginDestination[od].Flight)) {
                  result.FareGroup[fg].OriginDestination[od].Flight = [result.FareGroup[fg].OriginDestination[od].Flight];
                }
                for (let fl = 0; fl < result.FareGroup[fg].OriginDestination[od].Flight.length; fl++) {
                  result.FareGroup[fg].OriginDestination[od].Flight[fl].CurrencyCode = result.FareGroup[fg].CurrencyCode;
                  if (!isBrandedFareGroup) {
                    /* convert element to array */
                    if (!lodash.isArray(result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment)) {
                      result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment = [result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment];
                    }
                    // add FareRefKey to RelatedSegments
                    for (let rs = 0; rs < result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment.length; rs++) {
                      result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment[rs].FareRefKey = result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].FareRefKey;
                    }
                    result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup = {
                      PriceClass: {
                        Price: {
                          Total: result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].FareComponent.Total
                        },
                        PriceSegment: result.FareGroup[fg].TravelerGroup.FareRules.FareInfo[od].RelatedSegment
                      }
                    };
                  }
                  if (!lodash.isArray(result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass)) {
                    result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass = [result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass];
                  }
                  for (let pc = 0; pc < result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass.length; pc++) {
                    /* convert element to array */
                    if (!lodash.isArray(result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment)) {
                      result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment = [result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment];
                    }
                    // add Source and OriginDestinationID to PriceSegment
                    for (let ps = 0; ps < result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment.length; ps++) {
                      result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment[ps].Source = result.FareGroup[fg].Source;
                      result.FareGroup[fg].OriginDestination[od].Flight[fl].PriceGroup.PriceClass[pc].PriceSegment[ps].OriginDestinationID = od+1;
                    }
                  }

                }
                flights.push(result.FareGroup[fg].OriginDestination[od].Flight);
              }
              // get all combination of flights for current group
              let groupItineraries = utils.cartesianProductOf.apply(null, flights);
              itineraries = lodash.concat(itineraries, groupItineraries);
            }
            // generate ItinerariesIds
            for (let it = 0; it < itineraries.length; it++) {
              itineraries[it].ItineraryId = guid + '-itin-' + (it+1);
            }

            // Merchandising Fake keys Issue #39
            let itineraryIds = lodash.map(itineraries, 'ItineraryId');
            _keysMerchandisingWiFi = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 50 / 100) );
            _keysMerchandising1bagfree = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 75 / 100) );
            _keysMerchandisingPrioritySeat = lodash.sampleSize( lodash.shuffle(itineraryIds), Math.round(itineraryIds.length * 25 / 100) );

            async.map(itineraries, function (itinerary, doneCb) {

              let mappedItinerary = mapItinerary(itinerary);
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
        sails.log.error(op + ': An error occurs: ' + e + ',raw='+raw);
        // Assume 'International Flights Searches are restricted' and 'No Schedule availability' errors
        // are the same as 'No Results Found' error
        let no_flights_errors = [
          'International Flights Searches are restricted',
          'No Schedule availability',
          'Date should be (within|between|(greater|lesser) than)' // temporary as 'No Results Found' error due to only 2 errors type we show for end user
        ];
        if (typeof err == 'string' && err.match(new RegExp('(' + no_flights_errors.join('|') + ')', 'gi'))) {
          e = null;
        }
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
    let
      _api_name = serviceName + '.flightBooking',
      farelogixApi = 'PNRCreate';

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    let _cb = callback;
    callback = function (errors, result) {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return _cb(errors, result);
    };

    let endPoint = getEndPoint();
    sails.log.info(_api_name + ': Trying to connect to ' + endPoint);
    let op = _api_name + ': ' + farelogixApi;
    utils.timeLog(op);
    callFarelogixApi(farelogixApi, [guid, params], function (err, result, raw) {
      try {
        if (result.InfoGroup && (errors = result.InfoGroup.Error)) {
          if (!lodash.isArray(errors)) {
            errors = [errors];
          }
          let errtxt = [];
          for (let i = 0; i < errors.length; i++) {
            errtxt.push('(' + errors[i].Code + ') ' + errors[i].Text);
          }
          errors = errtxt.join('; ');
          throw errors;
        } else {
          return callback(null, {
            ReferenceNumber: '',
            PNR: result.PNRIdentification.RecordLocator
          });
        }
      } catch (e) {
        sails.log.error(op + ': An error occurs: ' + e);
        return callback(e, null);
      }
    });
  },
  readEticket: function(guid, params, callback) {
    // TODO: not implemented return fake data for cron
    return callback(null, params.pnr);
  },


  /**
   * Cancel booked itinerary by PNR
   *
   * @param {string} guid Own request id
   * @param {object} params {PNR: value}. Corresponding to http://developer.trippro.com/xwiki/bin/view/Developer+Network/Cancel+PNR+API
   * @param {function} callback
   */
  cancelPnr: function(guid, params, callback) {
    let
      _api_name = serviceName + '.cancelPnr',
      farelogixApi = 'cancelPnr';

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    let _cb = callback;
    callback = function (errors, result) {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return _cb(errors, result);
    };

    return callback('Not implemented.', null);
  },

  fareRules: function (guid, params, callback) {
    let
      _api_name = serviceName + '.fareRules',
      farelogixApi = 'fareRules';

    utils.timeLog(_api_name);
    sails.log.info(_api_name + ' started');
    // re-init callback for adding final measure of api processing time and show info in log
    let _cb = callback;
    callback = function (errors, result) {
      sails.log.info(_api_name + ' processing time: %s', utils.timeLogGetHr(_api_name));
      return _cb(errors, result);
    };

    return callback('Not implemented.', null);
  }
};
