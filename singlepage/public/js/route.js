avaeaStandaloneApp.config(['$stateProvider', '$locationProvider', '$urlRouterProvider',

    function ($stateProvider, $locationProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("home");

        $stateProvider.state('home', {
            url: '/home',
            views: {
                "mainView": {
                    templateUrl : 'modules/home/home.view.html',
                    controller  : 'homeController'
                }
            },
            data: {
                requireLogin: false,
                readonly: false,
                name: "Reservation"
            }
        }).state('home.reservation', {
            url: '/reservation',
            views: {
                "contentView": {
                    templateUrl : 'modules/reservation/reservation.view.html',
                    controller  : 'reservationController'
                }
            },
            data: {
                requireLogin: false,
                readonly: false,
                name: "Reservation"
            }

        }).state('home.searchAir', {
            url: '/searchAir',
            views: {
                "contentView": {
                    templateUrl : 'modules/searchAir/searchAir.view.html',
                    controller  : 'searchAirController'
                }
            },
            data: {
                requireLogin: false,
                readonly: false,
                name: "Search Air"
            }

        });

        return $locationProvider.html5Mode(false);

    }

]);