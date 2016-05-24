angular.module('eligibile',[])
//=======Home screen controller======================
.controller('eligibileCtrl', function($scope,$ionicHistory,$compile,$cordovaSQLite,$controller,
  $ionicModal,$http,$ionicLoading,userService,databaseManager,
  eligiblityDataManager,consentDataManager,irkResults,$state,$location,$window) {

// ==== on clcik of back from sign in screen ========
  $scope.GoHome = function() {
    $ionicHistory.clearCache().then(function(){
    $state.transitionTo('home');
  });
};
  $scope.beginConsent = function() {
    $ionicHistory.clearCache().then(function(){
    $state.transitionTo('beginConsent');
    });
  };
});
