angular.module('learnModule', [])
  //=======Home screen controller======================
  .controller('LearnCtrl', function($scope, $ionicHistory, $rootScope, $state, $ionicPopup, $ionicLoading) {

    $scope.go = function() {
      $ionicHistory.clearCache().then(function() {
        $rootScope.emailId = null;
        $state.transitionTo('home');
      });
    }
    $scope.showCloseButton = false;
    $scope.homeCalss = "icon ion-home";

  });
