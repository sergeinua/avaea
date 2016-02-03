'use strict';

avaeaStandaloneApp
    .controller('homeController',
    ['$scope', '$cookies', '$state', '$timeout', '$mdSidenav', 'MenuService',
        function($scope, $cookies, $state, $timeout, $mdSidenav, MenuService) {


        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.toggleRight = buildToggler('right');
        $scope.getClass = getClass;
        $scope.gotoMenuItem = gotoMenuItem;

        $scope.currentMenu = $state.current.name;

        $scope.isOpenRight = function(){
            return $mdSidenav('right').isOpen();
        };

        $scope.menu = MenuService.setDefaultMenu();

        function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function buildDelayedToggler(navID) {
            return debounce(function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        //$log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }
        function buildToggler(navID) {
            return function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        //$log.debug("toggle " + navID + " is done");
                    });
            }
        }

        function gotoMenuItem ($item) {
            if ($item.id != $scope.currentMenu.id) {
                $scope.currentMenu = $item;
                $state.go($item.id);
            }
        }

        function getClass(data){
           var _arr = data.split('.');
            if (_arr.length >= 3) {
                return _arr[0] + '.' + _arr[1];
            } else {return data};
        }

        }]).controller('LeftCtrl', function ($scope, $timeout, $mdSidenav) {

            $scope.close = function () {
                $mdSidenav('left').close()
                    .then(function () {
                        // $log.debug("close LEFT is done");
                    });
            };
        })
        //.controller('RightCtrl', function ($scope, $timeout, $mdSidenav) {
        //    $scope.close = function () {
        //        $mdSidenav('right').close()
        //            .then(function () {
        //                //$log.debug("close RIGHT is done");
        //            });
        //    };
        //});


    avaeaStandaloneApp.directive('resize', function ($window) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.style = function () {
                    return {
                        'height': (newValue.h) + 'px'
                    };
                };

            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    })
