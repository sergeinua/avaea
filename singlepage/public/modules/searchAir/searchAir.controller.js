'use strict';

avaeaStandaloneApp.controller('searchAirController',
    ['$scope', '$timeout', '$mdDialog', 'SearchAirService', SearchAirController]);

function SearchAirController($scope, $timeout, $mdDialog, SearchAirService) {

    $scope.Math = window.Math;


    $scope.fabIsOpen = false;
    $scope.fabIsHover = false;

    $scope.departSearchText = {};
    $scope.arriveSearchText = {};

    // ===
    $scope.tabCount = tabCount;
    $scope.selectTab = selectTab;

    $scope.selectedTab = null;
    $scope.selectedTabIndex = 0;
    $scope.tabTemplate = false;

    $scope.tabs = [
        {
            id: 'roundtrip',
            title: 'Round Trip',
            rows: 2
        },
        {
            id: 'oneway',
            title: 'One Way',
            rows: 1
        },
        {
            id: 'multicity',
            title: 'Multi City',
            rows: 3,
            addrow: true
        }
    ];

    // ===

    $scope.showAdditionalOptions = showAdditionalOptions;

    $scope.apts                 = loadApts();
    $scope.querySearch          = querySearch;
    $scope.selectedItemChange   = selectedItemChange;

    $scope.departSelectedItem = false;
    $scope.arriveSelectedItem = false;

    $scope.simulateQuery = false;

    // ===
    $scope.changeDate = changeDate;

    $scope.currentDate = new Date();
    $scope.minDate = new Date(
        $scope.currentDate.getFullYear(),
        $scope.currentDate.getMonth(),
        $scope.currentDate.getDate()
    );
    $scope.selectedtDate = false;

    // ===
    $scope.times = loadAllTimes();
    $scope.selectedTime = false;

    // ===
    $scope.directions = loadAllDirections();
    $scope.selectedDirection = false;


    // ===
    $scope.SearchAirAvailability = SearchAirAvailability;
    $scope.searchPrice = searchPrice;
    $scope.hasTransfer = hasTransfer;


    $scope.showSpinner = false;

    $scope.error = {};
    $scope.flights = {};
    $scope.SearchAirAvailabilityList = {};
    $scope.prive = false;

    // ===
    function tabCount (num) {
        return new Array(num);
    }

    function selectTab (tab, $index) {
        $scope.selectedTab = tab;
        $scope.selectedTabIndex = $index;
    }

    function showAdditionalOptions (index) {
        console.log($scope.selectedTabIndex, index);
    }

    function querySearch (type, query) {

        var results = query ? $scope.apts.filter( createFilterFor(query) ) : $scope.apts,
            deferred;

        if ($scope.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            var res = {};
            res[type] = results;
            return res;
        }
    };

    function selectedItemChange (type, item, index) {

        if (!$scope.SearchAirAvailabilityList[$scope.selectedTab.id]) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id] = {};
        }

        if (!$scope.SearchAirAvailabilityList[$scope.selectedTab.id][type]) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id][type] = [];
        }

        $scope.SearchAirAvailabilityList[$scope.selectedTab.id][type][index] = undefined;

        if (item) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id][type][index] = item.code;
        }

        console.log(index, type, $scope.SearchAirAvailabilityList[$scope.selectedTab.id][type]);
        var l;

    };

    function loadApts () {
        var allApt = [
            {code: 'YYZ', name: 'TORONTO LESTER B PEARSON INTL APT, CA:ON'},
            {code: 'YVR', name: 'VANCOUVER INTERNATIONAL APT, CA:BC'}
        ];
        return allApt;
    };

    function createFilterFor (query) {
        return function filterFn(item) {
            return (item.code.indexOf(angular.uppercase(query)) === 0);
        };
    };

    function changeDate (date, index) {

        if (!$scope.SearchAirAvailabilityList[$scope.selectedTab.id]) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id] = {};
        }

        if (!$scope.SearchAirAvailabilityList[$scope.selectedTab.id].date) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id].date = [];
        }

        $scope.SearchAirAvailabilityList[$scope.selectedTab.id].date[index] = undefined;
        if (date) {
            $scope.SearchAirAvailabilityList[$scope.selectedTab.id].date[index] = dateFormat(new Date(date), '%Y-%m-%d');
        }
    };

    function loadAllTimes () {
        var times = [
            {id: 'any', name: 'Anytime'},
            {id: 'beforenoon', name: 'Before noon'},
            {id: 'noon6pm', name: 'Noon - 6pm'},
            {id: 'after6pm', name: 'After 6pm'}
        ];

        $(['am', 'pm']).each(function(i, o){
            for (var i = 1; i <= 12; i++) {
                times.push({id: i + o, name: i + o});
            }
        });

        times.push({id: 'midnight', name: 'Midnight'});
        return times;
    };

    function loadAllDirections () {
        var directions = [
            {id: 'depart', name: 'Depart'},
            {id: 'arrive', name: 'Arrive'}
        ];

        return directions;
    };

    // ==================

    function SearchAirAvailability () {

        console.log($scope.SearchAirAvailabilityList[$scope.selectedTab.id]);
        if (
            !$scope.SearchAirAvailabilityList[$scope.selectedTab.id] ||
            !$scope.SearchAirAvailabilityList[$scope.selectedTab.id].arrive || arraySize($scope.SearchAirAvailabilityList[$scope.selectedTab.id].arrive) != $scope.selectedTab.rows ||
            !$scope.SearchAirAvailabilityList[$scope.selectedTab.id].depart || arraySize($scope.SearchAirAvailabilityList[$scope.selectedTab.id].depart) != $scope.selectedTab.rows ||
            !$scope.SearchAirAvailabilityList[$scope.selectedTab.id].date || arraySize($scope.SearchAirAvailabilityList[$scope.selectedTab.id].date) != $scope.selectedTab.rows
        ) {
            $scope.error[$scope.selectedTab.id] = 'Please fill From, To and Date fields';
            return;
        }

        $scope.showSpinner = true;
        $scope.flights[$scope.selectedTab.id] = [];
        $scope.error[$scope.selectedTab.id] = null;

        $scope.SearchAirAvailabilityList[$scope.selectedTab.id].rows = $scope.selectedTab.rows;
        SearchAirService.SearchAirAvailability($scope.SearchAirAvailabilityList[$scope.selectedTab.id])
            .then(function(response){
                var flights, res = [],
                    resp = response.data;

                if (!$.isArray(resp)) {
                    resp = [resp];
                };

                $scope.flights[$scope.selectedTab.id] = resp;
                $scope.showSpinner = false;
            }, function(rejected){
                $scope.showSpinner = false;
                $scope.error[$scope.selectedTab.id] = rejected.data.error;
                console.log(rejected);
                return 'Error getting air availability';
            })

    }

    function searchPrice (flight) {
        SearchAirService.SearchPrice(flight)
            .then(function(response){
                $scope.price = response.data;
                $scope.num
            }, function(rejected){
                console.log(rejected);
                return 'Error getting flight price';
            })
    };

    function multipleDestination (destination) {
        if ($.isArray(destination)) {
            return true;
        } else {
            return false;
        }
    }

    function hasTransfer(flight) {
        if ($.isArray(flight.Segment)) {
            return true;
        } else {
            return false;
        }
    }


    // ===============
    $scope.showPriceDialog = function($ev, flight) {

        $scope.price = false;

        $mdDialog.show({
            templateUrl: 'modules/dialog/showprice.view.html',
            parent: angular.element(document.body),
            targetEvent: $ev,
            scope: $scope,
            clickOutsideToClose: true,
            preserveScope: true,
            controller:
                function ($scope, $mdDialog) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.answer = function (answer) {
                        if (!answer) {
                            $mdDialog.hide(answer);
                        } else {
                            console.log('book ticket');
                        }
                    };
                }
        })
        .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
            $scope.status = 'You cancelled the dialog.';
        });

        searchPrice(flight);
    };

    function dateFormat (date, fstr, utc) {
        utc = utc ? 'getUTC' : 'get';
        return fstr.replace (/%[YmdHMS]/g, function (m) {
            switch (m) {
                case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
                case '%m': m = 1 + date[utc + 'Month'] (); break;
                case '%d': m = date[utc + 'Date'] (); break;
                case '%H': m = date[utc + 'Hours'] (); break;
                case '%M': m = date[utc + 'Minutes'] (); break;
                case '%S': m = date[utc + 'Seconds'] (); break;
                default: return m.slice (1); // unknown code, remove %
            }
            // add leading zero if required
            return ('0' + m).slice (-2);
        });
    }

    function arraySize(arr) {
        return arr.filter(function(value) { return value !== undefined }).length;
    }
}
