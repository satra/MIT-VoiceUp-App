angular.module('eligibile',[])
//=======Home screen controller======================
.controller('eligibileCtrl', function($scope,$stateParams,$compile,$cordovaSQLite,$controller,$ionicModal,$http,$ionicLoading,userService,databaseService,eligiblityDataManager,consentDataManager,irkResults,$state,$location,$window) {

// ==== on clcik of back from sign in screen ========
  $scope.GoHome = function() {
    $state.transitionTo('home', null, {'reload':false});
  };
  $scope.beginConsent = function() {
    $state.transitionTo('beginConsent', null, {'reload':false});
  };


});
