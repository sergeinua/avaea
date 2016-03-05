'use strict';

avaeaStandaloneApp
    .factory('BookingCartService', BookingCartService);

BookingCartService.$inject = ['$http'];

function BookingCartService($http) {

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



