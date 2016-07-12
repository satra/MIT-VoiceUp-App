angular.module('learnModule',[])
//=======Home screen controller======================
.controller('LearnCtrl', function($scope,$ionicHistory,$rootScope,$state) {

  $scope.go = function () {
          $ionicHistory.clearCache().then(function(){
                      $rootScope.emailId = null;
                      $state.transitionTo('home');
          });
   }
$scope.homeCalss = "icon ion-home";
/*  var homeButton  = '<i class = "icon ion-home" id="makeHome"></i>';
  angular.element(document.querySelector('#makeHome')).remove();
  angular.element(document.querySelector('#backButton')).append(homeButton);
*/
});
