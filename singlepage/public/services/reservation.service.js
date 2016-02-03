'use strict';

avaeaStandaloneApp
    .factory('ReservationService', ReservationService);

ReservationService.$inject = ['$http'];

function ReservationService($http) {

    var service = {};

    service.Get = Get;
    service.Create = Create;
    service.Delete = Delete;

    return service;

    function Get(){
        return $http.get('/api/reservation');
    }


    function Create(favorite) {
        return $http.post('/api/reservation/add', favorite);
    }

    function Delete(favorite) {
        return $http.post('/api/reservation/delete', favorite);
    }
}



