'use strict';

var avaeaStandaloneApp = angular.module('avaeaStandaloneApp', [
    'ui.router', 'ngCookies', 'ngMessages', 'ngAnimate', 'ngMaterial', 'ngSanitize'
]);

avaeaStandaloneApp.config(['$httpProvider', function ($httpProvider) {

    $httpProvider.interceptors.push(function($q, $injector, $timeout) {

        var deferred = $q.defer(), $http = null, $state = null;
        $timeout(function () {
            $http = $injector.get('$http');
            $state = $injector.get('$state');
        });

        return {
            responseError: function (rejection) {

                if (rejection.status !== 401) {
                    deferred.reject(rejection);
                    return deferred.promise;
                }

                $state.go('home');
                deferred.reject(rejection);
                return deferred.promise;
            }
        };

    });
}])
    .run(['$http', '$rootScope', '$cookies', '$timeout', '$state',
    function ($http, $rootScope, $cookies, $timeout, $state) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var token;
        $rootScope.currentState = {curr:toState.name, name: toState.data.name};

        token = "123";
        if (!token) {
            event.preventDefault();
            return $state.go('home');
        }
    });

}]);





