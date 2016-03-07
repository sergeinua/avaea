'use strict';

avaeaStandaloneApp.controller('bookingCartController',
  ['$scope', '$state',
    'BookingCartService', 'localStorageService',
    BookingCartController]);

function BookingCartController($scope, $state, BookingCartService, localStorageService) {

  //console.log(localStorageService.get('flight'));
  //console.log(localStorageService.get('price'));

  $scope.flight = localStorageService.get('flight');

  $scope.toggleSection = toggleSection;

  $scope.showNewItemForm = showNewItemForm;
  $scope.hideNewItemForm = hideNewItemForm;
  $scope.saveNewItemForm = saveNewItemForm;
  var newItemFormId = 'addNewItem-';

  $scope.sectionsAll = false;
  $scope.sections = {
    traveler: {
      id: 'traveler',
      title: 'Traveler',
      count: 0,
      show: true
    },
    phone: {
      id: 'phone',
      title: 'Phone',
      count: 0
    },
    email: {
      id: 'email',
      title: 'Email',
      count: 0
    },
    payment: {
      id: 'payment',
      title: 'Payment',
      count: 0
    },
    address: {
      id: 'address',
      title: 'Address',
      count: 0
    },
    itinerary: {
      id: 'itinerary',
      title: 'Itinerary',
      count: $scope.flight.length,
      show: true,
      readonly: true
    },
    transaction: {
      id: 'transaction',
      title: 'Transaction',
      count: 0
    },
    apis: {
      id: 'apis',
      title: 'APIS',
      count: 0
    },
    ssr: {
      id: 'ssr',
      title: 'SSR',
      count: 0
    },
    osi: {
      id: 'osi',
      title: 'OSI',
      count: 0
    },
    remark: {
      id: 'remark',
      title: 'Remark',
      count: 0
    }
  };

  function toggleSection(sectionId) {

    if (sectionId != 'all') {

      $scope.sections[sectionId].show = !$scope.sections[sectionId].show;

    } else {

      $scope.sectionsAll = !$scope.sectionsAll;
      $.each($scope.sections, function(i, o){
        o.show = $scope.sectionsAll;
      })
    }

  }

  function showNewItemForm(itemId) {
    $('#' + newItemFormId + itemId).show();
  }

  function hideNewItemForm(itemId) {
    $('#' + newItemFormId + itemId).hide();
  }

  function saveNewItemForm(itemId) {

  }

}
