angular.module('learnModule',[])
//=======Home screen controller======================
.controller('LearnCtrl', function($scope,$ionicHistory,$rootScope,$state) {
  $scope.headerCloseButton = true ;
  $scope.headerBackButton = false ;

      // == take user to home screeen
      $scope.switchUser = function (){
              $ionicHistory.clearCache().then(function(){
              $rootScope.emailId = null;
              $state.transitionTo('home');
              });
      }

});
