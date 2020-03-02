angular.module('calendar.app', ['ngAnimate', 'ui.bootstrap']);
angular.module('calendar.app').controller('DatepickerDemoCtrl', function ($scope) {

  function today() {
    $scope.selectedDate = new Date();
  }

  function clear() {
     $scope.selectedDate = null;
  }

  function confirmReservation() {

  }

  function cancelReservation() {

  }

  function isRervationExist() {
    return false;
  }

  function initialize() {
    $scope.selectedDate = null;
    $scope.datePickerConfig = {
      minDate: new Date(),
      showWeeks: true
    };
  }

  initialize();

  $scope.isRervationExist = isRervationExist;
  $scope.confirmReservation = confirmReservation;
  $scope.cancelReservation = cancelReservation;
  $scope.today = today;
  $scope.clear = clear;
});