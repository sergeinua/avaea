'use strict';

avaeaStandaloneApp
    .factory('SearchAirService', SearchAirService);

SearchAirService.$inject = ['$http'];

function SearchAirService($http) {

    var service = {};

    service.SearchAirAvailability = SearchAirAvailability;
    service.SearchPrice = SearchPrice;

    return service;

    function SearchAirAvailability(data){
        return $http.post('/api/farelogix/air', data);
    }

    function SearchPrice(data){

        data = data.Segment;
        var req = {
            airline: data.Carrier.AirlineCode,
            flightnumber: data.Carrier.FlightNumber,
            classofservice: 'Y',

            equipmentcode: data.Equipment.Code,
            equipmentname: data.Equipment.Name,

            departureapt: data.Departure.AirportCode,
            departuredate: data.Departure.Date,
            departuretime: data.Departure.Time,

            arrivalapt: data.Arrival.AirportCode,
            arrivaldate: data.Arrival.Date,
            arrivaltime: data.Arrival.Time
        };

        return $http.post('/api/farelogix/price', req);
    }

}



