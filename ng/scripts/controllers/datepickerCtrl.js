angular.module('calendar.app', ['ngAnimate', 'ui.bootstrap']);

angular.module('calendar.app').controller('DatepickerDemoCtrl', function ($scope, utilService) {
  'use strict';

  $scope.__cname = 'DatepickerDemoCtrl';
  var model = {
    tenantName: '',
    selectedDate: null,
    isReservationExist: false
  };

  function today() {
    model.selectedDate = new Date();
  }

  function clear() {
    model.selectedDate = null;
    model.tenantName = '';
    model.isReservationExist = false;
  }

  function confirmOrCancelReservation(isReserving) {
    var tenantObj = {
      tenantName: model.tenantName,
      date: model.selectedDate,
      reserved: isReserving
    };

    utilService.confirmOrCancelReservation(tenantObj).then(function () {
      model.isReservationExist = isReserving;
      if (!model.isReservationExist) {
        model.tenantName = null;
        model.selectedDate = null;
      } else {
        model.tenantName = tenantObj.tenantName;
      }
    });
  }

  $scope.$watch('model.selectedDate', function (newVal, oldVal) {
      if (newVal === oldVal) {
        return;
      } else if (!!newVal) {
        model.tenantName = '';
        model.isReservationExist = false;
        utilService.isDateReserved(newVal).then(function (tenantObj){
          model.isReservationExist = tenantObj.isDateReserved;
          if (tenantObj.isDateReserved) {
            model.tenantName = tenantObj.tenantName;
          }
        });
      }
  });

  $scope.model = model;

  function initialize() {
    $scope.datePickerConfig = {
      minDate: new Date(),
      showWeeks: true
    };
  }

  initialize();

  $scope.confirmOrCancelReservation = confirmOrCancelReservation;
  $scope.today = today;
  $scope.clear = clear;
});