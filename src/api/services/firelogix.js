/* global memcache */
/* global async */
/* global sails */
var libxmljs = require('libxmljs');

var getEndPoint = function() {
  return sails.config.flightapis.farelogix.endPoint;
};

var getBaseRq = function(id) {
  var xml = new libxmljs.parseXmlString(
    `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
    <SOAP-ENV:Header>
  <t:Transaction xmlns:t="xxs">
    <tc/>
    </t:Transaction>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  <ns1:XXTransaction xmlns:ns1="xxs">
    <REQ/>
    </ns1:XXTransaction>
  </SOAP-ENV:Body>
  </SOAP-ENV:Envelope>`
  );
  return ;
};

var getFlightSearchRq = function(id, params) {
  var req = getBaseRq(id);
  // minimum requirements for search request
  req.FlightSearchRequest = {
    OriginDestination: [{
      DepartureLocationCode: params.DepartureLocationCode,
      DepartureTime: params.DepartureTime,
      ArrivalLocationCode: params.ArrivalLocationCode
    }]
  };
  // add return OriginDestination if we have return date
  if (params.returnDate) {
    req.FlightSearchRequest.OriginDestination.push({
      DepartureLocationCode: params.ArrivalLocationCode,
      DepartureTime: params.returnDate,
      ArrivalLocationCode: params.DepartureLocationCode
    });
  }
  // set the same CabinClass for all OriginDestination elements
  if (['E','B','F','P'].indexOf(params.CabinClass) != -1) {
    req.FlightSearchRequest.OriginDestination.forEach(function(val) {
      val.CabinClass = params.CabinClass;
    });
  }
  return req;
};

//var soap = require('soap');

module.exports = {
  flightSearch: function(guid, params, callback) {
    memcache.init();

    var wsdlUrl = getWsdlUrl('flightSearch');
    sails.log.info('SOAP: Trying to connect to ' + wsdlUrl);
    soap.createClient(wsdlUrl, function(err, client) {
      if (err) {
        sails.log.error("SOAP: An error occurs:\n" + err);
        return callback([]);
      } else {
        var req = getFlightSearchRq(guid, params);

        return client.FlightSearch(args, function(err, result, raw, soapHeader) {
          var resArr = [];
          if (err) {
            sails.log.error(err);
            return callback(resArr);
          } else {
            //
          }
        });
      }
    });
  },

  //cache results functionality
  searchResultKeys: [],
  cache: function (value) {
    var id = 'itinerary_' + value.id.replace(/\W+/g, '_');
    this.searchResultKeys.push(id);
    memcache.store(id, value);
  },
  cacheSearch: function (searchId) {
    var id = 'search_' + searchId.replace(/\W+/g, '_');
    memcache.store(id, this.searchResultKeys);
    this.searchResultKeys = [];
  }
};
