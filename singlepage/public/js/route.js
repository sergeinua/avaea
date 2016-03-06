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
                name: "Home"
            }
        }).state('home.bookingCart', {
            url: '/bookingCart',
            views: {
                "contentView": {
                    templateUrl : 'modules/bookingCart/bookingCart.view.html',
                    controller  : 'bookingCartController'
                }
            },
            data: {
                requireLogin: false,
                readonly: false,
                name: "Booking Cart"
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